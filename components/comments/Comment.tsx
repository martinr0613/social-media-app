import { CommentData } from "@/lib/types"
import UserTooltip from "../UserToolTip"
import Link from "next/link"
import UserAvatar from "../UserAvatar"
import { formatRelativeDate } from "@/lib/utils"
import { useSession } from "@/app/(main)/SessionProvider"
import CommentMoreButton from "./CommentMoreButton"

interface CommentProps {
    comment: CommentData
}

export default function Comment(
    {comment}: CommentProps
) {
  const { user: loggedInUser } = useSession();
  return (
    <div className="group/comment flex gap-3 py-3">
        <span className="hidden sm:inline">
            <UserTooltip user={comment.user}>
                <Link href={`/users/${comment.user.username}`}>
                    <UserAvatar avatarUrl={comment.user.avatarUrl} 
                                size={40}/>
                </Link>
            </UserTooltip>
        </span>
        <div>
            <div className="flex items-center gap-1 text-sm">
                <UserTooltip user={comment.user}>
                    <Link href={`/users/${comment.user.username}`}
                          className="font-medium hover:underline">
                       {comment.user.displayName}
                    </Link>
                </UserTooltip>
                <span className="text-muted-foreground">
                    {formatRelativeDate(comment.createdAt)}
                </span>
            </div>
            <div>
                {comment.content}
            </div>
        </div>

        {( loggedInUser.id === comment.user.id || 
           loggedInUser.id === comment.post.userId ) &&
           <CommentMoreButton comment={comment}
                className="ms-auto opacity-0 trnasition-opasity
                group-hover/comment:opacity-100 justify-self-end"
            />
        }

    </div>
  )
}
