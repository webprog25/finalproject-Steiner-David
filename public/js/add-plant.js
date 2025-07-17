import { initAuthUi, apiRequest, API_KEY } from "./auth-ui.js";


function handleAuthChange() {
  if (!API_KEY) {
    // use replace so Back doesn't drop them right back here
    window.location.replace("index.html?signin=1");
    return;
  }
  // user is logged in;
  const form = document.getElementById("plant-form");
  if (form) {
    form.querySelectorAll("input, button").forEach(el => (el.disabled = false));
    const note = document.getElementById("signin-note");
    if (note) note.remove();
  }
}

// File uploader 
function setupFileUploader() {
  const uploader = document.getElementById("file-uploader");
  const input = uploader.querySelector("input[type=file]");
  const preview = document.getElementById("file-preview");
  const clearBtn = uploader.querySelector(".btn-clear");
  const placeholder = uploader.querySelector("p");

  // Open file picker on click (but not when clicking “clear”)
  uploader.addEventListener("click", (e) => {
    if (e.target === clearBtn) return;
    input.click();
  });

  // When a file is selected or dropped, show preview & clear button
  const showFile = (file) => {
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed. Please select a .jpg, .png, or similar.");
      input.value = "";
      return;
    }
    const url = URL.createObjectURL(file);
    preview.src = url;
    preview.hidden = false;
    clearBtn.hidden = false;
    placeholder.hidden = true;
  };

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;
    showFile(file);
  });

  uploader.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploader.classList.add("dragover");
  });
  uploader.addEventListener("dragleave", () => {
    uploader.classList.remove("dragover");
  });
  uploader.addEventListener("drop", (e) => {
    e.preventDefault();
    uploader.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed. Please drop a .jpg, .png, or similar.");
        return;
      }
      input.files = e.dataTransfer.files;
      showFile(file);
    }
  });

  // Clear selection
  clearBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    input.value = "";
    preview.src = "";
    preview.hidden = true;
    clearBtn.hidden = true;
    placeholder.hidden = false;
  });
}

class PlantForm {
  constructor(form) {
    this.form = form;
    this.form.addEventListener("submit", (e) => this.onSubmit(e));
  }

  async onSubmit(event) {
    event.preventDefault();
    console.log("Form submit handler fired");
    const data = new FormData(this.form);
    const file = data.get("image");
    const url = data.get("imageUrl").trim();
    const hasFile = file && file.size > 0;
    const hasUrl = url !== "";

    if (hasFile && hasUrl) {
      alert("Please provide either an image file or a URL, not both.");
      return;
    }
    if (!hasFile && !hasUrl) {
      alert("Please upload an image file or provide an image URL.");
      return;
    }

    let imageUrl = url;
    if (hasFile) {
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
      const res = await apiRequest("POST", "/api/plants", payload)
      console.log("Response status:", res.status);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("API error:", err);
        alert("Error adding plant: " + (err.error || res.status));
        return;
      }
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
  initAuthUi(handleAuthChange);
  setupFileUploader();
  const form = document.getElementById("plant-form");
  if (form) new PlantForm(form);
  handleAuthChange;
});
