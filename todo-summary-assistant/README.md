# Todo Summary Assistant

A full-stack application that allows users to create and manage personal to-do items, generate summaries of pending tasks using OpenAI, and send those summaries to a Slack channel.

## Features

- Create, edit, and delete to-do items
- Mark to-do items as completed or pending
- Generate AI-powered summaries of pending to-do items
- Send summaries to a Slack channel
- Responsive UI built with React and Tailwind CSS

## Tech Stack

- **Frontend**: React, Next.js, Tailwind CSS, shadcn/ui
- **Backend**: Node.js with Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **LLM Integration**: OpenAI API
- **Slack Integration**: Slack Incoming Webhooks

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Supabase account
- OpenAI API key
- Slack workspace with permission to create webhooks

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/todo-summary-assistant.git
   cd todo-summary-assistant
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   SLACK_WEBHOOK_URL=your_slack_webhook_url
   \`\`\`

4. Set up the Supabase database:
   - Create a new project in Supabase
   - Run the following SQL in the Supabase SQL editor to create the todos table:
   \`\`\`sql
   CREATE TABLE todos (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     completed BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   \`\`\`

5. Run the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Setting up Slack Webhook

1. Go to your Slack workspace and create a new app at [api.slack.com/apps](https://api.slack.com/apps)
2. Give your app a name and select your workspace
3. In the "Add features and functionality" section, click on "Incoming Webhooks"
4. Toggle "Activate Incoming Webhooks" to On
5. Click "Add New Webhook to Workspace"
6. Select the channel where you want to receive the todo summaries
7. Copy the Webhook URL and add it to your `.env.local` file as `SLACK_WEBHOOK_URL`

### Setting up OpenAI API

1. Create an account at [OpenAI](https://platform.openai.com/)
2. Navigate to the API section
3. Create an API key
4. Copy the API key and add it to your `.env.local` file as `OPENAI_API_KEY`

## Deployment

This application can be deployed to Vercel with minimal configuration:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Add the environment variables in the Vercel project settings
4. Deploy

## Architecture Decisions

### Frontend

- Used Next.js for both frontend and backend to simplify the development process
- Implemented a responsive UI using Tailwind CSS and shadcn/ui components
- Used React hooks for state management
- Added loading states and error handling for better user experience

### Backend

- Utilized Next.js API routes to create a RESTful API
- Implemented CRUD operations for todo management
- Created a dedicated endpoint for summarizing todos and sending to Slack

### Database

- Used Supabase (PostgreSQL) for data storage
- Designed a simple schema for todos with necessary fields

### LLM Integration

- Integrated with OpenAI's GPT-3.5 Turbo model for generating summaries
- Crafted a specific prompt to get meaningful and actionable summaries

### Slack Integration

- Used Slack's Incoming Webhooks for posting messages
- Formatted messages with blocks for better readability in Slack

## Future Improvements

- Add authentication to support multiple users
- Implement categories or tags for todos
- Add due dates and priority levels
- Create a mobile app version
- Add unit and integration tests
- Implement offline support with local storage

## License

MIT
