import https from "https";

export interface MatchedStory {
  id: number;
  title: string;
  url: string;
  by: string;
  time: number;
  score: number;
}

function fetchJSON<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
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
  const storyDate = new Date(unixTime * 1000);
  const today = new Date();
  return (
    storyDate.getFullYear() === today.getFullYear() &&
    storyDate.getMonth() === today.getMonth() &&
    storyDate.getDate() === today.getDate()
  );
}

export async function searchHN(word: string): Promise<MatchedStory[]> {
  const query = encodeURIComponent(word);
  const searchUrl = `https://hn.algolia.com/api/v1/search?query=${query}&tags=story&hitsPerPage=200`;

  interface AlgoliaHit {
    objectID: string;
    title: string;
    url: string;
    author: string;
    created_at_i: number;
    points: number;
  }

  interface AlgoliaResponse {
    hits: AlgoliaHit[];
  }

  const result = await fetchJSON<AlgoliaResponse>(searchUrl);

  return result.hits
    .filter((hit) => isFromToday(hit.created_at_i))
    .map((hit) => ({
      id: parseInt(hit.objectID, 10),
      title: hit.title,
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      by: hit.author,
      time: hit.created_at_i,
      score: hit.points,
    }));
}
