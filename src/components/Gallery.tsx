import { db } from "../lib/instantdb";
import PhotoCard from "./PhotoCard";
import { useEffect, useRef, useState } from "react";
import { seedImages } from "../services/unsplash";
import { Loader2 } from "lucide-react";

export default function Gallery() {
  const { isLoading, error, data } = db.useQuery({ images: { interactions: {} } });
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Sorting: Newest first based on creation time (simulated by our append logic)
  const sortedImages = (data?.images || []).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isFetchingMore && sortedImages.length > 0) {
          setIsFetchingMore(true);
          try {
            await seedImages(6); // Load 6 more
          } catch (e) {
            console.error("Failed to load more", e);
          } finally {
            // Add a small delay to prevent rapid-fire triggers
            setTimeout(() => setIsFetchingMore(false), 1000);
          }
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [sortedImages.length, isFetchingMore]);


  if (isLoading && sortedImages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin text-white/20">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  if (error) return <div className="text-red-500 text-center py-20">Error loading gallery</div>;

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
      {/* Masonry Grid using CSS Columns */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {sortedImages.map((img: any) => (
          <div key={img.id} className="break-inside-avoid">
            <PhotoCard image={img} />
          </div>
        ))}
      </div>

      {/* Infinite Scroll Loader Trigger */}
      <div ref={loaderRef} className="h-20 flex items-center justify-center w-full mt-10">
        {isFetchingMore && (
          <div className="flex items-center gap-2 text-white/50 bg-black/40 backdrop-blur px-4 py-2 rounded-full">
            <Loader2 className="animate-spin" size={16} />
            <span className="text-sm">Loading more canvas...</span>
          </div>
        )}
      </div>
    </div>
  );
}