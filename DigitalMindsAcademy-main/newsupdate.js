const news = [];

let container = null;
let uploadInput = null;

function loadNews() {
  if (!container) return;
  container.innerHTML = "";

  news.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("news-card");

    card.innerHTML = `
      <div class="news-img">
        <img src="${item.image}" width="100%" height="100%" style="object-fit:cover;">
      </div>
      <div class="news-actions">
        <i class="fa fa-edit"></i>
        <i class="fa fa-trash delete-news" data-id="${index}"></i>
      </div>
    `;

    container.appendChild(card);
  });

  createAddButton();
}

function createAddButton() {
  if (!container) return;

  const addCard = document.createElement("div");
  addCard.classList.add("news-card");
  addCard.innerHTML = `
    <div class="add-news">
      <i class="fa fa-plus"></i>
    </div>
  `;

  addCard.onclick = function () {
    const upload = document.getElementById("newsUpload");
    if (upload) {
      upload.click();
    }
  };

  container.appendChild(addCard);
}

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-news")) {
    const id = e.target.dataset.id;
    news.splice(id, 1);
    loadNews();
  }
});

function setupUploadInput() {
  uploadInput = document.createElement("input");
  uploadInput.type = "file";
  uploadInput.id = "newsUpload";
  uploadInput.accept = "image/*";
  uploadInput.style.display = "none";
  document.body.appendChild(uploadInput);

  uploadInput.addEventListener("change", function () {
    const file = this.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        news.push({
          image: e.target.result
        });
        loadNews();
      };

      reader.readAsDataURL(file);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  container = document.getElementById("newsContainer");
  setupUploadInput();
  loadNews();

  if (typeof loadAdminProfileInfo === "function") {
    loadAdminProfileInfo();
  }

  const menuLinks = document.querySelectorAll(".menu a");
  if (menuLinks.length) {
    menuLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        if (!href || href === "#") {
          event.preventDefault();
        }
        menuLinks.forEach((item) => item.classList.remove("active"));
        link.classList.add("active");
      });
    });
  }
});
