// Select elements
const imageUpload = document.getElementById("imageUpload");
const colorPicker = document.getElementById("colorPicker");
const previewCanvas = document.getElementById("preview");
const ctx = previewCanvas.getContext("2d");

// Handle form submission
document.getElementById("uploadForm").addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent form submission

  const file = imageUpload.files[0];
  if (!file) {
    alert("Please upload an image.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      // Draw the uploaded image on the canvas
      ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      ctx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);

      // Apply color overlay
      const color = colorPicker.value;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.5; // Adjust transparency
      ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
      ctx.globalAlpha = 1.0; // Reset transparency
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});
