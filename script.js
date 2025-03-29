// Select elements
const imageUpload = document.getElementById("imageUpload");
const colorPicker = document.getElementById("colorPicker");
const previewCanvas = document.getElementById("preview");
const ctx = previewCanvas.getContext("2d");
const downloadBtn = document.getElementById("downloadBtn");
const spinner = document.getElementById("loadingSpinner");

let img = new Image(); // To store the uploaded image
let isDrawing = false;
let maskCenter = null;
let maskRadius = 0;

// Handle image upload
imageUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Show spinner while loading the image
  spinner.style.display = "block";

  const reader = new FileReader();
  reader.onload = (event) => {
    img.onload = () => {
      // Resize canvas to match image dimensions
      previewCanvas.width = img.width;
      previewCanvas.height = img.height;

      // Draw the uploaded image on the canvas
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // Hide spinner and download button
      spinner.style.display = "none";
      downloadBtn.style.display = "none";
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

  // Show the download button after the preview is generated
  downloadBtn.style.display = "block";
});

// Handle download button click
downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "edited-wheel.png"; // Name of the downloaded file
  link.href = previewCanvas.toDataURL(); // Get the canvas data as a URL
  link.click();
});

// Start drawing the mask
previewCanvas.addEventListener("mousedown", (e) => {
  if (!img.src) {
    alert("Please upload an image first.");
    return;
  }

  isDrawing = true;

  // Get the starting point of the mask
  const rect = previewCanvas.getBoundingClientRect();
  maskCenter = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
});

// Update the mask radius as the user drags
previewCanvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;

  const rect = previewCanvas.getBoundingClientRect();
  const currentPos = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };

  maskRadius = Math.sqrt(
    Math.pow(currentPos.x - maskCenter.x, 2) +
    Math.pow(currentPos.y - maskCenter.y, 2)
  );

  // Redraw the image and the mask
  redrawCanvas();
  drawMaskOutline();
});

// Apply the color overlay to the masked area
previewCanvas.addEventListener("mouseup", () => {
  if (!isDrawing) return;

  isDrawing = false;

  if (maskCenter && maskRadius > 0) {
    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = colorPicker.value;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(maskCenter.x, maskCenter.y, maskRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
});

// Redraw the canvas (image only)
function redrawCanvas() {
  ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  ctx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
}

// Draw the mask outline
function drawMaskOutline() {
  ctx.beginPath();
  ctx.arc(maskCenter.x, maskCenter.y, maskRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.stroke();
}

const resetBtn = document.getElementById("resetBtn");

resetBtn.addEventListener("click", () => {
  // Clear the canvas
  ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

  // Reset the form
  document.getElementById("uploadForm").reset();

  // Hide the download button
  downloadBtn.style.display = "none";
});
