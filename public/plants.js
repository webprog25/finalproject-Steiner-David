const samplePlants = [
  {
    nickname:     "Aloe",
    species:      "Aloe vera",
    imageUrl:     "/images/aloe.jpg",
    frequencyDays: 14,
    lastWatered:  "2025-06-01"
  },
  {
    nickname:     "Figgy",
    species:      "Ficus lyrata",
    imageUrl:     "/images/fiddle.jpg",
    frequencyDays: 7,
    lastWatered:  "2025-06-05"
  }
];

// simple date‐difference fn (no libraries yet)
function daysBetween(d1, d2) {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((d2 - d1) / msPerDay);
}

export function renderPlants() {
    samplePlants.forEach(createPlantCard);  
  
}
export function createPlantCard(p) {
    const container = document.getElementById("plantDashboard");
    const template  = document.querySelector(".template.plant-card");
    const card      = template.cloneNode(true);

    card.classList.remove("template");

    // Image + alt
    const img = card.querySelector(".plant-image");
    img.src = p.imageUrl;
    img.alt = p.nickname;

    // Nickname & species
    card.querySelector(".plant-name").textContent    = p.nickname;
    card.querySelector(".plant-species").textContent = p.species;

    // Last watered
    card.querySelector(".last-watered span").textContent = p.lastWatered;

    // Days until next water
    const last = new Date(p.lastWatered);
    const today = new Date();
    const daysElapsed = daysBetween(last, today);
    const daysLeft = Math.max(0, p.frequencyDays - daysElapsed);
    card.querySelector(".days-left").textContent = daysLeft;

    // Badge color: green → gold → tomato
    const ratio = daysLeft / p.frequencyDays;
    let clr;
    if (ratio > 0.66) clr = "green";
    else if (ratio > 0.33) clr = "gold";
    else clr = "tomato";
    card.querySelector(".plant-badge").style.backgroundColor = clr;

    // Water-Now handler
    card.querySelector(".water-now").addEventListener("click", () => {
    card.querySelector(".days-left").textContent = p.frequencyDays;
    });

    // Delete button
    card.querySelector(".delete-plant")
        .addEventListener("click", () => card.remove());

    // Edit button (just demo via prompt)
    card.querySelector(".edit-plant")
        .addEventListener("click", () => {
        const newName = prompt("New nickname?", p.nickname);
        if (newName) {
            p.nickname = newName;
            card.querySelector(".plant-name").textContent = newName;
        }
        });

    container.appendChild(card);
}
