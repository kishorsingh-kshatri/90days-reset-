const STORAGE_KEY = "designReviewItems";
const itemForm = document.getElementById("itemForm");
const descriptionInput = document.getElementById("description");
const ownerInput = document.getElementById("owner");
const priorityInput = document.getElementById("priority");
const statusFilter = document.getElementById("statusFilter");
const itemsList = document.getElementById("itemsList");
const itemTemplate = document.getElementById("itemTemplate");

let items = [];

function loadItems() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    items = stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load items", error);
    items = [];
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getNextStatus(currentStatus) {
  const states = ["Open", "In Progress", "Done"];
  const nextIndex = (states.indexOf(currentStatus) + 1) % states.length;
  return states[nextIndex];
}

function formatPriority(priority) {
  if (priority === "High") return "🔥 High";
  if (priority === "Medium") return "⚠️ Medium";
  return "🟢 Low";
}

function createListItem(item) {
  const fragment = itemTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".item-card");
  const description = fragment.querySelector(".item-description");
  const owner = fragment.querySelector(".item-owner");
  const priority = fragment.querySelector(".item-priority");
  const status = fragment.querySelector(".item-status");
  const statusButton = fragment.querySelector(".status-button");
  const deleteButton = fragment.querySelector(".delete-button");

  description.textContent = item.description;
  owner.textContent = `Owner: ${item.owner || "Unassigned"}`;
  priority.textContent = formatPriority(item.priority);
  status.textContent = `Status: ${item.status}`;

  card.dataset.id = item.id;

  statusButton.addEventListener("click", () => {
    item.status = getNextStatus(item.status);
    saveItems();
    renderItems();
  });

  deleteButton.addEventListener("click", () => {
    items = items.filter((current) => current.id !== item.id);
    saveItems();
    renderItems();
  });

  return fragment;
}

function renderItems() {
  const filter = statusFilter.value;
  itemsList.innerHTML = "";

  const filtered = items.filter((item) => filter === "All" || item.status === filter);
  if (filtered.length === 0) {
    itemsList.innerHTML = `<p class="empty-state">No review items yet. Add one to get started.</p>`;
    return;
  }

  filtered.forEach((item) => itemsList.appendChild(createListItem(item)));
}

function addItem(event) {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const owner = ownerInput.value.trim();
  const priority = priorityInput.value;

  if (!description) {
    descriptionInput.focus();
    return;
  }

  items.unshift({
    id: crypto.randomUUID(),
    description,
    owner,
    priority,
    status: "Open",
    createdAt: new Date().toISOString(),
  });

  saveItems();
  itemForm.reset();
  renderItems();
}

itemForm.addEventListener("submit", addItem);
statusFilter.addEventListener("change", renderItems);

loadItems();
renderItems();
