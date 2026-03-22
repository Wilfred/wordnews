# WordNews

A minimal TypeScript website that searches today's Hacker News stories for mentions of a specific word using the [HN Algolia API](https://hn.algolia.com/api).

## Prerequisites

- Node.js >= 18

## Setup

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start the server
npm start
```

The server runs at `http://localhost:3000` by default. Set the `PORT` environment variable to change it.

## Usage

1. Open `http://localhost:3000` in your browser
2. Type a word (e.g. `rust`, `ai`, `typescript`) and click **Search**
3. See all Hacker News stories from today that mention that word

## API

```
GET /api/search?word=<term>
```

Returns JSON:

```json
{
  "word": "rust",
  "date": "2026-03-22",
  "count": 5,
  "stories": [
    {
      "id": 12345,
      "title": "Story title",
      "url": "https://example.com",
      "by": "author",
      "time": 1711100000,
      "score": 42
    }
  ]
}
```

## Development

```bash
# Watch mode (rebuild + restart on changes)
npm run dev

# Lint
npm run lint

# Lint with auto-fix
npm run lint:fix
```

## ESLint

The project uses ESLint with `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin` via the flat config format (`eslint.config.mjs`). Key rules:

- `@typescript-eslint/no-unused-vars` — warn
- `@typescript-eslint/explicit-function-return-type` — warn
- `@typescript-eslint/no-explicit-any` — warn

## Project Structure

```
wordnews/
├── src/
│   ├── server.ts    # Express server with /api/search endpoint
│   └── hn.ts        # Hacker News search module (Algolia API)
├── public/
│   └── index.html   # Frontend UI
├── eslint.config.mjs
├── tsconfig.json
└── package.json
```
