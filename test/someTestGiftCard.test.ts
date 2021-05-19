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
  let IdCard = uuidv4();
  testUtils.setupMessageStore([
    {
      type: CommandType.ADD_GIFT_CARD,
      stream_name: "giftCard:command-" + IdCard,
      data: {
        id: IdCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
  ]);

  runGiftCard();

  await testUtils.waitForExpect(async () => {
    let eventsCard = testUtils.getStreamMessages("giftCard-" + IdCard);
    expect(eventsCard).toHaveLength(1);
    expect(eventsCard[0].type).toEqual(EventType.GIFT_CARD_ADDED);
    expect(eventsCard[0].data.id).toEqual(IdCard);
  });
});

it("should remove a gift card", async () => {
  let IdCard = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + IdCard,
      data: {
        id: IdCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
    {
      type: CommandType.REMOVE_GIFT_CARD,
      stream_name: "giftCard:command-" + IdCard,
      data: {
        id: IdCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
  ]);

  runGiftCard();

  await testUtils.waitForExpect(async () => {
    let eventsCard = testUtils.getStreamMessages("giftCard-" + IdCard);
    expect(eventsCard).toHaveLength(2);
    expect(eventsCard[0].type).toEqual(EventType.GIFT_CARD_ADDED);
    expect(eventsCard[0].data.id).toEqual(IdCard);
    expect(eventsCard[1].type).toEqual(EventType.GIFT_CARD_REMOVED);
    expect(eventsCard[1].data.id).toEqual(IdCard);
  });
});

it("should check if a gift card exist", async () => {
  let IdCard = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + IdCard,
      data: {
        id: IdCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
  ]);

  runGiftCard();

  await testUtils.waitForExpect(async () => {
    let eventsCard = testUtils.getStreamMessages("giftCard-" + IdCard);
    expect(eventsCard).toHaveLength(1);
    expect(eventsCard[0].type).toEqual(EventType.GIFT_CARD_ADDED);
    expect(eventsCard[0].data.id).toEqual(IdCard);
    expect(await runGiftCardProjector(IdCard)).toEqual(true);
  });
});

it("should check if a gift card not exist", async () => {
  let IdCard = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + IdCard,
      data: {
        id: IdCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
  ]);

  runGiftCard();

  await testUtils.waitForExpect(async () => {
    let eventsCard = testUtils.getStreamMessages("giftCard-" + IdCard);
    expect(eventsCard).toHaveLength(1);
    expect(eventsCard[0].type).toEqual(EventType.GIFT_CARD_ADDED);
    expect(eventsCard[0].data.id).toEqual(IdCard);
    expect(await runGiftCardProjector(IdCard)).toEqual(true);
  });
});

it("should fail add card", async () => {
  let IdCard = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + IdCard,
      data: {
        id: IdCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
    {
      type: CommandType.ADD_GIFT_CARD,
      stream_name: "giftCard:command-" + IdCard,
      data: {
        id: IdCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
  ]);

  runGiftCard();

  await testUtils.waitForExpect(async () => {
    let eventsCard = testUtils.getStreamMessages("giftCard-" + IdCard);
    expect(eventsCard).toHaveLength(2);
    expect(eventsCard[0].type).toEqual(EventType.GIFT_CARD_ADDED);
    expect(eventsCard[0].data.id).toEqual(IdCard);
    expect(eventsCard[1].type).toEqual(EventType.GIFT_CARD_ADDED_ERROR);
    expect(eventsCard[1].data.id).toEqual(IdCard);
    expect(await runGiftCardProjector(IdCard)).toEqual(true);
  });
});

it("should fail remove card", async () => {
  let IdCard = uuidv4();
  testUtils.setupMessageStore([
    {
      type: CommandType.REMOVE_GIFT_CARD,
      stream_name: "giftCard:command-" + IdCard,
      data: {
        id: IdCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
  ]);

  runGiftCard();

  await testUtils.waitForExpect(async () => {
    let eventsCard = testUtils.getStreamMessages("giftCard-" + IdCard);
    expect(eventsCard).toHaveLength(1);
    expect(eventsCard[0].type).toEqual(EventType.GIFT_CARD_REMOVED_ERROR);
    expect(eventsCard[0].data.id).toEqual(IdCard);
    expect(await runGiftCardProjector(IdCard)).toEqual(false);
  });
});

it("should check if removed", async () => {
  let IdCard = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + IdCard,
      data: {
        id: IdCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
    {
      type: EventType.GIFT_CARD_REMOVED,
      stream_name: "giftCard-" + IdCard,
      data: {
        id: IdCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
  ]);

  runGiftCard();

  await testUtils.waitForExpect(async () => {
    expect(await runGiftCardProjector(IdCard)).toEqual(false);
  });
});

it("should redeem gift card", async () => {
  let IdCard = uuidv4();
  let IdAccount = uuidv4();
  let IdTransaction = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.CREDITS_EARNED,
      stream_name: "creditAccount-" + IdAccount,
      data: {
        id: IdAccount,
        amount: 150,
      },
    },
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + IdCard,
      data: {
        id: IdCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
    {
      type: CommandType.REDEEM_GIFT_CARD,
      stream_name: "giftCardTransaction:command-" + IdTransaction,
      data: {
        transactionId: IdTransaction,
        id: IdCard,
        IdUser: IdAccount,
        amount: 15,
      },
    },
    {
      type: EventType.CREDITS_USED,
      stream_name: "creditAccount-" + IdAccount,
      data: {
        id: IdAccount,
        amount: 15,
      },
    },
  ]);

  runGiftCard();

  await testUtils.waitForExpect(async () => {
    expect(await runGiftCardProjector(IdCard)).toEqual(true);
    let eventsCard = testUtils.getStreamMessages("giftCard-" + IdCard);
    let eventsCredits = testUtils.getStreamMessages(
      "creditAccount-" + IdAccount
    );
    let eventsCardTransaction = testUtils.getStreamMessages(
      "giftCardTransaction-" + IdTransaction
    );
    expect(eventsCredits).toHaveLength(2);
    expect(eventsCard).toHaveLength(1);
    expect(eventsCardTransaction).toHaveLength(1);
    expect(eventsCredits[0].type).toEqual(EventType.CREDITS_EARNED);
    expect(eventsCredits[0].data.id).toEqual(IdAccount);
    expect(eventsCard[0].type).toEqual(EventType.GIFT_CARD_ADDED);
    expect(eventsCard[0].data.id).toEqual(IdCard);
    expect(eventsCardTransaction[0].type).toEqual(
      EventType.GIFT_CARD_REDEEM_PENDING
    );
    expect(eventsCardTransaction[0].data.id).toEqual(IdTransaction);
    expect(eventsCredits[1].type).toEqual(EventType.CREDITS_USED);
    expect(eventsCredits[1].data.id).toEqual(IdAccount);
  });
});

it("should return false if gift card is not pending", async () => {
  let IdCard = uuidv4();
  let IdTransaction = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCardTransaction-" + IdTransaction,
      data: {
        id: IdCard,
        name: "Card1",
        description: "la prima carta",
        image_url: "www.card1.it",
        amounts_avaiable: [5, 15, 25, 50, 100],
      },
    },
  ]);
  await testUtils.waitForExpect(async () => {
    expect(await runPendingProjector(IdTransaction)).toEqual(false);
  });
});

