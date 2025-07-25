// ✅ ELEMENTS
const basket = document.getElementById('basket');
const scoreDisplay = document.getElementById('score');
const catchSound = document.getElementById('catch-sound');
const crashSound = document.getElementById('crash-sound');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const gameContainer = document.querySelector('.game-container');
const heartImages = document.querySelectorAll('.heart');

const pizzaRewardBox = document.getElementById("dominosReward");
const meeshoRewardBox = document.getElementById("meeshoReward");
const zeptoRewardBox = document.getElementById("zeptoReward");
const jobRewardBox = document.getElementById("jobReward");

const pizzaContinueBtn = document.getElementById("dominosContinueBtn");
const meeshoContinueBtn = document.getElementById("meeshoContinueBtn");
const zeptoContinueBtn = document.getElementById("zeptoContinueBtn");
const jobContinueBtn = document.getElementById("jobContinueBtn");
const restartBtn = document.getElementById("restartBtn");

// ✅ GAME STATE
let lives = 3;
let maxLives = 3;
let score = 0;
let basketSpeed = 30;
let fallInterval = 1500;
let basketX;
let gameEnded = false;
let consecutiveCatches = 0;
let diamondCount = 0;
let gamePaused = true;
let bombCount = 0;

let pizzaDropped = false;
let jobDropped = false;
let meeshoDropped = false;
let zeptoDropped = false;
let pizzaDropped2 = false;
let zeptoDropped2 = false;
let meeshoDropped2 = false;
let jobDropped2 = false;

let previousDiamondX = [];

window.onload = () => {
  gameContainer.style.display = "block";
  basketX = window.innerWidth / 2 - basket.offsetWidth / 2;
  basket.style.left = basketX + "px";
  gamePaused = false;

  setInterval(() => {
    if (!gameEnded && !gamePaused) {
      const dropCount = Math.floor(Math.random() * 2) + 1; // 1–2 items

      let usedX = [];

      for (let i = 0; i < dropCount; i++) {
        let posX;
        let attempts = 0;
        do {
          posX = Math.random() * (window.innerWidth - 80);
          attempts++;
        } while (usedX.some(x => Math.abs(x - posX) < 100) && attempts < 10);
        usedX.push(posX);
        createItem(posX);
      }
    }
  }, fallInterval);

  if (restartBtn) {
    restartBtn.addEventListener("click", () => location.reload());
  }
};

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') move('left');
  else if (e.key === 'ArrowRight') move('right');
});
['click', 'touchstart'].forEach(eventType => {
  leftBtn?.addEventListener(eventType, () => move('left'));
  rightBtn?.addEventListener(eventType, () => move('right'));
});

function move(direction) {
  if (gameEnded || gamePaused) return;
  const containerWidth = gameContainer.clientWidth;
  const basketWidth = basket.offsetWidth;
  if (direction === 'left') {
    basketX = Math.max(0, basketX - basketSpeed);
  } else if (direction === 'right') {
    basketX = Math.min(containerWidth - basketWidth, basketX + basketSpeed);
  }
  basket.style.left = basketX + 'px';
}

