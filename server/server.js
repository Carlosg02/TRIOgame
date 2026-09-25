const express = require('express');
const path = require('path');

const app = express();

const PORT = 3000;

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(express.json());

const game = {
    players: [],
    maxPlayers: 0,
    status: "lobby",
    center: [],
    currentPlayerID: null,
    turn: {
        revealedCards: []
    }

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

function startGame(){
    const deck = createDeck();
    const center = dealCards(deck, game.players);
    game.center = center;
    game.status = "playing";
    setStartingPlayer();
    console.log(game);
    
}

function setStartingPlayer(playerId){
    const startingPlayer = game.players.find((player) => {
        return player.id === playerId;
    })

    if (startingPlayer !== undefined){
        game.currentPlayerID = playerId
    }
}

function advanceTurn(){
    const currentIndex = game.players.findIndex((player)=> {
        return player.id === game.currentPlayerID;
    })
    const nextPlayerIndex = (currentIndex + 1) % game.players.length;
    game.currentPlayerID = game.players[nextPlayerIndex].id;
}

function getPlayerCard(playerId, position){
    const chosenPlayer = game.players.find((player)=>{
        return player.id === playerId;
    })
    if (chosenPlayer === undefined){
        return undefined;
    }
    const availableCards = chosenPlayer.hand.filter((card)=>{
        const alreadyRevealed = game.turn.revealedCards.some((revealedCard) => {
            return revealedCard.cardId === card.id;
        });

        return !alreadyRevealed;
    })
    console.log(availableCards);
    
    if(position === "lowest"){
        return availableCards[0];
    }
    if(position === "highest"){
        return availableCards[availableCards - 1];
    }
    return undefined;
}

function getCenterCard(cardId){
    const chosenCard = game.center.find((card)=>{
        return card.id === cardId;
    })

    return chosenCard;
}

function saveRevealedCard(card,source,playerId = null){
    const givenCard = { 
        cardId: card.id,
        value: card.value,
        source: source,
        playerId: playerId
    } 
    game.turn.revealedCards.push(givenCard);
}

function revealCard(source, options){
    let card = undefined;
    if (source === "player"){
        card = getPlayerCard(options.playerId, options.position);
        if (card != undefined){
            saveRevealedCard(card,source,options.playerId);
        }
    }else if(source === "center"){
        card = getCenterCard(options.cardId);
        if (card != undefined){
            saveRevealedCard(card,source);
        }
    }
}

function revealedCardsMatch(){
    if(game.turn.revealedCards.length == 0){
        return false;
    }
    const firstValue = game.turn.revealedCards[0].value;
    return game.turn.revealedCards.every((card)=>{
        return card.value === firstValue;
    });
}

function continueReveal(){
    if(game.turn.revealedCards.length === 1){
        return "Reveal Another";
    }else if (game.turn.revealedCards.length === 2){
        if(revealedCardsMatch()){
            return "Continue";
        }else{
            return "End Turn" ;
        }
    }else if(game.turn.revealedCards.length === 3){
        if(revealedCardsMatch()){
            return "TRIO";
        }else{
            return "End Turn" ;
        }
    }

}

function endTurn(){
    game.turn.revealedCards = [];
    advanceTurn();
}




////------------------End Points ---------------------------------

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
        id: "player-" + (game.players.length + 1),
        name: playerName,
        hand: [],
        trios: []
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
        if(game.players.length === game.maxPlayers){
            startGame();
            
            res.status(200).json({
                message: "Starting game with " + game.maxPlayers + " players!"
            })
        }else{
            res.status(400).json({
                message: "Not all players have joined"
            })
        }
        
    }else{
        res.status(400).json({
            message: "Invalid player count"
        });
    }
});

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT)
})


// game.players = [
//     { id: "player-1", name: "Carlos", hand: [{ id: 6, value: 2 },
//     { id: 7, value: 3 },
//     { id: 9, value: 3 },
//     { id: 10, value: 4 },
//     { id: 24, value: 8 },
//     { id: 23, value: 8 },
//     { id: 31, value: 11 }], trios: [] },
//     { id: "player-2", name: "David", hand: [], trios: [] },
//     { id: "player-3", name: "Sarah", hand: [], trios: [] },
//     { id: "player-4", name: "Josh", hand: [], trios: [] }
// ];

// const deck = createDeck();
// game.center = dealCards(deck, game.players);

// console.log(game.players[0]);
// console.log(revealCard("player",{playerId: "player-1",position: "lowest"}));
// console.log(game.turn.revealedCards);
// console.log(revealCard("player",{playerId: "player-1",position: "lowest"}));
// console.log(game.turn.revealedCards);
// revealCard("player", {
//     playerId: "player-2",
//     position: "highest"
// });
// revealCard("center", {
//     cardId: 17
// });
// console.log(game.turn.revealedCards);


