import { useMemo, useState } from "react";
import type { MatchmakingPost } from "../types/matchmaking.types";
import { mockMatchmaking } from "../data/matchmaking.mock";
import { getDisplayStatus } from "../utils/matchmaking.utils";

export function useMatchmakingManagement() {
  const [posts, setPosts] = useState<MatchmakingPost[]>(mockMatchmaking);

  const displayPosts = useMemo(
    () =>
      posts.map((post) => ({
        ...post,
        displayStatus: getDisplayStatus(post),
      })),
    [posts],
  );

  const handleRemovePost = (postId: string) => {
    setPosts((current) => current.filter((post) => post.id !== postId));
  };

  return { displayPosts, handleRemovePost };
}
