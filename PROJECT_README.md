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
- Steps Performed
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
- trpc
    * allows one to create server functions that run on a server, fetch data in correct shape -> authenticate to user w/o user to directly connect to db
    * currently at this point we had an example.ts router
    * going to create a posts.ts router


- CI/CD
    - Settings of Project: Assumption that Deployment Target is Vercel (gitlab configuration)
    - Created yaml file ()
        - Minimal yml workflow file that installs node modules, runs typescript, typechecking, runs lint for repo that uses npm
            - (1) Starts with 'node' Docker image (base image for CI environment)
            - (2) Define stage 'build' to run build commands
            - (3) 'before_script' section runs before each job in pipeline and 'npm install' runs and installs node.js dependencies
            - (4) single build job that runs in build stage
            - (5) commands run in script section
