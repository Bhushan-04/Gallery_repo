import { db } from "./lib/instantdb";
import { id } from "@instantdb/react";

interface UnsplashPhoto {
  id: string;
  urls: { regular: string };
  alt_description: string | null;
}

export async function seedImages(): Promise<void> {
  const KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  try {
    const res = await fetch(`https://api.unsplash.com/photos/random?count=10&client_id=${KEY}`);
    const data: UnsplashPhoto[] = await res.json();

    const txs = data.map((photo) => 
      db.tx.images[id()].update({
        unsplashId: photo.id,
        url: photo.urls.regular,
        altDescription: photo.alt_description || "Unsplash Image",
      })
    );
    await db.transact(txs);
  } catch (err) {
    console.error("Seeding error:", err);
  }
}