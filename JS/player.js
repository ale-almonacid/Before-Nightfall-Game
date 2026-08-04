class Player {

    constructor(){
        this.node = document.createElement("img")
        this.node.src = "./Images/player.png"

        // adding the node to the gamebox 
        gameBoxNode.append(this.node)

        this.x = 40; 
        this.y = 160;


        //adjusting the initial values of the DOM node
        this.node.style.position = "absolute"

        this.node.style.left = `${this.x}px`
        this.node.style.top = `${this.y}px`
        this.node.style.height = `${this.height}px`
        this.node.style.width = `${this.width}px`


        this.speed = 2







    }

    // Methods

    moveUp() {

        if (this.y <= 0){
      return
        }

        this.y -= 20
        this.node.style.top = `${this.y}px` 
    }

    moveDown() {

        if ((this.y + this.height) >= gameBoxNode.offsetHeight){
      return
        }

        this.y += 20
        this.node.style.top = `${this.y}px`
    }


    moveRight() {

        if (this.x <= 0){
      return
        }

        this.x += 20
        this.node.style.left = `${this.x}px` 
    }


     moveLeft() {

        if (this.x <= 0){
      return
        }

        this.x -= 20
        this.node.style.left = `${this.x}px` 
    }



}