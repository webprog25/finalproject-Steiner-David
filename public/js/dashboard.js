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
          <span class="badge ${this.getBadgeColor()}">
            ${Math.round((Date.now() - new Date(this.plant.lastWatered)) / (1000*60*60*24))} days
          </span>

      </div>

      <!-- Bottom action (water) -->
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

  handleEdit(button) {
    // transform card-content into editable inputs
    const content = this.element.querySelector(".card-content");
    const [h2, sp, fq, badge] = content.children;

    const inputName = document.createElement("input");
    inputName.value = this.plant.nickname;
    const inputSpec = document.createElement("input");
    inputSpec.value = this.plant.species;
    const inputFreq = document.createElement("input");
    inputFreq.type = "number";
    inputFreq.min  = "1";
    inputFreq.value = this.plant.frequencyDays;

    content.replaceChild(inputName, h2);
    content.replaceChild(inputSpec, sp);
    content.replaceChild(inputFreq, fq);

    // swap icon to save
    button.src = "icons/save.svg";
    button.removeEventListener("click",  () => this.handleEdit(button));
    button.addEventListener("click", async () => {
      this.plant.nickname     = inputName.value;
      this.plant.species      = inputSpec.value;
      this.plant.frequencyDays= Number(inputFreq.value);

      await fetch(`/api/plants/${this.plant._id}`, {
        method:"PATCH",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          nickname: this.plant.nickname,
          species:  this.plant.species,
          frequencyDays: this.plant.frequencyDays
        })
      });
      this.refresh();
    });
  }

  async handleDelete() {
    if (!confirm(`Delete "${this.plant.nickname}"?`)) return;
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