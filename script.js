/**
 * Letter Tracer - HTML/CSS/JavaScript Implementation
 * Based on Go/Ebiten original implementation
 * Educational letter tracing app using Montessori sandpaper letters methodology
 */

class LetterTracer {
    constructor() {
        // Constants matching Go implementation
        this.SCREEN_WIDTH = 360;
        this.SCREEN_HEIGHT = 640;
        this.POINTER_OFFSET = 23;
        this.POINTER_SIZE = 46;
        this.ANIMATION_DURATION = 3200;
        
        // Canvas and contexts
        this.canvas = null;
        this.ctx = null;
        
        // Images
        this.brushImage = null;
        this.canvasImage = null;
        this.letterOverlay = null;
        this.pointerImage = null;
        this.letterImages = [];
        
        // Audio
        this.audioContext = null;
        this.drawSound = null;
        this.letterSounds = [];
        this.currentLetterSound = null;
        
        // Game state
        this.count = 0;
        this.currentLetter = 0;
        this.letterJustLoaded = true;
        this.animationTimer = 0;
        this.transitioning = false;
        this.letterPixels = [];
        
        // Input state
        this.mouseX = 0;
        this.mouseY = 0;
        this.isDrawing = false;
        
        // Letter paths for asset loading
        this.letters = [
            './assets/img/a.png', './assets/img/b.png', './assets/img/c.png',
            './assets/img/d.png', './assets/img/e.png', './assets/img/f.png',
            './assets/img/g.png', './assets/img/h.png', './assets/img/i.png',
            './assets/img/j.png', './assets/img/k.png', './assets/img/l.png',
            './assets/img/m.png', './assets/img/n.png', './assets/img/o.png',
            './assets/img/p.png', './assets/img/q.png', './assets/img/r.png',
            './assets/img/s.png', './assets/img/t.png', './assets/img/u.png',
            './assets/img/v.png', './assets/img/w.png', './assets/img/x.png',
            './assets/img/y.png', './assets/img/z.png'
        ];
        
        // Audio paths
        this.audioFiles = [
            './assets/audio/letters/a.mp3', './assets/audio/letters/b.mp3',
            './assets/audio/letters/c.mp3', './assets/audio/letters/d.mp3',
            './assets/audio/letters/e.mp3', './assets/audio/letters/f.mp3',
            './assets/audio/letters/g.mp3', './assets/audio/letters/h.mp3',
            './assets/audio/letters/i.mp3', './assets/audio/letters/j.mp3',
            './assets/audio/letters/k.mp3', './assets/audio/letters/l.mp3',
            './assets/audio/letters/m.mp3', './assets/audio/letters/n.mp3',
            './assets/audio/letters/o.mp3', './assets/audio/letters/p.mp3',
            './assets/audio/letters/q.mp3', './assets/audio/letters/r.mp3',
            './assets/audio/letters/s.mp3', './assets/audio/letters/t.mp3',
            './assets/audio/letters/u.mp3', './assets/audio/letters/v.mp3',
            './assets/audio/letters/w.mp3', './assets/audio/letters/x.mp3',
            './assets/audio/letters/y.mp3', './assets/audio/letters/z.mp3'
        ];
        
        // Assets loading
        this.assetsLoaded = 0;
        this.totalAssets = 0;
        
        // Game started flag
        this.gameStarted = false;
        
        // Debug mode disabled for production
        this.debugMode = false;
        
        // Canvas layers for rendering
        this.backgroundCanvas = null;
        this.drawingCanvas = null;
        this.letterCanvas = null;
        this.pointerCanvas = null;
        this.animationCanvas = null;
        this.debugCanvas = null;
        
        // Pixel perfect collision detection
        this.letterImageData = null;
    }

    async init() {
        try {
            console.log('Initializing Letter Tracer...');
            console.log('Browser info:', {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language
            });
            
            // Show start screen first
            this.showStartScreen();
            console.log('Start screen displayed successfully');
            
        } catch (error) {
            console.error('Failed to initialize Letter Tracer:', error);
            throw new Error(`Initialization failed: ${error.message}`);
        }
    }

    showStartScreen() {
        const startScreen = document.getElementById('startScreen');
        const startButton = document.getElementById('startButton');
        
        if (startScreen) {
            startScreen.style.display = 'flex';
        }
        
        if (startButton) {
            startButton.addEventListener('click', () => this.showAlphabetScreen());
        }
    }

    showAlphabetScreen() {
        // Hide start screen
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            startScreen.style.display = 'none';
        }
        
        // Show alphabet screen
        const alphabetScreen = document.getElementById('alphabetScreen');
        if (alphabetScreen) {
            alphabetScreen.style.display = 'flex';
        }
        
        // Generate alphabet grid
        this.generateAlphabetGrid();
        
