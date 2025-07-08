# Woices - Voice Interaction Platform

A React-based voice interaction platform where users can post thoughts and receive 60-second voice responses. Built with Supabase for backend functionality.

## 🎯 Features Implemented

### Phase 1: Core Functionality ✅
- **Supabase Integration**: Complete database setup and API integration
- **Real Voice Recording**: Web Audio API implementation with 60-second recording limit
- **Audio Storage**: Automatic upload to Supabase Storage
- **Basic Playback**: Voice player with controls and progress tracking
- **Thought Management**: Create, store, and manage thoughts with tags
- **Responsive UI**: Mobile-optimized interface for all interactions

## 🛠️ Setup Instructions

### 1. Supabase Configuration
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Add environment variables to your deployment:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 2. Database Setup
1. Go to your Supabase SQL Editor
2. Copy and paste the contents of `src/lib/database-setup.sql`
3. Run the SQL commands to create tables, policies, and storage buckets

### 3. Testing Voice Recording
1. Grant microphone permissions when prompted
2. Test the recording functionality in a secure context (HTTPS)
3. Verify audio files are uploaded to Supabase Storage

## 📱 How to Use

### Post a Thought
1. Click "Write a thought or topic"
2. Enter your title, description, and optional tags
3. Submit to create a new thought

### Record a Voice Response
1. Click "Break the ice. Speak your Woice"
2. Select a thought to respond to
3. Record up to 60 seconds of audio
4. Send your voice response

### Playback Controls
- Play/Pause audio responses
- Scrub through timeline
- Restart from beginning
- View duration and current time

## 🔄 Next Features to Implement

The following phases are ready for implementation:

### Phase 2: AI Classification 🧠
- OpenAI integration for automatic response classification
- Categories: 🫧 Myth, 🎯 Fact, ❓ Unclear/Debated
- Smart content analysis and categorization

### Phase 3: Enhanced Mobile UI 📱
- Improved recording interface with waveform visualization
- Swipe gestures for Bloom/Brick actions
- Enhanced loading states and animations

### Phase 4: Feed System 🧭
- Explore tabs (🔥 Trending, 🧪 Science, 💭 Culture, 👻 Fun)
- Voice card components with audio snippets
- Filtering and sorting capabilities

### Phase 5: Advanced Features ⚡
- Real-time updates with WebSocket integration
- Auto-Brick/Bloom logic based on engagement
- Content moderation and privacy features

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn/ui** for components
- **Lucide React** for icons

### Backend Integration
- **Supabase** for database and authentication
- **Supabase Storage** for audio file management
- **Row Level Security** for data protection

### Voice Technology
- **Web Audio API** for recording
- **MediaRecorder API** for audio capture
- **WebM/MP3** format support with fallbacks

## 🎨 Design System

The app uses a custom color palette defined in the design system:
- **woices-violet**: Primary brand color for main actions
- **woices-mint**: Secondary color for complementary actions
- **woices-bloom**: Pink for positive interactions (blooming)
- **woices-brick**: Gray for negative interactions (bricking)
- **woices-sky**: Light blue for accent elements

## 🔐 Environment Variables

Required environment variables for production:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 Deployment

The app is ready to deploy to any static hosting platform:
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Ensure HTTPS is enabled for microphone access
4. Configure environment variables in your hosting platform

## 📞 Support

If you encounter any issues:
1. Check browser microphone permissions
2. Verify Supabase configuration
3. Ensure HTTPS is enabled for production
4. Check console logs for detailed error messages

---

## Original Project Info

**URL**: https://lovable.dev/projects/f9393319-fd03-49f8-becf-1d4ff6cb5322

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/f9393319-fd03-49f8-becf-1d4ff6cb5322) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/f9393319-fd03-49f8-becf-1d4ff6cb5322) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)