it("should return true if gift card is pending", async () => {
  let IdTransaction = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_REDEEM_PENDING,
      stream_name: "giftCardTransaction-" + IdTransaction,
      data: {},
    },
  ]);
  await testUtils.waitForExpect(async () => {
    expect(await runPendingProjector(IdTransaction)).toEqual(true);
  });
});

it("should return true if gift card is processing", async () => {
  let IdTransaction = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_REDEEM_PROCESSING,
      stream_name: "giftCardTransaction-" + IdTransaction,
      data: { id: IdTransaction },
    },
  ]);

  expect(await runProcessingProjector(IdTransaction)).toEqual(true);
});

it("should return false if gift card is not processing", async () => {
  let IdCard = uuidv4();
  let IdTransaction = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_ADDED,
      stream_name: "giftCard-" + IdCard,
      data: {
        id: IdCard,
        name: "Amazon",
        description: "Carta per comprarti il frigo",
        image_url: "https://img.it",
        amounts: [5, 10, 20, 30, 50],
      },
    },
    {
      type: EventType.GIFT_CARD_REDEEM_PENDING,
      stream_name: "giftCardTransaction-" + IdTransaction,
      data: {
        id: IdTransaction,
      },
    },
  ]);
  await testUtils.waitForExpect(async () => {
    expect(await runProcessingProjector(IdTransaction)).toEqual(false);
  });
});

it("should return succeded if giftCard is correctly sent", async () => {
  let IdTransaction = uuidv4();
  let IdCard = uuidv4();
  let IdAccount = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_REDEEM_PROCESSING,
      stream_name: "giftCardTransaction-" + IdTransaction,
      data: { transactionId: IdTransaction, id: IdCard, IdUser: IdAccount },
    },
    {
      type: CommandType.DELIVERY_GIFT_CARD,
      stream_name: "giftCardTransaction:command-" + IdTransaction,
      data: { transactionId: IdTransaction, id: IdCard, IdUser: IdAccount },
    },
  ]);
  await testUtils.waitForExpect(async () => {
    let eventsCardTransaction = testUtils.getStreamMessages(
      "giftCardTransaction-" + IdTransaction
    );
    expect(eventsCardTransaction).toHaveLength(2);
    expect(eventsCardTransaction[1].type).toEqual(
      EventType.GIFT_CARD_REDEEM_SUCCEDED
    );
  });
});

it("should return true if gift card is correctly sent", async () => {
  let IdTransaction = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_REDEEM_SUCCEDED,
      stream_name: "giftCardTransaction-" + IdTransaction,
      data: { id: IdTransaction },
    },
  ]);

  expect(await runDeliveryProjector(IdTransaction)).toEqual(true);
});

it("should return false if gift card is not correctly sent", async () => {
  let IdTransaction = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.GIFT_CARD_REDEEM_FAILED,
      stream_name: "giftCardTransaction-" + IdTransaction,
      data: { id: IdTransaction },
    },
  ]);

  expect(await runDeliveryProjector(IdTransaction)).toEqual(false);
});
