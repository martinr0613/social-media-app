"use client";
import useFollowerInfo from "@/hooks/useFollowerInfo"
import { FollowerInfo } from "@/lib/types"
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import kyInstance from "@/lib/ky";
import { useToast } from "./ui/use-toast";

interface FollowButtonProps {
    userId: string,
    initialState: FollowerInfo
}

export default function FollowButton(
    {userId, initialState} : FollowButtonProps
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data } = useFollowerInfo(userId, initialState);
  const queryKey: QueryKey = ["follower-info", userId];

  const { mutate } = useMutation({
    mutationFn: () => data.isFollowedByUser ?
      kyInstance.delete(`/api/users/${userId}/followers`) :
      kyInstance.post(`/api/users/${userId}/followers`),
    onMutate: async () => {
      await queryClient.cancelQueries({queryKey});
      const prevState = queryClient.getQueryData<FollowerInfo>(queryKey);
      queryClient.setQueryData<FollowerInfo>(
        queryKey, 
        () => ({
          followers: (prevState?.followers || 0) + 
          (prevState?.isFollowedByUser ? -1 : 1),
          isFollowedByUser: !prevState?.isFollowedByUser
        })
      );
      return { prevState };
    },
    onError(error, variables, context) {
        queryClient.setQueryData(queryKey, context?.prevState);
        console.error(error);
        toast({
          variant: "destructive",
          description: "Something went wrong. Please try again."
        });
    },
  });

  return (
    <Button 
    variant={data.isFollowedByUser ? "secondary":"default"}
    onClick={()=>mutate()}
    >
        {data.isFollowedByUser ? "Unfollow":"Follow"}
    </Button>
  )
}
