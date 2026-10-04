const playerList = document.querySelector("#player-list")
const lobbyButtons = document.querySelectorAll(".lobby-button");
const selectionMessage = document.querySelector('#selection-message')
const startGameButton = document.querySelector("#start-game-button");
const startMessage = document.querySelector('#start-message')


let playerCount = 0;
let currentPlayers = [];
let startingPlayer = null;

lobbyButtons.forEach(function(button){
    button.addEventListener("click", async function(){
        lobbyButtons.forEach(function(btn) {
            btn.style.backgroundColor = "";
        });
        playerCount = parseInt(button.textContent)
        selectionMessage.textContent ="You have selected " + playerCount +" players!"
        button.style.backgroundColor = "#A6B1BA"
        const response = await fetch("/api/game/configure",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                playerCount: playerCount
            })
        });
    });
})

function loadPlayers() {
    fetch("/api/players")
        .then(response => response.json())
        .then(data => {
            currentPlayers = data.players

            playerList.innerHTML = ""

            currentPlayers.forEach((player)=>{
                const newLi = document.createElement('li');
                newLi.addEventListener("click", function(){
                    startingPlayer = player.id;
                } )
                newLi.textContent = player.name;
                if (player.id === startingPlayer){
                    newLi.style.backgroundColor = "#A6B1BA";
                }
                playerList.appendChild(newLi);
                loadPlayers();
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

    startMessage.textContent = data.message;
})

loadPlayers();

setInterval(loadPlayers,2000)


