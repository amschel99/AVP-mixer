import { createCanvas, loadImage } from 'canvas';
import fs from 'fs/promises';


const imageWidth = 700;
const imageHeight = 700;
const circleRadius = imageWidth / 2;
const cropAmount = 30; 

export async function cropCircleImage(inputImagePath, outputImagePath) {
  const canvas = createCanvas(imageWidth, imageHeight);
  const context = canvas.getContext('2d');

  const image = await loadImage(inputImagePath);
  context.drawImage(image, 0, 0);

  context.clearRect(0, 0, imageWidth, imageHeight);

  context.beginPath();
  context.arc(imageWidth / 2, imageHeight / 2, circleRadius - cropAmount, 0, 2 * Math.PI);
  context.closePath();
  context.clip();

  context.drawImage(image, 0, 0);

  const buffer = canvas.toBuffer('image/jpeg');
  await fs.writeFile(outputImagePath, buffer);

  return outputImagePath;
}
