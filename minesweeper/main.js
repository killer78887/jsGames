document.addEventListener("DOMContentLoaded",function (){
    main();
});
function main(){
    
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const emtTotalMine = document.getElementById("mineCount");
const emtCellOpened = document.getElementById("cellOpened");

const grid = {x : 10, y : 10};
const gridTotal = grid.x * grid.y;
const gridSize = Math.sqrt(canvas.height*canvas.width/gridTotal);
const mine = 9;
//value - 0 Empty, 1-8, 9 Mine
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
    emtTotalMine.innerText = `Total Mine : ${totalMine}`;
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
            ctx.fillStyle = "black";
            ctx.fillRect(x*gridSize,y*gridSize,gridSize,gridSize);
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
    if(cellOpened===0){
        openCellFirst(touchX,touchY);
    }
    else{
        openCell(touchX,touchY);
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
        //loose logic
        gridArray[index].open = true;
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
}


generateBoard();
update();
}