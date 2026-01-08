import { init, i } from "@instantdb/react";

const schema = i.schema({
  entities: {
    images: i.entity({
      unsplashId: i.string(),
      url: i.string(),
      altDescription: i.string(),
      createdAt: i.number(),
    }),
    interactions: i.entity({
      type: i.string(), // 'emoji' or 'comment'
      content: i.string(),
      createdAt: i.number(),
      userName: i.string(),
      userColor: i.string(),
      userId: i.string(),
    }),
  },
  links: {
    imageInteractions: {
      forward: { on: "images", has: "many", label: "interactions" },
      reverse: { on: "interactions", has: "one", label: "images" },
    },
  },
});

// This exports a typed database instance
export const db = init({
  appId: import.meta.env.VITE_INSTANT_APP_ID as string,
  schema
});