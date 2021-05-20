import { emitEvent, subscribe } from "@keix/message-store-client";
import { runBalanceProjector } from "./projectors";
import { Command, CommandType, EventType } from "./types";
import { v4 as uuidv4 } from "uuid";

const MIN_USE_CREDITS_AMOUNT = 100;

async function handler(cmd: Command) {
  console.log(cmd);
  switch (cmd.type) {
    case CommandType.EARN_CREDITS:
      emitEvent({
        category: "creditAccount",
        id: cmd.data.id,
        event: EventType.CREDITS_EARNED,
        data: {
          id: cmd.data.id,
          amount: cmd.data.amount,
          transactionId: cmd.data.transactionId,
          time: cmd.data.time,
        },
      });
      break;

    case CommandType.USE_CREDITS:
      let balance = await runBalanceProjector(cmd.data.id);
      if (balance >= MIN_USE_CREDITS_AMOUNT && balance - cmd.data.amount > 0) {
        emitEvent({
          category: "creditAccount",
          id: cmd.data.id,
          event: EventType.CREDITS_USED,
          data: {
            id: cmd.data.id,
            amount: cmd.data.amount,
            transactionId: cmd.data.transactionId,
            time: cmd.data.time,
          },
        });
        break;
      }
  }
}
export async function run() {
  subscribe(
    {
      streamName: "creditAccount:command",
    },
    handler
  );
}
