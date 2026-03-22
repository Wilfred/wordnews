import express from "express";
import path from "path";
import { searchHN, MatchedStory } from "./hn";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/search", async (req, res) => {
  const word = req.query.word;
  if (typeof word !== "string" || word.trim().length === 0) {
    res.status(400).json({ error: "Missing ?word= parameter" });
    return;
  }

  try {
    const stories: MatchedStory[] = await searchHN(word.trim());
    res.json({ word: word.trim(), date: new Date().toISOString().slice(0, 10), count: stories.length, stories });
  } catch (err) {
    console.error("HN search failed:", err);
    res.status(500).json({ error: "Failed to fetch from Hacker News" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
