import { db } from "../lib/instantdb";
import { id } from "@instantdb/react";
import { useStore } from "../lib/store";

interface PhotoCardProps {
  image: {
    id: string;
    url: string;
    altDescription: string;
    interactions: Array<{ id: string; type: string; content: string; createdAt: number }>;
  };
}

export default function PhotoCard({ image }: PhotoCardProps) {
  const { setActiveImageId, user } = useStore();

  const addInteraction = (e: React.MouseEvent, type: "emoji", content: string) => {
    e.stopPropagation();
    if (!user) return;

    const interactionId = id();
    db.transact([
      db.tx.interactions[interactionId].update({
        type,
        content,
        createdAt: Date.now(),
        userName: user.name,
        userColor: user.color,
        userId: user.id,
      }),
      db.tx.images[image.id].link({ interactions: interactionId }),
    ]);
  };

  const interactions = image.interactions || [];
  const emojis = interactions.filter(i => i.type === 'emoji');
  const emojiCounts = emojis.reduce((acc, curr) => {
    acc[curr.content] = (acc[curr.content] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div
      className="group request-card relative rounded-2xl overflow-hidden cursor-zoom-in transition-all duration-500 hover:shadow-2xl hover:shadow-black/50"
      onClick={() => setActiveImageId(image.id)}
    >
      <img
        src={image.url}
        alt={image.altDescription}
        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform"
        loading="lazy"
      />

      {/* Cinematic Vignette Overlay (Only on Hover) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Floating Interaction Layer */}
      <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">

        <div className="flex justify-between items-end">
          {/* Reaction Stats */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(emojiCounts).map(([emoji, count]) => (
              <div key={emoji} className="bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                <span className="text-sm">{emoji}</span>
                <span className="font-semibold text-white/90">{count}</span>
              </div>
            ))}
          </div>

          {/* Quick React Actions */}
          <div className="flex gap-2 translate-y-2 group-hover:translate-y-0 transition-transform delay-75 duration-300">
            {["🔥", "❤️"].map(emoji => (
              <button
                key={emoji}
                onClick={(e) => addInteraction(e, "emoji", emoji)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-xl flex items-center justify-center text-lg active:scale-90 transition-all shadow-lg hover:shadow-xl"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}