/* =============================================
   app.js — El Impostor
   ============================================= */

const players = [];

let playerInput;
let addPlayerBtn;
let startGameBtn;
let impostorInput;

function initializeGameEvents() {

    playerInput   = document.getElementById("playerName");
    addPlayerBtn  = document.getElementById("addPlayerBtn");
    startGameBtn  = document.getElementById("startGameBtn");
    impostorInput = document.getElementById("impostorCount");

    addPlayerBtn.addEventListener("click", addPlayer);

    playerInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") addPlayer();
    });

    startGameBtn.addEventListener("click", startGameHandler);
}

function addPlayer() {

    const name = playerInput.value.trim();

    if (!name) {
        alert("Introduce un nombre");
        return;
    }

    if (players.length >= 50) {
        alert("Máximo 50 jugadores");
        return;
    }

    if (players.includes(name)) {
        alert("Ese jugador ya existe");
        return;
    }

    players.push(name);

    // Cerrar modal tras añadir
    const overlay = document.getElementById("modalOverlay");
    if (overlay) overlay.classList.remove("open");

    renderPlayers();
}

/* renderPlayers() está definida en ui.js y usa el diseño nuevo.
   addDeleteEvents() también viene de ui.js. */

function startGameHandler() {

    if (players.length < 3) {
        alert("Necesitas al menos 3 jugadores");
        return;
    }

    const impostorCount = Number(impostorInput.value);

    if (impostorCount < 1) {
        alert("Debe haber al menos 1 impostor");
        return;
    }

    if (impostorCount >= players.length) {
        alert("Los impostores deben ser menos que los jugadores");
        return;
    }

    const category = document.getElementById("categorySelect").value;

    const gameData = startGame(players, impostorCount, category);

    showRevealScreen(gameData);
}

function addDeleteEvents() {

    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.index);
            players.splice(index, 1);
            renderPlayers();
        });
    });
}

function resetGame() {
    players.length = 0;
    renderGameSetup();
}

document.addEventListener("DOMContentLoaded", () => {
    renderGameSetup();
});