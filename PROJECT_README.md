# Emoji Twitter Clone
## Description
- Exploring the Create T3 App Structure
    - Documentation
        - [T3 Docs](https://create.t3.gg/)
    - Creating a Twitter Clone
        * First iteration being an Emoji Twitter Clone
        * Open Source T3 Components
            - Modular and TypeSafe
## Documentation
### PART 1
- (1) Ran create t3-app@latest
- (2) Choose Typescript -> (2a) Select Prisma, Tailwind, trpc
- (3) setup db on planetscale -> vercel deployment
    * `app.planetscale.com` -> `vercel.com`
    1. on prisma, ran `npm install prisma` -> `npx prisma init`
- (4) following the insertion of data into schema.prisma -> ran `npx prisma studio` -> received errors on studio site on example
    * db is not synchronized with current schema as it expects model Example schema in .prisma
- (5) run `npx prisma db push` to update db expectation
- (6) can run `git add -p` allowing for selection of commits to add -> `git push`
- (7) Clerk setup - easy auth management solution
    1. using project name with dashboard (only github login method) -> `npm install @clerk/nextjs`
    2. go to api keys section of clerk and grab api keys
        * next_pub..., clerk_secret...
- (8)  Using Clerk Docs
    * Navigate to Mount <ClerkProvider /> section in clerk docs
        1. this comp wraps app to provide active session, user context to hooks, other comps
        2. add comp in `_app.tsx`
    * add middelware
        * auth every time a server req is made by embedding auth state in req
        1. implemented authmiddleware in `middleware.ts` and added a console.log()
        2. console.log() outputted when starting local host via `npm run dev`
    * after adding middleware -> index.tsx
        1. add block that determines what a user sees depending on signIn state i.e. fundamental auth
        ```tsx
            return(
                ...
                <div>
                {!user.isSignedIn && <SignInButton />}
                {!!user.isSignedIn && <SignOutButton />}
                </div>
            )
        ```
- (9) Implement logging system in order to understand how production is going w/ Axiom
    * had to perform `npm install -g prisma`
    * then went through vercel to add axiom to project
- (10) rewrote schema in schema.prisma, deleted example model and create `post` model -> `npx prisma db push`-> generate new db locally by `npm install`
- (11) coding
    - example.ts
        * change last line to `return ctx.prisma.post.findMany();`
        * may have to restart server
            - ctrl + shift + p -> restart `ts server`
    - index.tsx
        * going to add a line `const {data} = api.posts.getAll.useQuery()` that has now correct type
        * __CONSULT TRPC SECTION BELOW__

#### TRPC
* allows one to create server functions that run on a server, fetch data in correct shape -> authenticate to user w/o user to directly connect to db
* currently at this point we had an `example.ts` router
* going to create a posts.ts router

### CONTINUED FROM PART 1
- created new router for posts `posts.ts`
    * `postsRouter=createTRPCRouter`
    * `ctx.prisma.post.findMany()`
- root.ts
    * add new key `posts: postsRouter` i.e `router_name: router_nameRouter`
    * get rid of example router as it wasn't being used
- index.ts
    * we want to use `api.router_name.getAll.useQuery()` with UQ() method in order to obtain data
    * then map that variable to display posts
        - number of posts in an array object that are to be displayed

- (12) can use prisma studio in order to create posts
    * made changes to db -> reset env via `npx prisma studio` -> `npm run dev `
    * added a record via prisma studio -> now can see a post when logging in with github

### PART 2
- change styling using globals.css
    * added a body dictionary that contains `@apply tag` with chosen background, text color
- depending on where you want an effect of structure to take place, need to choose between comps `index.tsx` v `_app.tsx`
- in index.tsx, implementing styling in order to provide twitter look
    * testing <div className='flex flex-col'>
        - added isLoading check, data check
- in order to get imageUrl from user, had to get to user.user
    * user data is nested within user key -> `user.user.imageUrl`
    * fix - in order to get imageUrl to show had to modify `CreatePostWizard` to incorporate `useUser().user`
* get user data from id with single call

### 11/19/23
- performed styling on posts.ts
- define post type, `type PostsWithUser` -> return post with user info by selecting a particular post indexed in an array
- PostView now returns posts with desired user/post info
- including `PostView` in Feed now allows us to map over each post with a proper id
- on posts.ts changed
    ```js
    post,
    author: users.find((user)=>user.id===post.authorId)
    ```
    to
    ```js
    post,
    author: {
        ...author,
        username:author.username
    }
    // now strict typing as it relates to author?.username - now constrained to type string
    ```
- in order to get spacing between username and time they posted `index.tsx`
    * use a span class following username, `font-thin`
- in order to get accurate dates, `npm install dayjs`
    * user relativeTime w/ dayjs `import relativeTime from 'dayjs/...` -> `dayjs.extend(relativeTime)`

### 11/25/23
- ran into `TypeError: Cannot read properties of undefined (reading 'current')`
    * solution: start prisma studio server
- ran into `image with src ... is missing required width property`
    * updated with pixel # for both images
- ran into domain not be configured under images in next.config.js
    - updated `next.config.mjs`, config to have a dict `images` with domains key containing domain as value
- (CONTINUE)
    * import loading spinner - found tailwind spinner and created comp in `load.tsx` encapsulated by LoadingSpinner comp
    * then in order to get aligned to middle of page created `LoadingPage` comp in load.tsx
        - modified css in order to have loading spinner in middle of page
    * separated Home and Feed in order to provide better state in browser due to clarity in processes

## Setting up Posting
- Knowing if someone is a user, if they have correct permissions
    * modify trpc.ts (`ctx` (context) is instantiated from createcontext in `trpc.ts` used to process every request going through tRPC endpoint)
    * modify InnerTRPCcontext in order to contain info on session and user
    * then create a procedure that stems from t that uses middleware in order to enforce auth that is exported as a private procedure
    - final step: we then use `.input()` in order to insert/define content entity
        * using `z from zod` allows us to verify that info is correct, verifiable string type, to be used an input for post

- modify createPostWizard
    * create with functional components a way to store user input for posts and to allow stored posts to be displayed
    * Post button will trigger use of state via onClick handler

- in order to allow for posting
    *  modify createTRPCContext
        - instead of getting general user, extract userID from user info gained from getAuth, return `userId`
        - in `enforcedIsAuthed` extract userID from context
        - utilize userId in postsRouter `privateProcedure`

- allowing for auto reload, clearing of input field
    * add `isLoading: isPosting` and then with input tag in `CreatePostWizard`, set disabled flag to `isPosting`
    * update existing posts is to get context of entire cache
        - establish a variable to store `api.useContext`
        - create a `isLoading: isPosting` prop
        - then an onSuccess that allows for us to refresh input and refresh feed

### 1.27.23
- add rateLimiter in order to prevent users from spamming posts into feed
    * package via upstash
    - added `{RateLimit}` to `posts.ts` in order to stop users from spamming posts
        * `const {success} = await ratelimit.limit(authorId)` -> `if(!success){throw tcpError}`
- display error message when a user is unable to post
    * use toast for implementation ->
- encountered this error `Could not find files for / in .next/build-manifest.json`
    * deleted `.next` and ran `npm add webpack --dev`
- additions
    - in `src/pages/index.tsx` added `onError...toast.error()` in `CreatePostWizard`
    - in `src/pages/app.tsx` added `<Toaster position='bottom-center'/>`
        * now post errors are shown on bottom of web page
    - revised toast.error to include a zod validation error using `e -> e.data.zodError.fieldErrors.content` -> in posts.ts, `.emoji('only emojis)` (validation process -> client)

- prevent double posting -> post needs to be disabled when in loading state
    * made changes in index.tsx for the CreatePostWizard
    * used onKeyDown in order to allow users to press enter to submit post
-  For Future:
    * instead of waiting for server to block on validations, perform on client side using zod

### 1.28.23
* DESIRE: click on username, click on profile image -> redirect to profile page / click on post -> take to an individual post page
- fixed linting (eod)

### WHEN GONE
- Revisiting app:
    1. start up by visiting `app.planetscale.com` to wake up db
    2. start prisma db `npx prisma db push`

### CI/CD
- Settings of Project: Assumption that Deployment Target is Vercel (gitlab configuration)
- Created yaml file ()
    - Minimal yml workflow file that installs node modules, runs typescript, typechecking, runs lint for repo that uses npm
        - (1) Starts with 'node' Docker image (base image for CI environment)
        - (2) Define stage 'build' to run build commands
        - (3) 'before_script' section runs before each job in pipeline and 'npm install' runs and installs node.js dependencies
        - (4) single build job that runs in build stage
        - (5) commands run in script section
- reset commits with `git reset`
