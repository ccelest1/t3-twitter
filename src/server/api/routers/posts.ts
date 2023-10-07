import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// pp - generate method that client calls (getAll should be public allowing any non-auth user to see all posts)
export const postsRouter = createTRPCRouter({
    getAll: publicProcedure.query(({ ctx }) => {
        return ctx.prisma.post.findMany();
    }),
});
