import { testUtils } from "@keix/message-store-client";
import { runGiftCard } from "../src/indexGiftCard";
import { CommandType, EventType } from "../src/types";
import { v4 as uuidv4 } from "uuid";
import {
  runDeliveryProjector,
  runGiftCardProjector,
  runPendingProjector,
  runProcessingProjector,
} from "../src/projectors";

it("should add a gift card", async () => {
  let idCard = uuidv4();
  testUtils.setupMessageStore([
    {
      type: CommandType.ADD_GIFT_CARD,
      stream_name: "giftCard:command-" + idCard,
      data: {
        id: idCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
  ]);

  await testUtils.expectIdempotency(runGiftCard, async () => {
    let eventsCard = testUtils.getStreamMessages("giftCard-" + idCard);
    expect(eventsCard).toHaveLength(1);
    expect(eventsCard[0].type).toEqual(EventType.GIFT_CARD_ADDED);
    expect(eventsCard[0].data.id).toEqual(idCard);
  });
});

it("should remove a gift card", async () => {
  let idCard = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
    {
      type: CommandType.REMOVE_GIFT_CARD,
      stream_name: "giftCard:command-" + idCard,
      data: {
        id: idCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
  ]);

  await testUtils.expectIdempotency(runGiftCard, async () => {
    let eventsCard = testUtils.getStreamMessages("giftCard-" + idCard);
    expect(eventsCard).toHaveLength(2);
    expect(eventsCard[0].type).toEqual(EventType.GIFT_CARD_ADDED);
    expect(eventsCard[0].data.id).toEqual(idCard);
    expect(eventsCard[1].type).toEqual(EventType.GIFT_CARD_REMOVED);
    expect(eventsCard[1].data.id).toEqual(idCard);
  });
});

it("should check if a gift card exist", async () => {
  let idCard = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
  ]);

  await testUtils.expectIdempotency(runGiftCard, async () => {
    let eventsCard = testUtils.getStreamMessages("giftCard-" + idCard);
    expect(eventsCard).toHaveLength(1);
    expect(eventsCard[0].type).toEqual(EventType.GIFT_CARD_ADDED);
    expect(eventsCard[0].data.id).toEqual(idCard);
    expect(await runGiftCardProjector(idCard)).toEqual(true);
  });
});

it("should check if a gift card not exist", async () => {
  let idCard = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
  ]);

  await testUtils.expectIdempotency(runGiftCard, async () => {
    let eventsCard = testUtils.getStreamMessages("giftCard-" + idCard);
    expect(eventsCard).toHaveLength(1);
    expect(eventsCard[0].type).toEqual(EventType.GIFT_CARD_ADDED);
    expect(eventsCard[0].data.id).toEqual(idCard);
    expect(await runGiftCardProjector(idCard)).toEqual(true);
  });
});

it("should fail add card", async () => {
  let idCard = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
    {
      type: CommandType.ADD_GIFT_CARD,
      stream_name: "giftCard:command-" + idCard,
      data: {
        id: idCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
  ]);

  await testUtils.expectIdempotency(runGiftCard, async () => {
    let eventsCard = testUtils.getStreamMessages("giftCard-" + idCard);
    expect(eventsCard).toHaveLength(2);
    expect(eventsCard[0].type).toEqual(EventType.GIFT_CARD_ADDED);
    expect(eventsCard[0].data.id).toEqual(idCard);
    expect(eventsCard[1].type).toEqual(EventType.GIFT_CARD_ADDED_ERROR);
    expect(eventsCard[1].data.id).toEqual(idCard);
    expect(await runGiftCardProjector(idCard)).toEqual(true);
  });
});

it("should fail remove card", async () => {
  let idCard = uuidv4();
  let idCard2 = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
    {
      type: CommandType.REMOVE_GIFT_CARD,
      stream_name: "giftCard:command-" + idCard2,
      data: {
        id: idCard2,
        name: "Card2",
        description: "la seconda carta",
        image_url: "www.card2.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
  ]);

  await testUtils.expectIdempotency(runGiftCard, async () => {
    let eventsCard = testUtils.getStreamMessages("giftCard");
    expect(eventsCard).toHaveLength(2);
    expect(eventsCard[0].type).toEqual(EventType.GIFT_CARD_ADDED);
    expect(eventsCard[0].data.id).toEqual(idCard);
    expect(eventsCard[1].type).toEqual(EventType.GIFT_CARD_REMOVED_ERROR);
    expect(eventsCard[1].data.id).toEqual(idCard2);
  });
});

it("should check if removed", async () => {
  let idCard = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
    {
      type: EventType.GIFT_CARD_REMOVED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
  ]);

  await testUtils.expectIdempotency(runGiftCard, async () => {
    expect(await runGiftCardProjector(idCard)).toEqual(false);
  });
});

