import { clerkClient } from "@clerk/nextjs";
import { z } from "zod";
import type { User } from "@clerk/nextjs/dist/types/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

// created a filterUser method in order to make sure non-essential info is not returned when returning userinfo
const filterUser = (user: User) => {
    return {
        id: user.id,
        username: user.username,
        profileImage: user.imageUrl
    }
}

// pp - generate method that client calls (getAll should be public allowing any non-auth user to see all posts)
// now using .map(filterUser) in order to only return required information
// using .map(post) and creating relations with .find() grabbing author info per post
export const postsRouter = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany({
            take: 100,
        });
        const users = (
            await clerkClient.users.getUserList({
                userId: posts.map((post) => post.authorId),
                limit: 100
            })
        ).map(filterUser);
        return posts.map(post => {
            const author = users.find((user) => user.id === post.authorId)
            if (!author || !author.username) throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'post author not found'
            })
            return {
                post,
                author: {
                    ...author,
                    username: author.username
                }
            }
        });
    }),
});
