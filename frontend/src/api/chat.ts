export interface User {
  id: string;
  username: string;
  profile_pic?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  conversation_id: string;
  text: string;
  time: string;
  type: string;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  user1: User;
  user2: User;
  accepted: boolean | number | string;
  messages: Message[];
}

export interface Friend {
  id: string;
  username: string;
  profilePic?: string;
  hasUnread?: boolean;
}

export interface FriendRequest {
  id: string;
  username: string;
  profilePic?: string;
}