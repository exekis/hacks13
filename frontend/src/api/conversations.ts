const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? "http://localhost:8000" : "/api");

export interface Message {
  messageid: number;
  senderid: number;
  message_content: string;
  timestamp: string;
}

export interface ConversationPreview {
  conversationid: number;
  friend_user_id: number;
  friend_name: string;
  last_message: string;
  last_message_time: string;
  last_messaged: string;
}

export interface OpenConversationResponse {
  conversationid?: number;
  friend_user_id?: number;
  friend_name?: string;
  messages: Message[];
}

export interface SendMessageResponse {
  messageid: number;
  senderid: number;
  message_content: string;
  timestamp: string;
}

export const fetchConversations = async (userId: number): Promise<ConversationPreview[]> => {
  const response = await fetch(`${API_URL}/conversations/all-conversations?user_id=${userId}`);
  console.log(userId)
  console.log(response)
  if (!response.ok) {
    throw new Error('Failed to fetch conversations');
  }
  return response.json();
};

export const fetchConversation = async (userId: number, friendId: number): Promise<OpenConversationResponse> => {
  const response = await fetch(`${API_URL}/conversations/conversation/${friendId}?user_id=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch conversation');
  }
  return response.json();
};

export const sendMessage = async (userId: number, friendId: number, content: string): Promise<SendMessageResponse> => {
  const response = await fetch(`${API_URL}/conversations/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      friend_id: friendId,
      message_content: content,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  return response.json();
};
