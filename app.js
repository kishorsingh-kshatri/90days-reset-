const STORAGE_KEY = "health90DayTracker";
const startDateInput = document.getElementById("startDate");
const startButton = document.getElementById("startButton");
const selectedDayLabel = document.getElementById("selectedDayLabel");
const completedCount = document.getElementById("completedCount");
const progressMeter = document.getElementById("progressMeter");
const daysList = document.getElementById("daysList");
const stepsInput = document.getElementById("steps");
const waterInput = document.getElementById("water");
const sleepInput = document.getElementById("sleep");
const workoutInput = document.getElementById("workout");
const saveButton = document.getElementById("saveButton");
const weeklyRangeLabel = document.getElementById("weeklyRangeLabel");
const weeklySteps = document.getElementById("weeklySteps");
const weeklyWater = document.getElementById("weeklyWater");
const weeklySleep = document.getElementById("weeklySleep");
const weeklyWorkout = document.getElementById("weeklyWorkout");
const weeklyCompleted = document.getElementById("weeklyCompleted");
const overallSteps = document.getElementById("overallSteps");
const overallWater = document.getElementById("overallWater");
const overallSleep = document.getElementById("overallSleep");
const overallWorkout = document.getElementById("overallWorkout");
const overallCompleted = document.getElementById("overallCompleted");

let plan = null;
let selectedIndex = 0;

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function loadPlan() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    plan = stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to load plan", error);
    plan = null;
  }
}

function savePlan() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

function createDayData(startDate) {
  const start = new Date(startDate);
  return Array.from({ length: 90 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      id: index + 1,
      date: date.toISOString().slice(0, 10),
      label: `Day ${index + 1}`,
      steps: 0,
      water: 0,
      sleep: 0,
      workout: 0,
      completed: false,
    };
  });
}

function calculateCompleted(day) {
  const stepsGoal = day.steps >= 10000;
  const waterGoal = day.water >= 3;
  const sleepGoal = day.sleep >= 8;
  const workoutGoal = day.workout >= 30 && day.workout <= 60;
  return stepsGoal && waterGoal && sleepGoal && workoutGoal;
}

function updateSelectedState() {
  const day = plan.days[selectedIndex];
  selectedDayLabel.textContent = `${day.label} — ${day.date}`;
  stepsInput.value = day.steps || "";
  waterInput.value = day.water || "";
  sleepInput.value = day.sleep || "";
  workoutInput.value = day.workout || "";
}

function renderDays() {
  daysList.innerHTML = "";
  plan.days.forEach((day, index) => {
    const button = document.createElement("button");
    button.className = "day-item";
    if (index === selectedIndex) {
      button.classList.add("active");
    }
    button.innerHTML = `
      <h3>${day.label}</h3>
      <p>${day.date} · ${day.completed ? "Complete" : "Open"}</p>
    `;
    button.addEventListener("click", () => {
      selectedIndex = index;
      updateSelectedState();
      renderDays();
    });
    daysList.appendChild(button);
  });
}

function updateProgress() {
  const completedDays = plan.days.filter((day) => day.completed).length;
  completedCount.textContent = `${completedDays} / 90`;
  const percent = Math.round((completedDays / 90) * 100);
  progressMeter.style.width = `${percent}%`;
}

function renderSummaries() {
  if (!plan || !plan.days) return;

  // Weekly summary for the currently selected week
  const weekIndex = Math.floor(selectedIndex / 7);
  const weekStart = weekIndex * 7;
  const weekDays = plan.days.slice(weekStart, weekStart + 7);

  const wkTotals = weekDays.reduce(
    (acc, d) => {
      acc.steps += Number(d.steps || 0);
      acc.water += Number(d.water || 0);
      acc.sleep += Number(d.sleep || 0);
      acc.workout += Number(d.workout || 0);
      acc.completed += d.completed ? 1 : 0;
      return acc;
    },
    { steps: 0, water: 0, sleep: 0, workout: 0, completed: 0 }
  );

  weeklyRangeLabel.textContent = `${plan.days[weekStart].date} → ${plan.days[Math.min(weekStart + 6, plan.days.length - 1)].date}`;
  weeklySteps.textContent = wkTotals.steps;
  weeklyWater.textContent = wkTotals.water.toFixed(1);
  weeklySleep.textContent = wkTotals.sleep.toFixed(1);
  weeklyWorkout.textContent = Math.round(wkTotals.workout / weekDays.length);
  weeklyCompleted.textContent = `${wkTotals.completed} / ${weekDays.length}`;

  // Overall summary
  const allTotals = plan.days.reduce(
    (acc, d) => {
      acc.steps += Number(d.steps || 0);
      acc.water += Number(d.water || 0);
      acc.sleep += Number(d.sleep || 0);
      acc.workout += Number(d.workout || 0);
      acc.completed += d.completed ? 1 : 0;
      return acc;
    },
    { steps: 0, water: 0, sleep: 0, workout: 0, completed: 0 }
  );

  const daysCount = plan.days.length || 90;
  overallSteps.textContent = Math.round(allTotals.steps / daysCount);
  overallWater.textContent = (allTotals.water / daysCount).toFixed(1);
  overallSleep.textContent = (allTotals.sleep / daysCount).toFixed(1);
  overallWorkout.textContent = Math.round(allTotals.workout / daysCount);
  overallCompleted.textContent = `${allTotals.completed} / ${daysCount}`;
}

function renderPlan() {
  if (!plan) {
    return;
  }
  if (selectedIndex >= plan.days.length) {
    selectedIndex = 0;
  }
  updateSelectedState();
  renderDays();
  updateProgress();
  renderSummaries();
}

function handleStartPlan() {
  const startDate = startDateInput.value || getTodayDate();
  const newPlan = {
    startDate,
    createdAt: new Date().toISOString(),
    days: createDayData(startDate),
  };
  plan = newPlan;
  selectedIndex = 0;
  savePlan();
  renderPlan();
}

function handleSaveDay() {
  const day = plan.days[selectedIndex];
  day.steps = Number(stepsInput.value) || 0;
  day.water = Number(waterInput.value) || 0;
  day.sleep = Number(sleepInput.value) || 0;
  day.workout = Number(workoutInput.value) || 0;
  day.completed = calculateCompleted(day);
  savePlan();
  renderPlan();
}

startDateInput.value = getTodayDate();
startButton.addEventListener("click", handleStartPlan);
saveButton.addEventListener("click", handleSaveDay);

loadPlan();
if (!plan) {
  plan = {
    startDate: getTodayDate(),
    createdAt: new Date().toISOString(),
    days: createDayData(getTodayDate()),
  };
  savePlan();
}
renderPlan();
