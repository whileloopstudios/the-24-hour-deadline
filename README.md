# The 24 Hour Deadline

**"Success is 10% inspiration and 90% dodging your phone."**

[](https://opensource.org/licenses/MIT)
[](https://kaboomjs.com/)

**The 24 Hour Deadline** is a fast-paced, top-down arcade survival game built with Kaboom.js. Players take on the role of Zayn or Ayesher, students who have realized—far too late—that their final exam is tomorrow.

Navigate through three distinct levels—the Bedroom, the Library, and the dreaded Exam Hall—while collecting knowledge and dodging the distractions of modern life.

## Game Features

  * **Story Mode:** A 3-level campaign with narrative cutscenes.
  * **Endless Mode:** Test your focus in an infinite loop that gets harder the longer you study.
  * **Difficulty Scaling:** Easy, Normal, and Hard modes to suit your "GPA."
  * **Cross-Platform:** Full keyboard support (WASD/Arrows) and mobile-friendly on-screen controls.
  * **Persistence:** High scores and settings saved via LocalStorage.

## Quick Start

### Prerequisites

  * [Node.js](https://nodejs.org/) installed.
  * A modern web browser.

### Installation

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/whileLoop-Studios/24-hour-deadline.git
    cd 24-hour-deadline
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the dev server:**
    ```bash
    npm run dev
    ```

## Project Structure

  * `src/main.js` - The core game logic and scene management.
  * `public/sprites/` - Character and item assets.
  * `public/sounds/` - BGM and SFX.
  * `public/backgrounds/` - Level environments.

-----

## Developer Documentation

### Scene Management

The game uses a state-driven scene approach. To add a new level, use the `play_level` template:

```javascript
scene("new_level", () => go("play_level", { 
    bg: "Your_BG", 
    goodItems: ["Book"], 
    badItems: ["Distraction1", "Distraction2"], 
    scoreTarget: 25, 
    nextScene: "victory", 
    speedMulti: 2.0 
}));
```

### Scaling Logic

The game uses a dynamic scaling factor based on the smaller dimension of the screen:
$$\text{scaleFactor} = \min(\text{width}, \text{height}) / \text{divisor}$$
To adjust sprite sizes globally, modify the `playerScale` and `itemScale` divisors within the `setupGameplay` function.

### Adding New Hazards

1.  Load the sprite in `loadGameAssets()`.
2.  Add the sprite name to the `badItems` array in the desired level scene.
3.  The `onUpdate("danger")` tag automatically handles movement and rotation for all hazard-class items.

-----

## 📜 Credits

  * **Studio:** whileLoop Studios
  * **Lead Developer:** Aarizish
  * **Engine:** Kaboom.js
  * **Audio:** Pixabay & Azad Chaiwala
  * **Visuals:** Freepik (pikisuperstar & studiogstock)

-----

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.