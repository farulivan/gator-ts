# gator-ts

A TypeScript CLI RSS aggregator backed by PostgreSQL.

`gator-ts` lets you:
- register/login users,
- add RSS feeds,
- follow/unfollow feeds,
- aggregate feed items into a local database,
- browse recent posts from followed feeds.

## Requirements

Before running the CLI, make sure you have:
- Node.js 18+ (Node 20+ recommended)
- npm
- PostgreSQL (running locally or remotely)

## Installation

```bash
npm install
```

## Configuration

The CLI reads config from:

- `~/.gatorconfig.json`

Create this file before running commands.

Example:

```json
{
  "db_url": "postgres://postgres:postgres@localhost:5432/gator_ts",
  "current_user_name": "placeholder"
}
```

### Config fields

- `db_url`: PostgreSQL connection string used by both the app and Drizzle migrations.
- `current_user_name`: active user in the CLI context.
  - You can set any placeholder initially.
  - It will be updated automatically by `register` and `login` commands.

## Database setup

1. Create the database in PostgreSQL (example name: `gator_ts`).
2. Run migrations:

```bash
npm run migrate
```

If you change schema later, generate a migration with:

```bash
npm run generate
```

## Running the CLI

Use:

```bash
npm run start -- <command> [args...]
```

If no command is provided, the CLI shows:

```text
usage: cli <command> [args...]
```

## Common command flow

A practical first-time flow:

```bash
# Register and set current user
npm run start -- register alice

# Add a feed (also auto-follows it)
npm run start -- addfeed "Hacker News" "https://hnrss.org/frontpage"

# See available feeds
npm run start -- feeds

# Start aggregator loop (Ctrl+C to stop)
npm run start -- agg 30s

# Browse latest posts from followed feeds
npm run start -- browse 10
```

## Command reference

### User commands

- `register <name>`: create user and set as current user.
- `login <name>`: switch current user.
- `users`: list users (`(current)` is marked).
- `reset`: delete all users (and related rows via cascade).

### Feed commands

- `addfeed <feed_name> <url>`: create a feed owned by current user and auto-follow it.
- `feeds`: list all feeds.
- `follow <feed_url>`: follow an existing feed.
- `following`: list feeds followed by current user.
- `unfollow <feed_url>`: unfollow a feed.

### Aggregation & reading

- `agg <time_between_reqs>`: continuously fetch next feed and store posts.
  - Duration format: `<number><unit>`
  - Units: `ms`, `s`, `m`, `h`
  - Examples: `500ms`, `10s`, `2m`, `1h`
- `browse [limit]`: show latest posts for current user (default: `2`).

## Notes

- Commands that require authentication (`addfeed`, `follow`, `following`, `unfollow`, `browse`) depend on `current_user_name` being valid.
- Aggregation is a long-running loop; stop with `Ctrl+C`.
- Post URLs are deduplicated in the database (`on conflict do nothing`).

## Troubleshooting

- `db_url is required in config file`
  - Check `~/.gatorconfig.json` exists and includes a valid `db_url` string.
- `current_user_name is required in config file`
  - Add `current_user_name` to config (any initial value is fine).
- `User <name> not found`
  - Run `npm run start -- register <name>` (or `login` with an existing user).
- Migration/connection errors
  - Verify PostgreSQL is running and `db_url` points to a reachable database.
