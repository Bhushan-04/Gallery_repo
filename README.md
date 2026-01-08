# Real-Time Gallery Interaction App 

A premium, real-time "Canvas-First" image gallery built with React, Vite, Tailwind CSS v4, and InstantDB (helps in solving distributed state synchronization problem).

**Deployed Link**: [click here](https://gallery-repo-green.vercel.app/)

## Key Features

*   **Premium Canvas Layout**: Immersive, borderless masonry grid with a "Canvas-First" philosophy.
*   **Real-Time Sync**: InstantDB ensuring sub-millisecond updates for all users.
*   **Pinned HUD Feed**: A desktop-first "Head-Up Display" for activity, ensuring real-time events are never missed.
*   **Theater Mode**: Edge-to-edge focused view for immersive interaction.
*   **Infinite Scroll**: Automatically fetches and seeds unique images from Unsplash.
*   **User Identity**: Auto-generated persistent user profiles.

## Bonus Features (Strong Signal)

*   **Emoji Picker**: Integrated full emoji keyboard support.
*   **Delete Interactions**: Users can delete their own comments/reactions.
*   **Feed Navigation**: clicking a feed item instantly opens the context image.
*   **Animations**: Smooth entry animations for new feed items.
*   **Conflict Handling**: InstantDB's "Append-Only" log structure naturally handles simultaneous writes without conflicts.

## Tech Stack

*   **Frontend**: React 18, TypeScript, Vite
*   **Styling**: Tailwind CSS v4 (Glassmorphism, Compositing)
*   **Database**: InstantDB (Real-time, Optimistic UI)
*   **State Management**: Zustand (Global UI State)
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

## API Handling Strategy

The application uses a **hybrid approach** for data fetching:

1. **Image Seeding (REST API)**:
    *   Since InstantDB is a database, not a content provider, we use the **Unsplash API** to fetch images.
    *   **Strategy**: We fetch images in batches of 9 using a standard `fetch` call in `services/unsplash.ts`.
    *   **Data Persistence**: Fetched images are immediately "seeded" into InstantDB. This creates a permanent record, allowing persistent comments/reactions even if the image order changes.

2. **Live syncing (WebSockets)**:
    *   **Strategy**: All UI state related to images and interactions is driven by **InstantDB's `useQuery` hook**.
    *   **Benefit**: This eliminates the need for manual `useEffect` polling or complex optimistic UI code. The database handle *is* the state.

## InstantDB Schema & Usage

We utilize a **Graph-Relational** schema to link generic "Interactions" to specific "Images".

```typescript
// Schema Definition
const schema = i.schema({
  entities: {
    images: i.entity({
      unsplashId: i.string(),
      url: i.string(),
      altDescription: i.string(),
      createdAt: i.number(),
    }),
    interactions: i.entity({
      type: i.string(), 
      content: i.string(), 
      userId: i.string(),
      createdAt: i.number(),
    }),
  },
  links: {
    imageInteractions: {
      forward: { on: "images", has: "many", label: "interactions" },
      reverse: { on: "interactions", has: "one", label: "image" },
    },
  },
});
```

*   **Why this schema?**: Decoupling `interactions` from `images` allows us to query *all* recent interactions for the Feed (one query) AND specific image interactions for the Focused View (another query) efficiently.

## Key React Decisions

1. **Canvas-First Architecture**:
    *   Moved away from traditional heavy sidebars. The UI "floats" above the content.
    *   The **Feed HUD** uses a dedicated `Zustand` store for toggle state (`isFeedOpen`) to ensure smooth mobile-to-desktop transitions without prop drilling.

2. **Append-Only Conflict Handling**:
    *   Instead of incrementing a generic `likeCount` integer (which is prone to race conditions), every reaction is a new Entity.
    *   **Client-Side Aggregation**: We use `array.reduce()` on the client to calculate counts. If 50 users react effectively at once, 50 entities are created. No writes are lost.

3. **Hybrid Scroll Layout**:
    *   On **Desktop**, we use `overflow-hidden` for a cinematic "Theater Mode".
    *   On **Mobile**, we switch to `overflow-y-auto` to allow natural page scrolling, preventing content from being cut off on small screens.

## Challenges & Solutions

*   **Challenge**: The "Pinned Feed" overlapped with header controls on large screens.
    *   **Solution**: Implemented a responsive `lg:mr-[420px]` margin transition on the header, dynamically shifting content to respect the HUD's z-space.
*   **Challenge**: Infinite Scroll triggered too actively.
    *   **Solution**: Tuned the `IntersectionObserver` threshold and added a `loading` semaphore in React State to prevent duplicate fetch calls during react-renders.
*   **Challenge**: Strict Type Safety with NoSQL.
    *   **Solution**: Manually defined interface `Interaction` and `Image` types to extend InstantDB's inferred types, ensuring we catch missing fields (like `userId`) at build time.

## Improvements (With More Time)

1.  **Optimized Images**: Implement `Next.js`-style image optimization (lazy loading, blur-up placeholders) manually or via Cloudinary, as loading raw Unsplash URLs can be bandwidth-heavy.
2.  **Auth Integration**: Replace the random user generator with Clerk or Firebase Auth for secure, cross-device profiles.

---
Built by @Bhushan-04
