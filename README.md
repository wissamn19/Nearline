# Nearline

**Type anything. Nearline files it.**
A quick-capture app that sorts what you type into tasks, notes and links, and reminds you when something is due.

![Nearline screenshot](cover/cover.png)

**Live demo:** https://wissamn19.github.io/nearline/

## What it does

- **One input, no menus.** Type and press Enter (or press `/` anywhere to jump to the bar).
- **Auto-sorting.** Plain text becomes a task, `!` starts a note, and links file themselves. A tag shows where the text will land before you press Enter.
- **Click a stop to choose.** Each stop on the road (Task, Note, Link) opens its own input, so you can override the sorting.
- **Reminders.** Add `@17:30` to any entry. At that time a card appears with **Done** and **Snooze 10 min**, plus a system notification if the tab is in the background.
- **Tasks you can finish.** Checkboxes, strikethrough, and a done/total count on the Task stop.
- **Your data stays with you.** Everything is saved in your browser (localStorage). No account, no server.
- **Roadmap layout.** A winding road connects the three stops, and new items drive along it to their stop.
- **Hand-drawn look** inspired by Excalidraw, with dark mode that follows your system.

## How the sorting works

| You type | It becomes |
| --- | --- |
| `buy milk` | Task |
| `!idea for the landing page` | Note |
| `https://github.com` or `www.example.com` | Link |
| `call mom @17:30` | Task with a reminder at 17:30 (tomorrow if that time has passed) |

The rules live in `classifyInput()` in `script.js`. Clicking a stop skips the rules and files the text there.

## Run it

No build step. Open `index.html` in a browser, or use the Live Server extension in VS Code.

To test a reminder, type something like `test @HH:MM` with a time a minute or two ahead, and keep the tab open. Allow notifications when the browser asks.

## Project structure

```
nearline/
├── index.html
├── style.css
├── script.js
└── docs/
    └── screenshot.png
```

## Limits

- Reminders only fire while the page is open. Reminders with the app closed need the desktop version (planned).
- Data lives in one browser on one device.

## Roadmap

- [x] Capture, auto-sort, and save locally
- [x] Task checkboxes and delete
- [x] Reminders with notifications
- [x] Roadmap-style layout with animated road
- [ ] "Move to..." action and an export of labeled data
- [ ] Train a small text classifier to separate tasks from notes
- [ ] Rebuild in React
- [ ] Desktop app with Tauri (floating always-on-top panel)

                                                     

## License
