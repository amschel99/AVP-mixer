import { createVinylCircle } from "./vinylcanvas.js";
import { cropCircleImage } from "./removeEdges.js";
import { resizeImage } from "./resize.js";
import { spawn, fork } from 'child_process';
import { overlayImages } from "./draw.js";
import createBlackHole from "./blackhole.js";
import { removeSquareEdges } from './removeSquare.js';
import { fstat, writeFile } from "fs";
import { stderr } from "process";
import { calculateOverlayTimeRanges } from "./timeranges.js";
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
              
  const timeRanges = calculateOverlayTimeRanges(audioDuration, secs, finalImageFiles.length);
  console.log(timeRanges)
  const index0ranges = timeRanges.filter((element) => element.index === 0);
console.log(index0ranges)


// Filter the array based on the index and extract the start and end times



            let positionInVideo=0;
         
            let filterComplex = '[0:v]format=yuv420p[v0];';
            let f1 = `[2:v]rotate=t*33.333333333/10,format=yuv420p[v1];[v1]colorkey=0x000000:similarity=0.01[cout];[v0][cout]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:enable=`;

index0ranges.forEach((range, i) => {
  const { start, end } = range;
  const overlayTime = `between(t,${start},${end})${i===index0ranges.length-1?'':"+"}`;
  f1 += (i === 0 ? `'${overlayTime}` : `${overlayTime}`);
  f1+=(i===index0ranges.length-1?"'":"");
});

f1 += `[v];[v]format=rgba[v2];[v2]colorchannelmixer=aa=0.7[v];[1:a]volume=1.0[a];`;
positionInVideo+=secs



            finalImageFiles.forEach((image, i) => {
              if (i > 0) {
                const currentIndex = timeRanges.filter((element) => element.index === i);
f1+=`[${i+2}:v]format=yuv420p[v${i+2}];[v${i+2}]rotate=t*33.3333333/10,format=yuv420p[as${i+1}];[as${i+1}]colorkey=0x000000:similarity=0.01[cout${i}];[v][cout${i}]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:enable=`
               // f1 += `[${i + 2}:v]format=yuv420p[v${i + 2}];[v${i + 2}]rotate=t*33.333333333/10,format=yuv420p[as${i + 1}];[as${i + 1}]colorkey=0x000000:similarity=0.01[cout${i}];[v][cout${i}]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:enable='between(t,${positionInVideo},${i*secs+secs})'[v${i + 3}];[v${i + 3}]format=rgba[v${i + 4}];[v${i + 4}]colorchannelmixer=aa=0.7[v]${(i == images.length - 1) ? '' : ';'}${i === 0 ? '[1:a]volume=1.0[a];' : ''}`;
                //positionInVideo+=secs
                currentIndex.forEach((range,i)=>{
                  const { start, end } = range;
                  const overlayTime = `between(t,${start},${end})${i===currentIndex.length-1?'':"+"}`;
                  f1 += (i === 0 ? `'${overlayTime}` : `${overlayTime}`);
                  f1+=(i===currentIndex.length-1?"'":"");
                })
                f1+=`[v${i + 3}];[v${i + 3}]format=rgba[v${i + 4}];[v${i + 4}]colorchannelmixer=aa=0.7[v]${(i == images.length - 1) ? '' : ';'}${i === 0 ? '[1:a]volume=1.0[a];' : ''}`;
               
               
              }
            });
         

            filterComplex += f1;
            ffmpegArgs.push('-filter_complex', filterComplex, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-b:v', '1000k', '-pix_fmt', 'yuv420p', '-t', audioDuration.toString(), '-y', outputPath);
          };

          getFilterComplex();
console.log(ffmpegArgs)
          const ffmpeg = spawn('ffmpeg', ffmpegArgs);

          // Write the ffmpeg command to a file
          let ffmpegString = '';
          ffmpeg.spawnargs.forEach((arg) => ffmpegString += ` ${arg}`);
          writeFile('outputs/ffmpeg.sh', ffmpegString, () => {
            console.log('ffmpeg command written to file');
          });

          ffmpeg.stdout.on('data', (data) => {
            console.log(data.toString());
          });

          ffmpeg.stderr.on('data', (data) => {
            console.log(data.toString());
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
    const finalVideo = await generateVinyl(['./1.jpg', '2.jpg', './3.jpg', './4.jpg', './5.jpg', '6.jpg', '7.jpg', '8.jpg'], 'background.mp4', 'epic.mp3', 2, './outputs/final.mp4');
    console.log(`Find the final video at ${finalVideo}`);
  } catch (e) {
    console.log(e);
  }
};

start();
