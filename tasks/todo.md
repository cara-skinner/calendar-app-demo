# Calendar App — Implementation Checklist

## Task 1 — HTML skeleton (`index.html`)
- [x] Create HTML5 boilerplate with viewport meta, link to `styles.css`, deferred `app.js`
- [x] Add `#app` root → `#calendar-header` (prev button, `#month-heading` h1, next button)
- [x] Add `#calendar-grid` placeholder
- [x] Add `#modal-overlay.hidden` → `#modal` → form with: title, date, startTime, endTime, description, color select, Save/Delete buttons
- **Acceptance:**
  - ✓ Page loads with no console errors
  - ✓ Modal overlay not visible on load
  - ✓ All required IDs present in DOM (verify in DevTools)

## Task 2 — CSS reset and layout foundations (`styles.css`)
- [x] Add CSS reset: `box-sizing: border-box`, margin/padding zero
- [x] Define CSS custom properties: `--color-primary`, `--color-bg`, `--color-surface`, `--color-border`, `--color-text`, `--color-text-muted`, `--radius`, `--shadow`
- [x] Style `body`: system font, background, text color
- [x] Style `#app`: `max-width: 900px`, centered, padded
- [x] Style `#calendar-header`: flex row, space-between alignment
- **Acceptance:**
  - ✓ Background color visible
  - ✓ System font applied
  - ✓ No horizontal scrollbar at 900px viewport

## Task 3 — Calendar grid CSS (`styles.css`)
- [x] Add `#calendar-grid`: `display: grid; grid-template-columns: repeat(7, 1fr)`
- [x] Style `.dow-header`: centered, muted color, small font, bottom border
- [x] Style `.day-cell`: `min-height: 80px`, border, background, relative positioning, pointer cursor, hover state
- [x] Add `.day-cell.other-month`: muted/greyed styling
- [x] Add `.day-cell.today`: accent-colored day-number circle
- [x] Style `.event-chip`: truncated text with ellipsis, rounded, colored, pointer cursor
- [x] Add responsive breakpoint at `max-width: 600px`: reduce cell height to 48px
- **Acceptance:**
  - ✓ 7 equal columns visible at desktop width
  - ✓ Today's cell visually distinct
  - ✓ Event chips truncate instead of overflow
  - ✓ No horizontal scroll at 375px viewport

## Task 4 — Modal CSS (`styles.css`)
- [x] Style `#modal-overlay`: fixed overlay, `inset: 0`, flex center, z-index 100
- [x] Add `#modal-overlay.hidden`: `display: none`
- [x] Style `#modal`: surface background, radius, padding, `width: min(480px, 90vw)`, shadow
- [x] Style form elements: stack vertically, full-width, focus rings with `--color-primary`
- [x] Add `.hidden` utility: `display: none !important`
- [x] Style buttons: Save (primary filled), Delete (danger red)
- [x] Add `.field-error`: red small text for validation messages
- **Acceptance:**
  - ✓ Overlay hidden on page load
  - ✓ Modal opens/closes via `.hidden` toggle
  - ✓ Form fields tappable on 375px viewport
  - ✓ Save and Delete buttons visually distinct

## Task 5 — JS: state, loadEvents, saveEvents, initApp (`app.js`)
- [x] Create `state` object with `currentYear`, `currentMonth`, `events: []`, `editingId: null`
- [x] Write `loadEvents()`: parse localStorage with try/catch, fallback to `[]`
- [x] Write `saveEvents()`: JSON.stringify `state.events` to localStorage
- [x] Write `initApp()`: load events, set today's month/year, wire event listeners, render calendar
- [x] Add `document.addEventListener("DOMContentLoaded", initApp)`
- **Acceptance:**
  - ✓ `state.currentMonth/Year` match today on load
  - ✓ `loadEvents()` returns `[]` when localStorage empty
  - ✓ `saveEvents()` writes valid JSON (verify in DevTools Application tab)
  - ✓ No console errors on page load