        // Setup event listeners
        this.setupAlphabetControls();
    }

    generateAlphabetGrid() {
        const alphabetGrid = document.getElementById('alphabetGrid');
        if (!alphabetGrid) return;
        
        // Clear existing content
        alphabetGrid.innerHTML = '';
        
        // Generate buttons for A-Z
        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(65 + i); // A-Z
            const button = document.createElement('button');
            button.className = 'letter-button';
            button.textContent = letter;
            button.setAttribute('data-letter-index', i);
            
            // Add click event listener
            button.addEventListener('click', () => this.selectLetter(i));
            
            alphabetGrid.appendChild(button);
        }
        
        console.log('Generated alphabet grid with 26 letters');
    }

    setupAlphabetControls() {
        const randomBtn = document.getElementById('randomLetterBtn');
        const backBtn = document.getElementById('backToStartBtn');
        
        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                const randomIndex = Math.floor(Math.random() * 26);
                this.selectLetter(randomIndex);
            });
        }
        
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.backToStartScreen();
            });
        }
    }

    selectLetter(letterIndex) {
        console.log(`Selected letter: ${String.fromCharCode(65 + letterIndex)}`);
        
        // Set the selected letter
        this.currentLetter = letterIndex;
        
        // Start the game with selected letter
        this.startGameWithLetter(letterIndex);
    }

    backToStartScreen() {
        // Hide alphabet screen
        const alphabetScreen = document.getElementById('alphabetScreen');
        if (alphabetScreen) {
            alphabetScreen.style.display = 'none';
        }
        
        // Show start screen
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            startScreen.style.display = 'flex';
        }
    }

    async startGameWithLetter(letterIndex) {
        try {
            // Hide alphabet screen
            const alphabetScreen = document.getElementById('alphabetScreen');
            if (alphabetScreen) {
                alphabetScreen.style.display = 'none';
            }
            
            // Show loading
            const loadingElement = document.getElementById('loading');
            if (loadingElement) {
                loadingElement.style.display = 'flex';
            }
            
            console.log(`Starting game with letter: ${String.fromCharCode(65 + letterIndex)}`);
            
            // Get canvas and setup
            this.canvas = document.getElementById('gameCanvas');
            if (!this.canvas) {
                throw new Error('Canvas element not found');
            }
            
            this.ctx = this.canvas.getContext('2d');
            
            // Create additional canvases for layers
            this.createCanvasLayers();
            
            // Setup input handlers
            this.setupInputHandlers();
            
            // Initialize audio context (user interaction allows this)
            this.initAudioContext();
            
            // Load all assets
            await this.loadAssets();
            
            // Verify we have at least some letter images
            if (this.letterImages.length === 0) {
                throw new Error('No letter images loaded');
            }
            
            // Load the specific selected letter
            this.loadSpecificLetter(letterIndex);
            
            // Hide loading, show canvas
            if (loadingElement) loadingElement.style.display = 'none';
            this.canvas.style.display = 'block';
            
            const instructionsElement = document.getElementById('instructions');
            if (instructionsElement) instructionsElement.style.display = 'block';
            
            const navigationToolbar = document.getElementById('navigationToolbar');
            if (navigationToolbar) navigationToolbar.style.display = 'flex';
            
            console.log('Letter Tracer initialized successfully!');
            console.log(`Loaded ${this.letterImages.length} letter images`);
            
            // Mark game as started
            this.gameStarted = true;
            
            // Start game loop
            this.gameLoop();
            
        } catch (error) {
            console.error('Failed to start game:', error);
            // Show error message
            const loadingElement = document.getElementById('loading');
            if (loadingElement) {
                loadingElement.innerHTML = `<div class="loading-text">Error: ${error.message}</div>`;
            }
        }
    }

    loadSpecificLetter(letterIndex) {
        this.currentLetter = letterIndex;
        this.letterOverlay = this.letterImages[this.currentLetter];
        
        console.log(`Loading specific letter: ${String.fromCharCode(97 + letterIndex).toUpperCase()}`);
        
        // Ensure letterOverlay exists
        if (!this.letterOverlay) {
            console.error(`Letter image not found for index ${this.currentLetter}`);
            return;
        }
        
        // Reset canvas to fresh sandpaper texture
        const bgCtx = this.backgroundCanvas.getContext('2d');
        bgCtx.clearRect(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
        if (this.canvasImage) {
            bgCtx.drawImage(this.canvasImage, 0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
        }
        
        // Clear drawing canvas
        const drawCtx = this.drawingCanvas.getContext('2d');
        drawCtx.clearRect(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
        
        // Clear animation canvas
        const animCtx = this.animationCanvas.getContext('2d');
        animCtx.clearRect(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
        
        // Setup letter for collision detection
        this.setupLetterCollisionData();
        
        // Get pixels in letter
        this.letterPixels = this.getPixelsInLetter();
        
        // Play letter pronunciation
        this.playLetterSound();
        
        // Update the current letter display
        this.updateCurrentLetterDisplay();
        
        this.letterJustLoaded = true;
        
        console.log(`Successfully loaded specific letter: ${String.fromCharCode(97 + this.currentLetter).toUpperCase()}, pixels: ${this.letterPixels.length}`);
    }

    returnToAlphabetSelection() {
        // Stop game
        this.gameStarted = false;
        
        // Hide canvas, instructions, and toolbar
        this.canvas.style.display = 'none';
        const instructionsElement = document.getElementById('instructions');
        if (instructionsElement) instructionsElement.style.display = 'none';
        
        const navigationToolbar = document.getElementById('navigationToolbar');
        if (navigationToolbar) navigationToolbar.style.display = 'none';
        
        // Show alphabet screen
        const alphabetScreen = document.getElementById('alphabetScreen');
        if (alphabetScreen) {
            alphabetScreen.style.display = 'flex';
        }
        
        console.log('Returned to alphabet selection screen');
    }

    skipToNextLetter() {
        console.log('Manually skipping to next letter');
        this.transitioning = false;
        this.animationTimer = 0;
        this.loadNextLetter();
    }
    
    skipToPreviousLetter() {
        console.log('Manually skipping to previous letter');
        this.currentLetter = (this.currentLetter - 1 + this.letters.length) % this.letters.length;
        this.letterOverlay = this.letterImages[this.currentLetter];
        
        console.log(`Loading previous letter: ${String.fromCharCode(97 + this.currentLetter).toUpperCase()}`);
        
        // Reset canvas and reload letter
        this.resetCanvasForNewLetter();
        this.setupLetterCollisionData();
        this.letterPixels = this.getPixelsInLetter();
        
        this.playLetterSound();
        this.updateCurrentLetterDisplay();
        this.letterJustLoaded = true;
        
        console.log(`Successfully loaded previous letter: ${String.fromCharCode(97 + this.currentLetter).toUpperCase()}, pixels: ${this.letterPixels.length}`);
    }
    
    updateCurrentLetterDisplay() {
        const currentLetterText = document.getElementById('currentLetterText');
        if (currentLetterText) {
            currentLetterText.textContent = String.fromCharCode(65 + this.currentLetter); // A-Z
        }
    }
    
    resetCanvasForNewLetter() {
        // Reset canvas to fresh sandpaper texture
        const bgCtx = this.backgroundCanvas.getContext('2d');
        bgCtx.clearRect(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
        if (this.canvasImage) {
            bgCtx.drawImage(this.canvasImage, 0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
        }
        
        // Clear drawing canvas
        const drawCtx = this.drawingCanvas.getContext('2d');
        drawCtx.clearRect(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
        
        // Clear animation canvas
        const animCtx = this.animationCanvas.getContext('2d');
        animCtx.clearRect(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
    }

    createCanvasLayers() {
        // Create off-screen canvases for different layers
        this.backgroundCanvas = document.createElement('canvas');
        this.backgroundCanvas.width = this.SCREEN_WIDTH;
        this.backgroundCanvas.height = this.SCREEN_HEIGHT;
        
        this.drawingCanvas = document.createElement('canvas');
        this.drawingCanvas.width = this.SCREEN_WIDTH;
        this.drawingCanvas.height = this.SCREEN_HEIGHT;
        
        this.letterCanvas = document.createElement('canvas');
        this.letterCanvas.width = this.SCREEN_WIDTH;
        this.letterCanvas.height = this.SCREEN_HEIGHT;
        
        this.pointerCanvas = document.createElement('canvas');
        this.pointerCanvas.width = this.SCREEN_WIDTH;
        this.pointerCanvas.height = this.SCREEN_HEIGHT;
        
        this.animationCanvas = document.createElement('canvas');
        this.animationCanvas.width = this.SCREEN_WIDTH;
        this.animationCanvas.height = this.SCREEN_HEIGHT;
    }

    initAudioContext() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Resume audio context immediately since we have user interaction
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    console.log('Audio context resumed successfully');
                }).catch(e => {
                    console.warn('Failed to resume audio context:', e);
                });
            }
            
            console.log('Audio context initialized:', this.audioContext.state);
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    async loadAssets() {
        console.log('Loading assets...');
        
        // Calculate total assets
        this.totalAssets = this.letters.length + this.audioFiles.length + 4; // +4 for brush, pointer, sandpaper, pencil sound
        
        // Load brush image
        this.brushImage = await this.loadImage('./assets/img/brush.png');
        this.updateLoadingProgress();
        
        // Load pointer image  
        this.pointerImage = await this.loadImage('./assets/img/pointer.png');
        this.updateLoadingProgress();
        
        // Load sandpaper background
        this.canvasImage = await this.loadImage('./assets/img/sandpaper.jpg');
        this.updateLoadingProgress();
        
        // Load letter images
        for (let i = 0; i < this.letters.length; i++) {
            const img = await this.loadImage(this.letters[i]);
            this.letterImages[i] = img;
            this.updateLoadingProgress();
        }
        
        // Load pencil drawing sound
        if (this.audioContext) {
            try {
                this.drawSound = await this.loadAudio('./assets/audio/pencil.mp3');
                this.updateLoadingProgress();
            } catch (e) {
                console.warn('Could not load pencil sound:', e);
                this.updateLoadingProgress();
            }
            
            // Load letter sounds
            for (let i = 0; i < this.audioFiles.length; i++) {
                try {
                    const sound = await this.loadAudio(this.audioFiles[i]);
                    this.letterSounds[i] = sound;
                    this.updateLoadingProgress();
                } catch (e) {
                    console.warn(`Could not load letter sound ${i}:`, e);
                    this.updateLoadingProgress();
                }
            }
        } else {
            // Skip audio loading if no audio context
            this.assetsLoaded += this.audioFiles.length + 1;
            this.updateLoadingProgress();
        }
        
        console.log('All assets loaded!');
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    async loadAudio(src) {
        try {
            const response = await fetch(src);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            return audioBuffer;
        } catch (error) {
            console.warn(`Failed to load audio: ${src}`, error);
            return null;
        }
    }

    updateLoadingProgress() {
        this.assetsLoaded++;
        const progress = (this.assetsLoaded / this.totalAssets) * 100;
        const progressBar = document.querySelector('.loading-progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    setupInputHandlers() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Setup choose letter button if it exists
        const chooseLetterBtn = document.getElementById('chooseLetterBtn');
        if (chooseLetterBtn) {
            chooseLetterBtn.addEventListener('click', () => this.returnToAlphabetSelection());
        }
        
        // Setup next letter button
        const nextLetterBtn = document.getElementById('nextLetterBtn');
        if (nextLetterBtn) {
            nextLetterBtn.addEventListener('click', () => this.skipToNextLetter());
        }
        
        // Setup previous letter button
        const prevLetterBtn = document.getElementById('prevLetterBtn');
        if (prevLetterBtn) {
            prevLetterBtn.addEventListener('click', () => this.skipToPreviousLetter());
        }
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.SCREEN_WIDTH / rect.width;
        const scaleY = this.SCREEN_HEIGHT / rect.height;
        
        this.mouseX = (e.clientX - rect.left) * scaleX;
        this.mouseY = (e.clientY - rect.top) * scaleY;
        this.isDrawing = true;
        
        this.paint(this.mouseX, this.mouseY);
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.SCREEN_WIDTH / rect.width;
        const scaleY = this.SCREEN_HEIGHT / rect.height;
        
        this.mouseX = (e.clientX - rect.left) * scaleX;
        this.mouseY = (e.clientY - rect.top) * scaleY;
        
        if (this.isDrawing) {
            this.paint(this.mouseX, this.mouseY);
        }
    }

    handleMouseUp(e) {
        this.isDrawing = false;
        this.stopDrawSound();
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.SCREEN_WIDTH / rect.width;
        const scaleY = this.SCREEN_HEIGHT / rect.height;
        
        this.mouseX = (touch.clientX - rect.left) * scaleX;
        this.mouseY = (touch.clientY - rect.top) * scaleY;
        this.isDrawing = true;
        
        this.paint(this.mouseX, this.mouseY);
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.SCREEN_WIDTH / rect.width;
        const scaleY = this.SCREEN_HEIGHT / rect.height;
        
        this.mouseX = (touch.clientX - rect.left) * scaleX;
        this.mouseY = (touch.clientY - rect.top) * scaleY;
        
        if (this.isDrawing) {
            this.paint(this.mouseX, this.mouseY);
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.isDrawing = false;
        this.stopDrawSound();
    }

    loadNextLetter() {
        const previousLetter = this.currentLetter;
        // Move to next letter in alphabetical order (A→B→C...→Z→A)
        this.currentLetter = (this.currentLetter + 1) % this.letters.length;
        this.letterOverlay = this.letterImages[this.currentLetter];
        
        console.log(`Loading next letter: ${String.fromCharCode(97 + this.currentLetter).toUpperCase()} (previous: ${String.fromCharCode(97 + previousLetter).toUpperCase()})`);
        
        // Ensure letterOverlay exists
        if (!this.letterOverlay) {
            console.error(`Letter image not found for index ${this.currentLetter}`);
            return;
        }
        
        // Reset canvas to fresh sandpaper texture
        const bgCtx = this.backgroundCanvas.getContext('2d');
        bgCtx.clearRect(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
        if (this.canvasImage) {
            bgCtx.drawImage(this.canvasImage, 0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
        }
        
        // Clear drawing canvas
        const drawCtx = this.drawingCanvas.getContext('2d');
        drawCtx.clearRect(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
        
        // Clear animation canvas
        const animCtx = this.animationCanvas.getContext('2d');
        animCtx.clearRect(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
        
        // Setup letter for collision detection
        this.setupLetterCollisionData();
        
        // Get pixels in letter
        this.letterPixels = this.getPixelsInLetter();
        
        // Play letter pronunciation
        this.playLetterSound();
        
        // Update the current letter display
        this.updateCurrentLetterDisplay();
        
        this.letterJustLoaded = true;
        
        console.log(`Successfully loaded next letter: ${String.fromCharCode(97 + this.currentLetter).toUpperCase()}, pixels: ${this.letterPixels.length}`);
    }

    setupLetterCollisionData() {
        console.log('🔧 Setting up collision data for letter:', String.fromCharCode(97 + this.currentLetter).toUpperCase());
        
        if (!this.letterOverlay) {
            console.warn('❌ No letter overlay available for collision setup');
            return;
        }
        
        console.log('✅ Letter overlay found:', this.letterOverlay.src);
        console.log('✅ Letter overlay dimensions:', this.letterOverlay.width, 'x', this.letterOverlay.height);
        
        try {
            // Create temporary canvas with exact same dimensions
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.SCREEN_WIDTH;
            tempCanvas.height = this.SCREEN_HEIGHT;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Clear canvas and draw letter image
            tempCtx.clearRect(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
            
            // Draw letter at exact size
            tempCtx.drawImage(this.letterOverlay, 0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
            
            // Get image data for collision detection
            this.letterImageData = tempCtx.getImageData(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
            
            // Validate image data
            if (!this.letterImageData || !this.letterImageData.data) {
                throw new Error('Failed to extract image data');
            }
            
            // Sample some pixels to validate data integrity
            let transparentCount = 0;
            let opaqueCount = 0;
            const sampleSize = 100;
            
            for (let i = 0; i < sampleSize; i++) {
                const randomIndex = Math.floor(Math.random() * (this.letterImageData.data.length / 4)) * 4;
                const alpha = this.letterImageData.data[randomIndex + 3];
                
                if (alpha === 0) {
                    transparentCount++;
                } else {
                    opaqueCount++;
                }
            }
            
            console.log(`Letter collision data loaded successfully:`);
            console.log(`- Dimensions: ${this.SCREEN_WIDTH}x${this.SCREEN_HEIGHT}`);
            console.log(`- Data length: ${this.letterImageData.data.length} bytes`);
            console.log(`- Sample: ${transparentCount} transparent, ${opaqueCount} opaque pixels`);
            
            // If no transparent pixels found, fall back to bounds detection
            if (transparentCount === 0) {
                console.warn('No transparent pixels found in letter - using bounds detection');
                this.letterImageData = null;
            }
            
        } catch (error) {
            console.warn('Could not get letter image data for collision detection:', error);
            console.warn('Falling back to bounds-based collision detection');
            this.letterImageData = null;
        }
    }

    getPixelsInLetter() {
        const pixels = [];
        
        if (!this.letterImageData) {
            console.warn('No letter image data available, using bounds-based detection');
            return this.getRandomPixelsInLetter([]);
        }
        
        const data = this.letterImageData.data;
        
        // Find transparent pixels (alpha <= 0) which are drawable areas
        for (let y = 0; y < this.SCREEN_HEIGHT; y++) {
            for (let x = 0; x < this.SCREEN_WIDTH; x++) {
                const index = (y * this.SCREEN_WIDTH + x) * 4;
                const alpha = data[index + 3]; // Alpha channel
                
                // Following Go logic: letterOverlay.At(x, y).(color.RGBA).A <= 0
                if (alpha <= 0) {
                    pixels.push({ x: x, y: y });
                }
            }
        }
        
        console.log(`Found ${pixels.length} drawable pixels in letter`);
        return this.getRandomPixelsInLetter(pixels);
    }

    getRandomPixelsInLetter(pixels) {
        if (pixels.length === 0) {
            // Fallback: create some random pixels in center area
            const fallbackPixels = [];
            for (let i = 0; i < 100; i++) {
                fallbackPixels.push({
                    x: Math.floor(Math.random() * 200) + 80,
                    y: Math.floor(Math.random() * 300) + 170
                });
            }
            return fallbackPixels;
        }
        
        const randomPixels = [];
        for (let i = 0; i < Math.min(100, pixels.length); i++) {
            const randomIndex = Math.floor(Math.random() * pixels.length);
            randomPixels.push(pixels[randomIndex]);
        }
        
        return randomPixels;
    }

    insideLetter(x, y) {
        // Ensure coordinates are within canvas bounds
        if (x < 0 || x >= this.SCREEN_WIDTH || y < 0 || y >= this.SCREEN_HEIGHT) {
            console.log(`❌ Outside canvas bounds: (${x}, ${y})`);
            return false;
        }
        
        if (!this.letterImageData) {
            console.warn('⚠️ No letter image data available for collision detection - using fallback bounds');
            // Much more restrictive fallback bounds - only center area of canvas
            const centerX = this.SCREEN_WIDTH / 2;
            const centerY = this.SCREEN_HEIGHT / 2;
            const restrictedWidth = 80;  // Very narrow width
            const restrictedHeight = 120; // Limited height
            
            const inBounds = (x >= centerX - restrictedWidth/2 && x <= centerX + restrictedWidth/2 && 
                             y >= centerY - restrictedHeight/2 && y <= centerY + restrictedHeight/2);
            console.log(`📐 Strict bounds check (${x}, ${y}): ${inBounds ? '✅ INSIDE' : '❌ OUTSIDE'}`);
            return inBounds;
        }
        
        // Use integer coordinates for pixel-perfect detection
        const pixelX = Math.floor(x);
        const pixelY = Math.floor(y);
        
        // Double-check bounds after flooring
        if (pixelX < 0 || pixelX >= this.SCREEN_WIDTH || pixelY < 0 || pixelY >= this.SCREEN_HEIGHT) {
            console.log(`❌ Floored coordinates out of bounds: (${pixelX}, ${pixelY})`);
            return false;
        }
        
        const index = (pixelY * this.SCREEN_WIDTH + pixelX) * 4;
        
        // Ensure index is within image data bounds
        if (index + 3 >= this.letterImageData.data.length) {
            console.warn(`❌ Index out of bounds: ${index + 3} >= ${this.letterImageData.data.length}`);
            return false;
        }
        
        const alpha = this.letterImageData.data[index + 3];
        
        // Following Go logic: letterOverlay.At(x, y).(color.RGBA).A <= 0
        // Only allow drawing in completely transparent areas
        const isDrawable = alpha === 0;
        
        console.log(`🎯 Pixel (${pixelX}, ${pixelY}) alpha: ${alpha} → ${isDrawable ? '✅ DRAWABLE' : '❌ BLOCKED'}`);
        
        return isDrawable;
    }

    paint(x, y) {
        // Strict boundary checking before any drawing
        if (!this.insideLetter(x, y)) {
            if (this.debugMode) {
                console.log(`Drawing blocked at (${Math.floor(x)}, ${Math.floor(y)}) - outside letter boundary`);
            }
            return;
        }
        
        // Additional safety check with a small tolerance around the exact point
        const tolerance = 2;
        let validPointFound = false;
        
        for (let dx = -tolerance; dx <= tolerance && !validPointFound; dx++) {
            for (let dy = -tolerance; dy <= tolerance && !validPointFound; dy++) {
                if (this.insideLetter(x + dx, y + dy)) {
                    validPointFound = true;
                }
            }
        }
        
        if (!validPointFound) {
            if (this.debugMode) {
                console.log(`Drawing blocked - no valid points in tolerance area around (${Math.floor(x)}, ${Math.floor(y)})`);
            }
            return;
        }
        
        const drawCtx = this.drawingCanvas.getContext('2d');
        
        // Draw brush with color cycling like in Go version
        const theta = 2.0 * Math.PI * (this.count % 60) / 60;
        const hue = (theta * 180 / Math.PI) % 360;
        
        // Use brush image if available, otherwise draw colorful circle
        if (this.brushImage) {
            drawCtx.save();
            drawCtx.translate(x, y);
            drawCtx.rotate(theta * 0.1);
            
            // Apply color transformation
            drawCtx.filter = `hue-rotate(${hue}deg) saturate(200%) brightness(150%)`;
            drawCtx.globalCompositeOperation = 'source-over';
            
            // Draw brush at increased size for better coverage
            const brushSize = 30; // Increased from 20 to 30 for better coverage
            drawCtx.drawImage(this.brushImage, -brushSize/2, -brushSize/2, brushSize, brushSize);
            drawCtx.restore();
        } else {
            // Fallback: draw larger, colorful circles for better coverage
            const numSplotches = 3; // Increased for better coverage
            const brushRadius = 15; // Increased radius for better coverage
            
            for (let i = 0; i < numSplotches; i++) {
                const offsetX = (Math.random() - 0.5) * 8; // Slightly larger offset
                const offsetY = (Math.random() - 0.5) * 8;
                
                // Check each splotch position is still valid
                if (!this.insideLetter(x + offsetX, y + offsetY)) {
                    continue;
                }
                
                drawCtx.save();
                drawCtx.globalCompositeOperation = 'source-over';
                
                // Create vibrant colors with 80% saturation, 60% lightness
                const splotchHue = (hue + i * 30) % 360;
                drawCtx.fillStyle = `hsl(${splotchHue}, 80%, 60%)`;
                
                // Dark outline for better definition
                drawCtx.strokeStyle = `hsl(${splotchHue}, 80%, 30%)`;
                drawCtx.lineWidth = 1;
                
                drawCtx.beginPath();
                drawCtx.arc(x + offsetX, y + offsetY, brushRadius, 0, 2 * Math.PI);
                drawCtx.fill();
                drawCtx.stroke();
                drawCtx.restore();
            }
        }
        
        // Track progress and remove pixels
        this.removeLetterPixels(x, y);
        
        // Play drawing sound
        this.playDrawSound();
        
        // Increment counter for color cycling
        this.count++;
    }

    removeLetterPixels(x, y) {
        const newLetterPixels = [];
        let removedCount = 0;
        
        for (let pixel of this.letterPixels) {
            if (!this.isUnderPointer(x, y, pixel)) {
                newLetterPixels.push(pixel);
            } else {
                removedCount++;
            }
        }
        
        this.letterPixels = newLetterPixels;
        
        if (removedCount > 0) {
            console.log(`Removed ${removedCount} pixels, ${this.letterPixels.length} remaining`);
        }
    }

    isUnderPointer(px, py, pixel) {
        const inXBounds = (px + this.POINTER_SIZE / 2) >= pixel.x && (px - this.POINTER_SIZE / 2) <= pixel.x;
        const inYBounds = (py + this.POINTER_SIZE / 2) >= pixel.y && (py - this.POINTER_SIZE / 2) <= pixel.y;
        return inXBounds && inYBounds;
    }

    playDrawSound() {
        if (this.drawSound && this.audioContext && this.audioContext.state === 'running') {
            try {
                const source = this.audioContext.createBufferSource();
                source.buffer = this.drawSound;
                source.loop = true;
                source.connect(this.audioContext.destination);
                source.start();
                
                // Store reference to stop later
                if (this.currentDrawSource) {
                    this.currentDrawSource.stop();
                }
                this.currentDrawSource = source;
            } catch (e) {
                console.warn('Could not play draw sound:', e);
            }
        }
    }

    stopDrawSound() {
        if (this.currentDrawSource) {
            try {
                this.currentDrawSource.stop();
                this.currentDrawSource = null;
            } catch (e) {
                console.warn('Could not stop draw sound:', e);
            }
        }
    }

    playLetterSound() {
        if (this.letterSounds[this.currentLetter] && this.audioContext) {
            try {
                // Resume audio context if needed
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                
                const source = this.audioContext.createBufferSource();
                source.buffer = this.letterSounds[this.currentLetter];
                source.connect(this.audioContext.destination);
                source.start();
                
                this.currentLetterSound = source;
                
                console.log(`Playing letter sound: ${String.fromCharCode(97 + this.currentLetter).toUpperCase()}`);
            } catch (e) {
                console.warn('Could not play letter sound:', e);
            }
        }
    }

    transitionLetter() {
        if (!this.transitioning) {
            this.transitioning = true;
            this.animationTimer = this.ANIMATION_DURATION;
            this.playLetterSound();
            console.log('Starting letter transition...', {
                currentLetter: String.fromCharCode(97 + this.currentLetter).toUpperCase(),
                pixelsRemaining: this.letterPixels.length
            });
        } else if (this.animationTimer > this.ANIMATION_DURATION / 2) {
            this.animationTimer -= 16; // ~60 FPS
        } else if (this.animationTimer > 0) {
            this.fadeOut();
            this.animationTimer -= 16;
        } else {
            console.log('Transition complete, loading new letter...');
            this.transitioning = false;
            // Clear animation canvas before loading new letter
            const animCtx = this.animationCanvas.getContext('2d');
            animCtx.clearRect(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
            this.loadNextLetter();
        }
    }

    fadeOut() {
        const animCtx = this.animationCanvas.getContext('2d');
        animCtx.clearRect(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
        
        // Create fade overlay
        const offset = (this.ANIMATION_DURATION / 2 - this.animationTimer) / (this.ANIMATION_DURATION / 2);
        
        animCtx.fillStyle = `rgba(255, 255, 255, ${offset})`;
        animCtx.fillRect(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
    }

    update() {
        if (this.letterJustLoaded) {
            this.letterPixels = this.getPixelsInLetter();
            this.letterJustLoaded = false;
            console.log(`Letter loaded in update: ${String.fromCharCode(97 + this.currentLetter).toUpperCase()}, pixels: ${this.letterPixels.length}`);
        }
        
        // Clear pointer canvas
        const pointerCtx = this.pointerCanvas.getContext('2d');
        pointerCtx.clearRect(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
        
        // Draw pointer at mouse position
        if (this.pointerImage && this.mouseX && this.mouseY) {
            pointerCtx.drawImage(
                this.pointerImage,
                this.mouseX - this.POINTER_OFFSET,
                this.mouseY - this.POINTER_OFFSET
            );
        }
        
        // Check if letter is complete (fewer than 5 pixels remaining)
        if (!this.isDrawing && this.letterPixels.length < 5 && this.letterPixels.length >= 0) {
            if (!this.transitioning) {
                console.log(`Letter ${String.fromCharCode(97 + this.currentLetter).toUpperCase()} completed! Pixels remaining: ${this.letterPixels.length}`);
            }
            this.transitionLetter();
        }
    }

    render() {
        // Clear main canvas
        this.ctx.clearRect(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
        
        // Layer rendering order (back to front):
        // 1. Background (sandpaper texture)
        this.ctx.drawImage(this.backgroundCanvas, 0, 0);
        
        // 2. Colored brush strokes
        this.ctx.drawImage(this.drawingCanvas, 0, 0);
        
        // 3. Letter image (semi-transparent overlay)
        if (this.letterOverlay) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.4; // 40% opacity for better visibility
            this.ctx.drawImage(this.letterOverlay, 0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
            this.ctx.restore();
        }
        
        // 4. Animation effects
        this.ctx.drawImage(this.animationCanvas, 0, 0);
        
        // 5. Pointer indicators
        this.ctx.drawImage(this.pointerCanvas, 0, 0);
        
        // 6. Debug information (if enabled)
        if (this.debugMode) {
            this.renderDebugInfo();
        }
    }
    
    renderDebugInfo() {
        this.ctx.save();
        
        // Show collision detection status
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Collision: ${this.letterImageData ? 'PIXEL-PERFECT' : 'BOUNDS FALLBACK'}`, 10, 30);
        
        // Show current letter
        this.ctx.fillText(`Letter: ${String.fromCharCode(97 + this.currentLetter).toUpperCase()}`, 10, 50);
        
        // If using bounds fallback, show the restricted area
        if (!this.letterImageData) {
            const centerX = this.SCREEN_WIDTH / 2;
            const centerY = this.SCREEN_HEIGHT / 2;
            const restrictedWidth = 80;
            const restrictedHeight = 120;
            
            this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeRect(
                centerX - restrictedWidth/2, 
                centerY - restrictedHeight/2, 
                restrictedWidth, 
                restrictedHeight
            );
            this.ctx.setLineDash([]);
        }
        
        // Show mouse position and collision status
        if (this.mouseX && this.mouseY) {
            const isInside = this.insideLetter(this.mouseX, this.mouseY);
            this.ctx.fillStyle = isInside ? 'rgba(0, 255, 0, 0.8)' : 'rgba(255, 0, 0, 0.8)';
            this.ctx.fillText(`Mouse: (${Math.floor(this.mouseX)}, ${Math.floor(this.mouseY)}) - ${isInside ? 'INSIDE' : 'OUTSIDE'}`, 10, 70);
            
            // Draw crosshair at mouse position
            this.ctx.strokeStyle = isInside ? 'rgba(0, 255, 0, 0.8)' : 'rgba(255, 0, 0, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(this.mouseX - 10, this.mouseY);
            this.ctx.lineTo(this.mouseX + 10, this.mouseY);
            this.ctx.moveTo(this.mouseX, this.mouseY - 10);
            this.ctx.lineTo(this.mouseX, this.mouseY + 10);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }


    gameLoop() {
        // Only run game loop if game has started
        if (this.gameStarted) {
            this.update();
            this.render();
        }
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize the game when page loads
window.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing Letter Tracer...');
        const game = new LetterTracer();
        window.game = game; // Make game globally accessible for debugging
        await game.init();
        console.log('Letter Tracer initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize Letter Tracer:', error);
        // Show error message to user
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            startScreen.innerHTML = `
                <div class="start-content">
                    <h1 style="color: #ff6b6b;">⚠️ Error</h1>
                    <p>Failed to load Letter Tracer</p>
                    <p style="font-size: 14px; opacity: 0.8;">${error.message}</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Reload App</button>
                </div>
            `;
        }
    }
});

// Handle audio context activation on user interaction
document.addEventListener('click', () => {
    // This helps with browser audio policy requirements
    if (window.game && window.game.audioContext && window.game.audioContext.state === 'suspended') {
        window.game.audioContext.resume();
    }
});
