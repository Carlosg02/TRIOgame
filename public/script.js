const lobbyButtons = document.querySelectorAll(".lobby-button");
const selectionMessage = document.querySelector('#selection-message')

let playerCount = 0;



const startGameButton = document.querySelector("#start-game-button");
const startMessage = document.querySelector('#start-message')

startGameButton.addEventListener("click",async function(){
    if (playerCount === 0) {
        startMessage.textContent = "Please select the number of players before starting the game."
    }else{
        const response = await fetch("/api/game", {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                playerCount: playerCount
            })
        });

        const data = await response.json();
    
        startMessage.textContent = data.message;
    }
})