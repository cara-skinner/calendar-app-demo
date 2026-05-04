const state = {
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  events: [],
  editingId: null,
};

function loadEvents() {
  try {
    const stored = localStorage.getItem("calendarEvents");
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Error loading events:", e);
    return [];
  }
}

function saveEvents() {
  try {
    localStorage.setItem("calendarEvents", JSON.stringify(state.events));
  } catch (e) {
    console.error("Error saving events:", e);
  }
}

function buildDateString(year, month, day) {
  const y = year.toString().padStart(4, "0");
  const m = (month + 1).toString().padStart(2, "0");
  const d = day.toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateHeading() {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `${months[state.currentMonth]} ${state.currentYear}`;
}

function getEventsForDate(dateStr) {
  return state.events
    .filter(event => {
      const eventStart = event.startDate || event.date;
      const eventEnd = event.endDate || event.date;
      return dateStr >= eventStart && dateStr <= eventEnd;
    })
    .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
}

function renderCalendar() {
  const heading = document.getElementById("month-heading");
  const grid = document.getElementById("calendar-grid");

  heading.textContent = formatDateHeading();
  grid.innerHTML = "";

  const dowLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  dowLabels.forEach(label => {
    const header = document.createElement("div");
    header.className = "dow-header";
    header.textContent = label;
    grid.appendChild(header);
  });

  const firstDay = new Date(state.currentYear, state.currentMonth, 1).getDay();
  const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement("div");
    blank.className = "day-cell other-month";
    grid.appendChild(blank);
  }

  const today = new Date();
  const todayStr = buildDateString(today.getFullYear(), today.getMonth(), today.getDate());

  const cells = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = buildDateString(state.currentYear, state.currentMonth, day);
    const cell = document.createElement("div");
    cell.className = "day-cell";
    if (dateStr === todayStr) cell.classList.add("today");

    const dayNum = document.createElement("div");
    dayNum.className = "day-number";
    dayNum.textContent = day;
    cell.appendChild(dayNum);

    const events = getEventsForDate(dateStr);
    events.forEach(event => {
      if (event.startDate === event.endDate) {
        const chip = document.createElement("div");
        chip.className = "event-chip";
        chip.textContent = event.title;
        chip.style.backgroundColor = event.color || "#4f46e5";
        chip.addEventListener("click", (e) => {
          e.stopPropagation();
          openModal(dateStr, event.id);
        });
        cell.appendChild(chip);
      }
    });

    cell.addEventListener("click", () => openModal(dateStr));
    grid.appendChild(cell);
    const gridIndex = firstDay + day - 1;
    cells.push({ element: cell, dateStr, gridIndex });
  }

  const totalCells = firstDay + daysInMonth;
  const trailingBlanks = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 0; i < trailingBlanks; i++) {
    const blank = document.createElement("div");
    blank.className = "day-cell other-month";
    grid.appendChild(blank);
  }

  renderMultiDayEvents(cells);
}

function renderMultiDayEvents(cells) {
  const multiDayEvents = state.events.filter(event => event.startDate !== event.endDate);
  if (multiDayEvents.length === 0) return;

  const gridElement = document.getElementById("calendar-grid");
  const layer = document.createElement("div");
  layer.className = "multi-day-events-layer";
  gridElement.appendChild(layer);

  // Wait for layout so getBoundingClientRect() returns real positions
  requestAnimationFrame(() => {
    const gridRect = gridElement.getBoundingClientRect();
    // Track stacking slot per week row independently
    const stackByWeekRow = {};

    multiDayEvents.forEach(event => {
      const startCell = cells.find(c => c.dateStr === event.startDate);
      const endCell = cells.find(c => c.dateStr === event.endDate);
      if (!startCell || !endCell) return;

      const startWeekRow = Math.floor(startCell.gridIndex / 7);
      const endWeekRow = Math.floor(endCell.gridIndex / 7);

      // Render one bar segment per week row the event spans
      for (let weekRow = startWeekRow; weekRow <= endWeekRow; weekRow++) {
        const segStartCell = weekRow === startWeekRow
          ? startCell
          : cells.find(c => c.gridIndex === weekRow * 7);

        const segEndCell = weekRow === endWeekRow
          ? endCell
          : cells.find(c => c.gridIndex === weekRow * 7 + 6);

        if (!segStartCell || !segEndCell) continue;

        if (stackByWeekRow[weekRow] === undefined) stackByWeekRow[weekRow] = 0;
        const stackIdx = stackByWeekRow[weekRow]++;

        const startRect = segStartCell.element.getBoundingClientRect();
        const endRect = segEndCell.element.getBoundingClientRect();

        const bar = document.createElement("div");
        bar.className = "multi-day-event-bar";
        bar.textContent = weekRow === startWeekRow ? event.title : " ";
        bar.style.backgroundColor = event.color || "#4f46e5";
        bar.style.top = `${startRect.top - gridRect.top + 26 + stackIdx * 22}px`;
        bar.style.left = `${startRect.left - gridRect.left}px`;
        bar.style.width = `${endRect.right - startRect.left}px`;

        if (weekRow === startWeekRow && weekRow === endWeekRow) {
          bar.style.borderRadius = "3px";
        } else if (weekRow === startWeekRow) {
          bar.style.borderRadius = "3px 0 0 3px";
        } else if (weekRow === endWeekRow) {
          bar.style.borderRadius = "0 3px 3px 0";
        } else {
          bar.style.borderRadius = "0";
        }

        bar.addEventListener("click", (e) => {
          e.stopPropagation();
          openModal(event.startDate, event.id);
        });

        layer.appendChild(bar);
      }
    });
  });
}

