import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({});
// console.log('middleware running')
export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
