import { testUtils } from "@keix/message-store-client";
import { v4 as uuidv4 } from "uuid";
import { CommandType, EventType } from "../src/types";
import { run } from "../src";
import { runBalanceProjector } from "../src/projectors";
import { DateTime } from "luxon";

const idAccount = uuidv4();

it("at zero instant, all accounts have a zero credit balance", async () => {
  expect(await runBalanceProjector(idAccount)).toEqual(0);
});

it("Sarà possibile versare o prelevare dei crediti all'interno dell'account utente", async () => {
  testUtils.setupMessageStore([
    {
      type: EventType.CREDITS_EARNED,
      stream_name: "creditAccount-" + idAccount,
      data: { id: idAccount, amount: 300, time: new Date(2021, 5, 18) },
    },
    {
      type: CommandType.USE_CREDITS,
      stream_name: "creditAccount:command-" + idAccount,
      data: { id: idAccount, amount: 200, time: new Date(2021, 5, 18) },
    },
  ]);

  run();

  await testUtils.waitForExpect(async () => {
    let eventsCredits = testUtils.getStreamMessages(
      "creditAccount-" + idAccount
    );
    expect(eventsCredits).toHaveLength(2);
    expect(eventsCredits[0].type).toEqual(EventType.CREDITS_EARNED);
    expect(eventsCredits[0].data.id).toEqual(idAccount);
    expect(eventsCredits[1].type).toEqual(EventType.CREDITS_USED);
    expect(eventsCredits[1].data.id).toEqual(idAccount);
    expect(await runBalanceProjector(idAccount)).toEqual(100);
  });
});

it("should credit money into an account", async () => {
  let idTransaction = uuidv4();
  testUtils.setupMessageStore([
    {
      type: CommandType.EARN_CREDITS,
      stream_name: "creditAccount:command-" + idAccount,
      data: {
        id: idAccount,
        amount: 1000,
        time: new Date(2021, 5, 18),
        transactionId: idTransaction,
      },
    },
  ]);

  run();

  await testUtils.waitForExpect(async () => {
    let eventsCredits = testUtils.getStreamMessages(
      "creditAccount-" + idAccount
    );
    expect(eventsCredits).toHaveLength(1);
    expect(eventsCredits[0].type).toEqual(EventType.CREDITS_EARNED);
    expect(eventsCredits[0].data.id).toEqual(idAccount);
  });
});

it("should be possible to use the credits, only if the user's balance has a minimum amount equal to a constant", async () => {
  testUtils.setupMessageStore([
    {
      type: EventType.CREDITS_EARNED,
      stream_name: "creditAccount-" + idAccount,
      data: { id: idAccount, amount: 150, time: new Date(2021, 5, 18) },
    },
    {
      type: CommandType.USE_CREDITS,
      stream_name: "creditAccount:command-" + idAccount,
      data: { id: idAccount, amount: 100, time: new Date(2021, 5, 18) },
    },
  ]);

  run();

  await testUtils.waitForExpect(async () => {
    let eventsCredits = testUtils.getStreamMessages(
      "creditAccount-" + idAccount
    );
    expect(eventsCredits).toHaveLength(2);
    expect(eventsCredits[0].type).toEqual(EventType.CREDITS_EARNED);
    expect(eventsCredits[0].data.id).toEqual(idAccount);
    expect(eventsCredits[1].type).toEqual(EventType.CREDITS_USED);
    expect(eventsCredits[1].data.id).toEqual(idAccount);
    expect(await runBalanceProjector(idAccount)).toEqual(50);
  });
});

it("credits must be used within MAX_USE_CREDITS_DELAY days, after this interval they are no longer considered in the balance but are considered expired. ", async () => {
  testUtils.setupMessageStore([
    {
      type: EventType.CREDITS_USED,
      stream_name: "creditAccount-" + idAccount,
      data: { id: idAccount, amount: 100, time: new Date(2021, 5, 18) },
    },

    {
      type: CommandType.USE_CREDITS,
      stream_name: "creditAccount:command-" + idAccount,
      data: { id: idAccount, amount: 100, time: new Date(2021, 5, 18) },
    },
  ]);

  run();

  await testUtils.waitForExpect(async () => {
    let eventsCredits = testUtils.getStreamMessages(
      "creditAccount-" + idAccount
    );
    expect(eventsCredits).toHaveLength(1);
    expect(eventsCredits[0].type).toEqual(EventType.CREDITS_USED);
    expect(eventsCredits[0].data.id).toEqual(idAccount);
    expect(await runBalanceProjector(idAccount));
  });
});

it("should create a new transaction id", async () => {
  let idTransaction = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.CREDITS_EARNED,
      stream_name: "creditAccount-" + idAccount,
      data: {
        id: idAccount,
        amount: 150,
        time: new Date(2021, 5, 18),
        transactionId: idTransaction,
      },
    },
    {
      type: CommandType.USE_CREDITS,
      stream_name: "creditAccount:command-" + idAccount,
      data: {
        id: idAccount,
        amount: 100,
        time: new Date(2021, 5, 18),
        transactionId: idTransaction,
      },
    },
  ]);

  run();

  await testUtils.waitForExpect(async () => {
    let eventsCredits = testUtils.getStreamMessages(
      "creditAccount-" + idAccount
    );
    expect(eventsCredits).toHaveLength(2);
    expect(eventsCredits[0].type).toEqual(EventType.CREDITS_EARNED);
    expect(eventsCredits[0].data.id).toEqual(idAccount);
    expect(eventsCredits[1].type).toEqual(EventType.CREDITS_USED);
    expect(eventsCredits[1].data.id).toEqual(idAccount);
    expect(await runBalanceProjector(idAccount)).toEqual(50);
  });
});
