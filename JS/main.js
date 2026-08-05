//* GLOBAL DOM ELEMENTS

/*------ screens ----------*/
const startScreenNode = document.querySelector("#start-screen")
const gameScreenNode = document.querySelector("#game-screen")
const winScreenNode = document.querySelector("#win-screen")
const loseScreenNode = document.querySelector("#lose-screen")
const gameBoxNode = document.querySelector("#game-box")


/*------ buttons ----------*/

const startBtnNode = document.querySelector("#start-btn")

const playAgainBtnNode = document.querySelector("#play-again-btn")

const tryAgainBtnNode = document.querySelector("#try-again-btn")

/*------ counters ----------*/

const plantCounterNode = document.querySelector("#plant-counter")

const woodCounterNode = document.querySelector("#wood-counter")

const rockCounterNode = document.querySelector("#rock-counter")

/*------ countdown ----------*/

const countdownNode = document.querySelector("#countdown")

/*------ Assets ----------*/
const sunNode = document.querySelector("#sun")
const fireNode = document.querySelector("#fire")

/*----------- player-----------*/



//* GLOBAL GAME VARIABLES

let playerObj = null
let gameResources = []; // let, not const: filter() reassigns it when resources are collected

let spawnIntervalId = null;
let gameIntervalId = null;
let timeGame = 45;
let timerIntervalId = null;

let resourceCounts = {
    plant: 0,
    rock: 0,
    wood: 0
};

const RESOURCE_GOALS = { plant: 5, wood: 6, rock: 9 }

const layerIds = {
  rock: 'rocks-layer',
  plant: 'plants-layer',
  wood: 'wood-layer'
};



//* GLOBAL GAME FUNCTIONS

function resetGame() {

    // 1. stop any interval that could still be running from the previous game
    clearInterval(gameIntervalId)
    clearInterval(spawnIntervalId)
    clearInterval(timerIntervalId)

    // 2. remove the old player from the screen (if there was one)
    if (playerObj) {
        playerObj.node.remove()
        playerObj = null
    }

    // 3. remove every resource still on the ground and empty the array
    gameResources.forEach((resource) => resource.node.remove())
    gameResources = []

    // 4. put the counters and the timer back to their starting values
    resourceCounts = { plant: 0, rock: 0, wood: 0 }
    timeGame = 45

    fireNode.style.display = "none";

    updateCounterUI()
    updateCountdown()
    updateSunPosition()

    // 5. hide every pile sprite again
    updatePileDisplay("plant")
    updatePileDisplay("rock")
    updatePileDisplay("wood")
}


function startGame() {

    // 0. clean up whatever is left from a previous game
    resetGame()

    // 1. chnage the screen
    startScreenNode.style.display = "none"
    winScreenNode.style.display = "none"
    loseScreenNode.style.display = "none"
    gameScreenNode.style.display = "flex"

    // 2. add the initial elements
    playerObj = new Player()

    //3. start resources spawning
    startResourceSpawner();
    startCountdown()

   

    // 3. strat the main interval of the game (main 60 frames per second)

    gameIntervalId = setInterval(gameLoop, Math.floor(1000/60))


}
// ------- resources ------------ //

function resourceSpawn() {

    const randomPosX = Math.floor(Math.random() * (gameBoxNode.clientWidth - 40));
    const randomPosY = Math.floor(Math.random() * (gameBoxNode.clientHeight - 40));

    // 2. Pick a random number between 0 and 2 to choose a class
    const randomType = Math.floor(Math.random() * 3);
    let newResource;

    if (randomType === 0) {
        newResource = new Plant(randomPosX,randomPosY) 
    } else if (randomType === 1){
        newResource = new Rock(randomPosX,randomPosY) 
    } else if (randomType === 2){
        newResource = new Wood(randomPosX,randomPosY) 
    }
    
   gameResources.push(newResource);
   

}

function startResourceSpawner() {
    

    // 2. Set an alarm to spawn ONE single item every x ms 
    spawnIntervalId = setInterval(resourceSpawn, 1000);
}



function checkCollision(element1, element2) {
  return (
    element1.x < element2.x + element2.width &&
    element1.x + element1.width > element2.x &&
    element1.y < element2.y + element2.height &&
    element1.y + element1.height > element2.y
  ); // true if colliding, false if not colliding
}


function updatePileDisplay(type) {
  const layer = document.getElementById(layerIds[type]);
  if (!layer) return;

  const sprites = layer.querySelectorAll('.pile-item');
  sprites.forEach(sprite => {
    const index = parseInt(sprite.dataset.index, 10);
    // Show sprite if collected count reaches its index, hide otherwise
    sprite.classList.toggle('hidden', index > resourceCounts[type]);
  });
}


