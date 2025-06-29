class PlantForm {
  constructor(form) {
    this.form = form;
    this.form.addEventListener("submit", (e) => this.onSubmit(e));
  }

  async onSubmit(event) {
    event.preventDefault();
    const data = new FormData(this.form);

    let imageUrl = data.get("imageUrl");
    const file = data.get("image");
    if (file && file.size) {
      imageUrl = await this.toDataURL(file);
    }

    const payload = {
      nickname: data.get("nickname"),
      species: data.get("species"),
      frequencyDays: Number(data.get("frequency")),
      lastWatered: new Date(),
      imageUrl
    };

    await fetch("/api/plants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    location.href = "index.html";
  }

  toDataURL(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new PlantForm(document.getElementById("plant-form"));
});
