const express = require('express');
const path = require('path');

const app = express();

const PORT = 3000;

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(express.json());

const game = {
    players: [],
    maxPlayers: 0,
    started: false
};

const cardsPerPlayer = {
    3: 9,
    4: 7,
    5: 6,
    6: 5
};

function createDeck(){
    let cardID = 1;
    const deck = [];
    for (let i = 1; i < 13; i++ ){
        for(let j = 1; j < 4; j++){
            let card = {id: cardID, value: i }
            deck.push(card);
            cardID ++;
        }
    }
    return deck;
}

function shuffleDeck(deck){
    for( let i = deck.length -1; i >0; i--){
        let randomIndex = Math.floor(Math.random() * (i+1));
        let temp = deck[randomIndex];
        deck[randomIndex] = deck[i];
        deck[i] = temp;
    }
}


function dealCards(deck,players){
    shuffleDeck(deck);
    players.forEach((player)=>{
        player.hand = deck.splice(0, cardsPerPlayer[players.length])
        player.hand.sort((a,b) => a.value - b.value);
    })
    return deck;
}

//Endpoint for players joining the game and validating names
app.post("/api/players", (req, res) => {
    const playerName = req.body.name?.trim();
    if (!playerName){//Makes sure that the player name isnt empty
        return res.status(400).json({
            message: "Please provide a valid player name"
        })
    }

    if (game.maxPlayers === 0) {//Check that player count has been selected
        return res.status(400).json({
            message: "The game has not been configured yet."
        });
    }
    
    if (game.players.length >= game.maxPlayers) {//Checks if game is full
        return res.status(400).json({
            message: "Game is full"
        });
    }

    const dupeName = game.players.some((player) => {
        return player.name.toLowerCase() === playerName.toLowerCase();
    });
    if (dupeName) {
        return res.status(400).json({
            message: "Player Name is already taken!"
        })
    }

    
    game.players.push({
        name: playerName
    });

    res.status(201).json({
        message: "Player added successfully: Welcome, " + playerName + "!",
        player: {
            name: playerName
        }
    });
    
    
});

//Endpoint to retrieve all current players
app.get("/api/players", (req, res) => {
    res.json({
        players: game.players
    });
});

//This endpoint is for selecting the amount of players when begginning the game
app.post("/api/game", (req,res) => {
    const playerCount = req.body.playerCount;
    if (playerCount >= 3 && playerCount <=  6) {
        game.maxPlayers = playerCount;
        res.status(200).json({
            message: "Starting game with " + game.maxPlayers + " players!"
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