function checkCollisionPlayerResource(){
    // 1. Loop through every resource on the ground using forEach
    gameResources.forEach((resource) => {
        
        // Check if player collides with this specific resource
        if (checkCollision(playerObj, resource)) {
            
            // Increment counter based on class type
            if (resource instanceof Plant) {
                resourceCounts.plant++;
                updatePileDisplay("plant");
            } else if (resource instanceof Rock) {
                resourceCounts.rock++;
                updatePileDisplay("rock");
            } else if (resource instanceof Wood) {
                resourceCounts.wood++;
                updatePileDisplay("wood");
            }

            // 2. Remove the node from the screen
            resource.node.remove();

            // Mark this resource as collected
            resource.isCollected = true;

            // Update screen counters
            updateCounterUI();
        }
    });

    // 2. Filter out collected resources so gameResources only contains active items
    gameResources = gameResources.filter((resource) => !resource.isCollected);
}

function updateCounterUI() {

    plantCounterNode.innerText = `${resourceCounts.plant}/${RESOURCE_GOALS.plant}`

    woodCounterNode.innerText = `${resourceCounts.wood}/${RESOURCE_GOALS.wood}`

    rockCounterNode.innerText = `${resourceCounts.rock}/${RESOURCE_GOALS.rock}`

}

// ---------- sun (extra) ------------ //

function updateSunPosition() {
    const totalTime = 45;
    // progress moves from 0 (at 45s left) to 1 (at 0s left)
    const progress = (totalTime - timeGame) / totalTime; 

    // Point A (Top-Left)
    const startX = 0;
    const startY = 0;

    // Point B (Target Bottom-Right)
    const endX = 460;
    const endY = 175;

    // X moves in a straight line across
    const currentX = startX + (endX - startX) * progress;

    // Y uses progress squared to create the downward arc shown in your image
    const currentY = startY + (endY - startY) * Math.pow(progress, 2);

    sunNode.style.left = `${currentX}px`;
    sunNode.style.top = `${currentY}px`;
}

// ---------- countdown ------------ //

function startCountdown() {
  timerIntervalId = setInterval(() => {
    timeGame --;

    updateCountdown()
    updateSunPosition()

   if (timeGame <= 0) {
      clearInterval(timerIntervalId);
    }

  }, 1000);
}




function updateCountdown(){

    // Converts timeGame to a string and pads it with a leading "0" if it's shorter than 2 digits
    const formattedSeconds = String(timeGame).padStart(2, "0");

    countdownNode.innerText = `00:${formattedSeconds}`

}




// ---------- game essentials ------------ //

function gameLoop() {
    // console.log("this is running 60 times per second") // 60 fps (test but dont keep uncommented)

    checkCollisionPlayerResource();
    checkGameStatus()

}


function gameLose(){

   playerObj.changeSprite("./Images/player-lose.png")

    // stopping the interval 
    clearInterval(gameIntervalId)
    clearInterval(spawnIntervalId)
    clearInterval(timerIntervalId);

    setTimeout(() => {
        gameScreenNode.style.display = "none";
        loseScreenNode.style.display = "flex";
    }, 3000);

}


function gameWin(){

    fireNode.style.display = "block";
    playerObj.changeSprite("./Images/player-win.png")

    // 2. Stop game loops so character/timer freeze while fire plays
    clearInterval(gameIntervalId);
    clearInterval(spawnIntervalId);
    clearInterval(timerIntervalId);

    // 3. Wait 2 seconds (2000ms) before switching to the win screen
    setTimeout(() => {
        gameScreenNode.style.display = "none";
        winScreenNode.style.display = "flex";
    }, 3000);


}




function checkGameStatus() {
    // Only check the final outcome when the timer reaches 0
    if (timeGame <= 0) {
        const hasWon = 
            resourceCounts.plant >= RESOURCE_GOALS.plant &&
            resourceCounts.wood >= RESOURCE_GOALS.wood &&
            resourceCounts.rock >= RESOURCE_GOALS.rock;

        if (hasWon) {
            gameWin();
        } else {
            gameLose();
        }
    }
}





//* EVENT LISTENERS

startBtnNode.addEventListener("click", startGame)

playAgainBtnNode.addEventListener("click", startGame)

tryAgainBtnNode.addEventListener("click", startGame)


window.addEventListener("keydown", (event) => {

    if (!playerObj) {
        return // if the player hasnt been created then dont run this function
    }

    event.preventDefault() // removes any defalut behaviour of the action (ex scroll)

    if (event.key === "ArrowUp") {
        //console.log("trying to move the player up") (TEST)
        playerObj.moveUp()
    } else if (event.key === "ArrowDown") {
        playerObj.moveDown()
        //console.log("trying to move the player down") (TEST)
    }else if (event.key === "ArrowRight") {
        playerObj.moveRight()

    } else if (event.key === "ArrowLeft") {
        playerObj.moveLeft()

    }
    
})

//* TEST

