// event argument
export type ZirconEventArgument = { [key: string]: unknown };

// registry for Zircon events
export type ZirconRegistry = {
  incoming: Record<string, ZirconEventArgument>;
  outgoing: Record<string, ZirconEventArgument>;
};

// merge two registries
export type MergeZirconRegistries<
  A extends ZirconRegistry,
  B extends ZirconRegistry,
> = A & B;

export const EmptyRegistry: ZirconRegistry = {
  incoming: {},
  outgoing: {},
};

export type PickEvents<E, K extends keyof E> = Pick<E,K>;
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

//usage example
/*
 export type ZirconWindowEvents = {
  WINDOW_SET_PARENT_DESKTOP_DONE: {
    windowId: string;
    desktopTargetId: string;
  };
  WINDOW_SET_PARENT_DESKTOP_ERROR: {
    windowId: string;
    desktopTargetId: string;
    error: string;
  };
  WINDOW_SET_PARENT_DESKTOP_REQUEST: {
    windowId: string;
    desktopTargetId: string;
    position: { x: number; y: number };
  };
  WINDOW_RESIZED: { windowId: string };
  WINDOW_DISPLAYED: { windowId: string };
};

export type ZirconWindowEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [
        PickEvents<
          ZirconWindowEvents,
          'WINDOW_SET_PARENT_DESKTOP_DONE' | 'WINDOW_SET_PARENT_DESKTOP_ERROR'
        >,
      ]
    >;
    outgoing: MergePickEvents<
      [
        PickEvents<
          ZirconWindowEvents,
          | 'WINDOW_RESIZED'
          | 'WINDOW_DISPLAYED'
          | 'WINDOW_SET_PARENT_DESKTOP_REQUEST'
        >,
      ]
    >;
  },
  ZirconObjectUIEventRegistry
>;
*/
