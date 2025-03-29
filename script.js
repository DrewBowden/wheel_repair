// Select elements
const imageUpload = document.getElementById("imageUpload");
const colorPicker = document.getElementById("colorPicker");
const previewCanvas = document.getElementById("preview");
const ctx = previewCanvas.getContext("2d");

let img = new Image();
let isDrawing = false;
let maskCenter = null;
let maskRadius = 0;

// Handle image upload
imageUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    img.onload = () => {
      // Resize canvas to match image
      previewCanvas.width = img.width;
      previewCanvas.height = img.height;

      // Draw the uploaded image
      ctx.drawImage(img, 0, 0, img.width, img.height);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// Handle mouse events for drawing the mask
previewCanvas.addEventListener("mousedown", (e) => {
  isDrawing = true;

  // Get the starting point of the mask
  const rect = previewCanvas.getBoundingClientRect();
  maskCenter = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
});

previewCanvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;

  // Calculate the radius of the mask
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
  ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  ctx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);

  // Draw the mask outline
  ctx.beginPath();
  ctx.arc(maskCenter.x, maskCenter.y, maskRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.stroke();
});

previewCanvas.addEventListener("mouseup", () => {
  isDrawing = false;
});

// Handle form submission to apply the color
document.getElementById("uploadForm").addEventListener("submit", (e) => {
  e.preventDefault();

  if (!maskCenter || maskRadius === 0) {
    alert("Please mark the alloy wheel area first.");
    return;
  }

  // Apply the selected color to the masked area
  const color = colorPicker.value;
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.5; // Adjust transparency
  ctx.beginPath();
  ctx.arc(maskCenter.x, maskCenter.y, maskRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
});
