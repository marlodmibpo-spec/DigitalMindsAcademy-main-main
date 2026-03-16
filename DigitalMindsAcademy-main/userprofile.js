

// IMAGE UPLOAD PREVIEW

const uploadBtn = document.querySelector(".upload-btn");
const fileInput = document.getElementById("profileUpload");
const preview = document.getElementById("profilePreview");

if (uploadBtn && fileInput) {
  uploadBtn.addEventListener("click", () => {
    fileInput.click();
  });
}

if (fileInput && preview) {
  fileInput.addEventListener("change", function () {

    const file = this.files[0];

    if (file) {

      const reader = new FileReader();

      reader.onload = function (e) {
        preview.src = e.target.result;
      };

      reader.readAsDataURL(file);

    }

  });
}


// EDIT PROFILE ENABLE INPUTS

const editBtn = document.querySelector(".edit-btn");
const inputs = document.querySelectorAll(".profile-form input");

if (!editBtn) {
  console.error("editBtn (.edit-btn) not found");
}
if (inputs.length === 0) {
  console.error("No inputs found in .profile-form");
}

if (editBtn && inputs.length) {
  editBtn.addEventListener("click", () => {
    try {
      inputs.forEach((input) => {
        input.disabled = false;
      });
    } catch (err) {
      console.error("Error on editBtn click:", err);
    }
  });
}

