const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const grid = {x : 10, y : 10};
const gridTotal = grid.x * grid.y;
const totalMine = gridTotal/5;
const gridSize = Math.sqrt(canvas.height*canvas.width/gridTotal);
const mine = 9;
//value - 0 Empty, 1-8, 9 Mine
let gridArray = new Array(gridTotal);

function startUp(){
    gridArray = Array.from({length : gridTotal}, () => ({value: 0, state: false}));
    
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
        
            // Print neighboring pixels
            for (let j = 0; j<validNeighbors.length; j++) {
                //left and right edge cases
                if((ranI%grid.x!==0 || (validNeighbors[j]+1)%grid.x!==0) && 
                    ((ranI+1)%grid.x!==0 || validNeighbors[j]%grid.x!==0)){
                    gridArray[validNeighbors[j]].value += (gridArray[validNeighbors[j]].value===9 ? 0: 1);
                }
            }
        }
        else{
            //i--;
        }
    }
    
}

function update(){
    ctx.strokeStyle = "black";
    console.table(gridArray)
    for (var i = 0; i < gridTotal; i++) {
        let x = i%grid.x;
        let y = (i-x)/grid.x;
        if(gridArray[i].value===9){
            ctx.fillStyle = "grey";
            ctx.fillRect(x*gridSize,y*gridSize,gridSize,gridSize);
        }
        else if(gridArray[i].value>0 && gridArray[i].value<9) {
            ctx.fillStyle="red";
            ctx.font = `${gridSize/2}px Verdana`;
            ctx.textAlign = "center"
            ctx.fillText(gridArray[i].value,x*gridSize+(gridSize/2),y*gridSize+(gridSize*2/3));
        }
        ctx.strokeRect(x*gridSize,y*gridSize,gridSize,gridSize);
    }
}
startUp();
update();