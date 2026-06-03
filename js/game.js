let wordsData = {};
let gameData = [];

async function loadWords() {

    const response =
        await fetch("./data/words.json");

    wordsData =
        await response.json();

    console.log(
        "Categorías cargadas:",
        Object.keys(wordsData)
    );

    renderCategories();

}

loadWords();

function startGame(
    players,
    impostorCount,
    category
) {

    const categoryWords =
        wordsData[category];

    const secretWord =
        categoryWords[
            Math.floor(
                Math.random() *
                categoryWords.length
            )
        ];

    const indices =
        players.map((_, index) => index);

    const shuffled =
        [...indices].sort(
            () => Math.random() - 0.5
        );

    const impostors =
        shuffled.slice(0, impostorCount);

    gameData = players.map(
        (player, index) => ({

            name: player,

            role: impostors.includes(index)
                ? "Eres el impostor"
                : secretWord

        })
    );

    console.log(
        "Categoría:",
        category
    );

    console.log(
        "Palabra:",
        secretWord
    );

    console.log(gameData);

    return gameData;
}

function renderCategories() {

    const categorySelect =
        document.getElementById("categorySelect");

    if (!categorySelect) return;

    categorySelect.innerHTML = "";

    Object.keys(wordsData).forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent =
            category.charAt(0).toUpperCase() +
            category.slice(1);

        categorySelect.appendChild(option);

    });

}