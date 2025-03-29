// Select elements
const imageUpload = document.getElementById("imageUpload");
const colorPicker = document.getElementById("colorPicker");
const previewCanvas = document.getElementById("preview");
const ctx = previewCanvas.getContext("2d");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");
const spinner = document.getElementById("loadingSpinner");

let img = new Image(); // To store the uploaded image
let isDrawing = false;
let maskCenter = null;
let maskRadius = 0;
let imgScale = 1; // To track the scaling factor of the image
let offsetX = 0; // To center the image horizontally
let offsetY = 0; // To center the image vertically

// Handle image upload
imageUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Show spinner while loading the image
  spinner.style.display = "block";

  const reader = new FileReader();
  reader.onload = (event) => {
    img.onload = () => {
      // Get the canvas dimensions
      const canvasWidth = previewCanvas.width;
      const canvasHeight = previewCanvas.height;

      // Get the image dimensions
      const imgWidth = img.width;
      const imgHeight = img.height;

      // Calculate the scaling factor to fit the image within the canvas
      const widthRatio = canvasWidth / imgWidth;
      const heightRatio = canvasHeight / imgHeight;
      imgScale = Math.min(widthRatio, heightRatio); // Use the smaller ratio to maintain aspect ratio

      // Calculate offsets to center the image
      const scaledWidth = imgWidth * imgScale;
      const scaledHeight = imgHeight * imgScale;
      offsetX = (canvasWidth - scaledWidth) / 2;
      offsetY = (canvasHeight - scaledHeight) / 2;

      // Clear the canvas and draw the scaled image
      redrawCanvas();

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
    x: (e.clientX - rect.left - offsetX) / imgScale, // Adjust for scaling and centering
    y: (e.clientY - rect.top - offsetY) / imgScale, // Adjust for scaling and centering
  };
});

// Update the mask radius as the user drags
previewCanvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;

  const rect = previewCanvas.getBoundingClientRect();
  const currentPos = {
    x: (e.clientX - rect.left - offsetX) / imgScale, // Adjust for scaling and centering
    y: (e.clientY - rect.top - offsetY) / imgScale, // Adjust for scaling and centering
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
    ctx.arc(
      maskCenter.x * imgScale + offsetX, // Adjust for scaling and centering
      maskCenter.y * imgScale + offsetY, // Adjust for scaling and centering
      maskRadius * imgScale, // Adjust for scaling
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }
});

// Redraw the canvas (image only)
function redrawCanvas() {
  ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  ctx.drawImage(
    img,
    0,
    0,
    img.width,
    img.height,
    offsetX,
    offsetY,
    img.width * imgScale,
    img.height * imgScale
  );
}

// Draw the mask outline
function drawMaskOutline() {
  ctx.beginPath();
  ctx.arc(
    maskCenter.x * imgScale + offsetX, // Adjust for scaling and centering
    maskCenter.y * imgScale + offsetY, // Adjust for scaling and centering
    maskRadius * imgScale, // Adjust for scaling
    0,
    Math.PI * 2
  );
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Handle reset button click
resetBtn.addEventListener("click", () => {
  // Clear the canvas
  ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

  // Reset the form
  document.getElementById("uploadForm").reset();

  // Reset variables
  maskCenter = null;
  maskRadius = 0;

  // Hide the download button
  downloadBtn.style.display = "none";
});
