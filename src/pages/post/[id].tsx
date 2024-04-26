import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import type { GetStaticProps } from "next";
import { PageLayout } from "~/comps/profLayout";
import { LoadingPage } from "~/comps/load";
import { genSSG_helper } from "~/server/helpers/ssgHelper";
import { PostView } from "~/comps/postView";

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {

    const { data, isLoading } = api.posts.getPostById.useQuery({
        id,
    })

    return (
        !isLoading ? (
            data ? (
                <>
                    <Head>
                        <title>{`${data.post.content}- ${data.author.username}`}</title>
                    </Head>
                    <PageLayout>
                        <PostView
                            {...data}
                        />
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
    const id = context.params?.id
    if (typeof id !== "string") throw new Error('no slug')

    // fetch data ahead of time, hydrate via server side props
    await ssg.posts.getPostById.prefetch({
        id
    });

    return {
        props: {
            // takes all fetched data, parsed through static props, hydrate through react query => data is there when page laods
            trpcState: ssg.dehydrate(),
            id
        }
    }
}

// indicate what paths are valid
export const getStaticPaths = () => {
    return {
        paths: [], fallback: 'blocking'
    }
}

export default SinglePostPage;
