export type Role = 'user' | 'model' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  mimeType: string;
  data?: string; // base64
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface SparkNode {
  id: string;
  label: string;
  type: 'concept' | 'entity' | 'action';
  connections: string[];
}
