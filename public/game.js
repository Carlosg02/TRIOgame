
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
        nameSection.textContent = player.name;
        cardCountSection.textContent = "Cards: " + player.cardCount;
        playerSection.appendChild(nameSection);
        playerSection.appendChild(cardCountSection);
        playersArea.appendChild(playerSection);
    });
    
}

async function updateGame(){
    const gameState = await getGameState();
    displayTurn(gameState);
    displayHand(gameState);
    displayPlayers(gameState);
}

updateGame();