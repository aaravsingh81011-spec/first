# Hollow Night prototype

A small browser-based action platformer prototype inspired by Hollow Knight vibes.

## Run locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Controls

- Move: `A` / `D` or left/right arrow keys
- Jump: `Space` or up arrow key
- Attack: `J`

## How to test

### Quick code check

```bash
node --check game.js
```

### Manual gameplay test

1. Start the local server:
   ```bash
   python3 -m http.server 8000
   ```
2. Open <http://localhost:8000> in a browser.
3. Verify movement and jump:
   - Press `A` / `D` (or arrow keys) and confirm the player moves left/right.
   - Press `Space` and confirm the player jumps and lands on floor/platforms.
4. Verify combat:
   - Move into enemies and press `J` to attack.
   - Confirm enemies disappear after enough hits.
   - Confirm player HP decreases when touching enemies.
5. Verify game state:
   - Confirm `Foes Remaining` updates as enemies are defeated.
   - Lose all HP and confirm the `YOU FELL` overlay appears.