## Task 6 — JS: renderCalendar (`app.js`)
- [x] Write `renderCalendar()`: update heading, clear grid, render DOW headers
- [x] Compute month's first day of week and days in month
- [x] Render leading blank cells (`.day-cell.other-month`)
- [x] Render day cells with `.day-number`, add `.today` class if matching today
- [x] Append `.event-chip` elements per `getEventsForDate()` results
- [x] Wire cell click → `openModal(dateStr)`, chip click → `openModal(dateStr, eventId)` (with `stopPropagation`)
- [x] Render trailing blank cells to complete grid
- [x] Write helper functions: `formatDateHeading()`, `buildDateString()`, `getEventsForDate()`
- **Acceptance:**
  - ✓ Correct day count for current month (28–31)
  - ✓ May 1, 2026 lands on Friday (column 5)
  - ✓ Today's cell highlighted
  - ✓ Clicking a cell doesn't throw errors

## Task 7 — JS: navigateMonth (`app.js`)
- [x] Write `navigateMonth(delta)`: increment month, handle year rollover (11→0, 0→11)
- [x] Wire `#prev-btn` → `navigateMonth(-1)`, `#next-btn` → `navigateMonth(1)` in `initApp()`
- [x] Call `renderCalendar()` after navigation
- **Acceptance:**
  - ✓ Dec 2025 → Next → Jan 2026
  - ✓ Jan 2026 → Prev → Dec 2025
  - ✓ Rapid clicking (5 next + 5 prev) returns to start month

## Task 8 — JS: openModal, closeModal, validation (`app.js`)
- [x] Write `openModal(dateStr, eventId)`: set `state.editingId`, reset form, pre-fill date
- [x] If editing: pre-fill all fields, show Delete button, set title "Edit Event"
- [x] If new: hide Delete button, set title "Add Event"
- [x] Show modal (`remove .hidden`), focus `#field-title`
- [x] Write `closeModal()`: hide modal, reset `state.editingId`, clear validation errors
- [x] Write `validateForm(data)`: check title non-empty, date valid YYYY-MM-DD
- [x] Wire close button, backdrop click (`e.target === overlay`), Escape key to `closeModal()`
- **Acceptance:**
  - ✓ Click day cell → modal opens with date pre-filled
  - ✓ Click event chip → modal opens with all fields pre-filled
  - ✓ X/Escape/backdrop closes modal
  - ✓ No stale form data when reopening a different cell
  - ✓ Delete button hidden for new, visible for editing

## Task 9 — JS: saveEvent (`app.js`)
- [x] Write `saveEvent()`: form submit handler with `e.preventDefault()`
- [x] Collect form values, run `validateForm()`
- [x] If invalid: show inline error messages, return early (keep modal open)
- [x] If editing: find and update event in-place in `state.events`
- [x] If new: push new Event object with `id: crypto.randomUUID()` (fallback: `Date.now().toString()`)
- [x] Call `saveEvents()`, `renderCalendar()`, `closeModal()`
- [x] Wire `#event-form` submit → `saveEvent()` in `initApp()`
- **Acceptance:**
  - ✓ New event appears as chip on correct day
  - ✓ Chip displays event title (truncated if long)
  - ✓ Edit updates chip in place
  - ✓ Empty title shows validation error without closing modal
  - ✓ Event persists after page reload

## Task 10 — JS: deleteEvent (`app.js`)
- [x] Write `deleteEvent()`: check `state.editingId`, confirm with `window.confirm()`
- [x] Filter event out of `state.events` by id
- [x] Call `saveEvents()`, `renderCalendar()`, `closeModal()`
- [x] Wire `#delete-btn` click → `deleteEvent()` in `initApp()`
- **Acceptance:**
  - ✓ Delete button click removes chip immediately
  - ✓ Deleted event doesn't reappear after page reload
  - ✓ Other events on same day unaffected
  - ✓ Delete button only accessible when editing (not disabled when adding)

