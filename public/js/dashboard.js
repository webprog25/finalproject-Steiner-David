import { initAuthUi, apiRequest, API_KEY } from "./auth-ui.js";
import "https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js";

let statusChart = null;

const modal = document.getElementById("edit-modal");
const form = document.getElementById("edit-form");
const cancelBtn = document.getElementById("edit-cancel");


function openEditModal(plant, onSave) {
  modal.hidden = false;
  form.nickname.value = plant.nickname;
  form.species.value = plant.species;
  form.frequencyDays.value = plant.frequencyDays;
  form.onsubmit = async (e) => {
    e.preventDefault();
    await onSave({
      nickname: form.nickname.value.trim(),
      species: form.species.value.trim(),
      frequencyDays: Number(form.frequencyDays.value)
    });
    closeEditModal();
  };
}

function closeEditModal() {
  modal.hidden = true;
}

cancelBtn.addEventListener("click", closeEditModal);
modal.querySelector(".modal-backdrop")
  .addEventListener("click", closeEditModal);

class PlantCard {
  constructor(plant) {
    this.plant = plant;
    this.element = this.render();
    this.attachHandlers();
  }

  getBadgeColor() {
    const ms = Date.now() - new Date(this.plant.lastWatered).getTime();
    const days = ms / (1000 * 60 * 60 * 24);
    if (days < this.plant.frequencyDays * 0.75) return "green";
    if (days < this.plant.frequencyDays) return "yellow";
    return "red";
  }

  render() {
    const article = document.createElement("article");
    article.className = "plant-card";

    const daysAgo = Math.round(
      (Date.now() - new Date(this.plant.lastWatered)) /
      (1000 * 60 * 60 * 24)
    );
    const color = this.getBadgeColor();

    const lastDate = new Date(this.plant.lastWatered).toLocaleDateString(
      undefined,
      { year: "numeric", month: "short", day: "numeric" }
    );

    const actionsTop = document.createElement("div");
    actionsTop.className = "card-actions-top";
    const editImg = document.createElement("img");
    editImg.src = "icons/edit.svg";
    editImg.className = "btn-edit";
    editImg.title = "Edit";
    const delImg = document.createElement("img");
    delImg.src = "icons/delete.svg";
    delImg.className = "btn-delete";
    delImg.title = "Delete";
    actionsTop.append(editImg, delImg);
    article.appendChild(actionsTop);

    // Plant image
    const plantImg = document.createElement("img");
    plantImg.src = this.plant.imageUrl;
    plantImg.alt = this.plant.nickname;
    article.appendChild(plantImg);

    // Card content
    const content = document.createElement("div");
    content.className = "card-content";
    const h2 = document.createElement("h2");
    h2.textContent = this.plant.nickname;
    const pSpecies = document.createElement("p");
    pSpecies.className = "species";
    pSpecies.textContent = `Species: ${this.plant.species}`;
    const pFreq = document.createElement("p");
    pFreq.className = "frequency";
    pFreq.textContent = `Watering Frequency: ${this.plant.frequencyDays} days`;
    const badge = document.createElement("span");
    badge.className = `badge ${color}`;
    badge.title = `Last watered: ${lastDate}`;
    badge.textContent = `${daysAgo} days since last watering`;
    content.append(h2, pSpecies, pFreq, badge);
    article.appendChild(content);

    // Bottom actions
    const actionsBottom = document.createElement("div");
    actionsBottom.className = "card-actions-bottom";
    const waterBtn = document.createElement("button");
    waterBtn.className = "btn-water";
    waterBtn.title = "Water now";
    const waterImg = document.createElement("img");
    waterImg.src = "icons/water.svg";
    waterImg.alt = "";
    waterBtn.append(waterImg, document.createTextNode(" Water now"));
    actionsBottom.appendChild(waterBtn);
    article.appendChild(actionsBottom);

    return article;
  }