it("should redeem gift card", async () => {
  let idCard = uuidv4();
  let idAccount = uuidv4();
  let idTransaction = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.CREDITS_EARNED,
      stream_name: "creditAccount-" + idAccount,
      data: {
        id: idAccount,
        amount: 150,
      },
    },
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
    {
      type: CommandType.REDEEM_GIFT_CARD,
      stream_name: "giftCardTransaction:command-" + idTransaction,
      data: {
        transactionId: idTransaction,
        id: idCard,
        IdUser: idAccount,
        amount: 15,
      },
    },
    {
      type: EventType.CREDITS_USED,
      stream_name: "creditAccount-" + idAccount,
      data: {
        id: idAccount,
        amount: 15,
      },
    },
  ]);

  await testUtils.expectIdempotency(runGiftCard, async () => {
    expect(await runGiftCardProjector(idCard)).toEqual(true);
    let eventsCard = testUtils.getStreamMessages("giftCard-" + idCard);
    let eventsCredits = testUtils.getStreamMessages(
      "creditAccount-" + idAccount
    );
    let eventsCardTransaction = testUtils.getStreamMessages(
      "giftCardTransaction-" + idTransaction
    );
    expect(eventsCredits).toHaveLength(2);
    expect(eventsCard).toHaveLength(1);
    expect(eventsCardTransaction).toHaveLength(1);
    expect(eventsCredits[0].type).toEqual(EventType.CREDITS_EARNED);
    expect(eventsCredits[0].data.id).toEqual(idAccount);
    expect(eventsCard[0].type).toEqual(EventType.GIFT_CARD_ADDED);
    expect(eventsCard[0].data.id).toEqual(idCard);
    expect(eventsCardTransaction[0].type).toEqual(
      EventType.GIFT_CARD_REDEEM_PENDING
    );
    expect(eventsCardTransaction[0].data.id).toEqual(idTransaction);
    expect(eventsCredits[1].type).toEqual(EventType.CREDITS_USED);
    expect(eventsCredits[1].data.id).toEqual(idAccount);
  });
});

it("should return false if gift card is not pending", async () => {
  let idCard = uuidv4();
  let idTransaction = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCardTransaction-" + idTransaction,
      data: {
        id: idCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
  ]);
  await testUtils.expectIdempotency(runGiftCard, async () => {
    expect(await runPendingProjector(idTransaction)).toEqual(false);
  });
});

it("should return true if gift card is pending", async () => {
  let idTransaction = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_REDEEM_PENDING,
      stream_name: "giftCardTransaction-" + idTransaction,
      data: {},
    },
  ]);
  await testUtils.expectIdempotency(runGiftCard, async () => {
    expect(await runPendingProjector(idTransaction)).toEqual(true);
  });
});

it("should return true if gift card is processing", async () => {
  let idTransaction = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_REDEEM_PROCESSING,
      stream_name: "giftCardTransaction-" + idTransaction,
      data: { id: idTransaction },
    },
  ]);

  expect(await runProcessingProjector(idTransaction)).toEqual(true);
});

it("should return false if gift card is not processing", async () => {
  let idCard = uuidv4();
  let idTransaction = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + idCard,
      data: {
        id: idCard,
        name: "Amazon",
        description: "Carta per comprarti il frigo",
        image_url: "https://img.it",
        amounts: [5, 10, 20, 30, 50],
      },
    },
    {
      type: EventType.GIFT_CARD_REDEEM_PENDING,
      stream_name: "giftCardTransaction-" + idTransaction,
      data: {
        id: idTransaction,
      },
    },
  ]);
  await testUtils.expectIdempotency(runGiftCard, async () => {
    expect(await runProcessingProjector(idTransaction)).toEqual(false);
  });
});

it("should return succeded if giftCard is correctly sent", async () => {
  let idTransaction = uuidv4();
  let idCard = uuidv4();
  let idAccount = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_REDEEM_PROCESSING,
      stream_name: "giftCardTransaction-" + idTransaction,
      data: {
        transactionId: idTransaction,
        amount: 30,
        id: idCard,
        IdUser: idAccount,
      },
    },
    {
      type: CommandType.DELIVERY_GIFT_CARD,
      stream_name: "giftCardTransaction:command-" + idTransaction,
      data: {
        transactionId: idTransaction,
        amount: 30,
        id: idCard,
        IdUser: idAccount,
      },
    },
  ]);
  await testUtils.expectIdempotency(runGiftCard, async () => {
    let eventsCardTransaction = testUtils.getStreamMessages(
      "giftCardTransaction-" + idTransaction
    );
    expect(eventsCardTransaction).toHaveLength(2);
    expect(eventsCardTransaction[1].type).toEqual(
      EventType.GIFT_CARD_REDEEM_SUCCEDED
    );
  });
});

it("should return true if gift card is correctly sent", async () => {
  let idTransaction = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_REDEEM_SUCCEDED,
      stream_name: "giftCardTransaction-" + idTransaction,
      data: { id: idTransaction },
    },
  ]);

  expect(await runDeliveryProjector(idTransaction)).toEqual(true);
});

it("should return false if gift card is not correctly sent", async () => {
  let idTransaction = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_REDEEM_FAILED,
      stream_name: "giftCardTransaction-" + idTransaction,
      data: { id: idTransaction },
    },
  ]);

  expect(await runDeliveryProjector(idTransaction)).toEqual(false);
});
