class MarkovChain {
    constructor() {
        this.chain = new Map();
        this.startWords = [];
        this.wordFrequency = new Map(); // Track word frequencies
    }

    addPair(word1, word2) {
        if (!this.chain.has(word1)) {
            this.chain.set(word1, []);
        }
        this.chain.get(word1).push(word2);

        // Update word frequency
        this.wordFrequency.set(word1, (this.wordFrequency.get(word1) || 0) + 1);
        this.wordFrequency.set(word2, (this.wordFrequency.get(word2) || 0) + 1);
    }

    train(text) {
        const words = text.split(/\s+/).filter(word => word.length > 0);
        this.startWords = words.filter(word => /^[A-Z]/.test(word)); // Words that start with capital letters

        for (let i = 0; i < words.length - 1; i++) {
            this.addPair(words[i], words[i + 1]);
        }
    }

    findRelevantWords(prompt) {
        // Split prompt into individual words and clean them
        const promptWords = prompt.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2) // Ignore very short words
            .map(word => word.replace(/[^\w\s]/g, '')); // Remove punctuation

        // Find words in our chain that contain any of the prompt words
        const relevantWords = new Map(); // word -> relevance score

        for (const [word] of this.chain) {
            const wordLower = word.toLowerCase();
            let score = 0;

            // Calculate relevance score based on prompt words
            for (const promptWord of promptWords) {
                if (wordLower.includes(promptWord)) {
                    score += 2; // Direct substring match
                } else {
                    // Check for semantic similarity (common letters)
                    const commonLetters = [...new Set(wordLower)].filter(letter => 
                        promptWord.includes(letter)
                    ).length;
                    score += commonLetters / promptWord.length;
                }
            }

            if (score > 0) {
                // Adjust score based on word frequency (favor less common words)
                const frequency = this.wordFrequency.get(word) || 1;
                score = score * (1 + Math.log(1 / frequency));
                
                relevantWords.set(word, score);
            }
        }

