

import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

async function createBlackHole(inputFile, holeRadius, outputFile) {
  try {

    const image = await loadImage(inputFile);

  
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    
    ctx.beginPath();
    ctx.arc(centerX, centerY, holeRadius - 5, 0, 2 * Math.PI, false);
    const colorDark='rgba(5,15,15,18)'
    ctx.fillStyle = colorDark;
    ctx.fill();


    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, holeRadius);
    gradient.addColorStop(0, colorDark);
    gradient.addColorStop(0.7, colorDark);
    gradient.addColorStop(1, colorDark);

    
    ctx.beginPath();
    ctx.arc(centerX, centerY, holeRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = gradient;
    ctx.fill();

    const stream = canvas.createPNGStream();
    const out = fs.createWriteStream(outputFile);
    await new Promise((resolve, reject) => {
      stream.pipe(out);
      out.on('finish', resolve);
      out.on('error', reject);
    });

    console.log('The black hole image has been created.');
    return outputFile;

  } catch (err) {
    console.error('An error occurred:', err);
  }
}

export default createBlackHole;
