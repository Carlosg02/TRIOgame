# TRIO — Multiplayer Card Game

A browser-based, turn-based multiplayer card game for **3–6 players**, built with **Node.js, Express, and vanilla JavaScript**. Players join a shared lobby from their own devices, reveal cards from hands or the center, and compete to collect matching trios.

The game features a custom rainforest-inspired interface, animal-themed cards, animated reveals, and server-managed gameplay.

> **Project status:** Playable prototype designed for private games. Local-network play is the current supported setup; online hosting, stronger player authentication, automated tests, and WebSocket updates are planned improvements.

## Highlights

- **Multiplayer lobby:** A host selects 3–6 players, joins the lobby, and chooses the starting player.
- **Server-managed rules:** The Express server creates and shuffles a 36-card deck, deals hands, tracks turns, and validates card reveals.
- **Player-specific views:** Each player sees their own hand while opponents' unrevealed card values stay hidden in normal game responses.
- **Turn-based gameplay:** Players reveal cards from the center or the lowest/highest available card in a player's hand.
- **Win detection:** Collect three trios or the trio of 7s to win.
- **Custom UI:** Rainforest-themed cards, custom animal illustrations, animations, and a victory overlay.

## Tech stack

| Layer | Technology |
| --- | --- |
| Backend | Node.js, Express 5 |
| Frontend | HTML, CSS, vanilla JavaScript |
| Client–server communication | REST APIs with HTTP polling |
| Game state | In-memory JavaScript objects |
| Asset format | PNG illustrations |

The project intentionally uses a lightweight stack without a frontend framework or database.

## Getting started

### Prerequisites

- Node.js (a recent LTS version recommended)
- npm
- A modern web browser

### Installation

```bash
git clone <https://github.com/Carlosg02/TRIOgame.git>
cd <YOUR_REPOSITORY_FOLDER>
npm install
npm start
```

The server runs at **http://localhost:3000**.

For development with automatic restarts when server files change:

```bash
npm run dev
```

### Playing locally

1. The host opens **http://localhost:3000/host.html**.
2. The host enters a name, selects a player count, and waits for everyone to join.
3. Other players open **http://localhost:3000/join.html** and enter unique names.
4. The host selects a starting player from the connected-player list and starts the game.
5. Each player is taken to the game screen when the game begins.

For **different devices on the same Wi-Fi network**, replace `localhost` with the host computer's local IP address—for example, `http://192.168.x.x:3000/join.html`. The host computer must be reachable on that network, and its firewall must allow the connection.

> Only one game lobby exists per running server process. Restarting the server clears the in-memory game state.

## How the game works

The deck contains **36 cards**: three copies of each number from 1 through 12. Cards are dealt to players, with remaining cards placed face-down in the center.

On a turn, the active player reveals cards, attempting to uncover **three cards of the same number**. A card from another player's hand must be selected from its lowest or highest available position; cards in the center can be chosen individually. A mismatch ends the turn. A successful match awards a trio.

The first player to collect **three trios** or the **trio of 7s** wins.

## Architecture

```text
Browser clients (host / join / game)
            |
            | fetch() requests + polling
            v
     Express REST API
            |
            v
  In-memory game state
  ├─ Players and hands
  ├─ Deck and center cards
  ├─ Active turn and reveals
  └─ Collected trios and winner
```

The server owns the canonical game state and responds to browser requests with player-specific data. There is currently no database or real-time socket connection.

### Selected API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/game/configure` | Set player count |
| `POST` | `/api/players` | Join the lobby |
| `GET` | `/api/players` | List registered players |
| `POST` | `/api/game` | Start the game |
| `GET` | `/api/game/status` | Get game status |
| `GET` | `/api/game/player/:playerId` | Get player-specific game state |
| `POST` | `/api/game/reveal` | Attempt a card reveal |
| `POST` | `/api/players/reconnect` | Reconnect by name (prototype behavior) |
| `POST` | `/api/game/reset` | Reset a finished game |

## Project structure

```text
.
├── public/
│   ├── Assets/           # Animal illustrations and card artwork
│   ├── host.html         # Host lobby
│   ├── host.js
│   ├── join.html         # Player join page
│   ├── join.js
│   ├── game.html         # Main game interface
│   ├── game.js
│   ├── index.html
│   ├── script.js
│   └── style.css
├── server/
│   └── server.js         # Express API and game logic
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Screenshots and demo

Gameplay screenshots and a short demo will be added here. Recommended captures:

1. Host lobby with connected players
2. Active game showing the rainforest tabletop
3. A completed trio or victory celebration

A screenshot or short recording is especially useful for reviewers who cannot easily gather 3–6 people to run the game.

## Current limitations and roadmap

This project is a playable prototype rather than a production-ready internet service.

- [ ] Add secure player sessions and protect private game-state endpoints
- [ ] Add automated tests for card dealing, turn validation, and winning conditions
- [ ] Move from periodic polling to WebSockets / Socket.IO
- [ ] Improve reconnection and network error handling
- [ ] Refactor game logic into independently testable modules
- [ ] Add continuous integration and demo media
- [ ] Evaluate deployment for private online games

**Security note:** Player identifiers are not sufficient authentication, and the current name-based reconnect endpoint is not secure against impersonation. Do not expose this version as a public internet service.

## Project background

This project was built to explore full-stack web development through a multiplayer, stateful application. It combines REST API design, game-rule implementation, shared server state, client-side rendering, and iterative UI development.

The game is an **unofficial, independently developed adaptation inspired by TRIO**, the card game published by Happy Camper. It is not affiliated with or endorsed by the game's publisher. Game names and trademarks belong to their respective owners.

## License

No license is currently declared for the full repository. See `package.json` for its existing package metadata. A repository-wide license and permissions for game-related assets should be reviewed before broader distribution.
