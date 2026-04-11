const { Client } = require('@notionhq/client');
const config = require('./config');

const notion = new Client({
  auth: config.NOTION_API_KEY,
});

async function saveWorkoutProgram(userId, userName, workoutProgram) {
  try {
    // Check if Notion is configured
    if (!config.NOTION_API_KEY || config.NOTION_API_KEY === 'your_notion_api_key_here') {
      console.warn('Notion API key not configured, skipping save to Notion');
      return true; // Return success even if not configured
    }

    // Create a new page in the database
    const response = await notion.pages.create({
      parent: {
        database_id: config.NOTION_DATABASE_ID,
      },
      properties: {
        // Assuming your Notion database has these properties
        Name: {
          title: [
            {
              text: {
                content: `Программа для ${userName || `User ${userId}`}`,
              },
            },
          ],
        },
        // Add more properties as needed (date, user_id, etc.)
        UserID: {
          rich_text: [
            {
              text: {
                content: userId.toString(),
              },
            },
          ],
        },
        Date: {
          date: {
            start: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
          },
        },
      },
      children: [
        {
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [
              {
                text: {
                  content: 'Персональная программа тренировок',
                },
              },
            ],
          },
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                text: {
                  content: workoutProgram,
                },
              },
            ],
          },
        },
      ],
    });

    console.log('Program saved to Notion:', response.id);
    return true;

  } catch (error) {
    console.error('Error saving to Notion:', error);
    console.warn('Continuing without Notion save');
    return true; // Don't fail the whole process
  }
}

async function getProgramUrl(pageId) {
  try {
    // Notion API doesn't directly provide public URLs
    // You'll need to construct the URL manually or make the page public
    // This is a placeholder - you'll need to adjust based on your Notion setup
    const publicUrl = `https://notion.so/${config.NOTION_DATABASE_ID.replace(/-/g, '')}/${pageId.replace(/-/g, '')}`;

    return publicUrl;
  } catch (error) {
    console.error('Error getting program URL:', error);
    return null;
  }
}

module.exports = {
  saveWorkoutProgram,
  getProgramUrl
};
