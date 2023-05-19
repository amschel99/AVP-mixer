import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

export const removeSquareEdges = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    loadImage(inputPath).then((image) => {
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
  
      ctx.drawImage(image, 0, 0);
  
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data, width, height } = imageData;
  
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const pixelIndex = (y * width + x) * 4;
          const red = data[pixelIndex];
          const green = data[pixelIndex + 1];
          const blue = data[pixelIndex + 2];
  
          if (red === 0 && green === 0 && blue === 0) {
            data[pixelIndex + 3] = 0;
          }
        }
      }
  
      ctx.putImageData(imageData, 0, 0);
  
      const outputStream = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
  
      stream.pipe(outputStream);
  
      outputStream.on('finish', () => {
        console.log('Circle image with square edges ');
        resolve(outputPath);
      });
  
      outputStream.on('error', (err) => {
        reject(err);
      });
    }).catch((err) => {
      reject(err);
    });
  });
};
