import { type NextPage } from "next";
import Head from "next/head";
import { RouterOutputs, api } from "~/utils/api";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { SignedOut } from "@clerk/nextjs/dist/types/client-boundary/controlComponents";
import { type } from "os";

const CreatePostWizard = () => {
  const user = useUser().user;
  if (!user) return null;
  return (
    <div className='flex gap-3'>
      <img
        src={user?.imageUrl}
        alt='profile img'
        className='h-14 w-14 rounded-full'
      />
      <input
        className='grow bg-transparent outline-none'
        placeholder='type emojis!'
      />
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
      <img
        src={author?.profileImage}
        className='h-14 w-14 rounded-full'
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <span>
            {`@${author?.username}`}
          </span>
          <span className="font-thin">{`• 1 hour ago`}</span>
        </div>
        <span>
          {post.content}
        </span>
      </div>
    </div>
  )

}

const Home: NextPage = () => {
  const user = useUser();
  // can have isLoading check
  const { data, isLoading } = api.posts.getAll.useQuery();
  // if data has not yet been returned, we can have a Loading placeholder
  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>Something is wrong</div>
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
            {!user.isSignedIn &&
              <div className='flex-justify-center'>
                <SignInButton />
              </div>
            }
            {user.isSignedIn &&
              <>
                <div>
                  <SignOutButton />
                </div>
                <div>
                  <CreatePostWizard />
                </div>
              </>
            }
          </div>
          <div className='flex flex-col'>
            {[...data!, ...data!]?.map((fullPost) => (
              <PostView {...fullPost}
                key={fullPost.post.id}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
