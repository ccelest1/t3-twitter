import { createServerSideHelpers } from '@trpc/react-query/server';
import superjson from 'superjson';
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";

export const genSSG_helper = () =>
    createServerSideHelpers({
        router: appRouter,
        ctx: { prisma, userId: null },
        transformer: superjson, // optional - adds superjson serialization
    });
