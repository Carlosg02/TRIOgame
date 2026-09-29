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

        if (response.ok){
            sessionStorage.setItem("playerId", data.player.id);
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