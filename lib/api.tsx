import { WPPost } from "../types/wordpress";

export async function getPosts(): Promise<WPPost[]> {
  const res = await fetch("https://thesun.my/wp-json/wp/v2/posts", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }

  return res.json();
}