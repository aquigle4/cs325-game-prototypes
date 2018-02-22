"use strict";


window.onload = function() {
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update , render: render  } );
    
    function preload() {
        game.time.advancedTiming = true;
        // Image Loading
        game.load.image( 'player', 'assets/Player.png' );
        game.load.image( 'key', 'assets/Key.png' );
        game.load.image( 'camera', 'assets/Camera.png' );
        game.load.image('smug', 'assets/brick.png');
        game.load.image('brick', 'assets/brick.png');
        game.load.image('blue', 'assets/blueTint.png');
        game.load.image('alphaMask','assets/AlphaMask.png');
        game.load.image('alert','assets/alertBar.png');
        game.load.image('doorLocked','assets/DoorLocked.png');
        game.load.image('doorUnlocked','assets/DoorUnlocked.png');
    }
    
    
    var bitmap;
    
    var cursors;
    
    //various Layer for lighting+ obstacles
    var obstacleCanvas;
    var lightCanvas;
    var bg;
    var detectionCanvas;
    var detectionMaskCanvas;
    var compoundMask;
    var sightRangeMask;
    var holdOver;
    //Game Objects
    let player;
    let wallSprite;
    let key;
    let door;
    //Game Containers
    let walls = [];
    let polygons = [];
    let cameras = [];
    //Game Variables
    var alertLevel = 0;
    var alertBar;
    var hasKey;
    var HUDKey;
    
    
    //this and a few other lighting related bits are form: http://www.emanueleferonato.com/2015/02/03/play-with-light-and-dark-using-ray-casting-and-visibility-polygons/
    function createLightPolygon(x,y){
		var segments = VisibilityPolygon.convertToSegments(polygons);
		segments = VisibilityPolygon.breakIntersections(segments);
		var position = [x, y];
		if (VisibilityPolygon.inPolygon(position, polygons[polygons.length-1])) {
  			return VisibilityPolygon.compute(position, segments);
		}
        console.log("Yo it fucked up!");
		return null;
	}
    //float,float,float,float,Graphics canvas
    function createWall(startX,startY,width,height,obstacleCanvas = obstacleCanvas,isFilled = true){
        obstacleCanvas.drawRect(startX, startY, width, height);
        
        if(isFilled){
            var wall = game.add.tileSprite(startX,startY,width,height,'brick');
            game.physics.enable(wall);
            //Lock The new wall from moving
            wall.body.immovable = true;
            wall.body.moves = false;
            game.physics.arcade.collide(player.body,wall.body);
            compoundMask.add(wall);
            //Add the wall to the array of walls
            walls.push(wall);
        }

		// pushing the newly created box into polygons array
		polygons.push([[startX,startY],[startX+width,startY],[startX+width,startY+height],[startX,startY+height]]);
    }
    
    function createCamera(x,y,range= 200,patrolX = -1,patrolY = -1,speed = 20){

        var camera = game.add.sprite(x,y,'camera');
        game.physics.enable(camera);
        camera.detectionCanvas = game.add.graphics(0,0);
        camera.detectionCanvas.lineStyle(1,0xffffff,0.3);
        camera.detectionMaskCanvas = game.add.graphics(0,0);
        camera.detectionMaskCanvas.lineStyle(1,0xffffff,0.3);
        camera.detectionMaskCanvas.mask = camera.detectionCanvas;
        camera.patrolX = patrolX;
        camera.patrolY = patrolY;
        camera.startX = x;
        camera.startY = y;
        camera.speed = speed;
        camera.patrolTo = true;
        compoundMask.add(camera.detectionMaskCanvas);
        camera.anchor.x = 0.5;
        camera.anchor.y = 0.5;
        camera.range = range;
        cameras.push(camera);
        compoundMask.add(camera);

    }
    function create() {
        
        bg = game.add.tileSprite(0,0,8000,8000, 'smug');
        //detectionMaskCanvas = game.add.tileSprite(0,0,8000,8000, 'blue');
        
        
        game.physics.startSystem(Phaser.Physics.Arcade);
     
        compoundMask = game.add.group();
        //compoundMask.add(player);
        //Canvas Graphics setup
        obstacleCanvas = game.add.graphics(0,0);
        compoundMask.add(obstacleCanvas);
        lightCanvas = game.add.graphics(0,0);
        bg.mask = lightCanvas; 
        compoundMask.add(bg);
        obstacleCanvas.lineStyle(1,0xffffff,0.1);

        //compoundMask.add(sightRangeMask);
        compoundMask.mask = lightCanvas;
        
        
        player = game.add.sprite(125,125,'player');
        game.physics.enable(player);
        player.anchor.x = 0.5;
        player.anchor.y = 0.5;
        game.camera.follow(player);
        

        //Key and exit setup
        key = game.add.sprite(2800,750,'key');
        key.scale.setTo(2,2);
        game.physics.enable(key);
        // Wall Setup
        createWall(0,-10,5,9000,obstacleCanvas,true);
        createWall(-10,0,9000,5,obstacleCanvas,true);
        //Bounding walls
        createWall(0,8000,9000,5,obstacleCanvas,true);
        createWall(8000,0,5,9000,obstacleCanvas,true);
        createWall(0,500,2000,100,obstacleCanvas,true);
        createWall(400,10,250,250,obstacleCanvas,true);
        
                //Small walls demonstration
        createWall(1000,400,5,10,obstacleCanvas,true);
        createWall(1000,420,5,10,obstacleCanvas,true);
        createWall(1000,440,5,10,obstacleCanvas,true);
        createWall(1000,460,5,10,obstacleCanvas,true);
        createWall(1000,480,5,10,obstacleCanvas,true);
        
        createWall(1020,400,5,10,obstacleCanvas,true);
        createWall(1040,400,5,10,obstacleCanvas,true);
        createWall(1060,400,5,10,obstacleCanvas,true);
        createWall(1080,400,5,10,obstacleCanvas,true);
        createWall(1100,400,5,10,obstacleCanvas,true);
        
        createWall(1300,10,50,300,obstacleCanvas,true);
        createWall(1500,50,50,260,obstacleCanvas,true);
        createWall(1900,10,10,300,obstacleCanvas,true);
        //Camera 3 apature
        createWall(1500,300,150,10,obstacleCanvas,true);
        createWall(1750,300,150,10,obstacleCanvas,true);
        //Hide behind
        createWall(1650,450,100,10,obstacleCanvas,true);
        
        createWall(2100,0,10,700,obstacleCanvas,true);
        createWall(2100,800,10,700,obstacleCanvas,true);
        
        createWall(2900,0,10,7000,obstacleCanvas,true);
        createWall(0,1000,8000,10,obstacleCanvas,true);
        createWall(2100,500,5000,10,obstacleCanvas,true);
        //Key corridor walls
        createWall(2200,700,100,10,obstacleCanvas,true);
        createWall(2400,700,100,10,obstacleCanvas,true);
        createWall(2600,700,100,10,obstacleCanvas,true);
        createWall(2800,700,100,10,obstacleCanvas,true);
        
        createWall(2100,800,100,10,obstacleCanvas,true);
        createWall(2300,800,100,10,obstacleCanvas,true);
        createWall(2500,800,100,10,obstacleCanvas,true);
        createWall(2700,800,100,10,obstacleCanvas,true);
        //End Corridor Walls
        createWall(1600,800,100,10,obstacleCanvas,true);
        createWall(1600,800,10,50,obstacleCanvas,true);
        createWall(1700,800,10,100,obstacleCanvas,true);
        createWall(1600,900,100,10,obstacleCanvas,true);
       
        createWall(0,0,8000,8000,obstacleCanvas,false);


        
        createCamera(350,200);
        createCamera(1050,450,200,1200,400);
        createCamera(1600,230,600,1900,230,60);
        //Key Corridors Cameras
        createCamera(2880,650,300,2180,680,100);
        createCamera(2180,950,300,2880,920,100);
        //End corridor Camera
      
        
        wallSprite = game.add.sprite(0,0);
        wallSprite.addChild(obstacleCanvas);
        game.physics.enable(wallSprite);
        game.physics.arcade.collide(player.body,wallSprite);
        
        //Alert bar setup
        alertBar = game.add.sprite(-50,-100,'alert');
        alertBar.height = 25;
        alertBar.width = 0;
        player.addChild(alertBar);
        
        door = game.add.sprite(1400,700,'doorLocked');
        compoundMask.add(door);
        cursors = game.input.keyboard.createCursorKeys();
        
        game.world.setBounds(0,0,4800,3600);

        


    }
    
    function move(){
        // when the mouse is moved, we determine the new visibility polygon 	
     	var visibility = createLightPolygon(player.x , player.y);
     	// then we draw it
        try{
            lightCanvas.clear();
            lightCanvas.lineStyle(2, 0xff8800, 1);
            lightCanvas.beginFill(0xffffff,0.1); 
            lightCanvas.moveTo(visibility[0][0],visibility[0][1]);	
            for(var i=1;i<=visibility.length;i++){
                lightCanvas.lineTo(visibility[i%visibility.length][0],visibility[i%visibility.length][1]);		
            }
            lightCanvas.endFill();
        }catch(err){
            lightCanvas.endFill();
            console.log(err);
        }
        for(var i =0; i <walls.length; i++){
            game.physics.arcade.collide(player,walls[i]);
        }
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        
        game.physics.arcade.collide(player, obstacleCanvas);
        if (cursors.up.isDown)
        {
            player.body.velocity.y = -200;
        }
        else if (cursors.down.isDown)
        {
            player.body.velocity.y = 200;
        }

        if (cursors.left.isDown)
        {
            player.body.velocity.x = -200;
        }
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = 200;
        }
    }
    function cameraScan(){
        var isAlerted = false;
        var thereWasIntersect = false;
        for(var i = 0 ;i < cameras.length; i++){
            //Rendering
                var visibility = createLightPolygon(cameras[i].x , cameras[i].y);
                cameras[i].detectionCanvas.clear();
                cameras[i].detectionCanvas.beginFill(0xffffff,0.1); 
                cameras[i].detectionCanvas.moveTo(visibility[0][0],visibility[0][1]);	
                for(var g=0;g<=visibility.length;g++){
                    cameras[i].detectionCanvas.lineTo(visibility[g%visibility.length][0],visibility[g%visibility.length][1]);		
                }
                cameras[i].detectionCanvas.endFill();
                cameras[i].detectionMaskCanvas.clear();
                cameras[i].detectionMaskCanvas.beginFill(0x0000ff,0.3);
                cameras[i].detectionMaskCanvas.drawCircle(cameras[i].x+16, cameras[i].y+16, cameras[i].range*2);
                cameras[i].detectionMaskCanvas.endFill();
            
            
            //Raycast actual scanning
            let rayToPlayer = new Phaser.Line(cameras[i].x,cameras[i].y,player.x,player.y);
            try{
                walls.forEach(function(wall){
                    var lines = [
                        new Phaser.Line(wall.x, wall.y, wall.x + wall.width, wall.y),
                        new Phaser.Line(wall.x, wall.y, wall.x, wall.y + wall.height),
                        new Phaser.Line(wall.x + wall.width, wall.y,
                            wall.x + wall.width, wall.y + wall.height),
                        new Phaser.Line(wall.x, wall.y + wall.height,
                            wall.x + wall.width, wall.y + wall.height)
                    ];
                    for(var j = 0; j < lines.length; j++) {
                        var intersect = Phaser.Line.intersects(rayToPlayer, lines[j]);

                        thereWasIntersect = false;

                        if (intersect) {
                            // Find the closest intersection
                            var distance = game.math.distance(rayToPlayer.start.x, rayToPlayer.start.y, intersect.x, intersect.y);
                            //console.log('yee');
                            thereWasIntersect = true;
                            throw breakException;
                            break;
                        }
                    }
               })
            }
            catch(e){}
            
            if(!thereWasIntersect){
                if(rayToPlayer.length < cameras[i].range){
                    isAlerted = true;   
                }
            }
            //Patrol The Cameras;
            if(cameras[i].patrolX > -1){
              
                if(cameras[i].patrolTo){
                    game.physics.arcade.moveToXY(cameras[i],cameras[i].patrolX,cameras[i].patrolY,cameras[i].speed);
                    if(game.physics.arcade.distanceToXY(cameras[i],cameras[i].patrolX,cameras[i].patrolY) < 20){
                        cameras[i].patrolTo = false;
                    }
                }else{
                    game.physics.arcade.moveToXY(cameras[i],cameras[i].startX,cameras[i].startY,cameras[i].speed);
                    if(game.physics.arcade.distanceToXY(cameras[i],cameras[i].startX,cameras[i].startY) < 20){
                            cameras[i].patrolTo = true;
                    }
                    }
                }
            }
        if(isAlerted){
            alertLevel++;
        }else{
            if(alertLevel> 0){
                alertLevel--;
            }
        }
        
    }
    function handleAlert(){
        
        alertBar.width = alertLevel;
        if(alertLevel >= 100){
            player.x = 125;
            player.y = 125;
            alertLevel = 0;
            if(hasKey){
                key = game.add.sprite(2800,750,'key');
                game.physics.enable(key);
                key.scale.setTo(2,2);
                hasKey = false;
            }
        }
    }
    var won = false;
    function update() {        
        move();
        cameraScan();
        handleAlert();
        
        if((!hasKey) &&(player.overlap(key))){
            hasKey = true;
            door.loadTexture('doorUnlocked',0);
            key.destroy();
        }
        if((hasKey)&& (player.overlap(door))){
            if(!won){
                game.add.text(1500,700,"You've Won!");
            }
        }

    }

    function render(){
        game.debug.text('FPS: ' + game.time.fps || 'FPS: --', 40, 40, "#00ff00");
        game.debug.text('X: ' + player.x + 'Y: ' + player.y, 40, 60, "#00ff00");
    }

};
