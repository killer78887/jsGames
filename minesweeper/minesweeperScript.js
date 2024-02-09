//document.addEventListener("DOMContentLoaded",function (){});

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const emtFlagCount = document.getElementById("flagCount");
const emtTimer = document.getElementById("timer");
const winsfx = new Audio("asset/win.wav");
const explodesfx = new Audio("asset/explode.wav");
const flagImg = document.getElementById("flagIcon");

let asset = Array.from({length : 10}, ()=> new Image());
asset[0].src = "asset/flag.png"
asset[1].src = "asset/Num1.png"
asset[2].src = "asset/Num2.png"
asset[3].src = "asset/Num3.png"
asset[4].src = "asset/Num4.png"
asset[5].src = "asset/Num5.png"
asset[6].src = "asset/Num6.png"
asset[7].src = "asset/Num7.png"
asset[8].src = "asset/Num8.png"
asset[9].src = "asset/Mine.png"

const grid = {x : 10, y : 10};
const gridTotal = grid.x * grid.y;
const gridSize = Math.sqrt(canvas.height*canvas.width/gridTotal);
const mine = 9;
//value - 0 Empty, 1-8, 9 Mine
let paused = false;
let gridArray = new Array(gridTotal);
let cellOpened = 0;
let totalMine = (gridTotal/10)+Math.floor(Math.random()*(gridTotal/10));
let flagLeft = totalMine;
let inputFlag = false;

ctx.imageSmoothingEnabled = false;

function generateBoard(){
    gridArray = Array.from({length : gridTotal}, () => ({value: 0, open: false, flagged:false}));
    
    //setting up mines;
    for (var i = 0; i < totalMine; i++) {
        let ranI = Math.floor(Math.random()*gridTotal);
        if(gridArray[ranI].value < 8){ //to prevent picking same twice;
            gridArray[ranI].value = mine;
            
            //adds 1 to neighbours
            const neighbors = [
                ranI - grid.x - 1, ranI - grid.x, ranI - grid.x + 1,
                ranI - 1,ranI + 1,
                ranI + grid.x - 1, ranI + grid.x, ranI + grid.x + 1
            ];

            // Filter out invalid indices
            const validNeighbors = neighbors.filter(idx => idx >= 0 && idx < gridTotal);
        
            for (let j = 0; j<validNeighbors.length; j++) {
                //left and right edge cases
                if((ranI%grid.x!==0 || (validNeighbors[j]+1)%grid.x!==0) && 
                    ((ranI+1)%grid.x!==0 || validNeighbors[j]%grid.x!==0)){
                    gridArray[validNeighbors[j]].value += (gridArray[validNeighbors[j]].value===9 ? 0: 1);
                }
            }
        }
        else{
            i--;
        }
    }
    
}

let Timer = {
    second : 0,
    intervalId : null,
    start: function(){
        this.intervalId = setInterval(() => {
            if (!paused) {
                this.second++;
                emtTimer.innerText = this.second;
            }
        }, 1000);
    },
    reset : function(){
        clearInterval(this.intervalId);
        this.second = 0;
        emtTimer.innerText = this.second;
        console.log("reseting");
    }
};

function update(){
    emtFlagCount.innerText = `${flagLeft}`;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle = "black";
    //console.table(gridArray);
    for (var i = 0; i < gridTotal; i++) {
        let x = i%grid.x;
        let y = (i-x)/grid.x;
        if(!gridArray[i].open){
            let margin = gridSize/10;
            ctx.fillStyle = "#4b4659";
            ctx.fillRect(x*gridSize,y*gridSize,gridSize,gridSize);
            ctx.fillStyle = "#6b778e";
            ctx.fillRect(x*gridSize+margin,y*gridSize+margin,gridSize-2*margin,gridSize-2*margin);
        }
        else if(gridArray[i].value===9){
            ctx.drawImage(asset[9],x*gridSize,y*gridSize,gridSize,gridSize);
        }
        else if(gridArray[i].value>0 && gridArray[i].value<9) {
            ctx.drawImage(asset[gridArray[i].value], x*gridSize,y*gridSize,gridSize,gridSize);
        }
        if(gridArray[i].flagged){
            ctx.drawImage(asset[0], x*gridSize,y*gridSize,gridSize,gridSize);
        }
        ctx.strokeRect(x*gridSize,y*gridSize,gridSize,gridSize);
    }
}

