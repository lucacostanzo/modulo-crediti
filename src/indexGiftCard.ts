import {
  combineSubscriber,
  emitEvent,
  readLastMessage,
  sendCommand,
  subscribe,
} from "@keix/message-store-client";
import {
  runDeliveryProjector,
  runGiftCardProjector,
  runPendingProjector,
  runProcessingProjector,
} from "./projectors";
import { Command, CommandType, EventType, Event } from "./types";

async function handler(cmd: Command) {
  if (await isLastMessageAfterGlobalPosition(`giftCard-${cmd.data.id}`, cmd)) {
    return;
  }
  console.log(cmd);
  switch (cmd.type) {
    case CommandType.ADD_GIFT_CARD:
      if (!(await runGiftCardProjector(cmd.data.id))) {
        return emitEvent({
          category: "giftCard",
          id: cmd.data.id,
          event: EventType.GIFT_CARD_ADDED,
          data: {
            id: cmd.data.id,
            name: cmd.data.name,
            description: cmd.data.description,
            image_url: cmd.data.image_url,
            amounts_avaiable: cmd.data.amounts_avaiable,
          },
        });
      } else {
        return emitEvent({
          category: "giftCard",
          id: cmd.data.id,
          event: EventType.GIFT_CARD_ADDED_ERROR,
          data: {
            id: cmd.data.id,
          },
        });
      }

    case CommandType.REMOVE_GIFT_CARD:
      if (await runGiftCardProjector(cmd.data.id)) {
        return emitEvent({
          category: "giftCard",
          id: cmd.data.id,
          event: EventType.GIFT_CARD_REMOVED,
          data: {
            id: cmd.data.id,
            name: cmd.data.name,
            description: cmd.data.description,
            image_url: cmd.data.image_url,
            amounts_avaiable: cmd.data.amounts_avaiable,
          },
        });
      } else {
        if (!(await runGiftCardProjector(cmd.data.id))) {
          return emitEvent({
            category: "giftCard",
            id: cmd.data.id,
            event: EventType.GIFT_CARD_REMOVED_ERROR,
            data: {
              id: cmd.data.id,
            },
          });
        } else {
          return;
        }
      }

    case CommandType.REDEEM_GIFT_CARD:
      if (await runPendingProjector(cmd.data.transactionId)) {
        return;
      }
      await emitEvent({
        category: "giftCardTransaction",
        id: cmd.data.transactionId,
        event: EventType.GIFT_CARD_REDEEM_PENDING,
        data: { id: cmd.data.transactionId },
      });
      if (await runGiftCardProjector(cmd.data.id)) {
        await sendCommand({
          command: CommandType.USE_CREDITS,
          category: "creditAccount",
          data: {
            id: cmd.data.id,
            amount: cmd.data.amount,
            transactionId: cmd.data.transactionId,
            time: new Date(2021, 5, 18),
          },
        });
      }

    case CommandType.DELIVERY_GIFT_CARD:
      if (
        (await runProcessingProjector(cmd.data.transactionId)) &&
        !(await runDeliveryProjector(cmd.data.transactionId))
      ) {
        return emitEvent({
          category: "giftCardTransaction",
          id: cmd.data.id,
          event: EventType.GIFT_CARD_REDEEM_SUCCEDED,
          data: {
            id: cmd.data.id,
            amount: cmd.data.amount,
            transactionId: cmd.data.transactionId,
            idCard: cmd.data.idCard,
          },
        });
      } else {
        return emitEvent({
          category: "giftCardTransaction",
          id: cmd.data.id,
          event: EventType.GIFT_CARD_REDEEM_FAILED,
          data: {
            id: cmd.data.id,
            amount: cmd.data.amount,
            transactionId: cmd.data.transactionId,
            idCard: cmd.data.idCard,
          },
        });
      }
  }
}

export async function isLastMessageAfterGlobalPosition(
  streamName: string,
  cmd: Command
) {
  const { global_position } = cmd;
  const lastMsg = await readLastMessage({
    streamName,
  });
  return lastMsg && lastMsg.global_position > global_position;
}

async function handlerCredits(event: Event) {
  switch (event.type) {
    case EventType.CREDITS_USED:
      if (await runPendingProjector(event.data.transactionId)) {
        return;
      }
      return emitEvent({
        category: "giftCardTransaction",
        event: EventType.GIFT_CARD_REDEEM_PROCESSING,
        id: event.data.transactionId,
        data: event.data,
      });
  }
}

export async function runGiftCard() {
  return combineSubscriber(
    subscribe(
      {
        streamName: "giftCard:command",
      },
      handler
    ),
    subscribe(
      {
        streamName: "creditAccount",
      },
      handlerCredits
    ),
    subscribe(
      {
        streamName: "giftCardTransaction:command",
      },
      handler
    )
  );
}
