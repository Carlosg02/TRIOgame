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
            
            lobbyButtons.forEach(function(btn){
                btn.style.backgroundColor = "";
            })

            button.style.backgroundColor = "#A6B1BA"
        }else{
            selectionMessage.textContent = dataConfig.message;
        }

        if (responseConfig.ok && hostPlayerId === null){
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
            currentPlayers = data.players

            playerList.innerHTML = ""

            currentPlayers.forEach((player)=>{
                const newLi = document.createElement('li');
                newLi.addEventListener("click", function(){
                    startingPlayer = player.id;
                    loadPlayers();
                } )
                newLi.textContent = player.name;
                if (player.id === startingPlayer){
                    newLi.style.backgroundColor = "#A6B1BA";
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

setInterval(loadPlayers,2000)


