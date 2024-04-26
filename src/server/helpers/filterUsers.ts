
// created a filterUser method in order to make sure non-essential info is not returned when returning userinfo
import { type User } from "@clerk/nextjs/dist/types/server";

export const filterUser = (user: User) => {
    return {
        id: user.id,
        username: user.username,
        profileImage: user.imageUrl
    }
}
