const lobbyButtons = document.querySelectorAll(".lobby-button");
const selectionMessage = document.querySelector('#selection-message')

let playerCount = 0;

lobbyButtons.forEach(function(button){
    button.addEventListener("click", function(){
        lobbyButtons.forEach(function(btn) {
            btn.style.backgroundColor = "";
        });
        playerCount = parseInt(button.textContent)
        selectionMessage.textContent ="You have selected " + playerCount +" players!"
        button.style.backgroundColor = "#A6B1BA"
    })
})

const startGameButton = document.querySelector("#start-game-button");
const startMessage = document.querySelector('#start-message')

startGameButton.addEventListener("click", function(){
    if (playerCount === 0) {
        startMessage.textContent = "Please select the number of players before starting the game."
    }else{
        startMessage.textContent = "Starting game with " + playerCount + " players!"
    }
})