class PlantForm {
  constructor(form) {
    this.form = form;
    this.form.addEventListener("submit", (e) => this.onSubmit(e));
  }

  async onSubmit(event) {
    event.preventDefault();
    console.log("Form submit handler fired");
    const data = new FormData(this.form);

    let imageUrl = data.get("imageUrl");
    const file = data.get("image");
    if (file && file.size) {
      console.log("File selected:", file.name, file.size, "bytes");
      imageUrl = await this.toDataURL(file);
    }

    const payload = {
      nickname: data.get("nickname"),
      species: data.get("species"),
      frequencyDays: Number(data.get("frequency")),
      lastWatered: new Date(),
      imageUrl
    };
    console.log("Payload:", payload);

    try {
      const res = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      console.log("Response status:", res.status);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("API error:", err);
        alert("Error adding plant: " + (err.error || res.status));
        return;
      }
      // Success!
      location.href = "index.html";
    } catch (err) {
      console.error("Fetch failed:", err);
      alert("Network error, see console.");
    }
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
  const form = document.getElementById("plant-form");
  if (!form) {
    console.error("Could not find #plant-form!");
    return;
  }
  new PlantForm(form);
});
