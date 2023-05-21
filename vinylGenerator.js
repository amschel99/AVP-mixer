import { createVinylCircle } from "./vinylcanvas.js";
import { cropCircleImage } from "./removeEdges.js";
import { resizeImage } from "./resize.js";
import { spawn, fork } from 'child_process';
import { overlayImages } from "./draw.js";
import createBlackHole from "./blackhole.js";
import { removeSquareEdges } from './removeSquare.js';
import { fstat, writeFile } from "fs";
import { stderr } from "process";

export const generateVinyl = async (images, videoPath, audioPath, secs, outputPath) => {
  try {
    const imagesArr = [];

    const init = () => {
      return new Promise((resolve, reject) => {
        const processImage = async (image, index) => {
          const resizedPath = await resizeImage(image, `outputs/${index}.png`);
          const croppedPath = await cropCircleImage(resizedPath, resizedPath);
          const holePath = await createBlackHole(croppedPath, 40, croppedPath);
          const finalRealPath = await removeSquareEdges(holePath, holePath);
          imagesArr[index] = finalRealPath;
          console.log(imagesArr);

          if (imagesArr.length === images.length) {
            console.log('All images processed');
            resolve(imagesArr);
          }
        };

        images.forEach(processImage);
      });
    };

    await init();

    const createVinylRecordEffect = (finalImageFiles, videoPath, audioPath, secs, outputPath) => {
      return new Promise((resolve, reject) => {
        const ffprobeAudio = spawn('ffprobe', [
          '-v', 'error',
          '-show_entries', 'format=duration',
          '-of', 'default=noprint_wrappers=1:nokey=1',
          audioPath
        ]);

        ffprobeAudio.stdout.on('data', (data) => {
          const audioDuration = parseFloat(data.toString());
          const ffmpegArgs = [
            '-stream_loop', '-1', // Loop indefinitely
            '-i', videoPath,
            '-i', audioPath
          ];

          finalImageFiles.forEach((image, i) => {
            ffmpegArgs.push('-loop', '1', '-i', image);
          });

          const getFilterComplex = () => {
            let filterComplex = '[0:v]format=yuv420p[v0];';
            let f1 = `[2:v]rotate=t*33.333333333/10,format=yuv420p[v1];[v1]colorkey=0x000000:similarity=0.01[cout];[v0][cout]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:enable='between(t,0,${finalImageFiles.length === 1 ? audioDuration : secs})'[v];[v]format=rgba[v2];[v2]colorchannelmixer=aa=0.7[v];[1:a]volume=1.0[a];`;

            finalImageFiles.forEach((image, i) => {
              if (i > 0) {
                f1 += `[${i + 2}:v]format=yuv420p[v${i + 2}];[v${i + 2}]rotate=t*33.333333333/10,format=yuv420p[as${i + 1}];[as${i + 1}]colorkey=0x000000:similarity=0.01[cout${i}];[v][cout${i}]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:enable='between(t,${i * secs},${i === finalImageFiles.length - 1 ? audioDuration : i * secs + secs})'[v${i + 3}];[v${i + 3}]format=rgba[v${i + 4}];[v${i + 4}]colorchannelmixer=aa=0.7[v]${(i == images.length - 1) ? '' : ';'}${i === 0 ? '[1:a]volume=1.0[a];' : ''}`;
              }
            });

            filterComplex += f1;
            ffmpegArgs.push('-filter_complex', filterComplex, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-b:v', '1000k', '-pix_fmt', 'yuv420p', '-t', audioDuration.toString(), '-y', outputPath);
          };

          getFilterComplex();

          const ffmpeg = spawn('ffmpeg', ffmpegArgs);

          // Write the ffmpeg command to a file
          let ffmpegString = '';
          ffmpeg.spawnargs.forEach((arg) => ffmpegString += ` ${arg}`);
          writeFile('outputs/ffmpeg.sh', ffmpegString, () => {
            console.log('ffmpeg command written to file');
          });

          ffmpeg.stdout.on('data', (data) => {
            console.log(data);
          });

          ffmpeg.stderr.on('data', (data) => {
            console.log(data);
          });

          ffmpeg.on('close', (code) => {
            if (code === 0) {
              console.log('Video created', outputPath);
              resolve(outputPath);
            } else {
              console.log('An error occurred');
              // reject(new Error(`Video processing exited with code ${code}`)); // Reject the Promise with an error
            }
          });
        });
      });
    };

    const finalVideoPath = await createVinylRecordEffect(imagesArr, videoPath, audioPath, secs, outputPath)
      .then((outputPath) => {
        console.log('Video created', outputPath);
        return outputPath;
      })
      .catch((err) => {
        console.error('Error creating video:', err);
        return null;
      });

    return finalVideoPath;
  } catch (err) {
    console.error(err);
    return err;
  }
};

const start = async () => {
  try {
    const finalVideo = await generateVinyl(['./1.jpg', '2.jpg', './3.jpg', './4.jpg', './5.jpg', '6.jpg', '7.jpg', '8.jpg'], 'example.mp4', 'example.mp3', 10, './outputs/final.mp4');
    console.log(`Find the final video at ${finalVideo}`);
  } catch (e) {
    console.log(e);
  }
};

start();
