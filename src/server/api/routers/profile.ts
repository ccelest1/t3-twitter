import { clerkClient } from "@clerk/nextjs";
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { filterUser } from "~/server/helpers/filterUsers";

export const profileRouter = createTRPCRouter({
    // get User by Username
    getUserByUsername: publicProcedure.input(
        z.object({
            username: z.string()
        })).query(
            async ({ input }) => {
                const [user] = await clerkClient.users.getUserList({
                    username: [input.username]
                });
                if (!user) {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'User Not Found'
                    });
                }
                console.log(user)
                return filterUser(user)
            }),
});
