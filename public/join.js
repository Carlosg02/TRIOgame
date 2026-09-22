const joinButton = document.querySelector("#join-game-button");
const playerNameInput = document.querySelector("#player-name");
const joinMessage = document.querySelector("#join-message");

joinButton.addEventListener("click", function(){
    const playerName = playerNameInput.value.trim();
    if (playerName) {
        joinMessage.textContent = "Welcome, " + playerName + "!"
    } else{
        joinMessage.textContent = "Please enter your name to join"
    }
})