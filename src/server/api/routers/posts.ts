import { clerkClient } from "@clerk/nextjs";
import { currentUser, type User } from "@clerk/nextjs/dist/types/server";
import { z } from 'zod';
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// created a filterUser method in order to make sure non-essential info is not returned when returning userinfo
const filterUser = (user: User) => {
    return {
        id: user.id,
        username: user.username,
        profileImage: user.imageUrl
    }
}

// allow 3-reqs/1-min
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, "1 m"),
    analytics: true,
    /**
     * Optional prefix for the keys used in redis. This is useful if you want to share a redis
     * instance with other applications and want to avoid key collisions. The default prefix is
     * "@upstash/ratelimit"
     */
    prefix: "@upstash/ratelimit",
});

// pp - generate method that client calls (getAll should be public allowing any non-auth user to see all posts)
// now using .map(filterUser) in order to only return required information
// using .map(post) and creating relations with .find() grabbing author info per post
// using orderBy: descending w/ createdAt allows for posts to appear most to least recent
export const postsRouter = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany({
            take: 100,
            orderBy: [{ createdAt: 'desc' }]
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
                message: "Post's Author not found"
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
    // use zod (validator for forms) in order to insert content
    // allows for a function that serves as midpoint between auth and profile info
    create: privateProcedure.input(z.object({
        content: z.string().emoji("Only Emojis Please").min(1).max(280),
    }
    )).mutation(async ({ ctx, input }) => {
        // non-null assertion operator used next to currentUser
        if (!ctx.userId) return null;
        const authorId = ctx.userId

        const { success } = await ratelimit.limit(authorId);
        if (!success) throw new TRPCError({
            code: "TOO_MANY_REQUESTS"
        })
        const post = await ctx.prisma.post.create({
            data: {
                authorId,
                content: input.content
            },
        });
        return post
    })
});
