

import { createVinylCircle } from "./vinylcanvas.js"
import { cropCircleImage } from "./removeEdges.js"
import { resizeImage } from "./resize.js"
import {spawn, fork} from 'child_process'
import { overlayImages } from "./draw.js"
import createBlackHole from "./blackhole.js"
import {removeSquareEdges} from './removeSquare.js'
export const generateVinyl= async (imagePath,videoPath, secs,outputPath)=>{
  
    try{
async function resizeImageAsync() {
          try {
            const resizedPath = await resizeImage(imagePath,'./outputs/resize.png' );

       return resizedPath;
          } catch (error) {
            console.error('Error resizing image:', error);
            return null
          }
        }

       const resizeimageFinalPath=  await resizeImageAsync();
    const imageFinalPath=   await cropCircleImage(resizeimageFinalPath,'./outputs/1.png')
        await createVinylCircle('./outputs/canvas.png',700, 80, 110, 'black', 10)
      const circleFileNoHole=  await overlayImages('./outputs/canvas.png',imageFinalPath)

    const circleFileWithEdge=  await createBlackHole(circleFileNoHole,  40,circleFileNoHole);
   const circleFile= await removeSquareEdges(circleFileWithEdge,circleFileWithEdge)
   
    console.log(circleFile )
        function createVinylRecordEffect(imagePath,videoPath, secs, outputPath) {
            return new Promise((resolve, reject) => {
              const ffprobeAudio = spawn('ffprobe', [
                '-v', 'error',
                '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1',
                'epic.mp3'
              ]);
              
              ffprobeAudio.stdout.on('data', (data) => {
                const audioDuration = parseFloat(data.toString());
                const ffmpeg = spawn('ffmpeg', [
                  '-stream_loop', '-1', // Loop indefinitely
                  '-i', videoPath,
                  '-loop', '1',
                  '-i', circleFile,
                  '-i', 'epic.mp3',
                  '-filter_complex',
                  ` [0:v]format=yuv420p[v0];[1:v]rotate=t*33.333333333/10,format=yuv420p[v1];[v1]colorkey=0x000000:similarity=0.01[cout];[v0][cout]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2[v];[v]format=rgba[v2];[v2]colorchannelmixer=aa=0.7[v];
                    [2:a]volume=1.0[a]`, // Adjust the audio volume as needed
                  '-map', '[v]',
                  '-map', '[a]',
                  '-c:v', 'libx264',
                  '-preset', 'fast', // Adjust the preset as desired
                  '-crf', '23', // Adjust the CRF value as desired
                  '-b:v', '1000k', // Adjust the video bitrate as desired
                  '-pix_fmt', 'yuv420p',
                  '-t', audioDuration.toString(), // Set the output duration based on audio duration
                  '-y',
                  outputPath
                ]);
              
              
             
              
           
              
              
              
                ffmpeg.stdout.on('data', (data) => {
                  console.log(`stdout: ${data}`);
                });
                
                ffmpeg.stderr.on('data', (data) => {
                  console.error(`stderr: ${data}`);
                });
                
                ffmpeg.on('close', (code) => {
                  if (code === 0) {
                    console.log('Video processing complete');
                    resolve(outputPath);
                  } else {
                    console.error(`Video processing exited with code ${code}`);
                    reject(new Error(`Video processing exited with code ${code}`)); // Reject the Promise with an error
                  }
                });
              });
              
              
              
              
      
            });
          }
         const finalVideoPath= createVinylRecordEffect(imageFinalPath,videoPath, secs, outputPath)
  .then((outputPath) => {
    console.log('Vinyl record effect applied:', outputPath);
   return outputPath;
  })
  .catch((err) => {
    console.error('Error applying vinyl record effect:', err);
    return null;
   
  }); 
  return finalVideoPath;
    }
 
        catch(err){
console.error(err)
return err
    }
}
// use the function as shown below, you can export it to use it in other modules.
// the function returns the path to the generated video

const start= async()=>{
  try{
    const finalVideo=await generateVinyl("./2.jpg",'./example.mp4',10,'./outputs/final.mp4')
    console.log(`find it at ${finalVideo}`)
  }
  catch(e){
console.log(e)
  }
}
 start()