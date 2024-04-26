import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { genSSG_helper } from "~/server/helpers/ssgHelper";
import type { GetStaticProps } from "next";
import { PageLayout } from "~/comps/profLayout";
import Image from "next/image";
import { LoadingPage } from "~/comps/load";
import { PostView } from "~/comps/postView";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({ userId: props.userId })
  return (
    !isLoading ? (
      data ? (
        <div className="flex flex-col">
          {data.map((fullPost) => (
            <PostView
              {...fullPost}
              key={fullPost.post.id}
            />
          ))}
        </div>
      ) : (
        <div>
          User has not Posted
        </div>
      )
    ) : (
      <LoadingPage />
    )
  )

}
const ProfilePage: NextPage<{ username: string }> = ({ username }) => {

  const { data, isLoading } = api.profiles.getUserByUsername.useQuery({
    username,
  })

  return (
    !isLoading ? (
      data ? (
        <>
          <Head>
            <title>{username}</title>
          </Head>
          <PageLayout>
            <div className='relative h-48 bg-slate-600 '>
              <Image
                src={data.profileImage}
                alt={`${data.username ?? ""}'s prof pic`}
                width={128}
                height={128}
                className='absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4'
              />
            </div>
            <div className="h-[64px]"></div>
            <div className="p-4 text-2xl font-bold">{`@${username ?? ""}`}</div>
            <div className="w-full border-b border-slate-400"></div>
            <ProfileFeed userId={data.id} />
          </PageLayout>
        </>
      ) : (
        <div>
          404
        </div>
      )) : (
      <LoadingPage />
    )
  )
};

// prefetch queries on server
export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = genSSG_helper()
  const slug = context.params?.slug
  if (typeof slug !== "string") throw new Error('no slug')
  const username = slug.replace("@", "")

  // fetch data ahead of time, hydrate via server side props
  await ssg.profiles.getUserByUsername.prefetch({
    username
  });

  return {
    props: {
      // takes all fetched data, parsed through static props, hydrate through react query => data is there when page laods
      trpcState: ssg.dehydrate(),
      username
    }
  }
}

// indicate what paths are valid
export const getStaticPaths = () => {
  return {
    paths: [], fallback: 'blocking'
  }
}

export default ProfilePage;
