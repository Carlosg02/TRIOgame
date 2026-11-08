const joinButton = document.querySelector("#join-game-button");
const playerNameInput = document.querySelector("#player-name");
const joinMessage = document.querySelector("#join-message");

joinButton.addEventListener("click", async function(){
    const statusResponse = await fetch("/api/game/status");
    const statusData = await statusResponse.json();

    console.log("Current Game status:", statusData.status);

    let endpoint;

    if (statusData.status !== "lobby"){
        endpoint = "/api/players/reconnect";
    }else{
        endpoint = "/api/players";
    }

    const playerName = playerNameInput.value.trim();
    if (playerName) {
        const response = await fetch(endpoint,{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: playerName
            })
        });

        const data = await response.json();

        if (response.ok) {
            let playerId;

            if (endpoint === "/api/players/reconnect") {
                playerId = data.id;
            } else {
                playerId = data.player.id;
            }

            sessionStorage.setItem("playerId", playerId);
            if (endpoint === "/api/players/reconnect") {
                window.location.href = "game.html";
                return;
            }
        }

        joinMessage.textContent = data.message;
    } else{
        joinMessage.textContent = "Please enter your name to join"
    }
})

async function getGameState(){
    const playerId = sessionStorage.getItem("playerId");
    if (playerId === null){
        return;
    }
    const response = await fetch(`/api/game/player/${playerId}`,{
        method : "GET",
        headers: {
            "Content-Type": "application/json"
        },
    });
    const data = await response.json();
    console.log(data);
}

async function checkGameStatus(){
    const playerId = sessionStorage.getItem("playerId");
    if (playerId === null){
        return;
    }
    const response = await fetch("/api/game/status");
    const data = await response.json();
    if (data.status === "playing"){
        window.location.href = "game.html";
    }
}

//Check on initial load
checkGameStatus();

//Check when Socket connects or reconnects
socket.on("connect", () => {
    console.log(" Conncected to TRIO, Checking game status...");
    checkGameStatus();
});

//Check immediately when host starts game
socket.on("gameStarted", () => {
    console.log("Game started, Entering game page...");
    checkGameStatus();
})

