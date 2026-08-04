//* GLOBAL DOM ELEMENTS

const startScreenNode = document.querySelector("#start-screen")
const gameScreenNode = document.querySelector("#game-screen")
const winScreenNode = document.querySelector("#win-screen")
const loseScreenNode = document.querySelector("#lose-screen")
const startBtnNode = document.querySelector("#start-btn")
const gameBoxNode = document.querySelector("#game-box")


/*------ counters ----------*/

const plantCounterNode = document.querySelector("#plant-counter")

const woodCounterNode = document.querySelector("#wood-counter")

const rockCounterNode = document.querySelector("#rock-counter")




//* GLOBAL GAME VARIABLES

let playerObj = null
let gameResources = []; // let, not const: filter() reassigns it when resources are collected

let spawnIntervalId = null;
let gameIntervalId = null

let resourceCounts = {
    plant: 0,
    rock: 0,
    wood: 0
};

const RESOURCE_GOALS = { plant: 5, wood: 6, rock: 9 }



//* GLOBAL GAME FUNCTIONS

function startGame() {

    // 1. chnage the screen
    startScreenNode.style.display = "none"
    gameScreenNode.style.display = "flex"

    // 2. add the initial elements
    playerObj = new Player()

    //3. start resources spawning
    startResourceSpawner();

   

    // 3. strat the main interval of the game (main 60 frames per second)

    gameIntervalId = setInterval(gameLoop, Math.floor(1000/60))


}


function resourceSpawn() {

    const randomPosX = Math.floor(Math.random() * (gameBoxNode.clientWidth - 32));
    const randomPosY = Math.floor(Math.random() * (gameBoxNode.clientHeight - 32));

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
    // 1. First, spawn ONE single item right now
    resourceSpawn(); 

    // 2. Set an alarm to spawn ONE single item every 2000ms (2 seconds)
    spawnIntervalId = setInterval(resourceSpawn, 5000);
}



function checkCollision(element1, element2) {
  return (
    element1.x < element2.x + element2.width &&
    element1.x + element1.width > element2.x &&
    element1.y < element2.y + element2.height &&
    element1.y + element1.height > element2.y
  ); // true if colliding, false if not colliding
}

function checkCollisionPlayerResource(){
    // 1. Loop through every resource on the ground using forEach
    gameResources.forEach((resource) => {
        
        // Check if player collides with this specific resource
        if (checkCollision(playerObj, resource)) {
            
            // Increment counter based on class type
            if (resource instanceof Plant) {
                resourceCounts.plant++;
            } else if (resource instanceof Rock) {
                resourceCounts.rock++;
            } else if (resource instanceof Wood) {
                resourceCounts.wood++;
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




function gameLoop() {
    // console.log("this is running 60 times per second") // 60 fps (test but dont keep uncommented)

    checkCollisionPlayerResource();

}


function gameLose(){

    // chnaging the screens 
    gameScreenNode.style.display = "none"
    loseScreenNode.style.display = "flex"

    // stopping the interval 
    clearInterval(gameIntervalId)
    clearInterval(spawnIntervalId)

}


function gameWin(){

    // chnaging the screens 
    gameScreenNode.style.display = "none"
    winScreenNode.style.display = "flex"

    // stopping the interval 
    clearInterval(gameIntervalId)
    clearInterval(spawnIntervalId)

}





//* EVENT LISTENERS

startBtnNode.addEventListener("click", startGame)

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

