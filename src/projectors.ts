import { Message, runProjector } from "@keix/message-store-client";
import { EventType } from "./types";
import { DateTime } from "luxon";

export async function runBalanceProjector(IdAmount: string): Promise<number> {
  let date = new Date();
  const MAX_USE_CREDITS_DELAY = date.setMonth(date.getMonth() - 12);
  function reducer(res: number, next: Message) {
    if (
      next.type == EventType.CREDITS_EARNED &&
      next.data.time >= MAX_USE_CREDITS_DELAY
    ) {
      res = res + next.data.amount;
    } else {
      res = res - next.data.amount;
    }
    if (res < 0) {
      return 0;
    } else {
      return res;
    }
  }

  return runProjector(
    {
      streamName: "creditAccount-" + IdAmount,
    },
    reducer,
    0
  );
}

export async function runGiftCardProjector(IdCard: string) {
  function reducer(res: boolean, next: Message) {
    if (next.type == EventType.GIFT_CARD_ADDED) {
      return true;
    } else if (next.type == EventType.GIFT_CARD_REMOVED) {
      return false;
    } else {
      return res;
    }
  }
  return runProjector(
    {
      streamName: "giftCard-" + IdCard,
    },
    reducer,
    false
  );
}

export async function runPendingProjector(id: string): Promise<boolean> {
  function reducer(prev: boolean, next: Event) {
    if (next.type === EventType.GIFT_CARD_REDEEM_PENDING) {
      return true;
    } else {
      return false;
    }
  }
  return runProjector(
    { streamName: `giftCardTransaction-${id}` },
    reducer,
    false
  );
}

export async function runProcessingProjector(id: string): Promise<boolean> {
  function reducer(prev: boolean, next: Event) {
    if (next.type === EventType.GIFT_CARD_REDEEM_PROCESSING) {
      return true;
    } else {
      return false;
    }
  }
  return runProjector(
    { streamName: `giftCardTransaction-${id}` },
    reducer,
    false
  );
}

export async function runDeliveryProjector(id: string): Promise<boolean> {
  function reducer(prev: boolean, next: Event) {
    if (next.type === EventType.GIFT_CARD_REDEEM_SUCCEDED) {
      return true;
    } else {
      return false;
    }
  }
  return runProjector(
    { streamName: `giftCardTransaction-${id}` },
    reducer,
    false
  );
}