## Task 11 — Responsive polish (`styles.css`, `app.js`)
- [x] Add CSS media query `max-width: 480px`: reduce `#app` padding to 0.5rem
- [x] Add `flex-wrap` to `#calendar-header` if needed
- [x] JS: in `renderCalendar()`, if a cell has >3 events, hide excess chips and append overflow badge (e.g. "+2 more")
- **Acceptance:**
  - ✓ Full 7-column grid visible at 375px with no horizontal scroll
  - ✓ Month heading readable at mobile width
  - ✓ 4+ events on one day don't break cell height
  - ✓ At least 1 event chip visible per cell on mobile

## Task 12 — Accessibility basics (`index.html`, `app.js`, `styles.css`)
- [x] Add `aria-label` to prev/next buttons ("Previous month", "Next month")
- [x] Add `role="dialog" aria-modal="true" aria-labelledby="modal-title"` to `#modal`
- [x] Toggle `aria-hidden` on `#modal-overlay` in `openModal()` / `closeModal()`
- [x] Implement focus trap inside modal: Tab/Shift+Tab cycle only through modal focusable elements
- [x] Ensure all `<input>` and `<textarea>` have associated `<label>` elements (use `for`/`id` pairing)
- [x] Add descriptive option text to color select ("Indigo", "Rose", "Emerald", etc. — not just hex codes)
- **Acceptance:**
  - ✓ Lighthouse accessibility audit scores 90+
  - ✓ Tab key stays inside open modal (doesn't escape to page)
  - ✓ Screen reader announces button labels
  - ✓ All form fields have visible labels

---

## Review (To Complete After All Tasks)

- [x] Verify all 12 tasks completed and tested
- [x] Run Lighthouse accessibility audit
- [x] Test month navigation (forward 12 months, back 12 months)
- [x] Test event CRUD cycle: add, edit, delete
- [x] Verify localStorage persistence (reload page, events remain)
- [x] Test responsive layout at 375px, 768px, 1200px viewports
- [x] Verify no console errors
- [x] Check for any broken links or missing assets

---

## Summary of Changes

**Files Created:**
1. `index.html` — HTML5 boilerplate with semantic calendar structure, modal form, and accessibility attributes
2. `styles.css` — Complete styling with CSS Grid layout, responsive breakpoints (600px, 480px), modal styling, and accessibility features
3. `app.js` — Full calendar app logic: state management, localStorage persistence, event CRUD operations, month navigation, form validation, keyboard shortcuts (Escape), and focus management
4. `tasks/todo.md` — Comprehensive checklist documenting all 12 implementation tasks with acceptance criteria

**Key Features Implemented:**
- ✓ Month view grid (7-column CSS Grid, proper day alignment)
- ✓ Month navigation (previous/next buttons with year rollover)
- ✓ Add events (click any day cell to open modal)
- ✓ Edit events (click event chip to pre-fill and update)
- ✓ Delete events (Delete button visible only when editing)
- ✓ localStorage persistence (JSON serialization, auto-load on page load)
- ✓ Form validation (required title and date, error messages in modal)
- ✓ Responsive UI (works at 375px mobile and 900px+ desktop)
- ✓ Event chip overflow handling (shows "+N more" if >3 events per day)
- ✓ Accessibility (aria-labels, focus management, keyboard navigation, descriptive color labels)
- ✓ Modal interactions (open/close via button, Escape key, backdrop click)

**Implementation Approach:**
- No frameworks, no build tools, no dependencies — pure vanilla HTML/CSS/JS
- Single `state` object with plain functions (no classes)
- Events stored as plain JSON objects with: id, title, date (YYYY-MM-DD), startTime, endTime, description, color
- Responsive design using CSS Grid and media queries
- Full keyboard accessibility with Escape key, focus management, and aria attributes
