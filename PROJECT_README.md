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
            1. add block that determines what a user sees depending on signIn state
            ```tsx
                return(
                    ...
                    <div>
                    {!user.isSignedIn && <SignInButton />}
                    {!!user.isSignedIn && <SignOutButton />}
                    </div>
                )
            ```
- CI/CD
    - Settings of Project: Assumption that Deployment Target is Vercel (gitlab configuration)
    - Created yaml file ()
        - Minimal yml workflow file that installs node modules, runs typescript, typechecking, runs lint for repo that uses npm
            - (1) Starts with 'node' Docker image (base image for CI environment)
            - (2) Define stage 'build' to run build commands
            - (3) 'before_script' section runs before each job in pipeline and 'npm install' runs and installs node.js dependencies
            - (4) single build job that runs in build stage
            - (5) commands run in script section
