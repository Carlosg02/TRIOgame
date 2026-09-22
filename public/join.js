const joinButton = document.querySelector("#join-game-button");
const playerNameInput = document.querySelector("#player-name");
const joinMessage = document.querySelector("#join-message");

joinButton.addEventListener("click", async function(){
    const playerName = playerNameInput.value.trim();
    if (playerName) {
        const response = await fetch("/api/players",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: playerName
            })
        });

        const data = await response.json();

        joinMessage.textContent = data.message;
    } else{
        joinMessage.textContent = "Please enter your name to join"
    }
})