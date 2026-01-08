import { db } from "../lib/instantdb";
import { id } from "@instantdb/react";

export const seedImages = async (count = 10) => {
  const response = await fetch(
    `https://api.unsplash.com/photos/random?count=${count}&client_id=${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`
  );
  const data = await response.json();

  const txs = data.map((img: any) => {
    const imageId = id(); // Generate a new ID for every fetch to allow duplicates/infinite list effectively in this demo
    return db.tx.images[imageId].update({
      url: img.urls.regular,
      altDescription: img.alt_description || "Untitled",
      unsplashId: img.id,
      createdAt: Date.now(), // Use timestamp for sorting order
    });
  });

  await db.transact(txs);
};