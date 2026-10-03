
async function getGameState(){
    const playerId = sessionStorage.getItem("playerId");
    if (playerId === null){
        return;
    }
    const response = await fetch(`/api/game/player/${playerId}`);
    const data = await response.json();
    return data;
}

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

    // console.log("Reveal response:", data);

    // if (response.ok){
    //     const state = await getGameState();
    //     console.log("State immediately after reveal:", state);
    //     updateGame();
    // }
    if (response.ok){
        updateGame();
    }
}

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
    playerHandArea.textContent = "";
    gamestate.hand.forEach((card) => {
        const cardButton = document.createElement("button");
        cardButton.textContent = card.value;
        playerHandArea.appendChild(cardButton);
    });

    const lowButton = document.createElement("button");
    const highButton = document.createElement("button");
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
        const lowButton = document.createElement("button");
        const highButton = document.createElement("button");
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
    centerSection.textContent = "";
    gamestate.center.forEach((card) => {
        const cardButton = document.createElement("button");
        cardButton.addEventListener("click", async function(){
            await revealCenterCard(card.id);
        });
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

setInterval(() =>{
    updateGame();
},1000);