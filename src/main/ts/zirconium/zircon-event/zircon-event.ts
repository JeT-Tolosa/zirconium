// event content
export type ZirconEventPayload = { [key: string]: unknown };

export type ZirconEventGenericPayload = {};

export type ZirconEventListenerCallback<
  R extends ZirconEventRegistry,
  K extends keyof R['incoming'],
> = (payload: ZirconIncomingPayload<R, K>, trace: ZirconEventTrace) => void;

export type ZirconEventInfo = {
  eventId: string;
  eventName: string;
  timestamp: number;
  emitterId: string;
};

export type ZirconEventTrace = ZirconEventInfo[];

// export type ZirconEvent<
//   Payload extends ZirconEventPayload = ZirconEventGenericPayload,
// > = {
//   eventId: string;
//   timestamp: number;
//   sourceId: string;
//   payload: Payload;
//   info: ZirconEventInfo;
// };

/** registry for Zircon events
 * It is divided in two Records: incoming and outgoing
 * Both are composed of eventNamle: EventPayload
 */
export type ZirconEventRegistry = {
  incoming: Record<string, ZirconEventPayload>;
  outgoing: Record<string, ZirconEventPayload>;
};

// merge two zircon registries
export type MergeZirconRegistries<
  A extends ZirconEventRegistry,
  B extends ZirconEventRegistry,
> = A & B;

export const EmptyRegistry: ZirconEventRegistry = {
  incoming: {},
  outgoing: {},
};

/**
 * Specific payload
 */
export type ZirconIncomingPayload<
  R extends ZirconEventRegistry,
  K extends keyof R['incoming'],
> = R['incoming'][K];

export type ZirconOutgoingPayload<
  R extends ZirconEventRegistry,
  K extends keyof R['outgoing'],
> = R['outgoing'][K];

/**
 * Union of all incoming payloads of the given registry
 */
export type ZirconIncomingPayloadUnion<R extends ZirconEventRegistry> =
  R['incoming'][keyof R['incoming']];

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
