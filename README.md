# Workflow Builder

A visual, node-based workflow builder for composing and executing multi-step workflows. Create complex data processing pipelines by connecting nodes like text input, image/video upload, LLM calls, image cropping, and frame extraction.

## Features

- **Node Types:**
  - **Text**: Simple text input node
  - **Upload Image**: Upload and manage image files
  - **Upload Video**: Upload and manage video files
  - **Run Any LLM**: Execute LLM prompts with Gemini models (1.5 Pro, 1.5 Flash, Pro Vision)
  - **Crop Image**: Crop images with percentage-based parameters (X, Y, Width, Height)
  - **Extract Frame**: Extract frames from videos at specified timestamps

- **Workflow Features:**
  - Drag-and-drop node creation
  - Visual edge connections between nodes
  - Node execution with output propagation
  - Automatic data flow from source to target nodes
  - Real-time status indicators (idle, running, success, error)
  - Full workflow execution or single node execution

- **Authentication:**
  - Local mock auth for development (localStorage-based)
  - Easy migration path to Supabase, Firebase, or other providers
  - Protected routes with automatic redirect to sign-in

## Technologies

- **Frontend**: React 18, TypeScript
- **UI Framework**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Workflow Engine**: React Flow
- **State Management**: Zustand
- **Build Tool**: Vite
- **Animation**: Framer Motion
- **API**: React Query (TanStack Query)
- **Routing**: React Router
- **Form Handling**: React Hook Form

## Getting Started

### Prerequisites

- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation

```bash
# Clone the repository
git clone https://github.com/jash2884/gemini-canvas.git

# Navigate to project directory
cd gemini-canvas

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── auth/                 # Authentication components
│   │   ├── SignIn.tsx        # Sign-in page
│   │   └── RequireAuth.tsx   # Route protection wrapper
│   ├── workflow/             # Workflow builder components
│   │   ├── WorkflowBuilder.tsx
│   │   ├── WorkflowCanvas.tsx
│   │   ├── WorkflowNode.tsx
│   │   ├── LeftSidebar.tsx
│   │   ├── RightSidebar.tsx
│   │   └── Toolbar.tsx
│   └── ui/                   # Reusable UI components (shadcn/ui)
├── hooks/
│   ├── use-auth.tsx          # Authentication hook
│   └── use-mobile.tsx        # Mobile detection hook
├── store/
│   └── workflowStore.ts      # Zustand workflow state management
├── types/
│   └── workflow.ts           # TypeScript interfaces and node configs
├── pages/
│   ├── Index.tsx             # Main workflow builder page
│   └── NotFound.tsx          # 404 page
├── lib/
│   └── utils.ts              # Utility functions
├── App.tsx                   # App root with routing
└── main.tsx                  # Entry point
```

## Authentication

### Local Mock Auth (Development)

The project includes a lightweight local auth system using `localStorage`:

- **Provider**: `src/hooks/use-auth.tsx` - `AuthProvider` and `useAuth()` hook
- **Sign-In Page**: `/signin` route with styled form
- **Route Guard**: `RequireAuth` wrapper protects the main workflow builder
- **Session**: User email stored in localStorage and persisted across page reloads

**How it works:**

1. Unauthenticated users are redirected to `/signin`
2. Any email can be used to sign in (demo purposes)
3. Session persists in localStorage
4. Sign out clears the session

### Migrate to a Real Provider

To use Supabase, Firebase, or another auth provider:

1. Install the provider SDK:

   ```bash
   npm install @supabase/supabase-js
   # or
   npm install firebase
   ```

2. Create a `.env.local` file with your provider credentials:

   ```
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```

3. Update `src/hooks/use-auth.tsx` to use the provider's SDK instead of localStorage

4. Keep `RequireAuth` and `SignIn` or adapt them to your provider's flow

## Building & Deployment

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Deploy

Deploy the `dist/` directory to any static hosting provider:

- Vercel: `vercel deploy`
- Netlify: Drag and drop `dist/` folder
- GitHub Pages: Push `dist/` to `gh-pages` branch
- Traditional hosting: Upload `dist/` via FTP/SFTP

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build locally
- `npm run lint` — Run ESLint
- `npm run test` — Run tests once
- `npm run test:watch` — Run tests in watch mode

## How to Use

1. **Sign In**: Use any email to sign in (mock auth)
2. **Add Nodes**: Drag node types from the left sidebar onto the canvas
3. **Configure Nodes**: Click node expand button to configure parameters
4. **Connect Nodes**: Drag from a right handle (output) to a left handle (input) of another node
5. **Execute**: Click "Run" on individual nodes or use the workflow run control
6. **View Results**: Connected nodes receive outputs automatically as data flows through the graph

## Example Workflows

### Text → LLM → Display

1. Add Text node with content
2. Add LLM node
3. Connect Text `output` → LLM `user_message`
4. Run the text node, then the LLM node to see the response

### Image Processing Pipeline

1. Add Upload Image node
2. Add Crop Image node
3. Connect Image `output` → Crop `image_url`
4. Configure crop parameters and run

### Video Frame Extraction

1. Add Upload Video node
2. Add Extract Frame node
3. Connect Video `output` → Frame `video_url`
4. Set timestamp and run

## Environment Variables

Currently only needed for production deployments with a real auth provider.

Create `.env.local` in the project root:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

Or for Firebase:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## Contributing

Feel free to fork and submit pull requests for improvements.

## License

MIT

## Support

For issues or feature requests, please open an issue on GitHub.
