# StanzaStudio 🎭

A modern web application that generates Shakespearean-style poetry based on user prompts using [Markov Chain](https://en.wikipedia.org/wiki/Markov_chain) text generation.

## Features

- 🎨 **Elegant, Modern UI**
  - Responsive design for both desktop and mobile
  - Dark/light mode toggle with theme persistence
  - Dynamic logo animation and positioning
  - ChatGPT-style interface with infinite scroll

- 🤖 **Smart Text Generation**
  - Local text generation using Markov Chain algorithms
  - Contextually relevant output based on user prompts
  - Multi-word prompt support with thematic coherence
  - Proportional output length based on input complexity

- 📱 **Mobile-First Experience**
  - Optimized for touch interfaces
  - Adaptive layout for different screen sizes
  - Smart keyboard handling
  - Compact navigation on smaller screens

- 📋 **User Convenience**
  - One-click copy to clipboard functionality
  - Clear visual separation between responses
  - Smooth animations and transitions
  - Persistent theme preferences

## Technical Implementation

### Core Components

1. **Markov Chain Text Generation**
   - Implements a bigram-based Markov Chain for text generation
   - Uses Shakespeare's works as the training corpus
   - Features smart word selection based on prompt relevance
   - Includes frequency analysis for natural language flow

2. **Prompt Processing**
   ```javascript
   // Processes multi-word prompts with relevance scoring
   findRelevantWords(prompt) {
     // Splits and cleans prompt words
     // Calculates word relevance scores
     // Considers semantic similarity
     // Weights by word frequency
   }
   ```

3. **Dynamic Output Scaling**
   - Base output of 3-5 lines for single-word prompts
   - +3 lines for each additional prompt word
   - Maximum cap of 20 lines
   - Approximately 6 words per line

### UI/UX Design

1. **Responsive Layout**
   - CSS Grid and Flexbox for fluid layouts
   - Mobile-first design principles
   - Dynamic viewport adjustments
   - Smooth transitions between states

2. **Theme Management**
   ```javascript
   // Theme persistence using localStorage
   const theme = localStorage.getItem('theme') || 'dark';
   document.documentElement.setAttribute('data-theme', theme);
   ```

3. **Dynamic Logo Behavior**
   - Centered on page load
   - Transitions to top-left after first interaction
   - Adapts size and position for mobile keyboards
   - Smooth animation transitions

### Text Processing

1. **Word Selection Algorithm**
   - Relevance scoring based on:
     - Direct substring matches
     - Letter pattern similarity
     - Word frequency analysis
     - Capitalization patterns

2. **Output Formatting**
   ```javascript
   formatOutput(text) {
     // Formats text into poetic lines
     // Maintains natural sentence breaks
     // Balances line lengths
     // Preserves punctuation
   }
   ```

## Project Structure

```
StanzaStudio/
├── index.html      # Main application entry
├── styles.css      # Styling and themes
├── script.js       # Core application logic
└── corpus/
    └── shakespeare.txt  # Training corpus
```

## Technical Requirements

- Modern web browser with JavaScript enabled
- No external dependencies or API keys required
- Works entirely client-side
- Responsive design breakpoint at 768px

## Future Enhancements

- Enhanced text analysis for better theme coherence
- Additional corpus options
- Export functionality in various formats
- Social sharing capabilities
- User history and favorites
