# Emoji Twitter Clone
## Description
- Exploring the Create T3 App Structure
    - Creating a Twitter Clone
        * First iteration being an Emoji Twitter Clone
        * Open Source T3 Components
            - Modular and TypeSafe
## Documentation
- Documenting Startup
    - Settings of Project: Assumption that Deployment Target is Vercel (gitlab configuration)
    - Created yaml file ([.gitlab-ci.yml](.gitlab-ci.yml))
        - Minimal yml workflow file that installs node modules, runs typescript, typechecking, runs lint for repo that uses npm
            - (1) Starts with 'node' Docker image (base image for CI environment)
            - (2) Define stage 'build' to run build commands
            - (3) 'before_script' section runs before each job in pipeline and 'npm install' runs and installs node.js dependencies
            - (4) single build job that runs in build stage
            - (5) commands run in script section

- Steps Performed
    - (1) Run create t3-app@latest
    - (2) Choose Typescript -> (2a) Select Prisma, Tailwind, trpc
