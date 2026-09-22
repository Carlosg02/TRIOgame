const playerList = document.querySelector("#player-list")

let currentPlayers = [];

function loadPlayers() {
    fetch("/api/players")
        .then(response => response.json())
        .then(data => {
            currentPlayers = data.players

            playerList.innerHTML = ""

            currentPlayers.forEach((player)=>{
                const newLi = document.createElement('li');
                newLi.textContent = player.name;
                playerList.appendChild(newLi);
            });
        });
}

loadPlayers();

setInterval(loadPlayers,2000)


