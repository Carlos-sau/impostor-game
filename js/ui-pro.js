/* =============================================
   ui.js — El Impostor
   ============================================= */

let currentPlayerIndex = 0;

/* ══════════════════════════════════════════════
   SETUP
   ══════════════════════════════════════════════ */
function renderGameSetup() {

    document.getElementById("app").innerHTML = `

        <nav class="navbar">
            <a href="index.html" class="logo">
                <span class="logo-icon">⚡</span>
                EL IMPOSTOR
            </a>
        </nav>

        <div class="game-container">

            <div class="game-header">
                <h1 class="game-title">Nueva partida</h1>
            </div>

            <!-- Panel jugadores -->
            <div class="game-panel">

                <div class="empty-state" id="emptyState">
                    <div class="empty-icon">
                        <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="18" cy="14" r="6"/>
                            <path d="M4 38c0-7.732 6.268-14 14-14s14 6.268 14 14"/>
                            <circle cx="34" cy="14" r="5"/>
                            <path d="M34 26c5.523 0 10 4.477 10 10"/>
                        </svg>
                    </div>
                    <p class="empty-title">Aún no hay jugadores</p>
                    <p class="empty-sub">Añade al menos 3 personas para empezar la partida.</p>
                    <button class="btn-add-primary" id="btnAddFirst">+ Añadir jugador</button>
                </div>

                <ul class="players-list" id="playersList" style="list-style:none;padding:0;margin:0;"></ul>

                <div class="panel-footer" id="panelFooter">
                    <span class="player-count"><span id="countNum">0</span> jugadores</span>
                    <button class="btn-add-small" id="btnAddMore">+ Añadir jugador</button>
                </div>

            </div>

            <!-- Config: impostores + categoría -->
            <div class="config-grid" id="configGrid">

                <div class="config-card">
                    <span class="config-label">Impostores</span>
                    <div class="config-stepper">
                        <button class="stepper-btn" id="stepperMinus">−</button>
                        <span class="stepper-val" id="stepperVal">1</span>
                        <button class="stepper-btn" id="stepperPlus">+</button>
                    </div>
                    <input type="hidden" id="impostorCount" value="1">
                </div>

                <div class="config-card">
                    <span class="config-label">Categoría</span>
                    <select class="config-select" id="categorySelect">
                        <option value="">Cargando…</option>
                    </select>
                </div>

            </div>

            <!-- Acciones -->
            <div class="game-actions">
                <button class="btn-start" id="startGameBtn">⚡ Empezar partida</button>
                <a href="index.html" class="btn-back">Cancelar</a>
            </div>

        </div>

        <!-- Modal añadir jugador -->
        <div class="modal-overlay" id="modalOverlay">
            <div class="modal">
                <h2 class="modal-title">Nuevo jugador</h2>
                <input
                    type="text"
                    class="modal-input"
                    id="playerName"
                    placeholder="Nombre del jugador…"
                    maxlength="24"
                    autocomplete="off"
                >
                <div class="modal-actions">
                    <button class="btn-cancel"  id="btnModalCancel">Cancelar</button>
                    <button class="btn-confirm" id="addPlayerBtn">Añadir</button>
                </div>
            </div>
        </div>
    `;

    /* ── Modal ── */
    const overlay = document.getElementById("modalOverlay");

    function openModal() {
        document.getElementById("playerName").value = "";
        overlay.classList.add("open");
        setTimeout(() => document.getElementById("playerName").focus(), 50);
    }

    function closeModal() {
        overlay.classList.remove("open");
    }

    document.getElementById("btnAddFirst").addEventListener("click", openModal);
    document.getElementById("btnAddMore").addEventListener("click",  openModal);
    document.getElementById("btnModalCancel").addEventListener("click", closeModal);
    overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(); });

    /* ── Stepper impostores ── */
    const stepperVal    = document.getElementById("stepperVal");
    const impostorInput = document.getElementById("impostorCount");

    document.getElementById("stepperMinus").addEventListener("click", () => {
        let v = Math.max(1, Number(impostorInput.value) - 1);
        impostorInput.value = v;
        stepperVal.textContent = v;
    });

    document.getElementById("stepperPlus").addEventListener("click", () => {
        let max = players.length > 1 ? players.length - 1 : 10;
        let v = Math.min(max, Number(impostorInput.value) + 1);
        impostorInput.value = v;
        stepperVal.textContent = v;
    });

    /* ── Inicializar app.js + game.js ── */
    initializeGameEvents();
    renderPlayers();
    loadWords();
}

/* ══════════════════════════════════════════════
   RENDER JUGADORES
   ══════════════════════════════════════════════ */
function renderPlayers() {

    const list        = document.getElementById("playersList");
    const emptyState  = document.getElementById("emptyState");
    const panelFooter = document.getElementById("panelFooter");
    const countNum    = document.getElementById("countNum");
    const btnStart    = document.getElementById("startGameBtn");
    const configGrid  = document.getElementById("configGrid");

    if (!list) return;

    const count = players.length;

    if (emptyState)  emptyState.style.display = count === 0 ? "flex" : "none";
    if (panelFooter) panelFooter.classList.toggle("visible", count > 0);
    if (countNum)    countNum.textContent = count;
    if (configGrid)  configGrid.classList.toggle("visible", count > 0);
    if (btnStart)    btnStart.classList.toggle("ready", count >= 3);

    list.innerHTML = players.map((player, index) => `
        <li class="player-item">
            <div class="player-avatar">${player.charAt(0).toUpperCase()}</div>
            <span class="player-name">${escapeHtml(player)}</span>
            <button class="player-remove delete-btn" data-index="${index}" title="Eliminar">✕</button>
        </li>
    `).join("");

    list.classList.toggle("has-players", count > 0);

    addDeleteEvents();
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, c =>
        ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":'&#39;' }[c]));
}

