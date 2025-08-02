# SAGE: Secondary Academy Generator of Exercises ✨

A powerful web-based mathematical problem generator designed for educators and students. SAGE creates customized math problems with step-by-step solutions using AI, featuring advanced LaTeX rendering and an intuitive user interface.

## 🌟 Features

### 🎯 Core Functionality
- **AI-Powered Problem Generation**: Uses Google's Gemini API to create custom math problems
- **Multiple Difficulty Levels**: Easy, Medium, Hard, and Challenging options
- **Step-by-Step Solutions**: Detailed explanations for every problem
- **LaTeX Math Rendering**: Beautiful mathematical expressions using KaTeX
- **Export Functionality**: Download problems as text files

### 🚀 Advanced UX Features
- **Smart Input Assistance**: 
  - Autocomplete suggestions for 30+ common math topics
  - 12 clickable example topics organized by grade level
  - Difficulty descriptions with complexity explanations

- **Enhanced Navigation**:
  - Question navigation with prev/next buttons and counter
  - Keyboard shortcuts for power users (press `?` for help)
  - Arrow key navigation between questions

### 🎯 Personalization Features
- **Smart Recommendations**:
  - Recently used topics for quick access
  - AI-powered topic suggestions based on your history
  - Intelligent difficulty progression recommendations

- **Progress Tracking**:
  - Personal stats dashboard showing questions generated and topics explored
  - Usage history with timestamp tracking
  - Favorite topics identification and quick access

- **User Preferences**:
  - Automatic saving of preferred difficulty and topics
  - LocalStorage-based preference management
  - Question favorites and bookmarking system

- **Intelligent Error Handling**:
  - User-friendly error messages with actionable suggestions
  - Automatic retry mechanisms with progressive backoff
  - Network status monitoring with offline fallback questions

### 📱 Mobile-First Design
- **Touch-Optimized Interface**: Improved touch targets and responsive design
- **Pull-to-Refresh**: Swipe down to generate new questions
- **Mobile Keyboard Support**: Optimized input experience
- **Responsive Math Rendering**: Adapts to different screen sizes

### ⌨️ Keyboard Shortcuts
- `Ctrl + Enter`: Generate new questions
- `Ctrl + K`: Focus topic input field
- `Ctrl + E`: Export questions
- `← →`: Navigate between questions
- `1`, `2`, `3`: Show answers for specific questions
- `F5`: Regenerate questions
- `Escape`: Close dialogs and answers
- `?`: Show keyboard shortcuts help

### 🎨 Visual Enhancements
- **Animated Loading States**: Mathematical symbols (π, ∑, ∫, ∞) with progress bars
- **Dynamic Status Messages**: Real-time feedback during generation
- **Modern UI Design**: Dark theme with red accent colors
- **Smooth Animations**: Staggered question reveals and hover effects

## 🛠️ Technical Features

### Advanced Math Rendering
- **Intelligent LaTeX Processing**: Preserves text formatting while rendering math
- **Selective Math Detection**: Only processes actual mathematical content
- **Selective Line Break Processing**: Questions and answers display as single lines, while solutions preserve line breaks for readability
- **Fallback Mechanisms**: Graceful degradation when rendering fails
- **Caching System**: Optimized performance for repeated expressions

### Network & Performance
- **Offline Support**: Fallback questions when internet is unavailable
- **Progressive Enhancement**: Features work even with limited connectivity
- **Retry Mechanisms**: Automatic recovery from temporary failures
- **Optimized Loading**: Minimal resource usage and fast rendering

### Developer Features
- **Clean Architecture**: Modular JavaScript with clear separation of concerns
- **Security**: Input sanitization and XSS protection
- **Accessibility**: Full keyboard navigation and screen reader support
- **Error Logging**: Comprehensive debugging information

## 🚀 Getting Started

### Prerequisites
- A modern web browser with JavaScript enabled
- Internet connection for AI-generated problems
- Google Gemini API key

### Quick Start
1. **Get a Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key for the Generative Language API

2. **Open SAGE**:
   - Load `index.html` in your web browser
   - Enter your API key when prompted (stored locally)

3. **Generate Problems**:
   - Choose a math topic and grade level
   - Select difficulty level
   - Click "Generate Maths Questions!" or press `Ctrl + Enter`

### Example Topics
- "Linear equations for Grade 9"
- "Calculus derivatives for Form 6"
- "Trigonometry basics for Grade 10"
- "Quadratic functions for Form 4"

## 📝 Usage Guide

### Creating Problems
1. **Topic Selection**: Use autocomplete or click example topics
2. **Difficulty**: Choose from Easy to Challenging levels
3. **Generation**: Click generate or use keyboard shortcuts
4. **Navigation**: Use arrows or buttons to browse questions
5. **Solutions**: Click "Show Answer & Steps" for detailed explanations

### Advanced Features
- **Similar Questions**: Generate variations of existing problems
- **Export**: Download all questions as a formatted text file
- **Math View Toggle**: Switch between rendered and raw LaTeX
- **Offline Mode**: Continue using with sample questions when offline

### Keyboard Power User Tips
- Press `?` to see all available shortcuts
- Use `Ctrl + K` to quickly focus the input field
- Navigate questions with arrow keys for faster workflow
- Use number keys `1-3` to quickly reveal answers

## 🔧 Technical Implementation

### Architecture
- **Frontend**: Pure HTML/CSS/JavaScript (no frameworks)
- **Math Rendering**: KaTeX for LaTeX expression rendering
- **API**: Google Gemini for AI problem generation
- **Storage**: LocalStorage for API keys and preferences

### Key Technologies
- **KaTeX**: Mathematical notation rendering
- **Tailwind CSS**: Utility-first styling framework
- **Gemini API**: AI-powered content generation
- **Progressive Web App**: Modern web capabilities

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with ES6 support

## 🎯 Educational Applications

### For Teachers
- Create custom problem sets for any grade level
- Generate problems with consistent difficulty
- Export for use in worksheets or exams
- Save time on problem creation

### For Students
- Practice with step-by-step solutions
- Get similar problems for extra practice
- Learn mathematical notation and formatting
- Self-paced learning with immediate feedback

### For Tutors
- Generate problems on-demand during sessions
- Adjust difficulty based on student needs
- Provide detailed explanations for complex topics
- Maintain engagement with interactive features

## 🔒 Privacy & Security

- **Local Storage**: API keys stored only in your browser
- **No Data Transmission**: Personal information never sent to servers
- **Secure API Calls**: Direct communication with Google's secure endpoints
- **Input Sanitization**: Protection against malicious code injection

## 🆘 Troubleshooting

### Common Issues
- **API Errors**: Check your Gemini API key and quota
- **Math Not Rendering**: Ensure JavaScript is enabled
- **Network Issues**: Try offline mode or check connection
- **Mobile Issues**: Update to latest browser version

### Getting Help
- Check the keyboard shortcuts overlay (`?` key)
- Look for error messages with suggested solutions
- Use the retry buttons for temporary failures
- Verify API key permissions for Generative Language API

## 🚀 Future Enhancements

See `sage_todo_list.md` for planned Phase 4 features including:
- Preset customizable themes for users
- Advanced export formats (PDF with LaTeX)
- Animated mathematical backgrounds
- Enhanced accessibility features
- Usage streaks and milestones

## 📄 License

Copyright © 2025 MathConcept Secondary Academy. All Rights Reserved.

## 🤝 Contributing

This project was enhanced with AI assistance. For issues or suggestions, please create a GitHub issue.

---

**Powered by Google Gemini AI** • **Math Rendering by KaTeX** • **Built with Modern Web Standards**