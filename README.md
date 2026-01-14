# 🚀 Stellar Chess

<div align="center">

![Stellar Chess Banner](https://img.shields.io/badge/STELLAR-CHESS-00d4ff?style=for-the-badge&labelColor=1a1a2e&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDJMOSA5SDNMMTIgMjJMMjEgOUgxNUwxMiAyWiIvPjwvc3ZnPg==)

**Command the Galaxy • Conquer the Board**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

*A futuristic sci-fi space-themed chess game with stunning visuals and intelligent AI*

[Play Now](#-quick-start) • [Features](#-features) • [Installation](#-installation) • [Docker](#-docker-deployment) • [How to Play](#-how-to-play)

</div>

---

## 🌟 Overview

**Stellar Chess** is an immersive, browser-based chess game set in a futuristic space environment. Experience classic chess gameplay reimagined with a stunning sci-fi aesthetic, complete with animated star fields, nebula effects, and futuristic sound design.

Whether you're a chess grandmaster or just learning the game, Stellar Chess offers an engaging experience with multiple difficulty levels and both single-player and two-player modes.

---

## ✨ Features

### 🎮 Game Modes

| Mode | Description |
|------|-------------|
| **VS Computer** | Challenge the AI across three difficulty levels |
| **Two Players** | Play locally with a friend on the same device |

### 🤖 AI Difficulty Levels

| Level | Rank | XP Bonus | Description |
|-------|------|----------|-------------|
| 🌟 Easy | Ensign | +50 XP | Perfect for beginners - basic tactical play |
| ⚡ Medium | Commander | +100 XP | Strategic thinking with moderate challenge |
| 🔥 Hard | Admiral | +200 XP | Maximum threat - advanced minimax AI |

### 🎨 Visual Features

- **Dynamic Space Background** - Animated star fields with parallax scrolling
- **Nebula Effects** - Beautiful cosmic gas clouds and gradients
- **Glassmorphism UI** - Modern frosted-glass interface elements
- **Smooth Animations** - Fluid piece movements and hover effects
- **Responsive Design** - Plays great on desktop, tablet, and mobile

### 🏆 Progression System

- **XP & Ranking** - Earn experience points and climb the ranks
- **Rank Progression**: Cadet → Ensign → Lieutenant → Commander → Captain → Admiral → Fleet Admiral
- **Statistics Tracking** - Track your wins, losses, and total games
- **Persistent Progress** - Your stats are saved locally

### 🎵 Audio

- **Futuristic Sound Effects** - Sci-fi themed move, capture, and check sounds
- **Ambient Space Music** - Immersive background audio
- **Adjustable Volume** - Full control over audio settings

### ♟️ Full Chess Implementation

- Complete chess rules including:
  - ✅ Castling (kingside and queenside)
  - ✅ En passant captures
  - ✅ Pawn promotion with piece selection
  - ✅ Check and checkmate detection
  - ✅ Stalemate detection
  - ✅ Move hints and legal move highlighting

---

## 🚀 Quick Start

### Option 1: Open Directly

Simply open `index.html` in any modern web browser:

```bash
# Clone the repository
git clone https://github.com/john-aloha/stellar-chess.git

# Navigate to the directory
cd stellar-chess

# Open in your default browser (Windows)
start index.html

# Open in your default browser (macOS)
open index.html

# Open in your default browser (Linux)
xdg-open index.html
```

### Option 2: Use a Local Server

For the best experience (especially for audio), use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (npx)
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

---

## 🐳 Docker Deployment

Stellar Chess includes Docker support for easy deployment anywhere.

### Using Docker Compose (Recommended)

```bash
# Build and run
docker-compose up -d

# Stop the container
docker-compose down
```

### Using Docker Directly

```bash
# Build the image
docker build -t stellar-chess .

# Run the container
docker run -d -p 8080:80 --name stellar-chess stellar-chess

# Stop and remove
docker stop stellar-chess && docker rm stellar-chess
```

Access the game at **http://localhost:8080**

### Docker Image Details

- **Base Image**: `nginx:alpine` (~23MB)
- **Features**: Gzip compression, optimized static file serving
- **Port**: 80 (mapped to 8080 by default)

---

## 🎯 How to Play

### Starting a Game

1. **Launch the game** by opening index.html or visiting the Docker URL
2. **Choose your mode**:
   - 🤖 **VS Computer** - Play against AI
   - 👥 **Two Players** - Local multiplayer
3. **Select difficulty** (for VS Computer mode)
4. **Choose your fleet** (Light or Dark pieces)
5. **Click "Engage Battle"** to start!

### Controls

| Action | How To |
|--------|--------|
| Select a piece | Click on any of your pieces |
| Move a piece | Click on a highlighted square |
| Deselect | Click elsewhere or on the same piece |
| Undo move | Click the ↶ button |
| Pause game | Click the ⏸ button |
| Resign | Click the 🏳️ button |
| Menu | Click the ☰ button |

### Game Interface

```
┌─────────────────────────────────────┐
│  🤖 OPPONENT    [captured]   10:00  │  ← Opponent panel
├─────────────────────────────────────┤
│                                     │
│         ♜ ♞ ♝ ♛ ♚ ♝ ♞ ♜           │
│         ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟           │
│         · · · · · · · ·           │
│         · · · · · · · ·           │  ← Chess Board
│         · · · · · · · ·           │
│         · · · · · · · ·           │
│         ♙ ♙ ♙ ♙ ♙ ♙ ♙ ♙           │
│         ♖ ♘ ♗ ♕ ♔ ♗ ♘ ♖           │
│                                     │
├─────────────────────────────────────┤
│  👤 YOU         [captured]   10:00  │  ← Your panel
├─────────────────────────────────────┤
│     ↶    ⏸    🏳️    ☰              │  ← Controls
└─────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure and semantic markup |
| **CSS3** | Styling, animations, and responsive design |
| **Vanilla JavaScript** | Game logic, AI, and interactivity |
| **Web Audio API** | Sound synthesis and effects |
| **Local Storage** | Progress and settings persistence |
| **Nginx** | Docker web server |

### Project Structure

```
stellar-chess/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── game.js             # Game logic and UI management
├── chess-engine.js     # Chess rules and move validation
├── chess-ai.js         # AI opponent (minimax algorithm)
├── audio.js            # Sound effects and music
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose setup
├── .dockerignore       # Docker build exclusions
└── README.md           # This file
```

---

## 🧠 AI Implementation

The AI opponent uses the **Minimax algorithm** with **Alpha-Beta pruning** for efficient move calculation:

- **Easy (Ensign)**: Depth 2 - Quick decisions, occasional mistakes
- **Medium (Commander)**: Depth 3 - Balanced strategic play
- **Hard (Admiral)**: Depth 4 - Deep analysis, strong play

### Evaluation Factors

The AI considers:
- Material value (piece worth)
- Positional advantages
- King safety
- Center control
- Pawn structure

---

## ⚙️ Settings

Access settings from the main menu to customize your experience:

| Setting | Description |
|---------|-------------|
| **Sound Effects** | Toggle move and capture sounds |
| **Music** | Toggle ambient background music |
| **Volume** | Adjust overall audio level |
| **Show Hints** | Toggle legal move highlighting |

---

## 🏅 Ranking System

Progress through the ranks by winning games:

| Rank | XP Required |
|------|-------------|
| Cadet | 0 |
| Ensign | 500 |
| Lieutenant | 1,500 |
| Commander | 3,500 |
| Captain | 7,000 |
| Admiral | 15,000 |
| Fleet Admiral | 30,000 |

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Ideas for Contributions

- [ ] Online multiplayer support
- [ ] Additional themes/skins
- [ ] Move notation display
- [ ] Game replay/analysis
- [ ] Opening book for AI
- [ ] Tournament mode

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Chess piece Unicode characters for clean rendering
- Google Fonts (Orbitron, Rajdhani) for the futuristic typography
- The open-source community for inspiration

---

<div align="center">

**Made with ❤️ and ♟️**

*May the stars guide your strategy*

⭐ **Star this repo if you enjoyed the game!** ⭐

</div>
