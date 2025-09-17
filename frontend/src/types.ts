export type MessageType = "chat" | "system";

export interface Message {
  type: MessageType;
  username?: string;
  content?: string;
  usersList?: string[];
  timestamp?: number;
}
