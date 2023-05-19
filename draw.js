import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

export async function overlayImages(imagePath1, imagePath2) {
  const canvas = createCanvas();
  const ctx = canvas.getContext('2d');

  // Load the first image and set canvas dimensions
  const image1 = await loadImage(imagePath1);
  canvas.width = image1.width;
  canvas.height = image1.height;

  // Draw the first image onto the canvas
  ctx.drawImage(image1, 0, 0);

  // Load the second image
  const image2 = await loadImage(imagePath2);

  // Draw the second image at position 120, 120
  ctx.drawImage(image2, 0, 0);

  // Generate the output file path
  const outputPath = 'outputs/canvas.png';

  // Save the canvas as a PNG image
  const out = fs.createWriteStream(outputPath);
  const stream = canvas.createPNGStream();
  await new Promise((resolve, reject) => {
    stream.pipe(out);
    out.on('finish', resolve);
    out.on('error', reject);
  });

  return outputPath;
}

// Usage example:

