const STORAGE_KEY = "daywiseWorkoutRoutine";
const routineForm = document.getElementById("routineForm");
const daySelect = document.getElementById("daySelect");
const exerciseInput = document.getElementById("exercise");
const setsInput = document.getElementById("sets");
const repsInput = document.getElementById("reps");
const weightInput = document.getElementById("weight");
const notesInput = document.getElementById("notes");
const clearDayButton = document.getElementById("clearDayButton");
const clearAllButton = document.getElementById("clearAllButton");
const dayTabs = document.getElementById("dayTabs");
const routineList = document.getElementById("routineList");
const selectedDayLabel = document.getElementById("selectedDayLabel");
const installButton = document.getElementById("installButton");
const routineTemplate = document.getElementById("routineTemplate");

let deferredPrompt = null;

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

let routines = [];
let selectedDay = new Date().toLocaleDateString(undefined, { weekday: "long" });
if (!DAYS.includes(selectedDay)) {
  selectedDay = "Monday";
}

function loadRoutines() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    routines = stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load routines", error);
    routines = [];
  }
}

function saveRoutines() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
}

function createRoutineCard(routine) {
  const fragment = routineTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".entry-card");
  const checkbox = fragment.querySelector(".task-checkbox");
  const title = fragment.querySelector(".task-title");
  const meta = fragment.querySelector(".task-meta");
  const notes = fragment.querySelector(".task-notes");
  const deleteButton = fragment.querySelector(".delete-button");

  title.textContent = routine.exercise;
  meta.textContent = `${routine.sets} sets × ${routine.reps} reps${routine.weight ? ` @ ${routine.weight} kg` : ""}`;
  notes.textContent = routine.notes ? routine.notes : "";
  checkbox.checked = routine.completed;

  if (routine.completed) {
    card.classList.add("task-completed");
  }

  checkbox.addEventListener("change", () => {
    routine.completed = checkbox.checked;
    saveRoutines();
    renderRoutine();
  });

  deleteButton.addEventListener("click", () => {
    routines = routines.filter((current) => current.id !== routine.id);
    saveRoutines();
    renderRoutine();
  });

  return fragment;
}

function renderDayTabs() {
  dayTabs.innerHTML = "";

  DAYS.forEach((day) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "day-tab";
    button.textContent = `${day} (${countDayRoutines(day)})`;
    if (day === selectedDay) {
      button.classList.add("active");
    }
    button.addEventListener("click", () => {
      selectedDay = day;
      daySelect.value = day;
      renderRoutine();
    });
    dayTabs.appendChild(button);
  });
}

function countDayRoutines(day) {
  return routines.filter((routine) => routine.day === day).length;
}

function renderRoutine() {
  selectedDayLabel.textContent = selectedDay;
  renderDayTabs();
  routineList.innerHTML = "";

  const dayRoutines = routines
    .filter((routine) => routine.day === selectedDay)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  if (dayRoutines.length === 0) {
    routineList.innerHTML = `<p class="empty-state">No exercises planned for ${selectedDay}. Add one to complete your routine.</p>`;
    return;
  }

  dayRoutines.forEach((routine) => routineList.appendChild(createRoutineCard(routine)));
}

function handleAddRoutine(event) {
  event.preventDefault();

  const day = daySelect.value;
  const exercise = exerciseInput.value.trim();
  const sets = Number(setsInput.value);
  const reps = Number(repsInput.value);
  const weight = Number(weightInput.value);
  const notes = notesInput.value.trim();

  if (!day || !exercise || sets < 1 || reps < 1) {
    return;
  }

  routines.unshift({
    id: crypto.randomUUID(),
    day,
    exercise,
    sets,
    reps,
    weight: weight > 0 ? weight : null,
    notes,
    completed: false,
    createdAt: new Date().toISOString(),
  });

  selectedDay = day;
  daySelect.value = day;
  saveRoutines();
  routineForm.reset();
  renderRoutine();
}

function handleClearDay() {
  if (!confirm(`Clear all routine items for ${selectedDay}?`)) {
    return;
  }

  routines = routines.filter((routine) => routine.day !== selectedDay);
  saveRoutines();
  renderRoutine();
}

function handleClearAll() {
  if (!confirm("Clear all routine items for the week?")) {
    return;
  }

  routines = [];
  saveRoutines();
  renderRoutine();
}

function handleInstallClick() {
  if (!deferredPrompt) {
    return;
  }

  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === "accepted") {
      console.log("PWA install accepted");
    }
    deferredPrompt = null;
    installButton.hidden = true;
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", handleInstallClick);
routineForm.addEventListener("submit", handleAddRoutine);
clearDayButton.addEventListener("click", handleClearDay);
clearAllButton.addEventListener("click", handleClearAll);

loadRoutines();
renderRoutine();