function createItem(forcedX = null) {
  if (gameEnded || gamePaused) return;

  const item = document.createElement('div');
  item.classList.add('falling-item');

  const posX = forcedX !== null ? forcedX : Math.random() * (window.innerWidth - 80);
  const posY = Math.floor(Math.random() * 120); // more vertical randomness

  item.style.left = posX + 'px';
  item.style.top = posY + 'px';

  let type = 'diamond';
  let image = 'diamond.png';
  const rand = Math.random();

  const bombLimit = score < 40 ? 2 : Math.floor((score - 40) / 20) + 5;
  if (rand < 0.15 && score > 10 && bombCount < bombLimit) {
    type = 'bomb';
    image = 'bomb 1.png';
    bombCount++;
  } else if (score >= 40 && score < 60 && !pizzaDropped) {
  type = 'pizza';
  image = 'dominos.png';
  pizzaDropped = true;
} else if (score >= 60 && score < 80 && !pizzaDropped2) {
  type = 'pizza';
  image = 'dominos.png';
  pizzaDropped2 = true;
} else if (score >= 80 && score < 100 && !zeptoDropped) {
  type = 'zepto';
  image = 'zepto.png';
  zeptoDropped = true;
} else if (score >= 100 && score < 120 && !meeshoDropped) {
  type = 'meesho';
  image = 'meesho.png';
  meeshoDropped = true;
} else if (score >= 120 && score < 150 && !zeptoDropped2) {
  type = 'zepto';
  image = 'zepto.png';
  zeptoDropped2 = true;
} else if (score >= 150 && score < 180 && !meeshoDropped2) {
  type = 'meesho';
  image = 'meesho.png';
  meeshoDropped2 = true;
} else if (score >= 200 && score < 230 && !jobDropped) {
  type = 'job';
  image = 'job.png';
  jobDropped = true;
} else if (score >= 230 && score < 250 && !jobDropped2) {
  type = 'job';
  image = 'job.png';
  jobDropped2 = true;
}


  item.dataset.type = type;
  item.style.backgroundImage = `url('${image}')`;
  gameContainer.appendChild(item);

  if (type === 'diamond') {
    previousDiamondX.push(posX);
    if (previousDiamondX.length > 10) previousDiamondX.shift();
  }

let speed;

// Reward items always fall at the same speed
if (['pizza', 'job', 'meesho', 'zepto'].includes(type)) {
  speed = 7;
} 
// Bombs increase speed based on score
else if (type === 'bomb') {
  if (score < 40) speed = 2.5;
  else if (score < 80) speed = 3;
  else if (score < 120) speed = 4;
  else if (score < 180) speed = 5;
  else speed = 6; // faster after 180
} 
// Diamonds: constant speed before 100, increase after
else if (type === 'diamond') {
  if (score <= 100) speed = 1.8; // same speed from 0 to 100
  else speed = 2.5; // faster after 100
}


  function fall() {
  if (gameEnded || gamePaused) {
    item.remove();
    return;
  }

  const top = parseFloat(item.style.top);
  if (top + item.offsetHeight < window.innerHeight) {
    item.style.top = top + speed + 'px';
    item.style.zIndex = '5';

    if (isCaught(item)) {
      if (type === 'diamond') {
        score++;
        scoreDisplay.textContent = 'Score: ' + score;
        catchSound.play();
        item.remove();

        consecutiveCatches++;
        if (consecutiveCatches === 5 && lives < maxLives) {
          lives++;
          const newHeart = document.createElement("img");
          newHeart.src = "red heart.png";
          newHeart.classList.add("heart");
          document.getElementById("hearts").appendChild(newHeart);
          consecutiveCatches = 0;
        }

      } else if (type === 'bomb') {
        crashSound.play();
        item.remove();
        gameEnded = true;
        gameOver();

      } else {
        // ✅ REWARD (pizza, meesho, etc.)
        catchSound.play();
        item.remove();
        gamePaused = true;
        gameContainer.style.display = "none";

        // 🔥 STORE CAUGHT REWARD TO LOCALSTORAGE
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
        const userMobileKey = currentUser.mobile ? `caughtOffers_${currentUser.mobile}` : "caughtOffers_guest";
        const caughtOffers = JSON.parse(localStorage.getItem(userMobileKey) || "[]");

        let rewardLabel = "", rewardValue = "";

        if (type === 'pizza') {
          rewardLabel = "Pizza Offer";
          rewardValue = "Flat 50% off on your next order!";
          pizzaRewardBox.style.display = "flex";
        } else if (type === 'meesho') {
          rewardLabel = "Meesho Discount";
          rewardValue = "₹100 off on your first purchase!";
          meeshoRewardBox.style.display = "flex";
        } else if (type === 'zepto') {
          rewardLabel = "Zepto Reward";
          rewardValue = "Free delivery for 7 days!";
          zeptoRewardBox.style.display = "flex";
        } else if (type === 'job') {
          rewardLabel = "Job Hunt Bonus";
          rewardValue = "Get priority access to internships!";
          jobRewardBox.style.display = "flex";
        }

        // Save the reward to localStorage
        if (rewardLabel && rewardValue) {
          caughtOffers.push({ label: rewardLabel, value: rewardValue });
          localStorage.setItem(userMobileKey, JSON.stringify(caughtOffers));
        }
      }

    } else {
      requestAnimationFrame(fall);
    }

  } else {
    item.remove();

    if (type === 'diamond') {
      if (lives > 0) {
        lives--;
        const heartElems = document.getElementsByClassName("heart");
        if (heartElems.length > 0) {
          document.getElementById("hearts").removeChild(heartElems[heartElems.length - 1]);
        }
      }

      consecutiveCatches = 0;

      if (lives === 0) {
        gameEnded = true;
        gameOver();
      }
    }
  }
}

  fall();
}

function isCaught(item) {
  const itemRect = item.getBoundingClientRect();
  const basketRect = basket.getBoundingClientRect();
  const verticalOffset = 8;
  const horizontalBuffer = 35;
  return (
    itemRect.bottom >= basketRect.top + verticalOffset &&
    itemRect.right - horizontalBuffer >= basketRect.left &&
    itemRect.left + horizontalBuffer <= basketRect.right
  );
}

function gameOver() {
  gameContainer.style.display = "none";
  const gameOverScreen = document.getElementById("gameOverScreen");
  const finalScoreText = document.getElementById("finalScoreText");
  gameOverScreen.style.display = "flex";
  finalScoreText.textContent = "Your score: " + score;
}

// ✅ Reward Continue Buttons
pizzaContinueBtn.onclick = () => {
  pizzaRewardBox.style.display = 'none';
  gameContainer.style.display = 'block';
  gamePaused = false;
};
meeshoContinueBtn.onclick = () => {
  meeshoRewardBox.style.display = 'none';
  gameContainer.style.display = 'block';
  gamePaused = false;
};
zeptoContinueBtn.onclick = () => {
  zeptoRewardBox.style.display = 'none';
  gameContainer.style.display = 'block';
  gamePaused = false;
};
jobContinueBtn.onclick = () => {
  jobRewardBox.style.display = 'none';
  gameContainer.style.display = 'block';
  gamePaused = false;
};

// ✅ Window Resize Support
window.addEventListener('resize', () => {
  if (!gameEnded && gameContainer.style.display !== 'none') {
    basketX = Math.min(window.innerWidth - basket.offsetWidth, basketX);
    basket.style.left = basketX + 'px';
  }
});