function click(event) {
    event.preventDefault();
    var touchX = Math.floor((event.clientX - canvas.getBoundingClientRect().left)/gridSize);
    var touchY = Math.floor((event.clientY - canvas.getBoundingClientRect().top)/gridSize);
    console.log(event.button);
    if(!paused){
        if(event.button===0 && !inputFlag){
            if(cellOpened===0){
                openCellFirst(touchX,touchY);
            }
            else{
                openCell(touchX,touchY);
            }
        }
        else if (event.button===2 || inputFlag) {
            flag(touchX,touchY);
        }
    }
    //console.log("open", touchX, touchY);
}
canvas.addEventListener("click", click, false);
flagImg.addEventListener("click", function(){
    inputFlag = !inputFlag;
    if(inputFlag){
        flagImg.style.scale = 1.2;
    }
    else{
        flagImg.style.scale = 1;
    }
});

//to ensure 1st click is always empty
function openCellFirst(x,y) {
    let index = x+y*grid.x;
    if(gridArray[index].value!==0){
        generateBoard();
        openCellFirst(x,y);
        //in case flag are placed and board is regenerated 
        flagLeft=totalMine;
        emtFlagCount.innerText = `${flagLeft}`;
    }
    else{
        Timer.start();
        openCell(x,y);
    }
}
function openCell(x,y) {
    let index = x+y*grid.x;
    if(gridArray[index].flagged || gridArray[index].open){
        //do nothing
    }
    else if(gridArray[index].value===9){
        gridArray[index].open = true;
        update();
        defeat();
        return 0;
    }
    else if(gridArray[index].value===0){
        gridArray[index].open = true;
        cellOpened++;
        //zero spreading
        const neighbors = [
            index - grid.x - 1, index - grid.x, index - grid.x + 1,
            index - 1,index + 1,
            index + grid.x - 1, index + grid.x, index + grid.x + 1
        ];

        // Filter out invalid indices
        const validNeighbors = neighbors.filter(idx => idx >= 0 && idx < gridTotal);
        
        for (let j = 0; j<validNeighbors.length; j++) {
            let temp = validNeighbors[j];
            //left and right edge cases
            if((index%grid.x!==0 || (temp+1)%grid.x!==0) && 
                ((index+1)%grid.x!==0 || temp%grid.x!==0) &&
                gridArray[temp].value !== 9)
            {
                openCell(temp%grid.x,(temp-(temp%grid.x))/grid.x);
            }
        }
    }
    else{
        gridArray[index].open = true;
        cellOpened++;
    }
    update();
    checkWin();
}
function flag(x,y){
    let index = x+y*grid.x;
    if(!gridArray[index].flagged && flagLeft>0 && !gridArray[index].open){
        gridArray[index].flagged = true;
        flagLeft--;
        update();
    }
    else if(gridArray[index].flagged){
        gridArray[index].flagged = false;
        flagLeft++;
        update();
    }
}
function restart(){
    totalMine = (gridTotal/10)+Math.floor(Math.random()*(gridTotal/10));
    flagLeft = totalMine;
    cellOpened = 0;
    paused = false;
    generateBoard();
    update();
    Timer.reset();
}
function checkWin(){
    if(cellOpened === gridTotal-totalMine){
        winsfx.play();
        paused=true;
        console.log("win");
        ctx.globalAlpha = 0.5;
        for (var i = 0; i < gridTotal; i++) {
            if(gridArray[i].value===9){
                let x = i%grid.x;
                let y = (i-x)/grid.x;
                ctx.drawImage(asset[9],x*gridSize,y*gridSize,gridSize,gridSize);
            }
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = "Yellow";
        ctx.font = "70px Open Sans"
        ctx.textAlign = "center";
        ctx.fillText('You Won',canvas.width/2,canvas.height/2);
    }
}
function defeat(){
    explodesfx.play();
    paused=true;
    //open all Mine
    for (var i = 0; i < gridTotal; i++) {
        if(gridArray[i].value===9){
            gridArray[i].open = true;
        }
    }
    update();
    ctx.fillStyle = "Orange";
    ctx.font = "70px Open Sans"
    ctx.textAlign = "center";
    ctx.fillText('BOOM...',canvas.width/2,canvas.height/2);
}
function checkImagesLoaded(asset) {
  var loadedCount = 0;
  asset.forEach(function(image) {
    image.onload = function() {
      loadedCount++;
      if (loadedCount === asset.length) {
        console.log('All images have loaded properly.');
        generateBoard();
        update();
      }
    };
    image.onerror = function() {
        location.reload();
    };
  });
}

checkImagesLoaded(asset);