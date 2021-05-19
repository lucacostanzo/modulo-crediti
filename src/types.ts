import type { Message } from "@keix/message-store-client";

export enum CommandType {
  EARN_CREDITS = "EARN_CREDITS",
  USE_CREDITS = "USE_CREDITS",
  ADD_GIFT_CARD = "ADD_GIFT_CARD",
  UPDATES_GIFT_CARD = "UPDATES_GIFT_CARD",
  REMOVE_GIFT_CARD = "REMOVE_GIFT_CARD",
  REDEEM_GIFT_CARD = "REDEEM_GIFT_CARD",
  FAIL_REDEEM_GIFT_CARD = "FAIL_REDEEM_GIFT_CARD",
  SUCCESS_REDEEM_GIFT_CARD = "SUCCESS_REDEEM_GIFT_CARD",
  DELIVERY_GIFT_CARD = "DELIVERY_GIFT_CARD",
}

export type EARN_CREDITS = Message<
  CommandType.EARN_CREDITS,
  {
    id: string;
    amount: number;
    transactionId: string;
    time: Date;
  }
>;
export type USE_CREDITS = Message<
  CommandType.USE_CREDITS,
  {
    id: string;
    amount: number;
    transactionId: string;
    time: Date;
  }
>;
export type ADD_GIFT_CARD = Message<
  CommandType.ADD_GIFT_CARD,
  {
    id: string;
    name: string;
    description: string;
    image_url: string;
    amounts_avaiable: number[];
  }
>;
export type UPDATES_GIFT_CARD = Message<
  CommandType.UPDATES_GIFT_CARD,
  {
    id: string;
    name: string;
    description: string;
    image_url: string;
    amounts_avaiable: number[];
  }
>;
export type REMOVE_GIFT_CARD = Message<
  CommandType.REMOVE_GIFT_CARD,
  {
    id: string;
    name: string;
    description: string;
    image_url: string;
    amounts_avaiable: number[];
  }
>;
export type REDEEM_GIFT_CARD = Message<
  CommandType.REDEEM_GIFT_CARD,
  {
    id: string;
    amount: number;
    transactionId: string;
    idCard: string;
  }
>;
export type FAIL_REDEEM_GIFT_CARD = Message<
  CommandType.FAIL_REDEEM_GIFT_CARD,
  {
    id: string;
    name: string;
    description: string;
    image_url: string;
    amounts_avaiable: number[];
  }
>;
export type SUCCESS_REDEEM_GIFT_CARD = Message<
  CommandType.SUCCESS_REDEEM_GIFT_CARD,
  {
    id: string;
    name: string;
    description: string;
    image_url: string;
    amounts_avaiable: number[];
  }
>;
export type DELIVERY_GIFT_CARD = Message<
  CommandType.DELIVERY_GIFT_CARD,
  {
    id: string;
    amount: number;
    transactionId: string;
    idCard: string;
  }
>;

export type Command =
  | EARN_CREDITS
  | USE_CREDITS
  | ADD_GIFT_CARD
  | UPDATES_GIFT_CARD
  | REMOVE_GIFT_CARD
  | REDEEM_GIFT_CARD
  | FAIL_REDEEM_GIFT_CARD
  | SUCCESS_REDEEM_GIFT_CARD
  | DELIVERY_GIFT_CARD;

export enum EventType {
  CREDITS_EARNED = "CREDITS_EARNED",
  CREDITS_USED = "CREDITS_USED",
  GIFT_CARD_ADDED = "GIFT_CARD_ADDED",
  GIFT_CARD_UPDATED = "GIFT_CARD_UPDATED",
  GIFT_CARD_REMOVED = "GIFT_CARD_REMOVED",
  GIFT_CARD_REDEEM_PENDING = "GIFT_CARD_REDEEM_PENDING",
  GIFT_CARD_REDEEM_PROCESSING = "GIFT_CARD_REDEEM_PROCESSING",
  GIFT_CARD_REDEEM_FAILED = " GIFT_CARD_REDEEM_FAILED",
  GIFT_CARD_REDEEM_SUCCEDED = "GIFT_CARD_REDEEM_SUCCEDED",
  GIFT_CARD_ADDED_ERROR = "GIFT_CARD_ADDED_ERROR",
  GIFT_CARD_REMOVED_ERROR = "GIFT_CARD_REMOVED_ERROR",
}

export type CREDITS_EARNED = Message<
  EventType.CREDITS_EARNED,
  {
    id: string;
    amount: number;
    transactionId: string;
    time: Date;
  }
>;
export type CREDITS_USED = Message<
  EventType.CREDITS_USED,
  {
    id: string;
    amount: number;
    transactionId: string;
    time: Date;
  }
>;
export type GIFT_CARD_ADDED = Message<
  EventType.GIFT_CARD_ADDED,
  {
    id: string;
    name: string;
    description: string;
    image_url: string;
    amounts_avaiable: number[];
  }
>;
export type GIFT_CARD_UPDATED = Message<
  EventType.GIFT_CARD_UPDATED,
  {
    id: string;
    name: string;
    description: string;
    image_url: string;
    amounts_avaiable: number[];
  }
>;
export type GIFT_CARD_REMOVED = Message<
  EventType.GIFT_CARD_REMOVED,
  {
    id: string;
    name: string;
    description: string;
    image_url: string;
    amounts_avaiable: number[];
  }
>;
export type GIFT_CARD_REDEEM_PENDING = Message<
  EventType.GIFT_CARD_REDEEM_PENDING,
  {}
>;

export type GIFT_CARD_REDEEM_PROCESSING = Message<
  EventType.GIFT_CARD_REDEEM_PROCESSING,
  {}
>;
export type GIFT_CARD_REDEEM_FAILED = Message<
  EventType.GIFT_CARD_REDEEM_FAILED,
  {
    id: string;
    amount: number;
    transactionId: string;
    idCard: string;
  }
>;
export type GIFT_CARD_REDEEM_SUCCEDED = Message<
  EventType.GIFT_CARD_REDEEM_SUCCEDED,
  {
    id: string;
    name: string;
    description: string;
    image_url: string;
    amounts_avaiable: number[];
  }
>;

export type GIFT_CARD_REMOVED_ERROR = Message<
  EventType.GIFT_CARD_REMOVED_ERROR,
  {
    id: string;
  }
>;
export type GIFT_CARD_ADDED_ERROR = Message<
  EventType.GIFT_CARD_ADDED_ERROR,
  {
    id: string;
  }
>;

export type Event =
  | CREDITS_EARNED
  | CREDITS_USED
  | GIFT_CARD_ADDED
  | GIFT_CARD_UPDATED
  | GIFT_CARD_REMOVED
  | GIFT_CARD_REDEEM_PENDING
  | GIFT_CARD_REDEEM_PROCESSING
  | GIFT_CARD_REDEEM_FAILED
  | GIFT_CARD_REDEEM_SUCCEDED
  | GIFT_CARD_REMOVED_ERROR
  | GIFT_CARD_ADDED_ERROR;
