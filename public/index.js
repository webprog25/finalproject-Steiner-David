import { renderPlants, createPlantCard } from "./plants.js";

window.addEventListener("DOMContentLoaded", () => {
  renderPlants();

  const nameInput    = document.getElementById("newPlantName");
  const speciesInput = document.getElementById("newPlantSpecies");
  const freqInput    = document.getElementById("newPlantFreq");
  document.getElementById("addPlantBtn")
    .addEventListener("click", () => {
      const nickname = nameInput.value.trim();
      const species  = speciesInput.value.trim();
      const freq     = parseInt(freqInput.value, 10) || 7;
      if (!nickname || !species) return;

      createPlantCard({
        nickname,
        species,
        imageUrl: `https://picsum.photos/200?random=${Date.now()}`,
        frequencyDays: freq,
        lastWatered:   new Date().toISOString().split("T")[0]
      });

      // reset
      nameInput.value    = "";
      speciesInput.value = "";
      freqInput.value    = "";
      nameInput.focus();
    });
});
