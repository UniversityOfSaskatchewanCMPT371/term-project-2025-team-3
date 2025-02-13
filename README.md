# Setup Guide

## Clone Repository
Run the following commands in a new directory:

```bash
git clone https://github.com/UniversityOfSaskatchewanCMPT371/term-project-2025-team-3.git
cd ./term-project-2025-team-3/sk-vaccine-app/
```

## Download Dependencies
Make sure you have [Node.js](https://nodejs.org) installed.

Run the following in the `sk-vaccine-app` directory:

```bash
npm install
```

## [Set Up Android Emulator](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&platform=android&device=simulated#set-up-android-studio)
- Select **"Mac" or "Windows"** based on your operating system.

## Run emulator  
Run:  
```bash
npx start --android
```

# Prototype Guide

When creating a prototype there are two naming conventions to follow.

|Branch Name|Folder Name|
|-------------|------------|
|`proto_<test>`|`proto_<folder>`|


#### Branch
The branch name should start with `proto_`, for example the branch may be called `proto_server_request`. This will let the post-checkout git hooks know that a prototype branch is in use and no `proto_` directories should be scrubbed.
#### Folder
Any new directories created within the root of the project should also follow a familiar naming scheme, starting wtih `proto_`, for example `proto_server` if you are creating a temporary Express server.

### Why?

Why should this be done? This takes care of special cases of untracked files within temporary folders; NPM's `node_modules` folder is a prime example. If a folder called `server` were created within the root of the project and contained an initialized npm project (`npm init` run, resulting in a `package.json`, and `node_modules` folder) then a folder named `node_modules` will have been created. Normally this folder is not tracked by git and therefore when you switch to another branch the `server` folder will persist, and only contain the `node_modules` folder.

To remedy this there is a check performed after you switch to a branch or a `post-checkout`. This post checkout will check the current branch and if the branch does not contain `proto_` at the beginning, any folders starting with `proto_` will be removed. This is not to say that the code will not persist in the `proto_*` branch, just that the node_modules will be scrubbed.

### Prototype FAQ
**Question:**  My prototype wont run after switching back?

**Answer:** The one downside to this method is that when switching to a prototype branch you will have to run `npm install` or `npm i`, each time. To get around this while testing, your prototype's folder can be renamed to not contain `proto_` at the start. Please make sure to name it properly prior to pushing to maintain the naming scheme and allow easy running for others.


