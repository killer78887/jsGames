document.addEventListener("DOMContentLoaded",function (){
    main();
});
function main(){
    
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const emtTotalMine = document.getElementById("mineCount");
const emtCellOpened = document.getElementById("cellOpened");
const winsfx = new Audio("/minesweeper/asset/win.wav");
const explodesfx = new Audio("/minesweeper/asset/explode.wav");
let asset = new Array(10).fill(new Image());
asset[0].src = "/minesweeper/asset/flag.png"
asset[1].src = "/minesweeper/asset/Num1.png"
asset[2].src = "/minesweeper/asset/Num2.png"
asset[3].src = "/minesweeper/asset/Num3.png"
asset[4].src = "/minesweeper/asset/Num4.png"
asset[5].src = "/minesweeper/asset/Num5.png"
asset[6].src = "/minesweeper/asset/Num6.png"
asset[7].src = "/minesweeper/asset/Num7.png"
asset[8].src = "/minesweeper/asset/Num8.png"
asset[9].src = "/minesweeper/asset/Mine.png"

const grid = {x : 10, y : 10};
const gridTotal = grid.x * grid.y;
const gridSize = Math.sqrt(canvas.height*canvas.width/gridTotal);
const mine = 9;
//value - 0 Empty, 1-8, 9 Mine
let paused = false;
let gridArray = new Array(gridTotal);
let cellOpened = 0;
let totalMine = (gridTotal/10)+Math.floor(Math.random()*(gridTotal/10));
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

function update(){
    emtTotalMine.innerText = `💣 : ${totalMine}`;
    emtCellOpened.innerText = `Cell Opened : ${cellOpened}`;
    
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle = "black";
    //console.table(gridArray);
    for (var i = 0; i < gridTotal; i++) {
        let x = i%grid.x;
        let y = (i-x)/grid.x;
        if(!gridArray[i].open){
            ctx.fillStyle = "grey";
            ctx.fillRect(x*gridSize,y*gridSize,gridSize,gridSize);
        }
        else if(gridArray[i].value===9){
            ctx.drawImage(asset[9],x*gridSize,y*gridSize,gridSize,gridSize);
        }
        else if(gridArray[i].value>0 && gridArray[i].value<9) {
            ctx.fillStyle="red";
            ctx.font = `${gridSize/2}px Varela`;
            ctx.textAlign = "center"
            ctx.fillText(gridArray[i].value,x*gridSize+(gridSize/2),y*gridSize+(gridSize*2/3));
        }
        ctx.strokeRect(x*gridSize,y*gridSize,gridSize,gridSize);
    }
}

function click(event) {
    event.preventDefault();
    var touchX = Math.floor((event.clientX - canvas.getBoundingClientRect().left)/gridSize);
    var touchY = Math.floor((event.clientY - canvas.getBoundingClientRect().top)/gridSize);
    if(!paused){
        if(cellOpened===0){
            openCellFirst(touchX,touchY);
        }
        else{
            openCell(touchX,touchY);
        }
    }
    console.log("open", touchX, touchY);
}
canvas.addEventListener("click", click, false);

//to ensure 1st click is always empty
function openCellFirst(x,y) {
    let index = x+y*grid.x;
    if(gridArray[index].value!==0){
        console.log("regenerate")
        generateBoard();
        openCellFirst(x,y);
    }
    else{
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
function restart(){
    totalMine = (gridTotal/10)+Math.floor(Math.random()*(gridTotal/10));
    cellOpened = 0;
    paused = false;
    generateBoard();
    update();
}
function checkWin(){
    if(cellOpened === gridTotal-totalMine){
        winsfx.play();
        paused=true;
        console.log("win");
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
generateBoard();
update();
}