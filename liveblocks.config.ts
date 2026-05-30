// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      cursor: { x: number; y: number } | null;
      isThinking: boolean;
      thinking?: boolean;
    };

    // The Storage tree for the room, for useMutation, useStorage, etc.
    Storage: {
      canvas_state: {
        nodes: Array<{ id: string; [key: string]: unknown }>;
        edges: Array<{ id: string; [key: string]: unknown }>;
      };
    };

    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string;
      info: {
        id?: string;
        name: string;
        avatar: string;
        cursorColor: string;
      };
    };

    // Custom events, for useBroadcastEvent, useEventListener
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    RoomEvent: {};
      // Example has two events, using a union
      // | { type: "PLAY" } 
      // | { type: "REACTION"; emoji: "🔥" };

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    ThreadMetadata: {
      // Example, attaching coordinates to a thread
      // x: number;
      // y: number;
    };

    // Custom room info set with resolveRoomsInfo, for useRoomInfo
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    RoomInfo: {
      // Example, rooms with a title and url
      // title: string;
      // url: string;
    };
  }
}

export {};
