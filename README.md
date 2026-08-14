# XCaption - Interactive YouTube Captions

A React TypeScript application that provides interactive YouTube video captions. Users can paste YouTube video URLs, view synchronized captions, and click on captions to navigate to specific moments in the video.

## Features

- 📺 **YouTube Video Integration**: Paste any YouTube URL to load videos
- 📝 **Interactive Captions**: Click on any caption to jump to that moment
- 🎯 **Real-time Highlighting**: Current caption is highlighted as the video plays
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🌙 **Dark/Light Theme**: Toggle between dark and light themes
- 📤 **Manual Caption Upload**: Upload SRT/VTT files for any video
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
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Usage

1. **Enter YouTube URL**: Paste any YouTube video URL in the input field
2. **Load Video**: Click "Load Video" to load the video player
3. **Upload Captions**: Use the "Upload Caption File" button to upload SRT/VTT files
4. **Watch & Interact**:
   - Play the video and watch captions highlight in real-time
   - Click on any caption to jump to that moment in the video
   - Scroll through captions to find specific content
   - Toggle between dark and light themes using the switch in the top-right corner

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
- `CaptionUpload`: Handles manual caption file uploads
- `ThemeToggle`: Dark/light theme switching
- `ThemeContext`: Global theme state management
- `captionService`: Manages caption parsing and formatting

## Available Scripts

- `npm start`: Runs the React app in development mode
- `npm run build`: Builds the app for production
- `npm run deploy`: Deploys the app to GitHub Pages
- `npm test`: Launches the test runner
- `npm run eject`: Ejects from Create React App (not recommended)

## Deployment

To deploy the app to GitHub Pages:

```bash
npm run deploy
```

This will build the app and deploy it to the `gh-pages` branch of your repository.

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Future Enhancements

- Automatic YouTube caption extraction
- Multiple language support
- Caption search functionality
- Playback speed controls
- Caption export options
- Keyboard shortcuts
- Caption synchronization tools

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.
