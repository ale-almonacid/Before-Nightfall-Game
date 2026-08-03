//* GLOBAL DOM ELEMENTS

const startScreenNode = document.querySelector("#start-screen")
const gameScreenNode = document.querySelector("#game-screen")
const winScreenNode = document.querySelector("#win-screen")
const loseScreenNode = document.querySelector("#lose-screen")
const startBtnNode = document.querySelector("#start-btn")
const gameBoxNode = document.querySelector("#game-box")



//* GLOBAL GAME VARIABLES

let playerObj = null




//* GLOBAL GAME FUNCTIONS

function startGame() {

    // 1. chnage the screen
    startScreenNode.style.display = "none"
    gameScreenNode.style.display = "flex"

    // 2. add the initial elements
    playerObj = new Player()

   

    // 3. strat the main interval of the game (main 60 frames per second)

    gameIntervalId = setInterval(gameLoop, Math.floor(1000/60))


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
    }
})

