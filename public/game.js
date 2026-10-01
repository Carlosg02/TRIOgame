
async function getGameState(){
    const playerId = sessionStorage.getItem("playerId");
    if (playerId === null){
        return;
    }
    const response = await fetch(`/api/game/player/${playerId}`);
    const data = await response.json();
    return data;
}



function displayHand(gamestate){
    const playerHandArea = document.getElementById("player-hand");
    playerHandArea.textContent = "";
    gamestate.hand.forEach((card) => {
        const cardButton = document.createElement("button");
        cardButton.textContent = card.value;
        playerHandArea.appendChild(cardButton);
    });
}

function displayTurn(gamestate){
    const turnMessageArea = document.getElementById("turn-message");
    const player = sessionStorage.getItem("playerId");
    if (player === gamestate.currentPlayerID){
        turnMessageArea.textContent = "Your turn";
    }else{
        const currentPlayer = gamestate.players.find((player)=>{
            return player.id === gamestate.currentPlayerID;
        })
        turnMessageArea.textContent = currentPlayer.name + "'s turn";
    }
}

function displayPlayers(gamestate){
    const playersArea = document.getElementById("players");
    playersArea.textContent = "";
    gamestate.players.forEach((player) => {
        const playerSection = document.createElement("div");
        const nameSection = document.createElement("p");
        const cardCountSection = document.createElement("p");
        const trioSection = document.createElement("p");
        const revealedCardsSection = document.createElement("p");
        nameSection.textContent = player.name;
        cardCountSection.textContent = "Cards: " + player.cardCount;
        trioSection.textContent = "Trios: " + player.trios.join(", ");
        const revealedValues = player.revealedCards.map((card) => card.value);
        revealedCardsSection.textContent = "Revealed Cards: " + revealedValues.join(", ");
        playerSection.appendChild(nameSection);
        playerSection.appendChild(cardCountSection);
        playerSection.appendChild(trioSection);
        playerSection.appendChild(revealedCardsSection);
        playersArea.appendChild(playerSection);
    });
}

function displayCenter(gamestate){
    const centerSection = document.getElementById("center-cards");
    centerSection.textContent = "";
    gamestate.center.forEach((card) => {
        const cardButton = document.createElement("button");
        if (card.revealed){
            cardButton.textContent = card.value;
        }else{
            cardButton.textContent = "?";
        }
        centerSection.appendChild(cardButton);
    })
}

async function updateGame(){
    const gameState = await getGameState();
    displayCenter(gameState);
    displayTurn(gameState);
    displayHand(gameState);
    displayPlayers(gameState);
    
}

updateGame();