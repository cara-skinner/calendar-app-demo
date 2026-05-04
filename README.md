# Calendar App

A simple, responsive calendar app built with vanilla HTML, CSS, and JavaScript — no frameworks or build tools required.

## Features

- **Month view** — Navigate forward and back through months with a 7-column grid
- **Add events** — Click any day cell to open the add-event modal
- **Edit events** — Click an existing event to edit its details
- **Delete events** — Remove events from within the edit modal
- **Multi-day events** — Set a start and end date; the event spans continuously across all days in the range
- **Color coding** — Choose from 5 preset colors per event (Indigo, Rose, Emerald, Amber, Violet)
- **LocalStorage persistence** — Events are saved in the browser and survive page reloads
- **Responsive** — Works on mobile (375px) and desktop (900px+)
- **Accessible** — Keyboard navigation, focus management, and ARIA attributes

## Getting Started

No install or build step needed. Just open `index.html` directly in a browser:

```
open index.html
```

Or serve it locally with any static file server:

```
npx serve .
```

## Usage

| Action | How |
|---|---|
| Add event | Click any day cell |
| Edit event | Click an event chip or bar |
| Delete event | Open an event → click Delete |
| Navigate months | Click `‹` / `›` buttons |
| Close modal | Click ✕, press Escape, or click outside the modal |

## Event Fields

| Field | Required |
|---|---|
| Title | Yes |
| Start Date | Yes |
| End Date | Yes |
| Start Time | No |
| End Time | No |
| Description | No |
| Color | No (defaults to Indigo) |

## File Structure

```
calendar-app-demo/
  index.html       — App structure and modal markup
  styles.css       — Layout, grid, modal, and responsive styles
  app.js           — Calendar logic, event management, localStorage
  tasks/todo.md    — Implementation checklist
```

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Requires `crypto.randomUUID()` support for event IDs; falls back to `Date.now()` on older browsers.
