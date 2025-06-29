class PlantDetail {
  constructor(id) {
    this.id = id;
    this.load();
  }

  async load() {
    const res = await fetch(`/api/plants/${this.id}`);
    this.plant = await res.json();
    this.render();
  }

  render() {
    document.getElementById("nickname").value = this.plant.nickname;
    document.getElementById("species").value = this.plant.species;
    document.getElementById("frequency").value = this.plant.frequencyDays;

    document
      .getElementById("watered-today")
      .addEventListener("click", () => this.waterToday());

    document
      .getElementById("delete")
      .addEventListener("click", () => this.delete());

    document
      .getElementById("edit-form")
      .addEventListener("submit", (e) => this.onEdit(e));
  }

  async waterToday() {
    await fetch(`/api/plants/${this.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastWatered: new Date() })
    });
    location.reload();
  }

  async onEdit(event) {
    event.preventDefault();
    const update = {
      nickname: document.getElementById("nickname").value,
      species: document.getElementById("species").value,
      frequencyDays: Number(
        document.getElementById("frequency").value
      )
    };

    await fetch(`/api/plants/${this.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update)
    });

    location.href = "index.html";
  }

  async delete() {
    await fetch(`/api/plants/${this.id}`, {
      method: "DELETE"
    });
    location.href = "index.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  new PlantDetail(id);
});
