/**
 * Extract duration from an audio file
 */
export async function getAudioDuration(file: File | Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);
    
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(objectUrl);
      resolve(Math.floor(audio.duration));
    });
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load audio file'));
    });
    
    audio.src = objectUrl;
  });
}

/**
 * Validate audio file duration (max 60 seconds)
 */
export async function validateAudioDuration(file: File | Blob, maxDuration: number = 60): Promise<{ valid: boolean; duration: number; error?: string }> {
  try {
    const duration = await getAudioDuration(file);
    
    if (duration > maxDuration) {
      return {
        valid: false,
        duration,
        error: `Audio duration (${duration}s) exceeds maximum allowed duration (${maxDuration}s)`
      };
    }
    
    return {
      valid: true,
      duration
    };
  } catch (error) {
    return {
      valid: false,
      duration: 0,
      error: 'Failed to validate audio file'
    };
  }
}
