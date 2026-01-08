# Real-Time Gallery Interaction App

A premium, real-time "Canvas-First" image gallery built with React, Vite, Tailwind CSS v4, and InstantDB.

**Deployed Link**: [Click Here](https://gallery-task-ten.vercel.app/)

## Key Features

*   **Premium Canvas Layout**: Immersive, borderless masonry grid with a "Canvas-First" philosophy.
*   **Real-Time Sync**: InstantDB ensuring sub-millisecond updates for all users.
*   **Pinned HUD Feed**: A desktop-first "Head-Up Display" for activity, ensuring real-time events are never missed.
*   **Theater Mode**: Edge-to-edge focused view for immersive interaction.
*   **Infinite Scroll**: Automatically fetches and seeds unique images from Unsplash.
*   **User Identity**: Auto-generated persistent user profiles.

## Extra Features

*   **Emoji Picker**: Integrated full emoji keyboard support.
*   **Delete Interactions**: Users can delete their own comments/reactions.
*   **Feed Navigation**: clicking a feed item instantly opens the context image.
*   **Animations**: Smooth entry animations for new feed items.
*   **Conflict Handling**: InstantDB's "Append-Only" log structure naturally handles simultaneous writes without conflicts.

## Tech Stack

*   **Frontend**: React 18, TypeScript, Vite
*   **Styling**: Tailwind CSS v4 
*   **Database**: InstantDB 
*   **State Management**: Zustand 
*   **Icons**: Lucide React

## Setup Instructions

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/Bhushan-04/Gallery_repo.git
    cd gallery_task
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file in the root:
    ```env
    VITE_INSTANT_DB_APP_ID="your-instantdb-app-id"
    VITE_UNSPLASH_ACCESS_KEY="your-unsplash-access-key"
    ```

3.  **Run Locally**:
    ```bash
    npm run dev
    ```

## Architectural Decisions

### 1. "Canvas-First" Design
To meet the "Premium UI" goal, I moved away from traditional sidebars. The UI "floats" above the content. The Feed is a "Pinned HUD" on desktop to satisfy the "Real-Time Visibility" requirement without cluttering the center stage.

### 2. InstantDB for Real-Time
Selected InstantDB over Firebase/Socket.io for its "Optimistic UI" and graph-based relational queries. This eliminates the need for complex optimistic update logic in Redux/React Query—the DB handle is the source of truth.

### 3. Conflict Handling Strategy
-   Instead of modifying a single "count" field (which causes race conditions), every emoji reaction is a *new entity* in the DB.
-   The client aggregates these entities (reducers) to calculate counts.
-   This makes "conflicts" impossible: if two users react simultaneously, two entities are created. Both appear instantly.

### 4. Masonry Layout
Standard CSS Grids leave gaps with vertical images. I used CSS Columns (`columns-3`) to create a true masonry effect that handles varying aspect ratios perfectly.

## Challenges & Solutions
*   **Real-Time Types**: InstantDB's schema inference can be loose. I implemented strict typing in the `store.ts` and component props to ensure type safety which is essential for security.

---
Built by @Bhushan-04
