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

    article.innerHTML = `
      <!-- Top actions (edit/delete) -->
      <div class="card-actions-top">
        <img src="icons/edit.svg" class="btn-edit" title="Edit" />
        <img src="icons/delete.svg" class="btn-delete" title="Delete" />
      </div>

      <img src="${this.plant.imageUrl}" alt="${this.plant.nickname}" />

      <div class="card-content">
        <h2>${this.plant.nickname}</h2>
        <p class="species">Species: ${this.plant.species}</p>
        <p class="frequency">Watering Frequency: ${this.plant.frequencyDays} days</p>
        <span class="badge ${color}" title="Last watered: ${lastDate}">
          ${daysAgo} days since last watering
        </span>
      </div>

      <!-- Bottom actions: water button + badge -->
      <div class="card-actions-bottom">
        <button class="btn-water" title="Water now">
          <img src="icons/water.svg" alt="" />
          Water now
        </button>
      </div>
    `;
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
  plants.forEach(p => counts[plantStatus(p)]++);

  const total = counts.green + counts.yellow + counts.red;

  if (total === 0) {
    if (statusChart) { statusChart.destroy(); statusChart = null; }
    const box = document.getElementById("stats");
    if (box) box.querySelector("h3").textContent = "No plants yet";
    return;
  }

  // destroy prior chart (if any) before re-creating
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
  grid.innerHTML = "";
  // if not logged in, show message and skip server call
  if (!API_KEY) {
    grid.innerHTML = `
     <section class="intro">
       <h2>Welcome to Plant Pal</h2>
       <p class="intro-text">
         Plant Pal helps you keep your houseplants happy by tracking when they need water.
         Sign in with Google to view and manage your personal plant collection.
       </p>
     </section>
   `;
    return;
  }
  const res = await apiRequest("GET", "/api/plants");
  const plants = await res.json();
  plants.forEach(p => {
    const card = new PlantCard(p);
    grid.appendChild(card.element);
  });
  renderStatusChart(plants);
}

async function reloadPlantsPreserveScroll() {
  const y = window.scrollY;
  await loadPlants();                  // re-fetch + rebuild + update chart
  requestAnimationFrame(() => window.scrollTo(0, y));
}

document.addEventListener("DOMContentLoaded", () => {
  // set up nav + auth, then call loadPlants() when logged in
  initAuthUi(loadPlants);
});