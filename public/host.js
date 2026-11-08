const playerList = document.querySelector("#player-list")
const lobbyButtons = document.querySelectorAll(".lobby-button");
const selectionMessage = document.querySelector('#selection-message')
const startGameButton = document.querySelector("#start-game-button");
const startMessage = document.querySelector('#start-message')
const hostNameInput = document.querySelector("#host-name");


let playerCount = 0;
let currentPlayers = [];
let startingPlayer = null;

lobbyButtons.forEach(function(button){
    button.addEventListener("click", async function(){
        const hostName = hostNameInput.value.trim();
        const hostPlayerId = sessionStorage.getItem("playerId");

        if ( !hostName ){
            selectionMessage.textContent = "Please enter your name first";
            return;
        }

        const selectedCount = parseInt(button.textContent);
        
        const responseConfig = await fetch("/api/game/configure",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                playerCount: selectedCount
            })
        });

        const dataConfig = await responseConfig.json();

        if(responseConfig.ok){
            playerCount = selectedCount;
            selectionMessage.textContent = dataConfig.message;

            // Remove selection styling from all buttons
            lobbyButtons.forEach(function(btn){
                btn.style.backgroundColor = "";
                btn.classList.remove("selected");
            });

            // Highlight the selected button
            button.classList.add("selected");

        }else{
            selectionMessage.textContent = dataConfig.message;
        }

        const playersResponse = await fetch("/api/players");
        const playersData = await playersResponse.json();

        const hostAlreadyJoined = playersData.players.some((player) => {
            return player.id === hostPlayerId;
        });

        if (responseConfig.ok && !hostAlreadyJoined){
            const responsePlayer = await fetch("/api/players",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: hostName
                })
            });

            if (responsePlayer.ok){
                const dataPlayer = await responsePlayer.json();
                sessionStorage.setItem("playerId", dataPlayer.player.id);
            }
            
        }
        
    });
})

function loadPlayers() {
    fetch("/api/players")
        .then(response => response.json())
        .then(data => {
            currentPlayers = data.players;

            playerList.innerHTML = "";

            currentPlayers.forEach((player) => {
                const newLi = document.createElement("li");

                newLi.textContent = player.name;

                // Select which player starts the game
                newLi.addEventListener("click", function() {
                    startingPlayer = player.id;
                    loadPlayers();
                });

                // Highlight the selected starting player
                if (player.id === startingPlayer) {
                    newLi.classList.add("starting-player");
                }

                playerList.appendChild(newLi);
            });
        });
}


startGameButton.addEventListener("click",async function(){
    if (startingPlayer === null){
        startMessage.textContent = "Please select a starting player.";
        return;
    }

    const response = await fetch("/api/game", {
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            startingPlayerId: startingPlayer
        })
    });

    const data = await response.json();

    if (response.ok){
        window.location.href = "game.html";
    }

    startMessage.textContent = data.message;
})

loadPlayers();

//refresh after connecting or reconnecting to Socket.io
socket.on("connect", () => {
    console.log("Connected to TRIO, Syncing player list...");
    loadPlayers();
});

//Update plaeyr list when a new player joins
socket.on("playersUpdated", () => {
    console.log("Players update event received. Refreshing lobby...");
    loadPlayers();
});
