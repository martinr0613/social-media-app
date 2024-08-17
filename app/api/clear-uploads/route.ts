import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { UTApi } from "uploadthing/server";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        if(authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return Response.json({ error: "UNAUTHORIZED"}, 
                { status: 401 });
        }

        const unusedMedia = await prisma.postMedia.findMany({
            where: {
                postId: null,
                ...(process.env.NODE_ENV === "production") 
                ? {
                    createdAt: {
                        lte: new Date(Date.now() - 1000 * 60 * 60 * 24)
                    }
                } : {}
            },
            select: {
                id: true, 
                url: true
            }
        });

        new UTApi().deleteFiles(
            unusedMedia.map(
                media => 
                media.url.split(`/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`)[1]
            )
        );

        return new Response();

        await prisma.postMedia.deleteMany({
            where: {
                id: {
                    in: unusedMedia.map(m => m.id)
                }
            }
        });

    } catch (error) {
        console.error(error);
        return Response.json(
            {error: "Internal server error"},
            {status: 500}
        );
    }
}