import Dexie, { type Table } from "dexie";
import type { ChatMessage } from "@/lib/types";
import type { VisibilityType } from "@/components/chat/visibility-selector";

export interface DexieChat {
  id: string;
  title: string;
  createdAt: Date;
  userId: string;
  visibility: VisibilityType;
}

export interface DexieMessage {
  id: string;
  chatId: string;
  role: "user" | "assistant" | "system";
  content: string;
  parts: any[];
  createdAt: Date;
}

export interface DexieUser {
  id: string;
  username: string;
  password: string;
  createdAt: Date;
}

export class KaliDatabase extends Dexie {
  chats!: Table<DexieChat>;
  messages!: Table<DexieMessage>;
  users!: Table<DexieUser>;

  constructor() {
    super("KaliDatabase");
    this.version(3).stores({
      chats: "id, title, createdAt, userId",
      messages: "id, chatId, role, createdAt",
      users: "id, username, createdAt",
    });
  }
}

export const db = new KaliDatabase();
