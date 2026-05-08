const fs = require('fs');
const path = require('path');

// Cache for video links
let videoCache = null;

/** JSON с путями к упражнениям — репозиторий: data/video-database.json */
const VIDEO_DB_PATH = path.join(__dirname, '..', '..', 'data', 'video-database.json');

async function loadVideoDatabase() {
  try {
    // Check cache first
    if (videoCache) {
      return videoCache;
    }

    if (fs.existsSync(VIDEO_DB_PATH)) {
      const videoData = fs.readFileSync(VIDEO_DB_PATH, 'utf8');
      videoCache = JSON.parse(videoData);
      console.log(`Loaded ${Object.keys(videoCache).length} video links from local database`);
      return videoCache;
    } else {
      console.warn('Video database file not found, using empty database');
      return {};
    }

  } catch (error) {
    console.error('Error loading video database:', error);
    return {};
  }
}

// Fallback database with common exercises
function getFallbackVideoDatabase() {
  return {
    'жим гантелей лежа': 'https://youtu.be/example1',
    'приседания': 'https://youtu.be/example2',
    'отжимания': 'https://youtu.be/example3',
    'подтягивания': 'https://youtu.be/example4',
    'планка': 'https://youtu.be/example5'
  };
}

function findVideoLinks(workoutProgram, videoDatabase) {
  const lines = workoutProgram.split('\n');
  const enhancedLines = [];

  for (const line of lines) {
    let enhancedLine = line;

    // Skip lines that are headers or sections
    const normalizedLine = line.toLowerCase().trim();
    if (normalizedLine.includes('разминка') ||
        normalizedLine.includes('заминка') ||
        normalizedLine.includes('программа') ||
        normalizedLine.includes('понедельник') ||
        normalizedLine.includes('вторник') ||
        normalizedLine.includes('среда') ||
        normalizedLine.includes('четверг') ||
        normalizedLine.includes('пятница') ||
        normalizedLine.includes('суббота') ||
        normalizedLine.includes('воскресенье') ||
        line.trim() === '' ||
        line.startsWith('**') ||
        line.startsWith('💪') ||
        line.startsWith('🏆')) {
      enhancedLines.push(enhancedLine);
      continue;
    }

    // Look for exercise names in the line
    for (const [exerciseName, videoUrl] of Object.entries(videoDatabase)) {
      // Check if the line contains exercise name (more flexible matching)
      if (normalizedLine.includes(exerciseName) ||
          // Check for partial matches (e.g., "жим гантелей" matches "жим гантелей лежа")
          exerciseName.split(' ').some(word =>
            word.length > 3 && normalizedLine.includes(word)
          )) {
        // Add video link after the exercise line
        enhancedLine += `\n📹 ${videoUrl}`;
        break; // Only add one video per line
      }
    }

    enhancedLines.push(enhancedLine);
  }

  return enhancedLines.join('\n');
}

async function enhanceProgramWithVideos(workoutProgram) {
  const videoDatabase = await loadVideoDatabase();
  return findVideoLinks(workoutProgram, videoDatabase);
}

module.exports = {
  loadVideoDatabase,
  enhanceProgramWithVideos,
  findVideoLinks
};
