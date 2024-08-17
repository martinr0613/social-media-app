"use server"

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getCommentDataInclude, PostData } from "@/lib/types";
import { createCommentSchema } from "@/lib/validation";

export async function submitComment(
    {post, content}: {post: PostData, content: string}
) {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) throw new Error("Unauthorized");

    const {content: validContent} = createCommentSchema.parse({content});

    const newComment = await prisma.$transaction( async (tx) => {
        const newComment = await tx.comment.create({
            data: {
                content: validContent,
                postId: post.id,
                userId: loggedInUser.id
            },
            include: getCommentDataInclude(loggedInUser.id)
        });
        //If a user comments on their own post, don't create notification
        (post.userId !== loggedInUser.id
            ? [
                await tx.notification.create({
                    data: {
                        issuerId: loggedInUser.id,
                        recipientId: post.userId,
                        postId: post.id,
                        commentId: newComment.id,
                        type: "COMMENT"
                    }
                })
            ] : []
        );

        return newComment;
    })
 
    return newComment;
}

export async function deleteComment(id: string) {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) throw new Error("Unauthorized");

    const comment = await prisma.comment.findUnique({
        where: {id},
        select: {
            userId: true,
            post: {
                select: {
                    userId: true
                }
            }
        }
    });
    if (!comment) throw new Error("Comment not found");

    if(loggedInUser.id !== comment.userId && 
       loggedInUser.id !== comment.post.userId) {
        throw new Error("Unauthorized");
    }

    const [deletedComment] = await prisma.$transaction([
        prisma.comment.delete({
            where: { id },
            select: {
                id: true,
                postId: true
            }
        }),
        prisma.notification.deleteMany({
            where: {
                commentId: id,
                type: "COMMENT"
            }
        })

    ]);
    
    return deletedComment;
} 