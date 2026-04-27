"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { usePathname } from "next/navigation";
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useSWR, { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { useDataStream } from "@/components/chat/data-stream-provider";
import { getChatHistoryPaginationKey } from "@/components/chat/sidebar-history";
import { toast } from "@/components/chat/toast";
export type VisibilityType = "private" | "public";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import type { Vote } from "@/lib/db/schema";
import { ChatbotError } from "@/lib/errors";
import type { ChatMessage } from "@/lib/types";
import { fetcher, fetchWithErrorHandlers, generateUUID, getTextFromMessage } from "@/lib/utils";
import { db as dexieDb } from "@/lib/db/dexie";
import { useLiveQuery } from "dexie-react-hooks";

type ActiveChatContextValue = {
  chatId: string;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  status: UseChatHelpers<ChatMessage>["status"];
  stop: UseChatHelpers<ChatMessage>["stop"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  addToolApprovalResponse: UseChatHelpers<ChatMessage>["addToolApprovalResponse"];
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  visibilityType: VisibilityType;
  isReadonly: boolean;
  isLoading: boolean;
  votes: Vote[] | undefined;
  currentModelId: string;
  setCurrentModelId: (id: string) => void;
};

const ActiveChatContext = createContext<ActiveChatContextValue | null>(null);

function extractChatId(pathname: string): string | null {
  const match = pathname.match(/\/chat\/([^/]+)/);
  return match ? match[1] : null;
}

export function ActiveChatProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { setDataStream } = useDataStream();
  const { mutate } = useSWRConfig();

  const chatIdFromUrl = extractChatId(pathname);
  const isNewChat = !chatIdFromUrl;
  const newChatIdRef = useRef(generateUUID());
  const prevPathnameRef = useRef(pathname);

  if (isNewChat && prevPathnameRef.current !== pathname) {
    newChatIdRef.current = generateUUID();
  }
  prevPathnameRef.current = pathname;

  const chatId = chatIdFromUrl ?? newChatIdRef.current;

  const [currentModelId, setCurrentModelId] = useState(DEFAULT_CHAT_MODEL);
  const currentModelIdRef = useRef(currentModelId);
  useEffect(() => {
    currentModelIdRef.current = currentModelId;
  }, [currentModelId]);

  const [input, setInput] = useState("");

  const { data: chatData, isLoading } = useSWR(
    isNewChat
      ? null
      : `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/messages?chatId=${chatId}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const initialMessages: ChatMessage[] = useMemo(() => {
    if (chatData?.messages && chatData.messages.length > 0) {
      return chatData.messages;
    }
    return [];
  }, [chatData?.messages]);
  
  // Local persistence: load from Dexie if server data is not available or to complement it
  const localMessages = useLiveQuery(
    () => dexieDb.messages.where("chatId").equals(chatId).sortBy("createdAt"),
    [chatId]
  );

  const visibility: VisibilityType = isNewChat
    ? "private"
    : (chatData?.visibility ?? "private");

  const {
    messages,
    setMessages,
    sendMessage: originalSendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
    addToolApprovalResponse,
  } = useChat<ChatMessage>({
    id: chatId,
    messages: initialMessages,
    generateId: generateUUID,
    sendAutomaticallyWhen: ({ messages: currentMessages }) => {
      const lastMessage = currentMessages.at(-1);
      return (
        lastMessage?.parts?.some(
          (part) =>
            "state" in part &&
            part.state === "approval-responded" &&
            "approval" in part &&
            (part.approval as { approved?: boolean })?.approved === true
        ) ?? false
      );
    },
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/chat`,
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest(request) {
        const lastMessage = request.messages.at(-1);
        
        return {
          body: {
            id: request.id,
            message: lastMessage,
            messages: request.messages, // Send full history for context
            selectedChatModel: currentModelIdRef.current,
            selectedVisibilityType: visibility,
            ...request.body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
    },
    onFinish: async (message: any) => {
      console.log("[Dexie] Attempting to save AI response:", message);
      try {
        const messageId = message.id || generateUUID();
        await dexieDb.messages.put({
          id: messageId,
          chatId: chatId,
          role: "assistant",
          content: message.message.parts[1].text,
          parts: message.message.parts || [],
          createdAt: new Date(),
        });
        console.log("[Dexie] AI response saved successfully with ID:", messageId);
        mutate(unstable_serialize(getChatHistoryPaginationKey));
      } catch (err) {
        console.error("[Dexie] Failed to save AI response:", err);
      }
    },
    onError: (error) => {
      if (error instanceof ChatbotError) {
        toast({ type: "error", description: error.message });
      } else {
        toast({
          type: "error",
          description: error.message || "Oops, an error occurred!",
        });
      }
    },
  });

  const sendMessage: UseChatHelpers<ChatMessage>["sendMessage"] = async (
    message,
    options
  ) => {
    // Create chat entry if it doesn't exist in Dexie
    const existingChat = await dexieDb.chats.get(chatId);
    if (!existingChat) {
      const initialTitle =
        typeof message === "string"
          ? (message as any).slice(0, 40) + ((message as any).length > 40 ? "..." : "")
          : getTextFromMessage(message as any).slice(0, 40) || "New Conversation";

      await dexieDb.chats.put({
        id: chatId,
        title: initialTitle,
        createdAt: new Date(),
        userId: "local-admin",
        visibility: "private",
      });
    }

    // Save user message to Dexie immediately
    console.log("[Dexie] Saving user message:", (message as any).id || "new");
    try {
      await dexieDb.messages.put({
        id: (message as any).id || generateUUID(),
        chatId: chatId,
        role: (message as any).role || "user",
        content: (message as any).content || (message as any).parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') || (typeof message === 'string' ? message : ''),
        parts: (message as any).parts || [{ type: "text", text: message }],
        createdAt: new Date(),
      });
      console.log("[Dexie] User message saved successfully");
    } catch (err) {
      console.error("[Dexie] Failed to save user message:", err);
    }

    return originalSendMessage(message, options);
  };

  const loadedChatIds = useRef(new Set<string>());

  if (isNewChat && !loadedChatIds.current.has(newChatIdRef.current)) {
    loadedChatIds.current.add(newChatIdRef.current);
  }

  useEffect(() => {
    if (loadedChatIds.current.has(chatId)) {
      return;
    }
    
    const loadMessages = async () => {
      console.log("[Dexie] Attempting to load messages for chatId:", chatId);
      const dbMessages = await dexieDb.messages.where("chatId").equals(chatId).sortBy("createdAt");
      
      if (dbMessages && dbMessages.length > 0) {
        loadedChatIds.current.add(chatId);
        setMessages(dbMessages.map(m => ({
          id: m.id,
          role: m.role as any,
          content: m.content || "",
          parts: m.parts || [],
          metadata: { createdAt: m.createdAt.toISOString() }
        })));
      } else if (chatData?.messages && chatData.messages.length > 0) {
        console.log(`[Server] No local messages, found ${chatData.messages.length} server messages`);
        loadedChatIds.current.add(chatId);
        setMessages(chatData.messages);
      }
    };

    loadMessages();
  }, [chatId, chatData?.messages, setMessages]);

  const prevChatIdRef = useRef(chatId);
  useEffect(() => {
    if (prevChatIdRef.current !== chatId) {
      prevChatIdRef.current = chatId;
      if (isNewChat) {
        setMessages([]);
      }
    }
  }, [chatId, isNewChat, setMessages]);

  useEffect(() => {
    if (chatData && !isNewChat) {
      const cookieModel = document.cookie
        .split("; ")
        .find((row) => row.startsWith("chat-model="))
        ?.split("=")[1];
      if (cookieModel) {
        setCurrentModelId(decodeURIComponent(cookieModel));
      }
    }
  }, [chatData, isNewChat]);

  const hasAppendedQueryRef = useRef(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("query");
    if (query && !hasAppendedQueryRef.current) {
      hasAppendedQueryRef.current = true;
      window.history.replaceState(
        {},
        "",
        `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/chat/${chatId}`
      );
      sendMessage({
        role: "user" as const,
        parts: [{ type: "text", text: query }],
      });
    }
  }, [sendMessage, chatId]);

  useAutoResume({
    autoResume: !isNewChat && !!chatData,
    initialMessages,
    resumeStream,
    setMessages,
  });

  const isReadonly = isNewChat ? false : (chatData?.isReadonly ?? false);

  const { data: votes } = useSWR<Vote[]>(
    !isReadonly && messages.length >= 2
      ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/vote?chatId=${chatId}`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const value = useMemo<ActiveChatContextValue>(
    () => ({
      chatId,
      messages,
      setMessages,
      sendMessage,
      status,
      stop,
      regenerate,
      addToolApprovalResponse,
      input,
      setInput,
      visibilityType: visibility,
      isReadonly,
      isLoading: !isNewChat && isLoading,
      votes,
      currentModelId,
      setCurrentModelId,
    }),
    [
      chatId,
      messages,
      setMessages,
      sendMessage,
      status,
      stop,
      regenerate,
      addToolApprovalResponse,
      input,
      visibility,
      isReadonly,
      isNewChat,
      isLoading,
      votes,
      currentModelId,
    ]
  );

  return (
    <ActiveChatContext.Provider value={value}>
      {children}
    </ActiveChatContext.Provider>
  );
}

export function useActiveChat() {
  const context = useContext(ActiveChatContext);
  if (!context) {
    throw new Error("useActiveChat must be used within ActiveChatProvider");
  }
  return context;
}
