# Mafia - C64 Browser Edition 🕵️‍♂️💰

A retro-inspired, turn-based strategy game built for the web, faithfully recreating the look, feel, and core gameplay of the 1986 C64 classic "Mafia" by Sascha Laffrenzen.

Step into the shoes of an aspiring underworld figure in Hademarschen. Start with petty thefts, invest your ill-gotten gains into a variety of illicit businesses, recruit henchmen, bribe officials, and take on your rivals to build a criminal empire.

**Live Demo:** [Link to Live Demo Here](https://yourusername.github.io/mafia-c64-browser/)
*(Replace with your actual demo link or remove if not applicable)*

---

![Screenshot of Mafia C64 Browser Edition](path/to/your/screenshot.png)
*(Replace path/to/your/screenshot.png with the actual path to your screenshot in the repository, or an image URL. Consider adding a couple more to show different screens!)*

---

## 🎮 Features

*   **Authentic C64 Aesthetic:** Utilizes a C64 pixel font (C64 Pro Mono recommended), classic color palettes, and a UI designed to evoke the original 8-bit experience.
*   **Turn-Based Gameplay:** Supports 2 players (currently hardcoded as "Christoph" vs. "Sebastian") engaging in strategic decision-making.
*   **Core Game Mechanics Implemented:**
    *   **Aufbauphase (Build-up Phase):** Begin with "Kleine Diebstähle" (Small Thefts).
    *   **Hauptteil (Main Phase):** Unlock "Investitionen" (Investments), "Rekrutierung" (Recruitment), and "Bestechung" (Bribery).
    *   Variety of theft options with different risks and rewards, some impacting the opponent.
    *   Multiple investment opportunities from slot machines to grand hotels.
    *   Recruit personnel like gunmen, lawyers, and informants.
    *   Bribe officials from the Polizeiwachtmeister to the Bürgermeister.
    *   Jail system for failed crimes, with consequences for your operations (e.g., prostitutes may leave).
    *   "Schicksalsschläge" (Strokes of Bad Luck) to introduce random challenges for wealthier players.
    *   Debt and bankruptcy system with a multi-round recovery period (6 rounds as per original).
*   **Scalable Interface:** The game interface dynamically scales to fit the browser window while maintaining its retro aspect ratio and pixel fidelity.
*   **Pure HTML, CSS, and JavaScript:** Built entirely with vanilla web technologies, showcasing a foundational approach to browser-based game development.

## 🕹️ How to Play / Setup

1.  **Clone or Download:**
    ```bash
    git clone https://github.com/yourusername/mafia-c64-browser.git
    cd mafia-c64-browser
    ```
    Alternatively, download the ZIP of this repository and extract it.

2.  **Font Setup (Crucial for Authentic Look):**
    *   This game relies on a C64 pixel font. The recommended font is **"C64 Pro Mono" by Style-7**.
    *   Download the font (e.g., from [DaFont](https://www.dafont.com/c64-pro.font) or similar font sites - search for "C64 Pro Mono").
    *   Create a folder named `fonts` in the project's root directory (if it doesn't already exist).
    *   Place the font file (e.g., `C64_Pro_Mono-STYLE.ttf`) inside this `fonts` folder.
    *   *The `style.css` file is pre-configured to look for `fonts/C64_Pro_Mono-STYLE.ttf`. If your font file has a different name or you place it elsewhere, please update the `@font-face` rule in `style.css` accordingly.*

3.  **Open in Browser:**
    *   Open the `index.html` file in a modern web browser (Chrome, Firefox, Edge, Safari, etc.).

4.  **Gameplay:**
    *   The game will start automatically.
    *   Follow the on-screen prompts. Player 1 ("Faddie") starts the game. Turns alternate between the two players.
    *   Use your keyboard to enter choices (numbers or 'N') and press `Enter`.
    *   For screens like the Title, Status, Jail, or Game Over, pressing almost any key will advance the game.

## 🛠️ Built With

*   **HTML5**
*   **CSS3** (utilizing CSS Variables for theming, layout, and responsive scaling calculations)
*   **Vanilla JavaScript (ES6+)** (no external game frameworks or rendering libraries)

## 🔮 Future Development (Potential Ideas)

*   Fully implement "Aktionen" (Kidnapping, Assassination, Demolition) with proper targeting and mechanics.
*   Expand player support beyond 2 hardcoded players (e.g., selectable number of players).
*   Introduce AI opponents for a single-player mode.
*   Implement a save/load game feature (e.g., using LocalStorage or IndexedDB).
*   Further refine game balance and introduce a wider variety of random events.
*   Add authentic C64-style sound effects (e.g., using Web Audio API for beeps and simple tunes).
*   Enhance UI for selecting targets in multi-player scenarios for actions/thefts.

## 🙏 Acknowledgements

*   Deeply inspired by the original "Mafia" game (1986) by **Sascha Laffrenzen** for the Commodore 64. This project aims to be a faithful tribute to his work.
*   Valuable information, game mechanics, and visual references sourced from the [C64-Wiki page for Mafia (Sascha Laffrenzen)](https://www.c64-wiki.de/wiki/Mafia_(Sascha_Laffrenzen)).
*   **C64 Pro Mono Font** by Style-7 (Font source: [Link to Font Source if Known, e.g., DaFont](https://www.dafont.com/c64-pro.font)).

## ⚖️ Disclaimer

This project is a fan-made tribute to the 1986 Commodore 64 game "Mafia" by Sascha Laffrenzen. It is created for educational and entertainment purposes only and is not affiliated with or endorsed by the original copyright holders.
All copyrights and trademarks for the original "Mafia" game, including its specific textual content and unique gameplay elements, belong to their respective owners. This project does not intend to infringe upon any copyrights.
If you are a copyright holder of the original "Mafia" game and believe this project infringes on your rights, please contact [your-github-username/email] to discuss the matter or request its removal.
