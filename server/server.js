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
    winnerID: null,
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
    // console.log(availableCards);
    
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

    if (chosenCard === undefined) {
        return undefined;
    }

    const alreadyRevealed = game.turn.revealedCards.some((revealedCard) => {
        return revealedCard.cardId === chosenCard.id;
    });

    if(alreadyRevealed){
        return undefined;
    }

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

function removeRevealedCard(revealedCard){
    const cardSource = revealedCard.source;

    if (cardSource === "center"){
        game.center = game.center.filter((card) => {
            return card.id !== revealedCard.cardId;
        })
    }else if (cardSource === "player"){
        const player = game.players.find((player) =>{
            return player.id === revealedCard.playerId;
        })
        player.hand = player.hand.filter((card)=>{
            return card.id !== revealedCard.cardId;
        })

    }
}

function endGame(){
    game.status = "finished";
    game.winnerID = game.currentPlayerID;
}

function checkWinner(player){
    if(player.trios.includes(7)){
        return true;
    }else if (player.trios.length >= 3){
        return true;
    }
    return false;
}

function collectTrio(){
    const trioValue = game.turn.revealedCards[0].value;

    const player  = game.players.find((player) =>{
        return player.id === game.currentPlayerID;
    })

    player.trios.push(trioValue);

    if(checkWinner(player)){
        endGame();
    }else{
        game.turn.revealedCards.forEach((card)=>{
            removeRevealedCard(card);
        })

        game.turn.revealedCards = [];

        advanceTurn();
    }

}

function revealResults(){
    const turnResult = continueReveal();

    if (turnResult === "End Turn"){
        endTurn();
    }else if(turnResult === "TRIO"){
        collectTrio();
    }
}

function revealCard(actingPlayerId, source, options){
    if(game.status !== "playing"){
        return {
            success: false,
            message: "Game is not currently playing"
        };
    }
    if(game.currentPlayerID !== actingPlayerId){
        return {
            success: false,
            message: "It is not your turn"
        };
    }
    if(source !== "center" && source !== "player"){
        return {
            success: false,
            message: "Invalid card source"
        };
    }
    let card = undefined;
    if (source === "player"){
        if(options.position !== "lowest" && options.position !== "highest"){
            return{
                success: false,
                message: "invalid card position"
            };
        }
        card = getPlayerCard(options.playerId, options.position);
        if (card !== undefined){
            saveRevealedCard(card,source,options.playerId);
            revealResults();
            return {
                success: true,
                message: "Card revealed"
            }
        }
    }else if(source === "center"){
        card = getCenterCard(options.cardId);
        if (card !== undefined){
            saveRevealedCard(card,source);
            revealResults();
            return {
                success: true,
                message: "Card revealed"
            }
        }
    }
    return {
                success: false,
                message: "Card could not be revealed"
            }
    
}

function getPlayerGameState(playerId){
    const currPlayer = game.players.find((player) =>{
        return player.id === playerId;
    })

    if (currPlayer === undefined){
        return undefined;
    }

    const publicPlayers = game.players.map((player) => {
        return {
            id: player.id,
            name: player.name,
            cardCount: player.hand.length,
            trios: player.trios
        }
    });

    return {
        status: game.status,
        currentPlayerID: game.currentPlayerID,
        winnerID: game.winnerID,
        hand: currPlayer.hand,
        trios: currPlayer.trios,
        players: publicPlayers
    }
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

app.post("/api/game/reveal",(req,res)=>{
    const actingPlayerId = req.body.actingPlayerId;
    const source = req.body.source;
    const options = req.body.options;

    const results = revealCard(actingPlayerId, source, options);
    
    console.log(results);
    
    if (results.success){
        return res.status(200).json({
            message: results.message
        });
    }

    return res.status(400).json({
        message: results.message
    });
    
})

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT)
})

app.get("/api/game/player/:playerId", (req,res)=>{
    const playerId = req.params.playerId;
    const result = getPlayerGameState(playerId);

    if (result === undefined){
        return res.status(404).json({
            message: "Player not found"
        })
    }
    return res.status(200).json(result);
})

////////////////// TEST //////////////////////////
game.players = [
    { id: "player-1", name: "Carlos", hand: [
    { id: 7, value: 7 },
    { id: 9, value: 7 },
    { id: 10, value: 4 },
    { id: 24, value: 4 },
    { id: 23, value: 5 },
    { id: 31, value: 5 }], trios: [] },
    { id: "player-2", name: "David", hand: [
        { id: 1, value: 1 },
        { id: 2, value: 2 },
        { id: 3, value: 3 },
        { id: 4, value: 6 },
        { id: 5, value: 8 },
        { id: 6, value: 9 }
    ], trios: [] },
    { id: "player-3", name: "Sarah", hand: [], trios: [] },
    { id: "player-4", name: "Josh", hand: [], trios: [] }
];
game.currentPlayerID = "player-1"
game.status = "playing"

// const deck = createDeck();
// game.center = dealCards(deck, game.players);

game.center = [{ id: 8, value: 7 },{ id: 11, value: 4 },{ id: 32, value: 5 }]
console.log("Status:", game.status);
console.log("Current player:", game.currentPlayerID);
console.log("Players:", game.players);
console.log("Center:", game.center);
// console.log(game.center)
// console.log(game.players[0]);
// console.log(revealCard("player-1","player",{playerId: "player-1",position: "lowest"}));
// console.log(game.turn.revealedCards);
// revealCard("player",{playerId: "player-1",position: "lowest"});
// revealCard('center', {cardId: 8})
// console.log(game.players[0]);
// game.currentPlayerID = "player-1"
// revealCard("player",{playerId: "player-1",position: "lowest"});
// revealCard("player",{playerId: "player-1",position: "lowest"});
// revealCard('center', {cardId: 11})
// console.log(game.players[0]);

// console.log(game);
// console.log(game.turn.revealedCards);
// console.log(revealCard("player",{playerId: "player-1",position: "lowest"}));
// console.log(game.turn.revealedCards);


// console.log(revealCard("player",{playerId: "player-1",position: "lowest"}));
// console.log(game.turn.revealedCards);
// removeRevealedCard(game.turn.revealedCards[0]);
// console.log(game.players[0])
// console.log(game.center)
// console.log(game);
// revealCard("player", {
//     playerId: "player-2",
//     position: "highest"
// });
// revealCard("center", {
//     cardId: 17
// });
// console.log(game.turn.revealedCards);

// const response = fetch("/api/game/reveal", {
//             method: "POST",
//             headers:{
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//                 "actingPlayerId": "player-1",
//                 "source": "player",
//                 "options": {
//                     "playerId": "player-2",
//                     "position": "lowest"
//                 }
//             })
//         });

// const data = response.json();

// console.log(data);