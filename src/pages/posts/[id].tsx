import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
import dayjs from "dayjs";
import { LoadingPage, LoadingSpinner } from "~/comps/load";
import { useState } from "react";
import toast from "react-hot-toast";
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime)


const CreatePostWizard = () => {
    const user = useUser().user;
    const [input, setInput] = useState("")
    if (!user) return null;
    const ctx = api.useContext();
    // mutate requires args
    const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
        onSuccess: () => {
            setInput("");
            void ctx.posts.getAll.invalidate();
        },
        onError: (e) => {
            const errorMessage = e.data?.zodError?.fieldErrors.content;
            console.log(errorMessage)
            if (errorMessage && errorMessage[0]) {
                toast.error(errorMessage[0])
            } else {
                toast.error('Please post a valid emoji post!')
            }
        }
    }
    );
    // added ?? for username in order to avoid an invalid type 'string | null', provides a default value of empty string if null or undefined
    return (
        <div className='flex gap-3'>
            <Image
                src={user?.imageUrl}
                alt={`@${user?.username ?? ""}'s user image`}
                className='h-14 w-14 rounded-full'
                width={56}
                height={56}
            />
            <input
                className='grow bg-transparent outline-none'
                placeholder='Type some emojis for your status update!'
                value={input}
                type="text"
                onChange={(e) => {
                    setInput(e.target.value)
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        if (input !== "") {
                            mutate({
                                content: input
                            });
                        }
                    }
                }}
                //disable input while posting
                disabled={isPosting}
            />
            {input !== "" && !isPosting && (<button
                className="bg-black hover:bg-white-100 text-white-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                onClick={() => mutate({
                    content: input
                })}
            >
                Post
            </button>)}
            {isPosting && <div
                className="flex justify-center items-center"
            ><LoadingSpinner size={20} /></div>}
        </div>
    );
}

// generate output types
// filter to one element in array containing post and corresponding author info
type PostWithUser = RouterOutputs['posts']['getAll'][number]

const PostView = (props: PostWithUser) => {
    const { post, author } = props;
    return (
        <div key={post.id}
            className='flex gap-3 border-b p-4 border-slate-400 p-4'
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
                    <span>
                        {`@${author?.username}`}
                    </span>
                    <span className="font-thin">{`• ${dayjs(
                        post.createdAt
                    ).fromNow()}`}</span>
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

// clerk, react queries are inverted
const Feed = () => {
    const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
    if (postsLoading) return (
        <LoadingPage />
    )
    if (!data) return (
        <div>
            Something went wrong
        </div>
    )
    return (
        <div className='flex flex-col'>
            {data.map((fullPost) => (
                //dump prop
                <PostView {...fullPost}
                    key={fullPost.post.id}
                />
            ))}
        </div>
    )
}

const Home: NextPage = () => {
    const { isLoaded: userLoaded, isSignedIn } = useUser();
    // start fetching asap
    api.posts.getAll.useQuery();
    // if data has not yet been returned, we can have a Loading placeholder
    // return empty div if user isn't loaded yet
    if (!userLoaded) return <div />
    // fullPost now returns data with post, corresponding author with key being the id of each indv post
    return (
        <>
            <Head>
                <title>Create T3 App</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="flex h-screen justify-center">
                <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
                    <div className='border-b border-slate-400 p-4'>
                        {!isSignedIn &&
                            <div className='flex-justify-center'>
                                <SignInButton />
                            </div>
                        }
                        {isSignedIn &&
                            <>
                                <button
                                    className="mb-6 bg-black hover:bg-gray-100 text-white-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                                >
                                    <SignOutButton />
                                </button>
                                <div>
                                    <CreatePostWizard />
                                </div>
                            </>
                        }
                    </div>
                    <Feed />
                </div>
            </main>
        </>
    );
};

export default Home;
