var Module = (function(){
  
  
  const adtg = 9.8e-4; //m/ms²
  const boosterForce = 0.02;
  
  const velCap = 0.6;
  const birdMass = 10;
  
  const pipeWidth = 40;
  const pipeGap = 100;
  const pipeGapX = pipeWidth*3;
  const camVel = 0.1;
  
  let boosting = false;
  
  let camOffset = 0;
  
  let pipes = [];
  let lastPipesX = 0;
  let birdPos = {x: 0,  y: 0}
  let birdSize = {x: 20, y: 10}
  let birdVel = 0;
  
  let time = new Date();
  let lastTime = time.getTime();
  let dt;
  
  let paused = false;
  let canReset = true;
  
  let screen = 1; //1 start 2 running 3 death
  function setup(){
    canv = document.getElementById("myCanvas");
    ctx = canv.getContext("2d");
    
    control();
    game.reset();
  }
  
  var game = {
    reset: function(){
      if(canReset){
        birdPos.x = canv.width/5;
        birdPos.y = canv.height/2;
        birdVel = 0;
        camOffset = 0;
        lastPipesX = 0;
        pipes = [];
        game.pipeGen();
        canReset = false;
      }
    },
    loop: function(){
      switch (screen) {
        case 1:
          game.reset();
          game.render();
          ctx.font = "20px Robot"
          ctx.fillStyle = "grey";
          ctx.fillText("Press Space or Touch to start",0,20);
          game.nextMenu(2);
          
          time = new Date();
          lastTime = time.getTime();
          break;
        case 2:
          game.movement();
          game.pipeSplice();
          game.render();
          game.checkCollision();
          break;
        case 3:
          game.nextMenu(1);
          canReset=true;
          break;
        default:
          break;
      }
    },
    render : function(){
      const grd = ctx.createLinearGradient(0, 0, 0, canv.height);
      //background
      grd.addColorStop(0, "#1A2387");
      grd.addColorStop(1, "skyblue");
      ctx.fillStyle = grd;
      ctx.fillRect(0,0,canv.width,canv.height);
      
      //Pipes
      ctx.fillStyle = "#60C345"
      for (var i = 0; i < pipes.length; i++) {
        //upper
        ctx.fillRect(pipes[i].x-camOffset,0,pipeWidth,pipes[i].y-pipeGap);
        //lower
        ctx.fillRect(pipes[i].x-camOffset,pipes[i].y,pipeWidth,canv.height);
      }
      //bird
      ctx.fillStyle = "green";
      ctx.fillRect(birdPos.x,birdPos.y,birdSize.x,birdSize.y);
    },
    movement : function(){
      let force = 0;
      if(boosting)force=boosterForce;
      
      time = new Date();
      dt = time.getTime()-lastTime;
      lastTime = time.getTime();
      
      birdVel = birdVel + adtg*dt - (force/birdMass*dt);
      
      birdVel = Math.min(velCap,Math.max(-velCap,birdVel));
      birdPos.y = birdVel*dt + birdPos.y;
      birdPos.y = Math.min(canv.height-birdSize.y,Math.max(0,birdPos.y))
      camOffset = camVel*dt + camOffset;
      //console.clear();
      //console.log(camOffset);
    },
    checkCollision : function(){
      if(birdPos.y+birdSize.y>=canv.height || birdPos.y<=0){
        screen = 3;
      }
    },
    nextMenu : function(nextScreen){
      
      canv.addEventListener("touchstart",function(event){
        screen = nextScreen;
      },{once : true})
      
      canv.addEventListener("keydown",function(event){
        if(event.keyCode==32){
          screen = nextScreen;
        }
      }, {once:true})
    },
    pipeGen : function(){
      for (let i=pipes.length; i<canv.width/pipeWidth; i++){
        console.log(pipes);
        lastPipesX += pipeWidth+pipeGapX+Math.floor(Math.random()*pipeWidth);
        pipes.push({x:lastPipesX , y:Math.floor(Math.random()*(canv.height-2*pipeGap))+pipeGap})
      }
    },
    pipeSplice : function(){
      //checks if pipe is outside frame, if so splice it and gen new pipe
      if(pipes[0].x-camOffset<=0-pipeWidth){
        pipes.splice(0,1);
        game.pipeGen();
      }
    }
  };
  
  function control(){
    canv.addEventListener("touchstart", boosterOn);
    canv.addEventListener("touchend",boosteroff);
    
    canv.addEventListener("keydown", function(event){
      if(event.keyCode==32)boosterOn(event);});
    canv.addEventListener("keyup",boosteroff);
    
    function boosterOn(event) {
      event.preventDefault(); 
      boosting=true;
    }
    function boosteroff(event) {
      event.preventDefault(); 
      boosting=false;
    }
  }
  return {
    start : function(){
      window.onload = setup();
      intervalId = setInterval(game.loop,1000/30);
    },
  };
  
})();
Module.start();