function validateForm(data) {
  const errors = {};
  if (!data.title || data.title.trim() === "") {
    errors.title = "Title is required";
  }
  if (!data.startDate || !/^\d{4}-\d{2}-\d{2}$/.test(data.startDate)) {
    errors.startDate = "Valid start date is required";
  }
  if (!data.endDate || !/^\d{4}-\d{2}-\d{2}$/.test(data.endDate)) {
    errors.endDate = "Valid end date is required";
  }
  if (data.startDate && data.endDate && data.startDate > data.endDate) {
    errors.endDate = "End date must be after or equal to start date";
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

function clearFormErrors() {
  const errorsDiv = document.getElementById("form-errors");
  errorsDiv.innerHTML = "";
}

function showFormErrors(errors) {
  const errorsDiv = document.getElementById("form-errors");
  errorsDiv.innerHTML = "";
  Object.values(errors).forEach(message => {
    const errorEl = document.createElement("div");
    errorEl.className = "form-error-message";
    errorEl.textContent = message;
    errorsDiv.appendChild(errorEl);
  });
}

function openModal(dateStr, eventId = null) {
  state.editingId = eventId || null;
  const form = document.getElementById("event-form");
  form.reset();
  clearFormErrors();

  document.getElementById("field-start-date").value = dateStr;
  document.getElementById("field-end-date").value = dateStr;

  const modal = document.getElementById("modal-overlay");
  const titleEl = document.getElementById("modal-title");
  const deleteBtn = document.getElementById("delete-btn");

  if (eventId) {
    const event = state.events.find(e => e.id === eventId);
    if (event) {
      document.getElementById("field-title").value = event.title;
      document.getElementById("field-start-date").value = event.startDate || event.date || dateStr;
      document.getElementById("field-start-time").value = event.startTime || "";
      document.getElementById("field-end-date").value = event.endDate || event.date || dateStr;
      document.getElementById("field-end-time").value = event.endTime || "";
      document.getElementById("field-desc").value = event.description || "";
      document.getElementById("field-color").value = event.color || "#4f46e5";
      titleEl.textContent = "Edit Event";
      deleteBtn.classList.remove("hidden");
    }
  } else {
    titleEl.textContent = "Add Event";
    deleteBtn.classList.add("hidden");
  }

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.getElementById("field-title").focus();
}

function closeModal() {
  const modal = document.getElementById("modal-overlay");
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  state.editingId = null;
  clearFormErrors();
}

function saveEvent(e) {
  e.preventDefault();

  const formData = {
    title: document.getElementById("field-title").value.trim(),
    startDate: document.getElementById("field-start-date").value,
    startTime: document.getElementById("field-start-time").value,
    endDate: document.getElementById("field-end-date").value,
    endTime: document.getElementById("field-end-time").value,
    description: document.getElementById("field-desc").value.trim(),
    color: document.getElementById("field-color").value,
  };

  const validation = validateForm(formData);
  if (!validation.valid) {
    showFormErrors(validation.errors);
    return;
  }

  if (state.editingId) {
    const index = state.events.findIndex(e => e.id === state.editingId);
    if (index !== -1) {
      state.events[index] = { ...state.events[index], ...formData };
    }
  } else {
    state.events.push({
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      ...formData,
    });
  }

  saveEvents();
  renderCalendar();
  closeModal();
}

function deleteEvent() {
  if (!state.editingId) return;
  if (!window.confirm("Delete this event?")) return;

  state.events = state.events.filter(e => e.id !== state.editingId);
  saveEvents();
  renderCalendar();
  closeModal();
}

function navigateMonth(delta) {
  state.currentMonth += delta;
  if (state.currentMonth > 11) {
    state.currentMonth = 0;
    state.currentYear++;
  }
  if (state.currentMonth < 0) {
    state.currentMonth = 11;
    state.currentYear--;
  }
  renderCalendar();
}

function initApp() {
  state.events = loadEvents();

  const today = new Date();
  state.currentYear = today.getFullYear();
  state.currentMonth = today.getMonth();

  document.getElementById("prev-btn").addEventListener("click", () => navigateMonth(-1));
  document.getElementById("next-btn").addEventListener("click", () => navigateMonth(1));

  document.getElementById("event-form").addEventListener("submit", saveEvent);
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("delete-btn").addEventListener("click", deleteEvent);

  const overlay = document.getElementById("modal-overlay");
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.classList.contains("hidden")) {
      closeModal();
    }
  });

  renderCalendar();
}

document.addEventListener("DOMContentLoaded", initApp);
