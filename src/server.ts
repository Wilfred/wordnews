import express from "express";
import { searchHN, MatchedStory } from "./hn";
import { searchReddit } from "./reddit";

const app = express();
const PORT = process.env.PORT || 3000;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderStory(s: MatchedStory): string {
  const time = new Date(s.time * 1000).toLocaleTimeString();
  return `
    <div class="story">
      <div class="story-title"><a href="${escapeHtml(s.url)}">${escapeHtml(s.title)}</a></div>
      <div class="story-meta">${s.score} points by ${escapeHtml(s.by)} at ${time} &middot;
        <a href="${escapeHtml(s.permalink)}">comments</a></div>
    </div>`;
}

function renderSection(title: string, stories: MatchedStory[], word: string, date: string): string {
  if (stories.length === 0) {
    return `<div class="section">
      <h2 class="section-title">${escapeHtml(title)}</h2>
      <div class="empty">No mentions of &ldquo;<strong>${escapeHtml(word)}</strong>&rdquo; found today (${date}).</div>
    </div>`;
  }
  return `<div class="section">
    <h2 class="section-title">${escapeHtml(title)}</h2>
    <p class="info">Found <strong>${stories.length}</strong> mentions:</p>
    ${stories.map(renderStory).join("")}
  </div>`;
}

function renderPage(word: string, results: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WordNews – Word Tracker</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f6f6ef; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #ff6600; margin-bottom: 4px; }
    .subtitle { color: #666; margin-bottom: 20px; }
    form { display: flex; gap: 8px; margin-bottom: 24px; }
    input { flex: 1; padding: 10px 14px; font-size: 16px; border: 2px solid #ddd; border-radius: 6px; }
    input:focus { outline: none; border-color: #ff6600; }
    button { padding: 10px 20px; font-size: 16px; background: #ff6600; color: white; border: none; border-radius: 6px; cursor: pointer; }
    button:hover { background: #e55d00; }
    .info { color: #666; margin-bottom: 12px; }
    .story { background: white; padding: 12px 16px; margin-bottom: 8px; border-radius: 6px; border-left: 3px solid #ff6600; }
    .story-title a { color: #333; text-decoration: none; font-weight: 500; }
    .story-title a:hover { color: #ff6600; }
    .story-meta { font-size: 13px; color: #888; margin-top: 4px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 18px; color: #555; border-bottom: 2px solid #ddd; padding-bottom: 6px; margin-bottom: 12px; }
    .empty { text-align: center; padding: 40px; color: #888; }
    .error { color: #d32f2f; padding: 12px; background: #ffeaea; border-radius: 6px; }
  </style>
</head>
<body>
  <h1>WordNews</h1>
  <p class="subtitle">Search today's Hacker News and Reddit posts for any word</p>
  <form method="get" action="/">
    <input type="text" name="word" placeholder="Enter a word (e.g. rust, ai, typescript)" value="${escapeHtml(word)}" />
    <button type="submit">Search</button>
  </form>
  ${results}
</body>
</html>`;
}

app.get("/", async (req, res) => {
  const word = typeof req.query.word === "string" ? req.query.word.trim() : "";

  if (!word) {
    res.send(renderPage("", ""));
    return;
  }

  try {
    const [hnStories, redditStories] = await Promise.all([
      searchHN(word),
      searchReddit(word),
    ]);
    const date = new Date().toISOString().slice(0, 10);
    const total = hnStories.length + redditStories.length;

    const summaryHtml = `<p class="info">Found <strong>${total}</strong> mentions of &ldquo;<strong>${escapeHtml(word)}</strong>&rdquo; today (${date}):</p>`;
    const hnHtml = renderSection("Hacker News", hnStories, word, date);
    const redditHtml = renderSection("Reddit", redditStories, word, date);

    res.send(renderPage(word, `${summaryHtml}${hnHtml}${redditHtml}`));
  } catch (err) {
    console.error("Search failed:", err);
    res.send(renderPage(word,
      `<div class="error">Failed to fetch results. Please try again.</div>`));
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
