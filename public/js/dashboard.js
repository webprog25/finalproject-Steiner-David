const modal     = document.getElementById("edit-modal");
const form      = document.getElementById("edit-form");
const cancelBtn = document.getElementById("edit-cancel");

// Open and pre-fill the modal, then call onSave(updates) when submitted
function openEditModal(plant, onSave) {
  modal.hidden = false;
  form.nickname.value      = plant.nickname;
  form.species.value       = plant.species;
  form.frequencyDays.value = plant.frequencyDays;
  form.onsubmit = async (e) => {
    e.preventDefault();
    await onSave({
      nickname:      form.nickname.value.trim(),
      species:       form.species.value.trim(),
      frequencyDays: Number(form.frequencyDays.value)
    });
    closeEditModal();
  };
}

function closeEditModal() {
  modal.hidden = true;
}

// Cancel or backdrop click closes without saving
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

  // Compute badge text & color
  const daysAgo = Math.round(
    (Date.now() - new Date(this.plant.lastWatered)) /
      (1000 * 60 * 60 * 24)
  );
  const color = this.getBadgeColor();

  // Format last‐watered date for tooltip
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
      <p class="species">${this.plant.species}</p>
      <p class="frequency">${this.plant.frequencyDays} days</p>
      <span class="badge ${color}" title="Last watered: ${lastDate}">
        ${daysAgo} days
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
    const btnEdit  = this.element.querySelector(".btn-edit");
    const btnDel   = this.element.querySelector(".btn-delete");

    btnWater.addEventListener("click", () => this.handleWater(btnWater));
    btnEdit.addEventListener("click",  () => this.handleEdit(btnEdit));
    btnDel.addEventListener("click",   () => this.handleDelete());
  }

  async handleWater(button) {
    button.classList.add("pressed");
    await fetch(`/api/plants/${this.plant._id}`, {
      method: "PATCH",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ lastWatered: new Date() })
    });
    const res = await fetch(`/api/plants/${this.plant._id}`);
    this.plant = await res.json();
    this.refresh();
    setTimeout(() => button.classList.remove("pressed"), 300);
  }

  handleEdit() {
    openEditModal(this.plant, async (updates) => {
      await fetch(`/api/plants/${this.plant._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      Object.assign(this.plant, updates);
      this.refresh();
    });
  }

  async handleDelete() {
    if (!confirm(`Do you really want to delete "${this.plant.nickname}"?`)) return;
    await fetch(`/api/plants/${this.plant._id}`, { method: "DELETE" });
    this.element.remove();
  }

  refresh() {
    const newEl = this.render();
    this.element.replaceWith(newEl);
    this.element = newEl;
    this.attachHandlers();
  }
}

async function loadPlants() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  const res = await fetch("/api/plants");
  const plants = await res.json();
  plants.forEach(p => {
    const card = new PlantCard(p);
    grid.appendChild(card.element);
  });
}

document.addEventListener("DOMContentLoaded", loadPlants);