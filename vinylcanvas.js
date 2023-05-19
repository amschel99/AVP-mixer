import { createCanvas } from 'canvas';
import { overlayImages } from './draw.js';
import fs from 'fs'
const outputFilePath= './outputs/canvas.png';
export function createVinylCircle(outputFilePath, circleSize, innerRadius, outerRadius, borderColor, borderWidth) {
  const canvas = createCanvas(circleSize, circleSize);
  const context = canvas.getContext('2d');
  

  context.fillStyle = 'silver';
  context.beginPath();
  context.arc(circleSize / 2, circleSize / 2, circleSize / 2, 0, Math.PI * 2);
  context.closePath();
  context.fill();

  context.fillStyle = 'black';
  context.beginPath();
  context.arc(circleSize / 2, circleSize / 2, innerRadius, 0, Math.PI * 2);
  context.closePath();
  context.fill();

  // Draw the border
  context.strokeStyle = borderColor || 'black';
  context.lineWidth = borderWidth || 10;
  context.beginPath();
  context.arc(circleSize / 2, circleSize / 2, outerRadius || innerRadius + borderWidth / 2, 0, Math.PI * 2);
  context.closePath();
  context.stroke();

  const stream = canvas.createPNGStream();

  const writableStream = fs.createWriteStream(outputFilePath);
  stream.pipe(writableStream);

  return new Promise((resolve, reject) => {
    writableStream.on('finish', () => {
      resolve(outputFilePath);
    });
    writableStream.on('error', (err) => {
      reject(err);
    });
  });
}


  