        return Array.from(relevantWords.entries())
            .sort((a, b) => b[1] - a[1]) // Sort by score
            .map(([word]) => word); // Return just the words
    }

    findStartWord(prompt) {
        const relevantWords = this.findRelevantWords(prompt);
        
        // First try to find a relevant capitalized word
        const capitalizedStart = relevantWords.find(word => 
            /^[A-Z]/.test(word) && this.chain.has(word)
        );
        if (capitalizedStart) return capitalizedStart;

        // Then try any relevant word
        const anyRelevantWord = relevantWords.find(word => 
            this.chain.has(word)
        );
        if (anyRelevantWord) return anyRelevantWord;

        // Fall back to a random capitalized word
        return this.startWords[Math.floor(Math.random() * this.startWords.length)];
    }

    generate(prompt, minLinesPerWord = 3, maxLinesPerWord = 5, maxTotalLines = 20) {
        if (this.chain.size === 0) return '';

        // Calculate target number of lines based on prompt length
        const promptWords = prompt.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2)
            .map(word => word.replace(/[^\w\s]/g, ''));
        
        const baseLines = Math.floor(Math.random() * (maxLinesPerWord - minLinesPerWord + 1)) + minLinesPerWord;
        const additionalLines = Math.max(0, promptWords.length - 1) * 3;
        const targetLines = Math.min(baseLines + additionalLines, maxTotalLines);

        const relevantWords = this.findRelevantWords(prompt);
        let currentWord = this.findStartWord(prompt);
        const result = [currentWord];
        const relevantWordSet = new Set(relevantWords.slice(0, 10)); // Top 10 relevant words

        // Estimate words needed based on target lines (assuming ~6 words per line)
        const targetWords = targetLines * 6;

        while (result.length < targetWords) {
            let nextWords = this.chain.get(currentWord);
            
            if (!nextWords || nextWords.length === 0) {
                // If we're stuck, prefer jumping to a relevant word
                currentWord = relevantWords.length > 0 && Math.random() < 0.3 ?
                    relevantWords[Math.floor(Math.random() * Math.min(5, relevantWords.length))] :
                    this.startWords[Math.floor(Math.random() * this.startWords.length)];
            } else {
                // Bias towards relevant words when available
                if (relevantWordSet.size > 0 && Math.random() < 0.2) {
                    const relevantNextWords = nextWords.filter(word => relevantWordSet.has(word));
                    if (relevantNextWords.length > 0) {
                        nextWords = relevantNextWords;
                    }
                }
                currentWord = nextWords[Math.floor(Math.random() * nextWords.length)];
            }
            
            result.push(currentWord);
        }

        // Format and trim to exact number of lines
        const formattedLines = this.formatOutput(result.join(' ')).split('\n');
        return formattedLines.slice(0, targetLines).join('\n');
    }

    formatOutput(text) {
        // Add some basic formatting to make it more poetic
        const sentences = text.split(/([.!?]+\s+)/).filter(s => s.trim().length > 0);
        const lines = [];
        let currentLine = [];
        let wordCount = 0;

        for (const sentence of sentences) {
            const words = sentence.split(' ');
            for (const word of words) {
                currentLine.push(word);
                wordCount++;

                if (wordCount >= 8 || /[.!?]$/.test(word)) {
                    lines.push(currentLine.join(' '));
                    currentLine = [];
                    wordCount = 0;
                }
            }
        }

        if (currentLine.length > 0) {
            lines.push(currentLine.join(' '));
        }

        return lines.join('\n');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('promptForm');
    const input = document.getElementById('userInput');
    const submitButton = document.getElementById('submitButton');
    const chatContainer = document.getElementById('chatContainer');
    const themeToggle = document.getElementById('themeToggle');
    const logo = document.getElementById('logo');
    const markov = new MarkovChain();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Load and train the Markov chain
    try {
        const response = await fetch('corpus/shakespeare.txt');
        const text = await response.text();
        markov.train(text);
    } catch (error) {
        console.error('Error loading corpus:', error);
    }

    // Theme handling
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Handle mobile keyboard and scrolling
    if (isMobile) {
        input.addEventListener('focus', () => {
            logo.classList.add('keyboard-visible');
            // Delay scroll to ensure keyboard is fully shown
            setTimeout(() => {
                const lastPoem = chatContainer.lastElementChild;
                if (lastPoem) {
                    lastPoem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);
        });

        input.addEventListener('blur', () => {
            logo.classList.remove('keyboard-visible');
        });

        // Handle orientation changes and resize events
        window.addEventListener('resize', () => {
            if (document.activeElement === input) {
                logo.classList.add('keyboard-visible');
            }
        });
    }

    // Handle Enter key on desktop
    input.addEventListener('keydown', (e) => {
        if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmission();
        }
    });

    // Handle button click
    submitButton.addEventListener('click', () => {
        handleSubmission();
    });

    // Auto-resize textarea as user types
    input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Handle submission
    async function handleSubmission() {
        const prompt = input.value.trim();
        if (!prompt) return;

        // Move logo to top-left if it's the first submission
        if (chatContainer.children.length === 0) {
            logo.classList.remove('centered');
            logo.classList.add('top-left');
        }

        // Clear input and reset height
        input.value = '';
        input.style.height = 'auto';

        try {
            const generatedText = markov.generate(prompt);
            await createPoemCard(prompt, generatedText);
            
            // Scroll to the new poem with a delay to ensure it's rendered
            setTimeout(() => {
                const lastPoem = chatContainer.lastElementChild;
                if (lastPoem) {
                    lastPoem.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: isMobile ? 'center' : 'end'
                    });
                }
            }, 100);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function createPoemCard(prompt, poemText) {
        const card = document.createElement('div');
        card.className = 'poem-card';
        
        const poemContent = document.createElement('div');
        poemContent.className = 'poem-content';
        poemContent.textContent = poemText;
        
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy to Clipboard';
        copyButton.onclick = () => {
            navigator.clipboard.writeText(poemText)
                .then(() => {
                    const originalText = copyButton.textContent;
                    copyButton.textContent = 'Copied!';
                    setTimeout(() => {
                        copyButton.textContent = originalText;
                    }, 2000);
                })
                .catch(err => console.error('Failed to copy:', err));
        };
        
        card.appendChild(poemContent);
        card.appendChild(copyButton);
        chatContainer.appendChild(card);
    }
});
