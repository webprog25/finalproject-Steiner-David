import { initAuthUi, apiRequest, API_KEY } from "./auth-ui.js";
import "https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js";

let statusChart = null;

const editDialog = document.getElementById('edit-modal');
const form = document.getElementById('edit-form');
const cancelBtn = document.getElementById('edit-cancel');

function openEditModal(plant, onSave) {
  editDialog.showModal();
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
    editDialog.close('save');
  };
}

function closeEditModal() {
  editDialog.close();
}

cancelBtn.addEventListener('click', closeEditModal);

editDialog.addEventListener('click', (event) => {
  if (event.target === editDialog) {
    closeEditModal();
  }
});

class PlantCard {
  constructor(plant) {
    this.plant = plant;
    this.element = this.render();
    this.attachHandlers();
  }

  getBadgeColor() {
    let ms = Date.now() - new Date(this.plant.lastWatered).getTime();
    let days = ms / (1000 * 60 * 60 * 24);
    if (days < this.plant.frequencyDays * 0.75) return "green";
    if (days < this.plant.frequencyDays) return "yellow";
    return "red";
  }

  render() {
    const article = document.createElement("article");
    article.className = "plant-card";

    let daysAgo = Math.round(
      (Date.now() - new Date(this.plant.lastWatered)) /
      (1000 * 60 * 60 * 24)
    );
    let color = this.getBadgeColor();

    let lastDate = new Date(this.plant.lastWatered).toLocaleDateString(
      undefined,
      { year: "numeric", month: "short", day: "numeric" }
    );

    const actionsTop = document.createElement("div");
    actionsTop.className = "card-actions-top";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn-edit";
    editBtn.setAttribute("aria-label", "Edit plant");
    const editIcon = document.createElement("img");
    editIcon.src = "icons/edit.svg";
    editIcon.alt = ""; 
    editBtn.appendChild(editIcon);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn-delete";
    delBtn.setAttribute("aria-label", "Delete plant");
    const delIcon = document.createElement("img");
    delIcon.src = "icons/delete.svg";
    delIcon.alt = ""; 
    delBtn.appendChild(delIcon);

    actionsTop.append(editBtn, delBtn);
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
    try {
      let res = await apiRequest("PATCH", `/api/plants/${this.plant._id}`, { lastWatered: new Date() });
      if (!res.ok) {
        alert("You must be logged in to water plants.");
        return;
      }
      await reloadPlantsPreserveScroll();
    } catch (err) {
      alert(`Error watering plant: ${err.message}`);
    } finally {
      setTimeout(() => button.classList.remove("pressed"), 300);
    }
  }

  handleEdit() {
    openEditModal(this.plant, async (updates) => {
      try {
        let res = await apiRequest("PATCH", `/api/plants/${this.plant._id}`, updates);
        if (!res.ok) {
          alert("You must be logged in to edit plants.");
          return;
        }
        await reloadPlantsPreserveScroll();
      } catch (err) {
        alert(`Error editing plant: ${err.message}`);
      }
    });
  }

  async handleDelete() {
    if (!confirm(`Do you really want to delete "${this.plant.nickname}"?`)) {
      return;
    }
    try {
      let res = await apiRequest("DELETE", `/api/plants/${this.plant._id}`);
      if (!res.ok) {
        alert("You must be logged in to delete plants.");
        return;
      }
      await reloadPlantsPreserveScroll();
    } catch (err) {
      alert(`Error deleting plant: ${err.message}`);
    }
  }

  refresh() {
    const newEl = this.render();
    this.element.replaceWith(newEl);
    this.element = newEl;
    this.attachHandlers();
  }
}

function plantStatus(plant) {
  let ms = Date.now() - new Date(plant.lastWatered).getTime();
  let days = ms / (1000 * 60 * 60 * 24);
  if (days < plant.frequencyDays * 0.75) return "green";
  if (days < plant.frequencyDays) return "yellow";
  return "red";
}

function renderStatusChart(plants) {
  const el = document.getElementById("statusChart");
  if (!el) return;

  let counts = { green: 0, yellow: 0, red: 0 };
  for (let p of plants) {
    counts[plantStatus(p)]++;
  }

  let total = counts.green + counts.yellow + counts.red;

  if (total === 0) {
    if (statusChart) { statusChart.destroy(); statusChart = null; }
    const box = document.getElementById("stats");
    if (box) box.querySelector("h3").textContent = "No plants yet";
    return;
  }

  if (statusChart) {
    statusChart.data.datasets[0].data = [counts.green, counts.yellow, counts.red];
    statusChart.update();
    return;
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
  let grid = document.getElementById("grid");

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

  try {
    let res = await apiRequest("GET", "/api/plants");

    if (!res.ok) {
      alert(`Error loading plants: ${res.status} ${res.statusText}`);
      return;
    }

    let plants = await res.json();
    for (let p of plants) {
      const card = new PlantCard(p);
      grid.appendChild(card.element);
    }
    renderStatusChart(plants);

  } catch (err) {
    alert(`Error loading plants: ${err.message}`);
  }
}

async function reloadPlantsPreserveScroll() {
  let y = window.scrollY;
  await loadPlants();
  requestAnimationFrame(() => window.scrollTo(0, y));
}

initAuthUi(loadPlants);