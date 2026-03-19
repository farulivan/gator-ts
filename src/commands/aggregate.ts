import { getNextFeedToFetch, markFeedAsFetched } from 'src/lib/db/queries/feeds';
import { fetchFeed } from "../lib/rss";
import type { Feed } from 'src/lib/db/schema';
import { parseDuration, formatDuration } from 'src/lib/time';
import { createPost } from 'src/lib/db/queries/posts';

export async function handlerAgg(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <time_between_reqs>`);
  }

  const timeBetweenRequestsStr = args[0];
  const timeBetweenRequests = parseDuration(timeBetweenRequestsStr);
  if (!timeBetweenRequests) {
    throw new Error(
      `invalid duration: ${timeBetweenRequestsStr} — use format 1h 30m 15s or 3500ms`,
    );
  }
  console.log(`Collecting feeds every ${formatDuration(timeBetweenRequests)}`);

  scrapeFeeds().catch(handleError);

  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenRequests);

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("Shutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}

async function scrapeFeeds() {
  const feed = await getNextFeedToFetch();
  if (!feed) {
    console.log(`No feeds to fetch.`);
    return;
  }
  console.log(`Found a feed to fetch!`);
  await scrapeFeed(feed);
}

async function scrapeFeed(feed: Feed) {
  await markFeedAsFetched(feed.id);

  const feedData = await fetchFeed(feed.url);

  for (const item of feedData.channel.item) {
    const publishedAt = parsePublishedAt(item.pubDate);
    await createPost(item.title, item.link, item.description, publishedAt, feed.id);
  }
}

function parsePublishedAt(pubDate: string): Date {
  const d1 = new Date(pubDate);
  if (!isNaN(d1.getTime())) {
    return d1;
  }

  const normalized = pubDate.replace("GMT", "+0000");
  const t2 = Date.parse(normalized);
  if (!isNaN(t2)) {
    return new Date(t2);
  }

  return new Date();
}

function handleError(err: unknown) {
  console.error(
    `Error scraping feeds: ${err instanceof Error ? err.message : err}`,
  );
}