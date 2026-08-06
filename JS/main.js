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
const snowNode = document.querySelector("#snow")

/*----------- Audio-----------*/



//* GLOBAL GAME VARIABLES

let playerObj = null
let gameResources = []; // let, not const: filter() reassigns it when resources are collected
let raccoonArr = [] 

let spawnIntervalId = null;
let gameIntervalId = null;
let raccoonSpawnIntervalId = null;
let raccoonTimeoutId = null;

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

  // 1. Clear ALL intervals and timeouts
    clearInterval(gameIntervalId)
    clearInterval(spawnIntervalId)
    clearInterval(timerIntervalId)
    clearInterval(raccoonSpawnIntervalId)
    clearTimeout(raccoonTimeoutId)

    // 2. Remove player
    if (playerObj) {
        playerObj.node.remove()
        playerObj = null
    }

    // 3. Clear resources
    gameResources.forEach((resource) => resource.node.remove())
    gameResources = []

    // 4. Clear raccoons from screen and reset array
    raccoonArr.forEach((raccoon) => raccoon.node.remove())
    raccoonArr = []

    // 5. Reset stats and UI
    resourceCounts = { plant: 0, rock: 0, wood: 0 }
    timeGame = 45

    fireNode.style.display = "none";
    snowNode.style.display = "none";

    updateCounterUI()
    updateCountdown()
    updateSunPosition()

    updatePileDisplay("plant")
    updatePileDisplay("rock")
    updatePileDisplay("wood")
}


function startGame() {

    // 0. Clean up everything first
    resetGame();

    // 1. Switch screens
    startScreenNode.style.display = "none";
    winScreenNode.style.display = "none";
    loseScreenNode.style.display = "none";
    gameScreenNode.style.display = "flex";

    // 2. Add player
    playerObj = new Player();

    // 3. Start resources & countdown
    startResourceSpawner();
    startCountdown();

    // 4. DELAY RACCOONS BY 15 SECONDS
    // Nothing spawns until 15000ms passes
    raccoonTimeoutId = setTimeout(() => {
        // First raccoon at 15s mark
        addRaccoon();

        // Then 1 raccoon every 5s afterwards
        raccoonSpawnIntervalId = setInterval(addRaccoon, 5000); 
    }, 15000);

    // 5. Main 60 FPS loop
    gameIntervalId = setInterval(gameLoop, Math.floor(1000 / 60));
}



// ---------- collision generic  ------------ //

function checkCollision(element1, element2) {
  return (
    element1.x < element2.x + element2.width &&
    element1.x + element1.width > element2.x &&
    element1.y < element2.y + element2.height &&
    element1.y + element1.height > element2.y
  ); // true if colliding, false if not colliding
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

// ------- firepile ------------ //

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

// ---------- Raccoon ------------ //

// Track the last Y position used (placed OUTSIDE the function)
let lastRaccoonPosY = null;

function addRaccoon() {
    const raccoonLanes = [139, 177, 215];
    const availableLanes = [];

    // 1. Use forEach to build a list of lanes that match NOT the last used Y position
    raccoonLanes.forEach((laneY) => {
        if (laneY !== lastRaccoonPosY) {
            availableLanes.push(laneY);
        }
    });

    // 2. Pick a random lane from the remaining available options
    const randomIndex = Math.floor(Math.random() * availableLanes.length);
    const chosenPosY = availableLanes[randomIndex];

    // 3. Save this lane for the next spawn check
    lastRaccoonPosY = chosenPosY;

    // Pass the fixed lane Y position into the class
    let raccoonObj = new Raccoon(chosenPosY);
    raccoonArr.push(raccoonObj);
}


function checkRaccoonDespawn(){

    if (raccoonArr.length === 0) {
        return // dont check anything of empty 
    }

    if (raccoonArr[0].x <= (0 - raccoonArr[0].width)) {
        // the first element arrived to the end of the screen, remove it
        raccoonArr[0].node.remove()
        //remove also form the array
        raccoonArr.splice(0, 1)
    }

}



function checkRaccoonSteal() {
    //this is the point where sprites change
    const StealLineX = gameBoxNode.clientWidth - 92;

    raccoonArr.forEach((raccoonObj) => {
        // Only run when raccoon crosses the X threshold and hasn't stolen yet
        if (raccoonObj.x <= StealLineX && !raccoonObj.hasStolen) {

            // 1. Build a list of resource types that currently have stock (> 0)
            const availableResources = [];
            if (resourceCounts.plant > 0) availableResources.push("plant");
            if (resourceCounts.rock > 0) availableResources.push("rock");
            if (resourceCounts.wood > 0) availableResources.push("wood");

            // 2. Only steal if there is at least one resource remaining in the pile
            if (availableResources.length > 0) {
                // Pick a random index from the available resources array
                const randomIndex = Math.floor(Math.random() * availableResources.length);
                const chosenResource = availableResources[randomIndex];

                // 3. Deduct stock and change sprite based on the random choice
                if (chosenResource === "plant") {
                    resourceCounts.plant--;
                    updatePileDisplay("plant");
                    raccoonObj.changeSprite("./Images/Raccoon-plant.png");
                } else if (chosenResource === "rock") {
                    resourceCounts.rock--;
                    updatePileDisplay("rock");
                    raccoonObj.changeSprite("./Images/Raccoon-stone.png");
                } else if (chosenResource === "wood") {
                    resourceCounts.wood--;
                    updatePileDisplay("wood");
                    raccoonObj.changeSprite("./Images/Raccoon-wood.png");
                }

                // Update screen counter UI
                updateCounterUI();

                // Mark so this raccoon doesn't steal again while moving left
                raccoonObj.hasStolen = true;
            }
        }
    });
}



// ---------- game essentials ------------ //

function gameLoop() {
    // console.log("this is running 60 times per second") // 60 fps (test but dont keep uncommented)

     // automaic movement 
    raccoonArr.forEach((raccoonObj) =>{
    raccoonObj.automaticMoveLeft()
     })
   
    
    checkRaccoonSteal() 
    checkRaccoonDespawn()
    checkCollisionPlayerResource();
    checkGameStatus()

}


function gameLose(){


    snowNode.style.display = "block";

    playerObj.isGameOver = true;

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

    playerObj.isGameOver = true;

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
        playerObj.node.style.transform = "scaleX(1)"

    } else if (event.key === "ArrowLeft") {
        playerObj.moveLeft()
        playerObj.node.style.transform = "scaleX(-1)"

    }
    
})
