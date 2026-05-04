# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

No build step. Open `index.html` directly in a browser, or serve locally:

```
npx serve .
```

## Workflow

1. Write a plan as a checklist in `tasks/todo.md`
2. Check in with the user before starting work
3. Complete todos one by one, marking each off as you go
4. Explain what you changed at each step
5. Keep every change simple and minimal
6. Add a review section to `tasks/todo.md` summarising changes at the end

## Architecture

Single-page app with no framework, no build tools, three files:

- `index.html` — static shell; all DOM structure including the modal is declared here and toggled via the `.hidden` CSS class
- `styles.css` — CSS custom properties on `:root` define the design system (`--color-primary`, `--color-bg`, `--color-surface`, etc.); the calendar grid is `display: grid; grid-template-columns: repeat(7, 1fr)`
- `app.js` — all logic; a single `state` object drives the UI via plain functions

### State and data flow

```js
state = { currentYear, currentMonth, events: [], editingId: null }
```

All mutations go through `saveEvents()` → `renderCalendar()` → `closeModal()` in that order. Never mutate `state.events` without calling `saveEvents()` immediately after.

`renderCalendar()` wipes and rebuilds the entire grid on every call. It calls `renderMultiDayEvents(cells)` at the end, which uses `requestAnimationFrame` + `getBoundingClientRect()` to position spanning bars as an absolutely positioned layer over the grid.

### Event data model

```js
{
  id: string,          // crypto.randomUUID()
  title: string,       // required
  startDate: string,   // "YYYY-MM-DD", required
  endDate: string,     // "YYYY-MM-DD", required; equals startDate for single-day events
  startTime: string,   // "HH:MM" 24-hour, optional
  endTime: string,     // "HH:MM" 24-hour, optional
  description: string, // optional
  color: string,       // hex color, optional
}
```

Dates are always stored as `YYYY-MM-DD` strings — never `Date` objects — to avoid timezone drift on serialisation. Persisted under `localStorage["calendarEvents"]` as a JSON array.

### Multi-day event rendering

Single-day events render as chips inside their day cell. Multi-day events (`startDate !== endDate`) are rendered as horizontal bars in `renderMultiDayEvents()`. The bars are absolutely positioned inside `.multi-day-events-layer` using real cell coordinates from `getBoundingClientRect()`. Events that span multiple week rows are split into one bar segment per row.
