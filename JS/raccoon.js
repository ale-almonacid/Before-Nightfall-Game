class Raccoon {
    constructor(randomPosY = 0){
       
        this.node = document.createElement("img")
        this.node.src = "./Images/Raccoon.png"

        // adding the node to the gamebox 
        gameBoxNode.append(this.node)

        this.x = gameBoxNode.offsetWidth;  // we do this so that the enemies appear outside 
        this.y = randomPosY;


        this.width = 74;
        this.height = 74;


        this.node.style.position = "absolute"

        this.node.style.left = `${this.x}px`
        this.node.style.top = `${this.y}px`
        this.node.style.height = `${this.height}px`
        this.node.style.width = `${this.width}px`

        this.node.style.zIndex = "2"; 
        this.hasStolen = false


    }

    /* methods */

    automaticMoveLeft(){
        this.x -= 1
        this.node.style.left = `${this.x}px`
    }


    changeSprite(newSrc) {
        
        this.node.src = newSrc;
    }

    destroy() {
        this.node.remove();
    }









}