class PlantCard {
  constructor(plant) {
    this.plant = plant;
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
      <img src="${this.plant.imageUrl}" alt="${this.plant.nickname}" />
      <h2>${this.plant.nickname}</h2>
      <p>${this.plant.species}</p>
      <p>Last watered: ${new Date(this.plant.lastWatered).toLocaleDateString()}</p>
      <span class="badge ${this.getBadgeColor()}">
        ${Math.round((Date.now() - new Date(this.plant.lastWatered)) / (1000*60*60*24))} days
      </span>
    `;
    article.addEventListener("click", () => {
      location.href = `detail.html?id=${this.plant._id}`;
    });
    return article;
  }
}

async function loadPlants() {
  const res = await fetch("/api/plants");
  const plants = await res.json();
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  plants.forEach(p => grid.appendChild(new PlantCard(p).render()));
}

document.addEventListener("DOMContentLoaded", loadPlants);