const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const highScoreMessageEl = document.getElementById('highScoreMessage');

let score = 0;
let timeLeft = 60;
let gameRunning = true;
let highScore = localStorage.getItem('highScore') || 0;

// Imágenes
const images = {};
function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

images.santa = loadImage('resources/santa.png');
images.santaDrop = loadImage('resources/santa_drop.png');
images.gift = loadImage('resources/gift.png');
images.tree = loadImage('resources/tree.png');
images.child = loadImage('resources/child.png');
images.grinch = loadImage('resources/grinch.png');

// Santa
const santa = {
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    dropping: false,
    dropTimer: 0
};

// Regalos
let gifts = [];

// Objetos en tierra
let groundObjects = [];
const groundY = canvas.height - 50;

// Tipos de objetos
const objectTypes = [
    { type: 'tree', points: 0, img: images.tree },
    { type: 'child', points: 1, img: images.child },
    { type: 'grinch', points: -1, img: images.grinch }
];

// Función para crear objeto aleatorio
function createGroundObject() {
    const type = objectTypes[Math.floor(Math.random() * objectTypes.length)];
    return {
        x: canvas.width,
        y: groundY,
        width: 50,
        height: 50,
        type: type.type,
        points: type.points,
        img: type.img
    };
}

// Inicializar objetos
for (let i = 0; i < 10; i++) {
    groundObjects.push(createGroundObject());
    groundObjects[i].x = Math.random() * canvas.width;
}

// Click event
canvas.addEventListener('click', () => {
    if (!gameRunning) {
        resetGame();
        return;
    }
    santa.dropping = true;
    santa.dropTimer = 10; // frames para animación
    gifts.push({
        x: santa.x + santa.width / 2,
        y: santa.y + santa.height,
        width: 20,
        height: 20,
        vy: 5
    });
});

// Agregar click al gameOver
gameOverEl.addEventListener('click', resetGame);

// Timer
setInterval(() => {
    if (gameRunning) {
        timeLeft--;
        timerEl.textContent = `Tiempo: ${timeLeft}`;
        if (timeLeft <= 0) {
            endGame();
        }
    }
}, 1000);

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar fondo
    ctx.fillStyle = '#90EE90'; // Verde para tierra
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    // Dibujar Santa
    const santaImg = santa.dropping ? images.santaDrop : images.santa;
    ctx.drawImage(santaImg, santa.x, santa.y, santa.width, santa.height);

    if (santa.dropping) {
        santa.dropTimer--;
        if (santa.dropTimer <= 0) {
            santa.dropping = false;
        }
    }

    // Mover y dibujar objetos en tierra
    groundObjects.forEach(obj => {
        obj.x -= 2; // Scroll
        if (obj.x + obj.width < 0) {
            obj.x = canvas.width;
            const type = objectTypes[Math.floor(Math.random() * objectTypes.length)];
            obj.type = type.type;
            obj.points = type.points;
            obj.img = type.img;
        }
        ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height);
    });

    // Mover y dibujar regalos
    gifts.forEach((gift, index) => {
        gift.y += gift.vy;
        ctx.drawImage(images.gift, gift.x, gift.y, gift.width, gift.height);

        // Check colisión
        if (gift.y + gift.height >= groundY) {
            let hit = false;
            groundObjects.forEach(obj => {
                if (!hit && gift.x < obj.x + obj.width && gift.x + gift.width > obj.x) {
                    score += obj.points;
                    scoreEl.textContent = `Puntuación: ${score}`;
                    hit = true;
                }
            });
            gifts.splice(index, 1);
        }
    });

    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

function endGame() {
    gameRunning = false;
    let message = '';
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        message = '¡Nuevo récord!';
    } else {
        message = `Récord: ${highScore}`;
    }
    finalScoreEl.textContent = `Puntuación final: ${score}`;
    highScoreMessageEl.textContent = message;
    gameOverEl.style.display = 'block';
}

function resetGame() {
    score = 0;
    timeLeft = 60;
    gameRunning = true;
    gifts = [];
    groundObjects.forEach(obj => {
        obj.x = Math.random() * canvas.width;
    });
    scoreEl.textContent = `Puntuación: ${score}`;
    timerEl.textContent = `Tiempo: ${timeLeft}`;
    gameOverEl.style.display = 'none';
    gameLoop();
}

// Iniciar juego
gameLoop();