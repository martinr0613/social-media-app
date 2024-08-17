import { LikeInfo } from "@/lib/types"
import { useToast } from "./ui/use-toast"
import { QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
    postId: string,
    initialState: LikeInfo
}
export default function LikeButton(
    {postId, initialState}: LikeButtonProps
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["postlike-info", postId];
  const { data } = useQuery({
    queryKey,
    queryFn: () => kyInstance.get(`/api/posts/${postId}/likes`)
    .json<LikeInfo>(),
    initialData: initialState,
    staleTime: Infinity
  });

  const { mutate } = useMutation({
    mutationFn: () => 
        data.isLikedByUser ?
        kyInstance.delete(`/api/posts/${postId}/likes`) :
        kyInstance.post(`/api/posts/${postId}/likes`),
    onMutate: async () => {
        await queryClient.cancelQueries({queryKey});
        const prevState = queryClient.getQueryData<LikeInfo>(queryKey);
        queryClient.setQueryData<LikeInfo>(
            queryKey,
            () => ({
                likes: (prevState?.likes || 0) + 
                (prevState?.isLikedByUser ? -1 : 1),
                isLikedByUser: !prevState?.isLikedByUser
            })
        );
        return { prevState }
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
    <div className="flex items-center gap-2">
        <button onClick={()=>mutate()}>
            <Heart className={
                cn("size-5", data.isLikedByUser && 
                    "fill-red-500 text-red-500"
                )
            }/>
        </button>
        <div className="text-sm font-medium tabular-nums space-x-0.25">
            <span>{data.likes} </span>
            <span className="hidden sm:inline">likes</span>
        </div>

    </div>
  )
}

