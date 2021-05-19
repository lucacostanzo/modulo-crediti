import { testUtils } from "@keix/message-store-client";
import { v4 as uuidv4 } from "uuid";
import { CommandType, EventType } from "../src/types";
import { run } from "../src";
import { runBalanceProjector } from "../src/projectors";
import { DateTime } from "luxon";

const IdAccount = uuidv4();

it("All'istante zero, tutti gli account hanno un balance di zero crediti", async () => {
  expect(await runBalanceProjector(IdAccount)).toEqual(0);
});

it("Sarà possibile versare o prelevare dei crediti all'interno dell'account utente", async () => {
  testUtils.setupMessageStore([
    {
      type: EventType.CREDITS_EARNED,
      stream_name: "creditAccount-" + IdAccount,
      data: { id: IdAccount, amount: 300, time: new Date(2021, 5, 18) },
    },
    {
      type: CommandType.USE_CREDITS,
      stream_name: "creditAccount:command-" + IdAccount,
      data: { id: IdAccount, amount: 200, time: new Date(2021, 5, 18) },
    },
  ]);

  run();

  await testUtils.waitForExpect(async () => {
    let eventsCredits = testUtils.getStreamMessages(
      "creditAccount-" + IdAccount
    );
    expect(eventsCredits).toHaveLength(2);
    expect(eventsCredits[0].type).toEqual(EventType.CREDITS_EARNED);
    expect(eventsCredits[0].data.id).toEqual(IdAccount);
    expect(eventsCredits[1].type).toEqual(EventType.CREDITS_USED);
    expect(eventsCredits[1].data.id).toEqual(IdAccount);
    expect(await runBalanceProjector(IdAccount)).toEqual(100);
  });
});

it("accredito soldi in un account", async () => {
  let IdTransaction = uuidv4();
  testUtils.setupMessageStore([
    {
      type: CommandType.EARN_CREDITS,
      stream_name: "creditAccount:command-" + IdAccount,
      data: {
        id: IdAccount,
        amount: 1000,
        time: new Date(2021, 5, 18),
        transactionId: IdTransaction,
      },
    },
  ]);

  run();

  await testUtils.waitForExpect(async () => {
    let eventsCredits = testUtils.getStreamMessages(
      "creditAccount-" + IdAccount
    );
    expect(eventsCredits).toHaveLength(1);
    expect(eventsCredits[0].type).toEqual(EventType.CREDITS_EARNED);
    expect(eventsCredits[0].data.id).toEqual(IdAccount);
  });
});

it("Sarà possibile utilizzare i crediti, soltanto se il balance dell'utente ha un amount minimo pari ad una costante", async () => {
  testUtils.setupMessageStore([
    {
      type: EventType.CREDITS_EARNED,
      stream_name: "creditAccount-" + IdAccount,
      data: { id: IdAccount, amount: 150, time: new Date(2021, 5, 18) },
    },
    {
      type: CommandType.USE_CREDITS,
      stream_name: "creditAccount:command-" + IdAccount,
      data: { id: IdAccount, amount: 100, time: new Date(2021, 5, 18) },
    },
  ]);

  run();

  await testUtils.waitForExpect(async () => {
    let eventsCredits = testUtils.getStreamMessages(
      "creditAccount-" + IdAccount
    );
    expect(eventsCredits).toHaveLength(2);
    expect(eventsCredits[0].type).toEqual(EventType.CREDITS_EARNED);
    expect(eventsCredits[0].data.id).toEqual(IdAccount);
    expect(eventsCredits[1].type).toEqual(EventType.CREDITS_USED);
    expect(eventsCredits[1].data.id).toEqual(IdAccount);
    expect(await runBalanceProjector(IdAccount)).toEqual(50);
  });
});

it("i crediti devono essere utilizzati entro MAX_USE_CREDITS_DELAY giorni, dopo questo intervallo non vengono più considerati nel balance ma sono considerati scaduti. ", async () => {
  testUtils.setupMessageStore([
    {
      type: EventType.CREDITS_USED,
      stream_name: "creditAccount-" + IdAccount,
      data: { id: IdAccount, amount: 100, time: new Date(2021, 5, 18) },
    },

    {
      type: CommandType.USE_CREDITS,
      stream_name: "creditAccount:command-" + IdAccount,
      data: { id: IdAccount, amount: 100, time: new Date(2021, 5, 18) },
    },
  ]);

  run();

  await testUtils.waitForExpect(async () => {
    let eventsCredits = testUtils.getStreamMessages(
      "creditAccount-" + IdAccount
    );
    expect(eventsCredits).toHaveLength(1);
    expect(eventsCredits[0].type).toEqual(EventType.CREDITS_USED);
    expect(eventsCredits[0].data.id).toEqual(IdAccount);
    expect(await runBalanceProjector(IdAccount));
  });
});

it("should create a new transaction id", async () => {
  let IdTransaction = uuidv4();
  testUtils.setupMessageStore([
    {
      type: EventType.CREDITS_EARNED,
      stream_name: "creditAccount-" + IdAccount,
      data: {
        id: IdAccount,
        amount: 150,
        time: new Date(2021, 5, 18),
        transactionId: IdTransaction,
      },
    },
    {
      type: CommandType.USE_CREDITS,
      stream_name: "creditAccount:command-" + IdAccount,
      data: {
        id: IdAccount,
        amount: 100,
        time: new Date(2021, 5, 18),
        transactionId: IdTransaction,
      },
    },
  ]);

  run();

  await testUtils.waitForExpect(async () => {
    let eventsCredits = testUtils.getStreamMessages(
      "creditAccount-" + IdAccount
    );
    expect(eventsCredits).toHaveLength(2);
    expect(eventsCredits[0].type).toEqual(EventType.CREDITS_EARNED);
    expect(eventsCredits[0].data.id).toEqual(IdAccount);
    expect(eventsCredits[1].type).toEqual(EventType.CREDITS_USED);
    expect(eventsCredits[1].data.id).toEqual(IdAccount);
    expect(await runBalanceProjector(IdAccount)).toEqual(50);
  });
});
