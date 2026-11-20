# How Cogvivo is built

Cogvivo is one web app that works in the browser and installs like a normal app. This page explains the building blocks. The source code itself is private.

**[▶ Try it at cogvivo.com](https://cogvivo.com)**

## The pieces

| Part | What it does | Built with |
|---|---|---|
| **Website and app** | Every page, in 24 languages, rendered close to the visitor | [SvelteKit](https://svelte.dev) and Svelte 5 on [Cloudflare Workers](https://workers.cloudflare.com) |
| **Photos and videos** | Uploads go to storage and are only shown after a check | Cloudflare R2 |
| **Accounts and data** | Profiles, posts, stars, badges, places, duels and chats | [Supabase](https://supabase.com) (PostgreSQL with row-level security on every table) |
| **Background jobs** | Checking uploads, notifications, keeping scores up to date | Supabase Edge Functions and pg_cron |
| **Sign in** | Google, Microsoft, or an email with a link and a code, with a bot check | Supabase Auth and Cloudflare Turnstile |
| **Safety** | Every photo, video and text is checked before others see it, and anyone can report a post | Automatic moderation plus community reports |
| **Languages** | 24 languages, picked from your browser, with right-to-left support for Arabic; your browser only loads the texts of your own language | [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) |
| **App install** | Installable straight from the browser, with its own icon and no address bar | Progressive Web App |
| **Buddy on your computer** | Your buddy walks across your desktop and taskbar, the same one as on the site | Desktop app for Windows (Microsoft Store) and Linux (Snap, AppImage, apt, dnf and pacman), see [cogvivo.com/pc](https://cogvivo.com/pc) |
| **Places** | Monuments and famous places around the world | [Wikidata](https://www.wikidata.org) and open heritage registers |
| **Neighborhood** | Alerts from your own neighborhood, plus outages that neighbors report themselves | Official weather, police, earthquake and news sources such as MeteoAlarm, NWS, USGS and GDELT |

## Principles

- **Fast on cheap phones.** The feed loads in about 145 KB, and pages are cached at the edge.
- **Safe by default.** The database decides who may see what, not the app. Nothing anyone uploads is public before it is checked.
- **Everyone, everywhere.** Age rules follow each country's law. Younger players get a protected mode.

## Want to help?

See the [README](README.md#help-make-cogvivo). Translations are the easiest place to start.

---

© 2026 Tim Wijnands. See [LICENSE](LICENSE).
