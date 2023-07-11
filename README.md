# Vinyl Record Video Creator

The Vinyl Record Video Creator is a tool that generates vinyl record videos accompanied by music. It creates visually appealing videos by overlaying spinning vinyl record shapes with images onto a background video. The images are overlaid at specific time intervals, creating an engaging visual experience synchronized with the music.

## How It Works

The Vinyl Record Video Creator tool utilizes Node.js, ffmpeg, and ffprobe to generate the vinyl record videos. The core functionality is provided by the `generateVinyl()` function in the `vinylGenerator.js` file.

### `generateVinyl()` Function

The `generateVinyl()` function is responsible for generating the vinyl record video. It takes the following parameters:

- `images` (Array): An array of image file paths representing the images to be overlaid on the vinyl record shapes.
- `backgroundVideo` (String): The path to the background video file.
- `mp3` (String): The path to the mp3 audio file.
- `time` (Number): The time interval (in seconds) between each image overlay.
- `outputFile` (String): The path where the output video file will be saved.

The function performs the following steps to generate the vinyl record video:

1. Loads the images, background video, and mp3 audio file.
2. Creates vinyl record shapes from the images, resembling compact disks with the images drawn on them.
3. Overlays the vinyl record images onto the background video, making them spin like actual vinyl records.
4. Positions the images at `time` intervals apart, ensuring synchronization with the music.
5. Combines the audio with the video, making the final video as long as the audio.
6. If the images finish overlaying before the video ends, the process starts again from the first image, creating a seamless looping effect.
7. Saves the generated video to the specified `outputFile` path.

## Installation
To install and set up the Vinyl Record Video Creator tool, follow these steps:

1. Ensure that you have Node.js, ffmpeg, and ffprobe installed on your system.
2. Clone the repository using the following command:
   ```shell
   git clone https://github.com/amschel99/vinyl-video-creator.git

To install and set up the Vinyl Record Video Creator tool, follow these steps:

1. Ensure that you have Node.js, ffmpeg, and ffprobe installed on your system.
2. Clone the repository using the following command:
   ```shell
   git clone https://github.com/amschel99/vinyl-video-creator.git
   
cd vinyl-video-creator

npm install

To generate a vinyl record video using the Vinyl Record Video Creator tool, follow these steps:

Open the vinylGenerator.js file located in the cloned repository.
Locate the generateVinyl() function.
Customize the function call with your desired parameters. For example:

``` const finalVideo = await generateVinyl(['./1.jpg', '2.jpg', './3.jpg', './4.jpg', './5.jpg', '6.jpg', '7.jpg', '8.jpg'], 'background.mp4', 'epic.mp3', 2, './outputs/final.mp4');
```
The first parameter is an array of image file paths.
The second parameter is the path to the background video file.
The third parameter is the path to the mp3 audio file.
The fourth parameter is the time interval (in seconds) between each image overlay.
The fifth parameter is the output video file path.
To execute the tool and generate the vinyl record video, run the following command:
``` npm run dev ```


The generated video will be saved at the specified output file path.

