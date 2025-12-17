const dealerCards = document.getElementById("dealerCards");
const playerCards = document.getElementById("playerCards");
const dealerScore = document.getElementById("dealerScore");
const playerScore = document.getElementById("playerScore");
const resultDiv = document.getElementById("gameResult");

const dealBtn = document.getElementById("dealBtn");
const standBtn = document.getElementById("standBtn");
const hitBtn = document.getElementById("hitBtn");
const restartBtn = document.getElementById("restartBtn");

const ranks = ["2","3","4","5","6","7","8","9","10","jack","queen","king","ace"];
const suits = ["clubs","diamonds","hearts","spades"];

const deck = [];

let dealerHidden = true;

function setMode(mode) {
    const modes = {
        start: { deal: "block", hit: "none", stand: "none", restart: "none" },
        play:  { deal: "none",  hit: "block", stand: "block", restart: "block" },
        end:   { deal: "none",  hit: "none",  stand: "none", restart: "block" }
    };
    const buttons = { deal: dealBtn, hit: hitBtn, stand: standBtn, restart: restartBtn };

    Object.entries(modes[mode]).forEach(([btnKey, display]) => {
        const btn = buttons[btnKey];
        if (!btn) return;

        btn.style.display = display;

        const card = btn.closest('.card');
        if (card) {
            card.classList.toggle('hidden-by-mode', display === "none");
        }
    });
};

function generateDeck() {
    
    for (let suit of suits) {
        for (let rank of ranks) {

            const filename = `${rank}_of_${suit}.png`;

             let value;
            if (rank === "ace") {
                value = 11; 
            } else if (["jack", "queen", "king"].includes(rank)) {
                value = 10;
            } else {
                value = parseInt(rank);
            }

            deck.push({ 
                rank: rank,
                suit: suit,
                img: filename,
                value: value
            });
        }
    }

    for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
}
    console.log(deck);
    return deck;
};

function showCard(card, container, hidden = false) {
    const img = document.createElement("img");
    img.src = hidden ? "cards/card_back.png" : `cards/${card.img}`;
    img.className = "card-img";
    container.appendChild(img);
}; // van ChatGPT om de plaatjes te tonen.

function startGame() {
    setMode("play");

    resultDiv.textContent = "";

    console.log("Deal knop geklikt");

    generateDeck();

    playerHand.push(deck.pop());
    dealerHand.push(deck.pop());
    playerHand.push(deck.pop());
    dealerHand.push(deck.pop());

    playerCards.innerHTML = "";
    dealerCards.innerHTML = "";
    showCard(playerHand[0], playerCards);
    showCard(playerHand[1], playerCards);
    showCard(dealerHand[0], dealerCards);
    showCard(dealerHand[1], dealerCards, true)

    calculateHandScores();
    checkInstantWin();
    logStats();
};

function hit() {
    console.log("Hit knop geklikt");

    const newCard = deck.pop();
    playerHand.push(newCard);
    showCard(newCard, playerCards); 

    calculateHandScores();
    checkPlayerStatus();
    logStats();
};

function stand() {
    console.log("Stand knop geklikt");
    showDealer();
    calculateHandScores();

    while (dealerHandScore < 17) {
        const newCard = deck.pop();
        dealerHand.push(newCard);
        showCard(newCard, dealerCards);
        calculateHandScores();
    }

    winnerCheck();
    logStats();
};

function calculateScore(hand) {
    let score = hand.reduce((total, card) => total + card.value, 0);
    let aces = hand.filter(card => card.rank === "ace").length;

    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }

    return score;
}


function calculateHandScores() {
    playerHandScore = calculateScore(playerHand);
    dealerHandScore = calculateScore(dealerHand);

    playerScore.textContent = `Score: ${playerHandScore}`;

    if (dealerHidden) {
        dealerScore.textContent = "Score: ?";
    } else {
        dealerScore.textContent = `Score: ${dealerHandScore}`;
    }
};

function checkPlayerStatus() {
    if (playerHandScore === 21) {
        handleResult("PLAYER_BLACKJACK");
    } else if (playerHandScore > 21) {
        handleResult("PLAYER_BUST");
    } else {
        resultDiv.textContent = ""; 
    }
};

function winnerCheck() {
    let outcome = null;

    if (playerHandScore > 21) {
        outcome = "PLAYER_BUST";

    } else if (playerHandScore === 21) {
        outcome = "PLAYER_BLACKJACK";

    } else if (dealerHandScore > 21) {
        outcome = "DEALER_BUST";

    } else if (dealerHandScore === 21) {
        outcome = "DEALER_BLACKJACK";

    } else if (playerHandScore > dealerHandScore) {
        outcome = "PLAYER_WINS";

    } else if (dealerHandScore > playerHandScore) {
        outcome = "DEALER_WINS";

    } else {
        outcome = "TIE";
    }

    handleResult(outcome, false);
};

function checkInstantWin() {
    if (playerHandScore === 21) {
        handleResult("PLAYER_BLACKJACK");
    }

    if (dealerHandScore === 21) {
        handleResult("DEALER_BLACKJACK");
    }
};

const OUTCOMES = {
    PLAYER_BLACKJACK: "Blackjack! Je hebt gewonnen!",
    PLAYER_BUST: "Je hebt verloren! Je ging over 21.",
    DEALER_BLACKJACK: "Dealer heeft blackjack! Je hebt verloren.",
    DEALER_BUST: "Je hebt gewonnen! De dealer ging over 21.",
    PLAYER_WINS: "Je hebt gewonnen! Je score is hoger dan die van de dealer.",
    DEALER_WINS: "Je hebt verloren! De dealer heeft een hogere score.",
    TIE: "Gelijkspel!"
};

function handleResult(outcomeKey, revealDealer = true) {
    if (revealDealer) {
        showDealer();
    }
    resultDiv.textContent = OUTCOMES[outcomeKey] || "";
    setMode("end");
}

function showDealer() {
        dealerHidden = false;
        dealerCards.innerHTML = "";
        dealerHand.forEach(card => showCard(card, dealerCards));
        dealerScore.textContent = `Score: ${dealerHandScore}`;
};

function logStats() {
    console.log("Player hand:", playerHand);
    console.log("Dealer hand:", dealerHand);
    console.log("Player score:", playerHandScore);
    console.log("Dealer score:", dealerHandScore);
};


function resetGame() {
    deck.length = 0;

    playerHand = [];
    dealerHand = [];

    playerHandScore = 0;
    dealerHandScore = 0;

    dealerHidden = true;

    playerCards.innerHTML = "";
    dealerCards.innerHTML = "";
    playerScore.textContent = "Score: 0";
    dealerScore.textContent = "Score: 0";
    
    resultDiv.textContent = "";

    console.log("Game gereset");
    setMode("start");
}

let playerHand = [];
let dealerHand = [];

let playerHandScore = 0;
let dealerHandScore = 0;

setMode("start");

dealBtn.addEventListener("click", startGame);
hitBtn.addEventListener("click", hit);
standBtn.addEventListener("click",stand);
restartBtn.addEventListener("click", resetGame);
