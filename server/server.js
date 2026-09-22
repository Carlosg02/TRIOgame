const express = require('express');
const path = require('path');

const app = express();

const PORT = 3000;

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(express.json());

const players = [];
let maxPlayers = 0;

app.post("/api/players", (req, res) => {
    const playerName = req.body.name;
    if (maxPlayers === 0) {
        return res.status(400).json({
            message: "The game has not been configured yet."
        });
    }else if (players.length >= maxPlayers) {
        return res.status(400).json({
            message: "Game is full"
        });
    }else{
        players.push({
            name: playerName
        });
        res.status(201).json({
            message: "Player added successfully: Welcome, " + playerName + "!",
            player: {
                name: playerName
            }
        });
    }
    
});

app.get("/api/players", (req, res) => {
    res.json({
        players: players
    });
});

app.post("/api/game", (req,res) => {
    const playerCount = req.body.playerCount;
    if (playerCount >= 3 && playerCount <=  6) {
        maxPlayers = playerCount;
        res.status(200).json({
            message: "Starting game with " + maxPlayers + " players!"
        })
    }else{
        res.status(400).json({
            message: "Invalid player count"
        });
    }
});

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT)
})