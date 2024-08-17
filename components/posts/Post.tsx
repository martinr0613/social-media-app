"use client"

import { PostData } from "@/lib/types";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { cn, formatRelativeDate } from "@/lib/utils";
import { useSession } from "@/app/(main)/SessionProvider";
import PostMoreButton from "./PostMoreButton";
import Linkify from "../Linkify";
import UserTooltip from "../UserToolTip";
import { PostMedia } from "@prisma/client";
import Image from "next/image";
import LikeButton from "../LikeButton";
import BookmarkButton from "./BookmarkButton";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import Comments from "../comments/Comments";

interface PostProps {
    post: PostData,
}

export default function Post({post}: PostProps) {
  const {user} = useSession();
  const [showComments, setShowComments] = useState(false);

  return (
    <article className="group/post space-y-3 rounded-2xl p-5 shadow-sm bg-card">
        <div className="flex justify-between gap-3">

            <div className="flex flex-wrap gap-3 items-center">
                <UserTooltip user={post.user}>
                    <Link href={`/users/${post.user.username}`}>
                        <UserAvatar avatarUrl={post.user.avatarUrl} size={40}/>
                    </Link>
                </UserTooltip>
                <div>
                    <UserTooltip user={post.user}>
                        <Link href={`/users/${post.user.username}`}
                        className="block font-medium hover:underline">
                            {post.user.displayName}
                        </Link>
                    </UserTooltip>
                    <Link href={`/posts/${post.id}`}
                    className="block text-sm text-muted-foreground hover:underline"
                    suppressHydrationWarning>
                        {formatRelativeDate(post.createdAt)}
                    </Link>
                </div>
            </div>

            {post.userId === user.id && (
                <PostMoreButton post={post} className="opacity-0 transition-opacity group-hover/post:opacity-100"/>
            )}

        </div>
        <Linkify>
            <div className="whitespace-pre-line break-words">
                {post.content}
            </div>
        </Linkify>
        {!!post.attachments.length && 
        <PostMediaPreviews attachments={post.attachments}/>}
        <hr className="text-muted-forground" />
        <div className="flex justify-between gap-5">
            <div className="flex items-center gap-5">
                <LikeButton postId={post.id} initialState={{
                    likes: post._count.likes,
                    isLikedByUser: post.likes.some( like => like.userId === user.id)
                }}/>
                <CommentButton post={post} 
                    onClick={()=>setShowComments(!showComments)}/>
            </div>
            <BookmarkButton postId={post.id} initialState={{
                isBookmarkedByUser: post.bookmarks.some(bookmark => bookmark.userId === user.id)
            }}
            />
        </div>
        { showComments && <Comments post={post}/>}
    </article>
  )
}

interface PostMediaPreviewsProps {
    attachments: PostMedia[]
}
function PostMediaPreviews ( {attachments} : PostMediaPreviewsProps) {
    return (
        <div className={cn("flex flex-col gap-3", 
        attachments.length>1 && "sm:grid sm:grid-col-2")}>
            {attachments.map(attachment => (
                <PostMediaPreview 
                key={attachment.postId} 
                attachment={attachment}/>
            ))}
        </div>
    )
}

interface PostMediaPreviewProps {
    attachment: PostMedia
}
function PostMediaPreview ( {attachment} : PostMediaPreviewProps) {
    if(attachment.type === "IMAGE") {
        return <Image 
            src={attachment.url}
            alt="Attachment"
            width={500}
            height={500}
            className="mx-auto size-fit max-h-[30rem] rounded-2xl"
        />
    }

    if(attachment.type === "VIDEO") {
        return <div>
            <video 
                src={attachment.url}
                controls
                className="mx-auto size-fit max-h-[30rem] rounded-2xl"
                />
        </div>
    }

    return <p className="text-destructive">
        Unsupported media type
    </p>
}

interface CommentButtonProps {
    post: PostData,
    onClick: () => void
}
function CommentButton(
    {post, onClick} : CommentButtonProps
) {
    return (
        <button onClick={onClick}
        className="flex items-center gap-2">
            <MessageSquare className="size-5"/>
            <span className="text-sm font-medium tabular-nums">
                {post._count.comments}{" "}
                <span className="hidden sm:inline">
                    comments
                </span>
            </span>
        </button>
    )
}