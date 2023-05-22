export function calculateOverlayTimeRanges(videoDuration, interval, imageCount) {
    const timeRanges = [];
    let startTime = 0;
  
    for (let i = 0; i < videoDuration; i += interval) {
      const endTime = Math.min(startTime + interval, videoDuration);
      const imageIndex = Math.floor(startTime / interval) % imageCount;
      timeRanges.push({ start: startTime, end: endTime, index: imageIndex });
      startTime = endTime;
    }
  
    return timeRanges;
  }
  
    
  
  