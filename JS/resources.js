class Resource {

 constructor(randomPosX, randomPosY, imagePath) {
    
    this.node = document.createElement("img")
    this.node.src = imagePath
    
    this.x = randomPosX;  
    this.y = randomPosY;

    this.height = 40
    this.width = 40

 
    this.node.style.position = "absolute" // IMPORTANT
    this.node.style.left = `${this.x}px`
    this.node.style.top = `${this.y}px`
    this.node.style.height = `${this.height}px`
    this.node.style.width = `${this.width}px`


    this.node.style.zIndex = "1"; 
    
    

    // 2. Append to DOM so it appears in the game area
    gameBoxNode.append(this.node)


}

   
}

class Plant extends Resource {
    constructor(randomPosX, randomPosY){
        super(randomPosX, randomPosY,'./Images/Plant.png')
    }
}


class Rock extends Resource {
    constructor(randomPosX, randomPosY){
        super(randomPosX, randomPosY,'./Images/Rock.png')
    }
}


class Wood extends Resource {
    constructor(randomPosX, randomPosY){
        super(randomPosX, randomPosY,'./Images/Wood.png')
    }
}




