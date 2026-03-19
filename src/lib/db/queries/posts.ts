import { db } from "..";
import { firstOrUndefined } from "./utils";
import { desc, eq } from "drizzle-orm";
import { feedFollows, feeds, posts } from "../schema";

export async function createPost(title: string, url: string, description: string, publishedAt: Date, feedId: string) {
  const result = await db
    .insert(posts)
    .values({
      title,
      url,
      description,
      publishedAt,
      feedId,
    })
    .onConflictDoNothing({ target: posts.url })
    .returning();

  return firstOrUndefined(result);
}

export async function getPostsForUsers(userId: string, limit: number) {
  const result = await db
    .select({
      id: posts.id,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      title: posts.title,
      url: posts.url,
      description: posts.description,
      publishedAt: posts.publishedAt,
      feedId: posts.feedId,
      feedName: feeds.name,
    })
    .from(posts)
    .innerJoin(feedFollows, eq(posts.feedId, feedFollows.feedId))
    .innerJoin(feeds, eq(posts.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
  return result;
}