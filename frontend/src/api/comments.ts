import api from "./api";
import type { CommentData } from "../components/commentSection";

export interface PostCommentRequest {
  game_id: number;
  comment: string;
  comment_title: string;
  rating: number;
}

export async function postComment(data: PostCommentRequest): Promise<void> {
  await api.post("/comments/post", data);
}


export interface CommentsPageResponse {
  comments: any[];
  total: number;
}

export async function getComments(
  gameID: string | number,
  page: number
): Promise<CommentsPageResponse> {
  const res = await api.get<CommentsPageResponse>(
    `comments/${gameID}/comments`,
    {
      params: {
        page,
      },
    }
  );

  return res.data;
}
