import type { RouterOutputs } from "~/utils/api";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime)
import Link from "next/link";

// generate output types
// filter to one element in array containing post and corresponding author info
type PostWithUser = RouterOutputs['posts']['getAll'][number]

export const PostView = (props: PostWithUser) => {
    const { post, author } = props;
    return (
        <div key={post.id}
            className='flex gap-3 border-b p-4 border-slate-400'
        >
            <Image
                src={author?.profileImage}
                alt={`@${author.username}'s profile pic`}
                className='h-14 w-14 rounded-full'
                width={56}
                height={56}
            />
            <div className="flex flex-col">
                <div className="flex gap-1 text-slate-300">
                    <Link href={`/@${author.username}`}>
                        <span>
                            {`@${author?.username}`}
                        </span>
                    </Link>
                    <Link href={`/post/${post.id}`}>
                        <span className="font-thin">{`• ${dayjs(
                            post.createdAt
                        ).fromNow()}`}
                        </span>
                    </Link>
                </div>
                <span
                    className="text-2xl"
                >
                    {post.content}
                </span>
            </div>
        </div>
    )

}
