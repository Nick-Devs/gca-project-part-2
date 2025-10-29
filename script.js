const game = document.getElementById("game");
const bucket = document.getElementById("bucket");
const scoreDisplay = document.getElementById("score");
const menu = document.getElementById("menu");
const countdownEl = document.getElementById("countdown");

let score = 0;
let bucketX = window.innerWidth / 2;
let drops = [];
let lastDropTime = 0;
let dropSpeed = 1;
const minDropInterval = 200;
let baseDropInterval = 5000;
let dropInterval = baseDropInterval;
let difficulty = "normal";

function startCountdown(callback) {
    let count = 3;
    countdownEl.textContent = count;
    countdownEl.classList.remove("hidden");

    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownEl.textContent = count;
        } else {
            countdownEl.textContent = "GO!";
            setTimeout(() => {
                countdownEl.classList.add("hidden");
                callback();
            }, 800);
            clearInterval(interval);
        }
    }, 1000);
}

function startGame(selectedDifficulty) {
    difficulty = selectedDifficulty;
    menu.classList.add("hidden");

    switch (difficulty) {
        case "easy":
            baseDropInterval = 7500;
            dropSpeed = 0.8;
            break;
        case "hard":
            baseDropInterval = 3500;
            dropSpeed = 1.5;
            break;
        default:
            baseDropInterval = 5000;
            dropSpeed = 1;
            break;
    }

    dropInterval = baseDropInterval;

    startCountdown(() => {
        game.classList.remove("hidden");
        requestAnimationFrame(gameLoop);
    });
}


function createDrop() {
    const drop = document.createElement("div");
    drop.classList.add("drop");
    drop.style.left = Math.random() * (window.innerWidth - 20) + "px";
    drop.style.top = "0px";
    game.appendChild(drop);
    drops.push(drop);
}

function moveBucket(e) {
    const step = 15;
    if (e.key === "ArrowLeft" && bucketX > 0) bucketX -= step;
    if (e.key === "ArrowRight" && bucketX < window.innerWidth - bucket.offsetWidth)
        bucketX += step;
    bucket.style.left = bucketX + "px";
}

function updateDrops() {
    for (let i = drops.length - 1; i >= 0; i--) {
        const drop = drops[i];
        let top = parseFloat(drop.style.top);
        top += dropSpeed;
        drop.style.top = top + "px";

        const dropRect = drop.getBoundingClientRect();
        const bucketRect = bucket.getBoundingClientRect();

        if (
            dropRect.bottom >= bucketRect.top &&
            dropRect.left >= bucketRect.left &&
            dropRect.right <= bucketRect.right
        ) {
            score += 10;
            scoreDisplay.textContent = "Score: " + score;
            game.removeChild(drop);
            drops.splice(i, 1);
        } else if (top > window.innerHeight - 20) {
            score -= 5;
            scoreDisplay.textContent = "Score: " + score;
            game.removeChild(drop);
            drops.splice(i, 1);
        }
    }
}

function updateDifficulty() {
    const difficultyFactor = Math.floor(score / 100);
    let rampMultiplier = 1;

    switch (difficulty) {
        case "easy":
            rampMultiplier = 0.6;
            break;
        case "hard":
            rampMultiplier = 1.4;
            break;
        default:
            rampMultiplier = 1;
            break;
    }

    dropInterval = Math.max(
        minDropInterval,
        baseDropInterval - difficultyFactor * 800 * rampMultiplier
    );
}

function gameLoop(timestamp) {
    if (timestamp - lastDropTime > dropInterval) {
        createDrop();
        lastDropTime = timestamp;
    }

    updateDrops();
    updateDifficulty();
    requestAnimationFrame(gameLoop);
}

window.addEventListener("resize", () => {
    if (bucketX > window.innerWidth - bucket.offsetWidth) {
        bucketX = window.innerWidth - bucket.offsetWidth - 10;
    }
    bucket.style.left = bucketX + "px";

    for (let drop of drops) {
        const left = parseFloat(drop.style.left);
        if (left > window.innerWidth - 20) {
            drop.style.left = window.innerWidth - 25 + "px";
        }
    }
});

window.addEventListener("keydown", moveBucket);
