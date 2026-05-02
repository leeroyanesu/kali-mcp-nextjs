import "server-only";

import type { VisibilityType } from "@/components/chat/visibility-selector";
import type { ArtifactKind } from "@/components/chat/artifact";
import { ChatbotError } from "../errors";
import { 
  localSaveChat, 
  localGetChatById, 
  localGetChatsByUserId, 
  localSaveMessages, 
  localGetMessagesByChatId,
  localUpdateMessage,
  localDeleteChatById,
  localDeleteAllChatsByUserId,
  localUpdateChatTitle,
  localSaveDocument,
  localUpdateDocumentContent,
  localGetDocumentById,
  localGetDocumentsById
} from "./local-storage";

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await localSaveChat({ id, userId, title, visibility });
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to save chat");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await localDeleteChatById(id);
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  try {
    return await localDeleteAllChatsByUserId(userId);
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const chats = await localGetChatsByUserId(id);
    return {
      chats: chats.slice(0, limit),
      hasMore: chats.length > limit,
    };
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get chats by user id"
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    return await localGetChatById(id);
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to get chat by id");
  }
}

export async function saveMessages({ messages }: { messages: any[] }) {
  try {
    return await localSaveMessages(messages);
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to save messages");
  }
}

export async function updateMessage({
  id,
  parts,
}: {
  id: string;
  parts: any;
}) {
  try {
    return await localUpdateMessage(id, parts);
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to update message");
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await localGetMessagesByChatId(id);
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get messages by chat id"
    );
  }
}

export async function updateChatTitleById({
  chatId,
  title,
}: {
  chatId: string;
  title: string;
}) {
  try {
    return await localUpdateChatTitle(chatId, title);
  } catch (_error) {
    return;
  }
}

// Stub functions for other parts of the app that expect them
export async function voteMessage() { return; }
export async function getVotesByChatId() { return []; }
export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await localSaveDocument({ id, title, kind, content, userId });
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to save document");
  }
}

export async function updateDocumentContent({
  id,
  content,
}: {
  id: string;
  content: string;
}) {
  try {
    return await localUpdateDocumentContent(id, content);
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to update document content"
    );
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    return await localGetDocumentsById(id);
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get documents by id"
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    return await localGetDocumentById(id);
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get document by id"
    );
  }
}
export async function deleteDocumentsByIdAfterTimestamp() { return []; }
export async function saveSuggestions() { return; }
export async function getSuggestionsByDocumentId() { return []; }
export async function getMessageById() { return []; }
export async function deleteMessagesByChatIdAfterTimestamp() { return; }
export async function updateChatVisibilityById() { return; }
export async function getMessageCountByUserId() { return 0; }
export async function createStreamId() { return; }
export async function getStreamIdsByChatId() { return []; }
