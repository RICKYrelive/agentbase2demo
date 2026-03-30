# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## Brave Search API

- **API Key:** $BRAVE_API_KEY (环境变量)
- **Endpoint:** https://api.search.brave.com/res/v1/web/search
- **Usage:** `curl -H "X-Subscription-Token: $KEY" "https://api.search.brave.com/res/v1/web/search?q=..."`

## Search Priority

1. **SearXNG（首选）** — `http://localhost:8080`，用 curl JSON API
2. **Brave Search API（备用）** — 当 SearXNG 不可用时使用
3. **web_fetch** — 给定具体 URL 时使用

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