  attachHandlers() {
    const btnWater = this.element.querySelector(".btn-water");
    const btnEdit = this.element.querySelector(".btn-edit");
    const btnDel = this.element.querySelector(".btn-delete");

    btnWater.addEventListener("click", () => this.handleWater(btnWater));
    btnEdit.addEventListener("click", () => this.handleEdit(btnEdit));
    btnDel.addEventListener("click", () => this.handleDelete());
  }

  async handleWater(button) {
    button.classList.add("pressed");
    const res = await apiRequest("PATCH", `/api/plants/${this.plant._id}`, { lastWatered: new Date() });
    if (!res.ok) {
      alert("You must be logged in to water plants.");
      button.classList.remove("pressed");
      return;
    }
    await reloadPlantsPreserveScroll();
    setTimeout(() => button.classList.remove("pressed"), 300);
  }

  handleEdit() {
    openEditModal(this.plant, async (updates) => {
      const res = await apiRequest("PATCH", `/api/plants/${this.plant._id}`, updates);
      if (!res.ok) {
        alert("You must be logged in to edit plants.");
        return;
      }

      await reloadPlantsPreserveScroll();
    });
  }

  async handleDelete() {
    if (!confirm(`Do you really want to delete "${this.plant.nickname}"?`)) return;

    const res = await apiRequest("DELETE", `/api/plants/${this.plant._id}`);
    if (!res.ok) {
      alert("You must be logged in to delete plants.");
      return;
    }
    await reloadPlantsPreserveScroll();
  }

  refresh() {
    const newEl = this.render();
    this.element.replaceWith(newEl);
    this.element = newEl;
    this.attachHandlers();
  }
}

function plantStatus(plant) {
  const ms = Date.now() - new Date(plant.lastWatered).getTime();
  const days = ms / (1000 * 60 * 60 * 24);
  if (days < plant.frequencyDays * 0.75) return "green";
  if (days < plant.frequencyDays) return "yellow";
  return "red";
}

function renderStatusChart(plants) {
  const el = document.getElementById("statusChart");
  if (!el) return;

  const counts = { green: 0, yellow: 0, red: 0 };
  for (const p of plants) {
    counts[plantStatus(p)]++;
  }

  const total = counts.green + counts.yellow + counts.red;

  if (total === 0) {
    if (statusChart) { statusChart.destroy(); statusChart = null; }
    const box = document.getElementById("stats");
    if (box) box.querySelector("h3").textContent = "No plants yet";
    return;
  }

  if (statusChart) {
    statusChart.destroy();
    statusChart = null;
  }

  statusChart = new Chart(el, {
    type: "doughnut",
    data: {
      labels: ["On Track", "Due Soon", "Overdue"],
      datasets: [{
        data: [counts.green, counts.yellow, counts.red],
        backgroundColor: ["#2e7d32", "#fbc02d", "#d32f2f"], // match CSS vars
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed;
              return `${ctx.label}: ${v} plant${v === 1 ? "" : "s"}`;
            }
          }
        }
      }
    }
  });
}


async function loadPlants() {
  const grid = document.getElementById("grid");

  while (grid.firstChild) {
    grid.removeChild(grid.firstChild);
  }

  if (!API_KEY) {
    const intro = document.createElement("section");
    intro.className = "intro";


    const heading = document.createElement("h2");
    heading.textContent = "Welcome to Plant Pal";
    intro.appendChild(heading);

    const para = document.createElement("p");
    para.className = "intro-text";
    para.textContent =
      "Plant Pal helps you keep your houseplants happy by tracking when they need water. " +
      "Sign in with Google to view and manage your personal plant collection.";
    intro.appendChild(para);

    grid.appendChild(intro);

    return;
  }

  const res = await apiRequest("GET", "/api/plants");
  const plants = await res.json();
  for (const p of plants) {
    const card = new PlantCard(p);
    grid.appendChild(card.element);
  }
  renderStatusChart(plants);
}

async function reloadPlantsPreserveScroll() {
  const y = window.scrollY;
  await loadPlants();
  requestAnimationFrame(() => window.scrollTo(0, y));
}

document.addEventListener("DOMContentLoaded", () => {
  initAuthUi(loadPlants);
});