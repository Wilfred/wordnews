import https from "https";

import { MatchedStory } from "./hn";

function fetchJSON<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "wordnews/1.0" } }, (res) => {
      let data = "";
      res.on("data", (chunk: string) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data) as T);
        } catch (e) {
          reject(e);
        }
      });
      res.on("error", reject);
    }).on("error", reject);
  });
}

function isFromToday(unixTime: number): boolean {
  const postDate = new Date(unixTime * 1000);
  const today = new Date();
  return (
    postDate.getFullYear() === today.getFullYear() &&
    postDate.getMonth() === today.getMonth() &&
    postDate.getDate() === today.getDate()
  );
}

export async function searchReddit(word: string): Promise<MatchedStory[]> {
  const query = encodeURIComponent(word);
  const searchUrl = `https://www.reddit.com/search.json?q=${query}&sort=new&t=day&limit=100`;

  interface RedditPost {
    data: {
      id: string;
      title: string;
      url: string;
      author: string;
      created_utc: number;
      score: number;
      permalink: string;
    };
  }

  interface RedditResponse {
    data: {
      children: RedditPost[];
    };
  }

  const result = await fetchJSON<RedditResponse>(searchUrl);

  return result.data.children
    .filter((child) => isFromToday(child.data.created_utc))
    .map((child) => ({
      id: parseInt(child.data.id, 36),
      title: child.data.title,
      url: child.data.url,
      by: child.data.author,
      time: child.data.created_utc,
      score: child.data.score,
      permalink: `https://www.reddit.com${child.data.permalink}`,
    }));
}
