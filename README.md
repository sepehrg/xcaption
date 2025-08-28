# XCaption - Interactive YouTube Captions

A React TypeScript application that provides interactive YouTube video captions. Users can paste YouTube video URLs, view synchronized captions, and click on captions to navigate to specific moments in the video.

## Features

- 📺 **YouTube Video Integration**: Paste any YouTube URL to load videos
- 📝 **Interactive Captions**: Click on any caption to jump to that moment
- 🎯 **Real-time Highlighting**: Current caption is highlighted as the video plays
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **TypeScript**: Fully typed for better development experience
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository or navigate to the project directory:

```bash
cd xcaption
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

**Alternative:** Run frontend and backend separately:

```bash
# Terminal 1 - Backend API
npm run server

# Terminal 2 - Frontend React app
npm start
```

## Usage

1. **Enter YouTube URL**: Paste any YouTube video URL in the input field
2. **Load Video**: Click "Load Video" to fetch the video and **real captions**
3. **Watch & Interact**:
   - Play the video and watch **demo captions** highlight in real-time
   - Click on any caption to jump to that moment in the video
   - Scroll through captions to find specific content
   - **Note**: Currently shows demo captions due to YouTube restrictions

## Technical Implementation

### Architecture

- **React 18** with functional components and hooks
- **TypeScript** for type safety and better developer experience
- **react-youtube** for YouTube player integration
- **Custom caption service** for handling subtitle data

### Key Components

- `YouTubeInput`: Handles URL input and validation
- `YouTubePlayer`: Integrates YouTube player with time tracking
- `CaptionDisplay`: Shows interactive captions with highlighting
- `captionService`: Manages caption fetching and formatting

### Caption Integration

**⚠️ Important Update (August 2024):** YouTube has significantly restricted automated caption access.

**Current Status:**

- 📝 **Demo Mode**: Shows sample interactive captions to demonstrate functionality
- 🔧 **Technical Challenge**: YouTube's anti-scraping measures block most caption extraction methods
- 🎯 **Proof of Concept**: All interactive features work perfectly with demo data

**For Real Implementation:**

- 🔑 **YouTube Data API v3**: Requires API key and proper authentication
- 👥 **Manual Process**: Video owners can provide caption files
- 🏢 **Enterprise Solutions**: Use official YouTube APIs for production apps

## Available Scripts

- `npm start`: Runs the React app in development mode
- `npm run server`: Runs the backend API server on port 3001
- `npm run dev`: **Recommended** - Runs both frontend and backend simultaneously
- `npm build`: Builds the app for production
- `npm test`: Launches the test runner
- `npm eject`: Ejects from Create React App (not recommended)

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Future Enhancements

- Real YouTube caption API integration
- Multiple language support
- Caption search functionality
- Playback speed controls
- Caption export options
- Keyboard shortcuts

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.
