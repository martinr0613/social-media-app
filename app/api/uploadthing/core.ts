import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import {} from "uploadthing/next";
import { createUploadthing, FileRouter, UploadThingError, UTApi } from "uploadthing/server";
import Image from 'next/image';

const f = createUploadthing();

export const fileRouter = {
    avatarUploader: f({
        image: { maxFileSize: "1024KB" }
    })
    .middleware( async () => {
        // This code runs on your server BEFORE every upload
        const {user} = await validateRequest();
        if(!user) throw new UploadThingError("UNAUTHORIZED");

        return {user};
    })
    .onUploadComplete(async ({metadata, file}) => {
        // This code runs on your server AFTER every upload
        // metadata is what we return in middleware
        const oldAvatarUrl = metadata.user.avatarUrl;
        if(oldAvatarUrl) {
            const key = oldAvatarUrl.split(
                `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`)[1];
            await new UTApi().deleteFiles(key);
        }
        const newAvatarUrl = file.url.replace(
            "/f/", `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`
        );

        await Promise.all([
            prisma.user.update({
                where: {
                    id: metadata.user.id
                },
                data: {
                    avatarUrl: newAvatarUrl
                }
            }),
            streamServerClient.partialUpdateUser({
                id: metadata.user.id,
                set: {
                    Image: newAvatarUrl
                }
            })
        ]);

        return {avatarUrl: newAvatarUrl};
    }),
    postMediaUploader: f({
        image: {maxFileSize: "1024KB", maxFileCount: 5},
        video: {maxFileSize: "64MB", maxFileCount: 5}
    })
    .middleware( async () => {
        const {user} = await validateRequest();
        if(!user) throw new UploadThingError("UNAUTHORIZED");

        return {}
    })
    .onUploadComplete(async ({file}) => {
        const media = await prisma.postMedia.create({
            data: {
                url: file.url.replace("/f/", 
                    `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`),
                type: file.type.startsWith("image") ? "IMAGE":"VIDEO"
            }
        });
        return {mediaId: media.id }
    })
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;