import { type NextPage } from "next";
import { api } from "~/utils/api";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
import dayjs from "dayjs";
import { LoadingPage, LoadingSpinner } from "~/comps/load";
import { useState } from "react";
import toast from "react-hot-toast";
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime)
import { PageLayout } from "~/comps/profLayout";
import { PostView } from "~/comps/postView";


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
    <PageLayout>
      <div className='border-b border-slate-400 p-2'>
        {!isSignedIn ? (<div className='flex-justify-center'>
          <SignInButton />
        </div>
        ) : (
          <>
            <div>
              <button
                className="mb-6 bg-black hover:bg-gray-100 text-white-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
              >
                <SignOutButton />
              </button>
              <div className='border-b border-slate-400 p-2' >
                <CreatePostWizard />
              </div>
            </div>
          </>
        )
        }
        <Feed />
      </div>
    </PageLayout>
  );
};

export default Home;
