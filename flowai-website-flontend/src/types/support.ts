export interface SupportTicket {
  id: number;
  user_id: number;
  subject: string;
  description: string;
  priority: string;
  status: string;
  order_id?: number | null;
  resolution?: string | null;
  created_at: string;
}

export interface ConversationMessage {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ConversationMessage[];
}
