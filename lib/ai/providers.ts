import { createAnthropic } from "@ai-sdk/anthropic";
import { titleModel } from "./models";

export function getLanguageModel(modelId: string) {
  const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  return anthropic(modelId);
}

export function getTitleModel() {
  const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  return anthropic(titleModel.id);
}
