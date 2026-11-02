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

const animalImages = {
    1: "01-jaguar.png",
    2: "02-capybara.png",
    3: "03-macaw.png",
    4: "04-monkey.png",
    5: "05-snake.png",
    6: "06-armadillo.png",
    7: "07-frog.png",
    8: "08-tiger.png",
    9: "09-axolotl.png",
    10: "10-sloth.png",
    11: "11-butterfly.png",
    12: "12-toucan.png"
};

function displayHand(gamestate){
    const playerHandArea = document.getElementById("player-hand");
    const playerId = sessionStorage.getItem("playerId");
    const canReveal = (playerId === gamestate.currentPlayerID) && (!gamestate.turnLocked) && (gamestate.status === "playing");
    playerHandArea.textContent = "";
    gamestate.hand.forEach((card) => {
        const cardButton = document.createElement("button");
        cardButton.classList.add("game-card");

        const cardNumber = document.createElement("span");
        cardNumber.textContent = card.value;

        const animalImage = document.createElement("img");
        animalImage.src = `/assets/animals/${animalImages[card.value]}`;
        animalImage.classList.add("card-animal");

        cardButton.appendChild(cardNumber);
        cardButton.appendChild(animalImage);

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
    .forEach((player,index) => {
        const availableCardCount = player.cardCount - player.revealedCards.length;
        const playerSection = document.createElement("div");
        playerSection.classList.add("opponent-card");
        playerSection.classList.add(`opponent-position-${index + 1}`);
        const nameSection = document.createElement("p");
        const cardCountSection = document.createElement("p");
        const trioSection = document.createElement("p");
        const cardArea = document.createElement("div");
        const opponentHand = document.createElement("div");
        const revealedHand = document.createElement("div");

        cardArea.classList.add("opponent-card-area");
        opponentHand.classList.add("opponent-hand");
        revealedHand.classList.add("revealed-hand");
        const lowButton = document.createElement("button");
        lowButton.disabled = !canReveal || (availableCardCount === 0);
        const highButton = document.createElement("button");
        highButton.disabled = !canReveal || (availableCardCount === 0);
        nameSection.textContent = player.name;
        cardCountSection.textContent = "Cards: " + availableCardCount;
        trioSection.textContent = "Trios: " + player.trios.join(", ");

        // Display remaining hidden cards
        for (let i = 0; i < availableCardCount; i++) {
            const card = document.createElement("div");

            card.classList.add("game-card", "face-down-card");
            card.textContent = "?";

            opponentHand.appendChild(card);
        }
        if (player.revealedCards.length > 0) {
            cardArea.classList.add("has-revealed-cards");
        }
        // Display revealed cards separately
        player.revealedCards.forEach((revealedCard) => {
            const card = document.createElement("div");
            card.classList.add("game-card", "revealed-card");

            const cardNumber = document.createElement("span");
            cardNumber.textContent = revealedCard.value;

            const animalImage = document.createElement("img");
            animalImage.src = `/assets/animals/${animalImages[revealedCard.value]}`;
            animalImage.alt = `Animal for card ${revealedCard.value}`;
            animalImage.classList.add("card-animal");

            card.appendChild(cardNumber);
            card.appendChild(animalImage);

            revealedHand.appendChild(card);
        });
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
        cardArea.appendChild(opponentHand);
        cardArea.appendChild(revealedHand);
        playerSection.appendChild(cardArea);
        playerSection.appendChild(trioSection);
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
        if (card.revealed) {
            cardButton.classList.add("revealed-card");

            const cardNumber = document.createElement("span");
            cardNumber.textContent = card.value;

            const animalImage = document.createElement("img");
            animalImage.src = `/assets/animals/${animalImages[card.value]}`;
            animalImage.alt = `Animal for card ${card.value}`;
            animalImage.classList.add("card-animal");

            cardButton.appendChild(cardNumber);
            cardButton.appendChild(animalImage);

        } else {
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