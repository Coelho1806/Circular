# Linear Clone - Built with Next.js and Convex

A modern, production-ready project management platform inspired by Linear.app. Built with Next.js 15, Convex for real-time backend, Clerk for authentication, and styled with Tailwind CSS.

![Linear Clone](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![Convex](https://img.shields.io/badge/Convex-Backend-orange?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)

## ✨ Features

### Core Functionality
- **🔐 Authentication** - Secure user authentication with Clerk
- **📋 Issue Management** - Create, update, delete, and organize issues
- **🏷️ Labels & Tags** - Categorize issues with custom labels
- **🎯 Priorities** - Set issue priorities (Urgent, High, Medium, Low, None)
- **📊 Status Tracking** - Track progress through customizable workflows
- **👥 Team Collaboration** - Assign issues to team members
- **📁 Projects** - Organize issues into projects
- **💬 Comments** - Discussion threads on issues
- **🔍 Search** - Quick issue search and filtering
- **📱 Command Palette** - Keyboard-first navigation (⌘K)
- **⚡ Real-time Updates** - Instant data sync with Convex
- **🎨 Modern UI** - Clean, dark-mode interface

### Technical Features
- **Server-side Rendering** - Fast initial page loads with Next.js App Router
- **Real-time Database** - Reactive queries with Convex
- **Type Safety** - End-to-end TypeScript
- **Optimistic Updates** - Instant UI feedback
- **Responsive Design** - Mobile-friendly interface
- **Keyboard Shortcuts** - Power user productivity features

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd linear-clone
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Clerk Authentication**
   - Create a free account at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy your publishable and secret keys
   - Add to `.env.local`:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

4. **Initialize Convex**
```bash
npx convex dev
```
   - Follow the prompts to create a Convex account (or run locally)
   - This will create `.env.local` with Convex credentials

5. **Run the development server**
```bash
npm run dev
```

6. **Open in browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Sign up to create your account
   - Follow the onboarding to create your first workspace

## 📖 Usage Guide

### Creating Your First Issue

1. **Click "New Issue"** button or press `C`
2. **Fill in the details:**
   - Title (required)
   - Description
   - Status
   - Priority
   - Project
   - Assignee
3. **Submit** to create the issue

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open command palette |
| `C` | Create new issue |
| `G + I` | Go to issues |
| `G + P` | Go to projects |
| `/` | Focus search |

### Command Palette

Press `⌘K` (Mac) or `Ctrl+K` (Windows/Linux) to open the command palette. This allows you to:
- Quickly navigate to any page
- Create new issues
- Search across your workspace
- Execute actions without leaving the keyboard

### Managing Projects

1. Navigate to **Projects** page
2. Click **New Project**
3. Enter project details:
   - Name
   - Identifier (2-5 characters for issue keys)
   - Description
4. Issues can be assigned to projects during creation

### Team Management

1. Go to **Team** page
2. View all workspace members
3. Invite new members by email (requires email provider setup)
4. Manage member roles and permissions

## 🏗️ Project Structure

```
linear-clone/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                  # Authentication routes
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── app/                     # Main application routes
│   │   ├── issues/              # Issue management
│   │   ├── projects/            # Project management
│   │   ├── team/                # Team settings
│   │   └── settings/            # User settings
│   ├── onboarding/              # Workspace creation
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── issues/                  # Issue-specific components
│   ├── layout/                  # Layout components (Sidebar)
│   ├── providers/               # Context providers
│   ├── system/                  # System UI (Command Menu)
│   └── ui/                      # Reusable UI components
├── convex/                       # Convex backend
│   ├── schema.ts                # Database schema
│   ├── users.ts                 # User functions
│   ├── workspaces.ts            # Workspace functions
│   ├── projects.ts              # Project functions
│   ├── issues.ts                # Issue functions
│   ├── comments.ts              # Comment functions
│   ├── labels.ts                # Label functions
│   ├── statuses.ts              # Status functions
│   └── activities.ts            # Activity log functions
├── lib/                         # Utility functions
│   └── utils.ts                 # Helper functions
└── public/                      # Static assets
```

## 🗄️ Database Schema

### Tables

#### `users`
- User profiles synced from Clerk
- Stores user metadata and preferences

#### `workspaces`
- Top-level organization unit
- Contains projects, issues, and team members

#### `projects`
- Groups related issues together
- Has unique identifier for issue keys

#### `issues`
- Main task/ticket entity
- Links to status, assignee, project, labels
- Auto-incrementing number within workspace

#### `statuses`
- Workflow states (Todo, In Progress, Done, etc.)
- Customizable per workspace
- Ordered by position

#### `labels`
- Tagging system for issues
- Color-coded categories

#### `comments`
- Discussion threads on issues
- Support for nested replies (via `parentId`)

#### `activities`
- Audit log of changes
- Tracks who did what and when

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Convex (auto-generated)
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=...
```

### Customization

#### Changing Colors
Edit `app/globals.css` and Tailwind config for theme customization.

#### Adding Status Types
Modify `convex/workspaces.ts` to add default statuses when creating workspaces.

#### Custom Fields
Extend the `issues` schema in `convex/schema.ts` with additional fields.

## 🧪 Development

### Running Tests
```bash
npm run test
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run start
```

## 📦 Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy on Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

3. **Set up Convex for Production**
```bash
npx convex deploy
```
   - Update `NEXT_PUBLIC_CONVEX_URL` in Vercel with production URL

### Environment Variables on Vercel

Add these in your Vercel project settings:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOYMENT`

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) - React framework with App Router
- **Backend:** [Convex](https://convex.dev/) - Real-time backend platform
- **Authentication:** [Clerk](https://clerk.com/) - User management and auth
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS
- **Language:** [TypeScript](https://www.typescriptlang.org/) - Type safety
- **UI Components:** Custom components with Radix UI primitives
- **Icons:** [Lucide React](https://lucide.dev/) - Beautiful icons
- **Command Palette:** [cmdk](https://cmdk.paco.me/) - Command menu

## 📚 Additional Resources

### Documentation Context (Map Context7)

This project follows a clear architectural pattern:

1. **Data Layer (Convex)** - All database operations
   - Schema definitions with relationships
   - Type-safe queries and mutations
   - Real-time subscriptions
   - Built-in authentication

2. **Presentation Layer (Next.js)** - UI and routing
   - Server and client components
   - API route handlers
   - Middleware for auth
   - Optimized rendering

3. **UI Layer (React + Tailwind)** - Components
   - Reusable UI primitives
   - Compound components
   - Consistent design system
   - Responsive layouts

### Key Patterns

- **Optimistic Updates** - UI updates immediately, reverts on error
- **Progressive Enhancement** - Works without JavaScript where possible
- **Code Splitting** - Lazy load components and routes
- **Type Safety** - End-to-end TypeScript with generated types
- **Real-time First** - Data syncs automatically across clients

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by [Linear.app](https://linear.app)
- Built with amazing tools from the open source community
- Thanks to all contributors and users

## 📞 Support

- **Documentation:** See this README and inline code comments
- **Issues:** Create an issue on GitHub
- **Discussions:** Join our community discussions

---

**Built with ❤️ using Next.js and Convex**
