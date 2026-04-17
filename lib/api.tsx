import { WPPost } from "../types/wordpress";

export async function getPosts(): Promise<WPPost[]> {
  const res = await fetch("http://190.254.2.223/wp-json/wp/v2/posts", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }

  return res.json();
}