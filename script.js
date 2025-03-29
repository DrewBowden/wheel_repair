// Select elements
const imageUpload = document.getElementById("imageUpload");
const colorPicker = document.getElementById("colorPicker");
const previewCanvas = document.getElementById("preview");
const ctx = previewCanvas.getContext("2d");

let img = new Image(); // To store the uploaded image

// Handle image upload
imageUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    img.onload = () => {
      // Resize canvas to match image dimensions
      previewCanvas.width = img.width;
      previewCanvas.height = img.height;

      // Draw the uploaded image on the canvas
      ctx.drawImage(img, 0, 0, img.width, img.height);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// Handle form submission to apply color overlay
document.getElementById("uploadForm").addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent form submission

  if (!img.src) {
    alert("Please upload an image first.");
    return;
  }

  // Apply the selected color as an overlay
  const color = colorPicker.value;
  ctx.save();
  ctx.globalCompositeOperation = "source-atop"; // Apply color only to the image
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.5; // Adjust transparency
  ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
  ctx.restore();
});
