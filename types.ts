
export interface PromptHistoryItem {
  id: string;
  original: string;
  instruction: string;
  modified: string;
  timestamp: number;
}

export interface RefineRequest {
  basePrompt: string;
  instruction: string;
}