/* ══════════════════════════════════════════════
   REVEAL — turno de cada jugador
   ══════════════════════════════════════════════ */
function showRevealScreen(gameData) {
    currentPlayerIndex = 0;
    renderPlayerTurn(gameData);
}

function renderPlayerTurn(gameData) {

    const player = gameData[currentPlayerIndex];
    const total  = gameData.length;

    document.getElementById("app").innerHTML = `
        <nav class="navbar">
            <a href="index.html" class="logo">
                <span class="logo-icon">⚡</span>
                EL IMPOSTOR
            </a>
        </nav>
        <div class="game-container">
            <div class="game-header">
                <span class="game-label">Jugador ${currentPlayerIndex + 1} de ${total}</span>
                <h1 class="game-title">${escapeHtml(player.name)}</h1>
            </div>
            <p class="reveal-hint">Pulsa el botón para ver tu rol en secreto</p>
            <button class="btn-start ready" id="showRoleBtn">👁 Mostrar mi rol</button>
        </div>
    `;

    document.getElementById("showRoleBtn")
        .addEventListener("click", () => showRole(gameData));
}

function showRole(gameData) {

    const player     = gameData[currentPlayerIndex];
    const isImpostor = player.isImpostor;
    const isLast     = currentPlayerIndex === gameData.length - 1;

    document.getElementById("app").innerHTML = `
        <nav class="navbar">
            <a href="index.html" class="logo">
                <span class="logo-icon">⚡</span>
                EL IMPOSTOR
            </a>
        </nav>
        <div class="game-container">
            <div class="game-header">
                <span class="game-label">Tu carta secreta</span>
                <h1 class="game-title">${escapeHtml(player.name)}</h1>
            </div>

            <div class="flip-card" id="flipCard">
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        ⚡
                        <p>Toca para revelar</p>
                    </div>
                    <div class="flip-card-back ${isImpostor ? "impostor" : ""}">
                        ${isImpostor
                            ? `🎭 ERES EL IMPOSTOR:<br><strong>${escapeHtml(player.role)}</strong>`
                            : `🔑 Tu palabra:<br><strong>${escapeHtml(player.role)}</strong>`
                        }
                    </div>
                </div>
            </div>

            <button class="btn-start" id="nextPlayerBtn" style="display:none;">
                ${isLast ? "¡Empezar partida!" : "Siguiente jugador →"}
            </button>
        </div>
    `;

    document.getElementById("flipCard").addEventListener("click", () => {
    const card = document.getElementById("flipCard");
    const btn  = document.getElementById("nextPlayerBtn");

    card.classList.toggle("flipped");

        // El botón aparece en cuanto se revela por primera vez y ya no se oculta
        if (card.classList.contains("flipped")) {
            btn.style.display = "flex";
            btn.classList.add("ready");
        }
    });

    document.getElementById("nextPlayerBtn")
        .addEventListener("click", () => nextPlayer(gameData));
}

function nextPlayer(gameData) {
    currentPlayerIndex++;
    if (currentPlayerIndex >= gameData.length) {
        showStartMessage();
        return;
    }
    renderPlayerTurn(gameData);
}

function showStartMessage() {

    // Elegir un jugador aleatorio
    const randomPlayer = players[Math.floor(Math.random() * players.length)];

    document.getElementById("app").innerHTML = `
        <nav class="navbar">
            <a href="index.html" class="logo">
                <span class="logo-icon">⚡</span>
                EL IMPOSTOR
            </a>
        </nav>
        <div class="game-container" style="min-height:80vh; justify-content:center;">
            <div class="game-header" style="text-align:center; margin-top:auto;">
                <span class="game-label">Todo listo</span>
                <h1 class="game-title">¡Empieza: ${escapeHtml(randomPlayer)}!</h1>
            </div>

            <p class="reveal-hint">
                Ya podéis empezar a debatir y descubrir al impostor.
            </p>

            <div class="game-actions" style="margin-top:auto;">
                <button class="btn-start ready" id="repeatGameBtn">
                    Jugar con los mismos jugadores
                </button>
                <button class="btn-start ready" id="newGameBtn"
                    style="background:transparent; border:1px solid var(--border); color:var(--muted);">
                    ↩ Nueva partida
                </button>
            </div>
        </div>
    `;

    document.getElementById("repeatGameBtn").addEventListener("click", () => {
        const impostorCount = Number(document.getElementById("impostorCount")?.value) || 1;
        const category = document.getElementById("categorySelect")?.value || Object.keys(wordsData)[0];
        const gameData = startGame(players, impostorCount, category);
        showRevealScreen(gameData);
    });

    document.getElementById("newGameBtn").addEventListener("click", resetGame);
}