/**
 * Aquires the current game state from the server to provide the client with updated information about the game
 * @returns Disctionary containing important game state variable and informatio.
 */
async function getGameState(){
    const playerId = sessionStorage.getItem("playerId");
    
    if (playerId === null){
        window.location.href = "join.html";
        return;
    }
    const response = await fetch(`/api/game/player/${playerId}`);
    const data = await response.json();

    if(response.status === 404){
        sessionStorage.removeItem("playerId");
        window.location.href = "join.html";
        return;
    }
    return data;
}
/**
 * Sends post request to server to reveal the chosen card from the center of table.
 * @param {*} cardId  - Id of the card to be revealed from center.
 */
async function revealCenterCard(cardId){
    const playerId = sessionStorage.getItem("playerId");
    const response = await fetch("/api/game/reveal", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            actingPlayerId: playerId,
            source: "center",
            options: {
                cardId: cardId
            }
        })
    });
    const data = await response.json();

    if (response.ok){
        updateGame();
    }
}
/**
 * Sends post request to server to reveal either the lowest or highest card from the target player.
 * @param {*} targetPlayerId - Id of the player whose card will be revealed
 * @param {*} position  - Either lowest or highest. Pertaining to which card will be revealed from player hand
 * Automatically update front end after receiving response
 */
async function revealPlayerCard(targetPlayerId, position){
    const playerId = sessionStorage.getItem("playerId");
    const response = await fetch("/api/game/reveal",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            actingPlayerId: playerId,
            source: "player",
            options: {
                playerId: targetPlayerId,
                position: position
            }
        })
    });
    const data = await response.json();
    console.log(data);
    if (response.ok){
        updateGame();
    }
}

function displayHand(gamestate){
    const playerHandArea = document.getElementById("player-hand");
    const playerId = sessionStorage.getItem("playerId");
    const canReveal = (playerId === gamestate.currentPlayerID) && (!gamestate.turnLocked) && (gamestate.status === "playing");
    playerHandArea.textContent = "";
    gamestate.hand.forEach((card) => {
        const cardButton = document.createElement("button");
        cardButton.textContent = card.value;
        cardButton.classList.add("game-card");
        playerHandArea.appendChild(cardButton);
    });

    const lowButton = document.createElement("button");
    lowButton.disabled = !canReveal;
    const highButton = document.createElement("button");
    highButton.disabled = !canReveal;
    lowButton.textContent = "Reveal Lowest";
    highButton.textContent = "Reveal Highest";
    lowButton.addEventListener("click", async function(){
        await revealPlayerCard(playerId, "lowest");
    });
    highButton.addEventListener("click", async function(){
        await revealPlayerCard(playerId, "highest");
    });

    playerHandArea.appendChild(lowButton);
    playerHandArea.appendChild(highButton);


}

function displayTurn(gamestate){
    const turnMessageArea = document.getElementById("turn-message");
    const player = sessionStorage.getItem("playerId");
    if (gamestate.status === "finished"){
        if (gamestate.winnerID === player){
            turnMessageArea.textContent = "You won!";
        }else{
            const winner = gamestate.players.find((player)=>{
                return player.id === gamestate.winnerID;
            });
            turnMessageArea.textContent = winner.name + " won!";
        }
        return;
    }

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
    const playerId = sessionStorage.getItem("playerId");
    const canReveal = (playerId === gamestate.currentPlayerID) && (!gamestate.turnLocked) && (gamestate.status === "playing");
    playersArea.textContent = "";
    gamestate.players
    .filter((player) => player.id !== playerId)
    .forEach((player) => {
        const availableCardCount = player.cardCount - player.revealedCards.length;
        const playerSection = document.createElement("div");
        playerSection.classList.add("opponent-card");
        const nameSection = document.createElement("p");
        const cardCountSection = document.createElement("p");
        const trioSection = document.createElement("p");
        const revealedCardsSection = document.createElement("p");
        const lowButton = document.createElement("button");
        lowButton.disabled = !canReveal || (availableCardCount === 0);
        const highButton = document.createElement("button");
        highButton.disabled = !canReveal || (availableCardCount === 0);
        nameSection.textContent = player.name;
        cardCountSection.textContent = "Cards: " + player.cardCount;
        trioSection.textContent = "Trios: " + player.trios.join(", ");
        const revealedValues = player.revealedCards.map((card) => card.value);
        revealedCardsSection.textContent = "Revealed Cards: " + revealedValues.join(", ");
        lowButton.textContent = "Reveal Lowest";
        highButton.textContent = "Reveal Highest";
        lowButton.addEventListener("click", async function(){
            await revealPlayerCard(player.id, "lowest");
        });
        highButton.addEventListener("click", async function(){
            await revealPlayerCard(player.id, "highest");
        });
        playerSection.appendChild(nameSection);
        playerSection.appendChild(cardCountSection);
        playerSection.appendChild(trioSection);
        playerSection.appendChild(revealedCardsSection);
        playerSection.appendChild(lowButton);
        playerSection.appendChild(highButton);
        playersArea.appendChild(playerSection);

    });
}

function displayCenter(gamestate){
    const centerSection = document.getElementById("center-cards");
    const playerId = sessionStorage.getItem("playerId");
    const canReveal = (playerId === gamestate.currentPlayerID) && (!gamestate.turnLocked) && (gamestate.status === "playing");
    centerSection.textContent = "";
    gamestate.center.forEach((card) => {
        const cardButton = document.createElement("button");
        cardButton.classList.add("game-card");
        cardButton.disabled = !canReveal || card.revealed;
        cardButton.addEventListener("click", async function(){
            await revealCenterCard(card.id);
        });
        if (card.revealed){
            cardButton.textContent = card.value;
            cardButton.classList.add("revealed-card");
        }else{
            cardButton.textContent = "?";
            cardButton.classList.add("face-down-card");
        }
        centerSection.appendChild(cardButton);
    })
}

const newGameButton = document.querySelector("#new-game-button");
newGameButton.addEventListener("click", async function(){
    const playerId = sessionStorage.getItem("playerId");
    const response = await fetch("/api/game/reset",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            playerId: playerId
        })
    });
    if (response.ok){
        sessionStorage.removeItem("playerId");
        window.location.href = "host.html";
    }
})

function displayNewGameButton(gamestate){
    
    if ( gamestate.status === "finished" && gamestate.hostPlayerID === sessionStorage.getItem("playerId")){
        newGameButton.hidden = false;
        return;
    }
    newGameButton.hidden = true;

}

async function updateGame(){
    const gameState = await getGameState();

    if (gameState === undefined){
        return;
    }
    displayCenter(gameState);
    displayTurn(gameState);
    displayHand(gameState);
    displayPlayers(gameState);
    displayNewGameButton(gameState);
}

updateGame();

setInterval(() =>{
    updateGame();
},1000);