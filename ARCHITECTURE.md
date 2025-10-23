# Architecture Documentation - Map Context7

This document provides a comprehensive overview of the Linear Clone application architecture, data flow, and design decisions.

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Layers](#architecture-layers)
3. [Data Flow](#data-flow)
4. [Database Schema](#database-schema)
5. [Component Structure](#component-structure)
6. [State Management](#state-management)
7. [Authentication Flow](#authentication-flow)
8. [Real-time Updates](#real-time-updates)
9. [Performance Optimizations](#performance-optimizations)
10. [Security Considerations](#security-considerations)

## System Overview

The Linear Clone is built as a three-tier architecture:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Next.js 15 + React + Tailwind CSS)    │
└─────────────────┬───────────────────────┘
                  │
                  │ API Calls
                  │
┌─────────────────▼───────────────────────┐
│           Business Logic                │
│        (Convex Functions)               │
│   (Queries, Mutations, Actions)         │
└─────────────────┬───────────────────────┘
                  │
                  │ Database Operations
                  │
┌─────────────────▼───────────────────────┐
│           Data Layer                    │
│      (Convex Real-time Database)        │
└─────────────────────────────────────────┘
```

## Architecture Layers

### 1. Presentation Layer (Next.js)

**Location:** `/app`, `/components`

**Responsibilities:**
- Server-side and client-side rendering
- User interface components
- Routing and navigation
- Client-side state management
- User interactions

**Key Technologies:**
- Next.js 15 App Router
- React 19 with Server Components
- Tailwind CSS 4 for styling
- TypeScript for type safety

**Structure:**
```
app/
├── (auth)/              # Authentication routes
│   ├── sign-in/
│   └── sign-up/
├── app/                 # Protected application routes
│   ├── issues/
│   ├── projects/
│   ├── team/
│   └── settings/
├── onboarding/          # New user workspace setup
├── layout.tsx           # Root layout with providers
└── page.tsx             # Public landing page
```

### 2. Business Logic Layer (Convex)

**Location:** `/convex`

**Responsibilities:**
- Data validation and business rules
- Complex queries and aggregations
- Authorization and access control
- Real-time subscriptions
- Data transformations

**Structure:**
```
convex/
├── schema.ts            # Database schema definition
├── users.ts             # User management functions
├── workspaces.ts        # Workspace operations
├── projects.ts          # Project management
├── issues.ts            # Issue CRUD operations
├── comments.ts          # Comment functionality
├── labels.ts            # Label management
├── statuses.ts          # Status workflow
└── activities.ts        # Activity logging
```

**Function Types:**

1. **Queries** (Read Operations)
   - Subscribe to data changes
   - Automatically update on changes
   - Type-safe return values
   - Example: `listIssues`, `getIssueByNumber`

2. **Mutations** (Write Operations)
   - Create, update, delete operations
   - Transactional guarantees
   - Optimistic updates support
   - Example: `createIssue`, `updateIssue`

3. **Actions** (External Operations)
   - Third-party API calls
   - Email sending
   - File uploads
   - Example: `sendInviteEmail` (future)

### 3. Data Layer (Convex Database)

**Location:** Managed by Convex

**Responsibilities:**
- Data persistence
- Real-time synchronization
- Indexing and querying
- Relationships and foreign keys
- ACID transactions

**Schema Design Principles:**
- Normalize where appropriate
- Denormalize for performance
- Index common query patterns
- Support real-time subscriptions

## Data Flow

### Issue Creation Flow

```
User Action (UI)
    │
    ▼
Client Component
    │
    ├─► useMutation(api.issues.createIssue)
    │
    ▼
Convex Mutation
    │
    ├─► Validate input
    ├─► Check permissions
    ├─► Generate issue number
    ├─► Insert into database
    └─► Create activity log
    │
    ▼
Database Write
    │
    ▼
Real-time Propagation
    │
    ├─► Update all subscribed clients
    └─► Trigger query revalidation
    │
    ▼
UI Update (All Clients)
```

### Query Data Flow

```
Component Mount
    │
    ▼
useQuery(api.issues.listIssues)
    │
    ├─► Subscribe to query
    ├─► Initial data fetch
    │
    ▼
Convex Query Function
    │
    ├─► Execute database query
    ├─► Apply filters
    ├─► Join related data
    ├─► Return results
    │
    ▼
Client Receives Data
    │
    ├─► Update component state
    └─► Render UI
    │
    ▼
[Listening for Changes]
    │
    └─► Auto-update on database changes
```

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐
│   Users      │
└──────┬───────┘
       │
       │ created_by / assignee
       │
       ▼
┌──────────────┐      ┌──────────────┐
│  Workspaces  │◄────►│WorkspaceMembers│
└──────┬───────┘      └──────────────┘
       │
       ├─────────┐
       │         │
       ▼         ▼
┌──────────┐  ┌──────────┐
│ Projects │  │ Statuses │
└────┬─────┘  └────┬─────┘
     │             │
     │             │
     ▼             ▼
┌────────────────────┐
│      Issues        │◄───────┐
└──────┬─────────────┘        │
       │                      │
       ├──────────┬───────────┤
       │          │           │
       ▼          ▼           ▼
┌──────────┐  ┌──────┐  ┌──────────┐
│ Comments │  │Labels│  │Activities│
└──────────┘  └──────┘  └──────────┘
                 │
                 ▼
            ┌──────────┐
            │IssueLabels│
            └──────────┘
```

### Table Relationships

#### Users
- **Primary Key:** `_id`
- **Indexes:** `clerkId`, `email`
- **Relationships:**
  - One-to-many with Issues (creator)
  - One-to-many with Issues (assignee)
  - One-to-many with Comments
  - Many-to-many with Workspaces (via WorkspaceMembers)

#### Workspaces
- **Primary Key:** `_id`
- **Indexes:** `identifier`, `createdBy`
- **Relationships:**
  - One-to-many with Projects
  - One-to-many with Issues
  - One-to-many with Statuses
  - Many-to-many with Users (via WorkspaceMembers)

#### Issues
- **Primary Key:** `_id`
- **Indexes:** 
  - `workspaceId`, `number` (composite - unique issue identifier)
  - `statusId`
  - `assigneeId`
  - `projectId`
  - `updatedAt` (for sorting)
- **Relationships:**
  - Many-to-one with Status
  - Many-to-one with Project
  - Many-to-one with User (assignee)
  - One-to-many with Comments
  - Many-to-many with Labels (via IssueLabels)

### Indexing Strategy

1. **Single-field indexes:**
   - Primary lookups: `by_clerk_id`, `by_email`
   - Foreign key navigation: `by_workspace`, `by_project`

2. **Composite indexes:**
   - Unique constraints: `[workspaceId, number]`
   - Common filters: `[workspaceId, statusId]`
   - Sorted queries: `[workspaceId, updatedAt]`

3. **Query optimization:**
   - Filter first (most selective index first)
   - Sort last (use index for ordering)
   - Limit results for pagination

## Component Structure

### Component Hierarchy

```
RootLayout
├── ClerkProvider (Authentication)
└── AppProvider (Convex + Toast)
    ├── CommandMenu (Global)
    └── Page Content
        ├── Sidebar (Navigation)
        └── Main Content
            ├── Page-specific layouts
            └── Feature components
```

### Component Categories

#### 1. Layout Components
- **Sidebar:** Global navigation
- **Header:** Page titles and actions
- **Container:** Content wrappers

#### 2. Feature Components
- **IssueCard:** Issue display
- **IssueForm:** Issue creation/editing
- **CommentList:** Comment threads
- **StatusDropdown:** Status selection

#### 3. UI Primitives
- **Button:** Interactive actions
- **Input:** Text input
- **Textarea:** Multi-line input
- **Select:** Dropdown selection

#### 4. System Components
- **CommandMenu:** Keyboard shortcuts
- **Toast:** Notifications
- **LoadingSpinner:** Loading states

### Component Patterns

#### Composition Pattern
```tsx
<IssueCard>
  <IssueCard.Header />
  <IssueCard.Body />
  <IssueCard.Footer />
</IssueCard>
```

#### Render Props Pattern
```tsx
<DataProvider>
  {(data) => <Component data={data} />}
</DataProvider>
```

#### Custom Hooks Pattern
```tsx
function useIssues(workspaceId) {
  return useQuery(api.issues.listIssues, { workspaceId });
}
```

## State Management

### Client State (React)
- Component-local state: `useState`
- Form state: `useState` + controlled inputs
- UI state: Local to components

### Server State (Convex)
- Data fetching: `useQuery`
- Data mutations: `useMutation`
- Real-time sync: Automatic
- Caching: Built-in

### URL State
- Filters: Query parameters
- Current page: Route params
- Modal state: Hash navigation

## Authentication Flow

### Sign Up Flow

```
1. User visits /sign-up
2. Clerk handles registration
3. User creates account
4. Redirect to /onboarding
5. Create first workspace
6. Sync user to Convex
7. Redirect to /app
```

### Sign In Flow

```
1. User visits /sign-in
2. Clerk authenticates
3. Get auth token
4. Convex verifies token
5. Sync user data
6. Check workspace membership
7. Redirect to /app or /onboarding
```

### Authorization

**Middleware:** `/middleware.ts`
- Protects all `/app/*` routes
- Allows public routes: `/`, `/sign-in`, `/sign-up`

**Convex Functions:**
- Get user identity: `ctx.auth.getUserIdentity()`
- Verify workspace membership
- Check user roles

## Real-time Updates

### Subscription Mechanism

```tsx
// Component subscribes to query
const issues = useQuery(api.issues.listIssues, { 
  workspaceId 
});

// Convex automatically:
// 1. Executes query
// 2. Returns results
// 3. Watches for changes
// 4. Re-runs query on changes
// 5. Updates component
```

### Update Propagation

1. **Mutation executed**
   - Client calls mutation
   - Convex processes mutation
   - Database updated

2. **Change detection**
   - Convex detects table changes
   - Identifies affected queries

3. **Query revalidation**
   - Re-runs affected queries
   - Computes new results

4. **Client notification**
   - Pushes updates to clients
   - React re-renders components

### Optimistic Updates

```tsx
const updateIssue = useMutation(api.issues.updateIssue);

// Optimistic UI update
setLocalState(newValue);

// Backend update
updateIssue({ issueId, newValue })
  .catch(() => {
    // Revert on error
    setLocalState(oldValue);
  });
```

## Performance Optimizations

### 1. Query Optimization
- **Index-based queries:** Use appropriate indexes
- **Selective fields:** Only fetch needed data
- **Pagination:** Limit result sets
- **Filtering:** Apply filters in database

### 2. Component Optimization
- **React.memo:** Prevent unnecessary re-renders
- **useMemo:** Cache expensive computations
- **useCallback:** Stable function references
- **Code splitting:** Dynamic imports

### 3. Bundle Optimization
- **Tree shaking:** Remove unused code
- **Dynamic imports:** Load on demand
- **Font optimization:** Next.js font system
- **Image optimization:** Next.js Image component

### 4. Network Optimization
- **WebSocket connection:** Single connection for all queries
- **Request batching:** Combine multiple queries
- **Automatic caching:** Built into Convex
- **CDN delivery:** Static assets

## Security Considerations

### 1. Authentication
- **Clerk integration:** Industry-standard auth
- **JWT tokens:** Secure token transmission
- **Session management:** Automatic token refresh
- **MFA support:** Optional two-factor auth

### 2. Authorization
- **Server-side checks:** All mutations verify permissions
- **Workspace isolation:** Users only see their workspaces
- **Role-based access:** Admin vs member permissions
- **Row-level security:** Implemented in queries

### 3. Data Validation
- **Input validation:** Convex Validators
- **Type safety:** TypeScript everywhere
- **SQL injection prevention:** Convex query builder
- **XSS prevention:** React escaping

### 4. API Security
- **HTTPS only:** Encrypted transmission
- **CORS configuration:** Controlled origins
- **Rate limiting:** Built into Convex
- **DDoS protection:** Convex infrastructure

### 5. Environment Variables
- **Secret management:** `.env.local` (gitignored)
- **Client vs server:** `NEXT_PUBLIC_*` prefix
- **Production secrets:** Vercel environment variables
- **Key rotation:** Regular credential updates

## Best Practices

### Code Organization
- One component per file
- Co-locate related files
- Clear naming conventions
- Consistent file structure

### Type Safety
- Explicit return types
- Avoid `any` type
- Use generated types
- Validate external data

### Error Handling
- Try-catch in mutations
- Toast notifications for errors
- Fallback UI components
- Error boundaries

### Testing Strategy
- Unit tests for utilities
- Integration tests for flows
- E2E tests for critical paths
- Visual regression tests

### Documentation
- README for setup
- Architecture docs (this file)
- Inline code comments
- API documentation

## Future Enhancements

### Planned Features
1. **Search improvements**
   - Full-text search
   - Advanced filters
   - Saved searches

2. **Collaboration**
   - Real-time cursors
   - Live editing
   - Presence indicators

3. **Notifications**
   - In-app notifications
   - Email notifications
   - Slack integration

4. **Reporting**
   - Analytics dashboard
   - Custom reports
   - Data exports

5. **Mobile app**
   - React Native app
   - Offline support
   - Push notifications

### Performance Roadmap
1. Virtual scrolling for long lists
2. Background data prefetching
3. Service worker caching
4. Progressive Web App features

---

**Last Updated:** 2024
**Version:** 1.0.0
