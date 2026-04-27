// Claude 3.5 Sonnet via Anthropic SDK (Assuming 4.6 was a typo for 3.5/latest)
export const DEFAULT_CHAT_MODEL = "claude-sonnet-4-6";

export const titleModel = {
  id: DEFAULT_CHAT_MODEL,
  name: "Claude Sonnet 4.6",
  provider: "anthropic",
  description: "Used for title generation",
};

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  gatewayOrder?: string[];
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high";
};

export const chatModels: ChatModel[] = [
  {
    id: DEFAULT_CHAT_MODEL,
    name: "Claude Sonnet 4.6",
    provider: "anthropic",
    description: "Anthropic Claude Sonnet 4.6",
  },
];

// Static capabilities — no Vercel gateway needed
export async function getCapabilities(): Promise<
  Record<string, ModelCapabilities>
> {
  return Object.fromEntries(
    chatModels.map((m) => [
      m.id,
      { tools: false, vision: false, reasoning: false },
    ])
  );
}

export const isDemo = false;

export type GatewayModelWithCapabilities = ChatModel & {
  capabilities: ModelCapabilities;
};

export async function getAllGatewayModels(): Promise<
  GatewayModelWithCapabilities[]
> {
  return chatModels.map((m) => ({
    ...m,
    capabilities: { tools: false, vision: false, reasoning: false },
  }));
}

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
