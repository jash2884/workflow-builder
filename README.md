# Workflow Builder

A visual workflow builder for composing and executing multi-step workflows with nodes for text, images, videos, LLM calls, cropping, and frame extraction.

## Setup

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and make changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Deployment

Build the project with `npm run build` and deploy the `dist/` directory to your hosting provider.

## Technologies

## Authentication (local mock)

This project includes a lightweight, development-only auth implementation:

- `src/hooks/use-auth.tsx` — `AuthProvider` and `useAuth()` that store a minimal `user` object in `localStorage`.
- `src/components/auth/SignIn.tsx` — simple sign-in form at the `/signin` route.
- `src/components/auth/RequireAuth.tsx` — route guard that redirects unauthenticated users to `/signin`.

How it works:

- The `AuthProvider` is wired in `src/App.tsx`. The root route (`/`) is protected and will redirect to `/signin` if not signed in.
- This is intentionally minimal for local development/testing. Do not use for production.

Replacing with a real provider

- To replace with Supabase, Firebase, or another provider:
	1. Install the provider SDK and add client initialization using environment variables.
	2. Replace `use-auth.tsx` to call the provider's sign-in and sign-out methods and sync the authenticated user.
	3. Keep `RequireAuth` or adapt it to check the provider's auth state.

Example commands to run the app locally:

```bash
npm install
npm run dev
```

If you want, I can add an example Supabase integration and `.env` instructions next.
