// event content
export type ZirconEventPayload = { [key: string]: unknown };

export type ZirconEventGenericPayload = {};

export type ZirconEventInfo = {
  eventId: string;
  parentEventId?: string;
  timestamp: number;
  emitterId?: string;
};

export type ZirconEvent<
  Payload extends ZirconEventPayload = ZirconEventGenericPayload,
> = {
  eventId: string;
  parentEventId: string;
  timestamp: number;
  sourceId: string;
  payload: Payload;
};

// registry for Zircon events
export type ZirconEventRegistry = {
  incoming: Record<string, ZirconEventPayload>;
  outgoing: Record<string, ZirconEventPayload>;
};

// merge two registries
export type MergeZirconRegistries<
  A extends ZirconEventRegistry,
  B extends ZirconEventRegistry,
> = A & B;

export const EmptyRegistry: ZirconEventRegistry = {
  incoming: {},
  outgoing: {},
};

export type PickEvents<E, K extends keyof E> = Pick<E, K>;
// {
//   [P in K]: E[P];
// };

export type Merge<A, B> = {
  [K in keyof (A & B)]: (A & B)[K];
};

export type MergePickEvents<T extends readonly unknown[]> = T extends [
  infer First,
  infer Second,
  ...infer Rest,
]
  ? MergePickEvents<[Merge<First, Second>, ...Rest]>
  : T extends [infer Only]
    ? Only
    : {};
