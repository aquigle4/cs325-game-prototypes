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
        // Image Loading
        game.load.image( 'player', 'assets/Player.png' );
        game.load.image( 'key', 'assets/Key.png' );
        game.load.image( 'camera', 'assets/Camera.png' );
        game.load.image('smug', 'assets/smugbg.png');
        game.load.image('brick', 'assets/brick.png');
        game.load.image('blue', 'assets/blueTint.png');
    }
    
 
    var cursors;
    
    //various Layer for lighting+ obstacles
    var obstacleCanvas;
    var lightCanvas;
    var bg;
    var detectionCanvas;
    var detectionMaskCanvas;
    var compoundMask;
    //Game Objects
    let player;
    let wallSprite;
    
    let walls = [];
    let polygons = [];
    let cameras = [];
    
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
    function createWall(startX,startY,width,height,obstacleCanvas,isFilled){
        obstacleCanvas.drawRect(startX, startY, width, height);
        if(isFilled){
            var wall = game.add.tileSprite(startX,startY,width,height,'brick');
            game.physics.enable(wall);
            //Lock The new wall from moving
            wall.body.immovable = true;
            wall.body.moves = false;
            game.physics.arcade.collide(player.body,wall.body);
            //Add the wall to the array of walls
            walls.push(wall);
        }

		// pushing the newly created box into polygons array
		polygons.push([[startX,startY],[startX+width,startY],[startX+width,startY+height],[startX,startY+height]]);
    }
    
    function createCamrea(x,y){
        var visibility = createLightPolygon(x , y);
        var camera = game.add.sprite(x,y,'camera');
        cameras.push(camera);
        
        detectionCanvas.lineStyle(2, 0xff0000, 1);
        detectionCanvas.beginFill(0xffffff,0.1); 
        detectionCanvas.moveTo(visibility[0][0],visibility[0][1]);	
        for(var i=1;i<=visibility.length;i++){
            detectionCanvas.lineTo(visibility[i%visibility.length][0],visibility[i%visibility.length][1]);		
        }
        detectionCanvas.endFill();
        
        detectionMaskCanvas.beginFill(0x0000ff,0.3);
        detectionMaskCanvas.drawCircle(x+16, y+16, 200);
        detectionMaskCanvas.endFill();
    }
    function create() {
        
        bg = game.add.tileSprite(0,0,8000,8000, 'smug');
        //detectionMaskCanvas = game.add.tileSprite(0,0,8000,8000, 'blue');
        
        player = game.add.sprite(125,125,'player');
        game.physics.startSystem(Phaser.Physics.Arcade);
        game.physics.enable(player);

        game.camera.follow(player);
        
        //Canvas Graphics setup
        obstacleCanvas = game.add.graphics(0,0);
        lightCanvas = game.add.graphics(0,0);
        bg.mask = lightCanvas; 
        obstacleCanvas.lineStyle(1,0xffffff,1);
        detectionCanvas = game.add.graphics(0,0);
        detectionMaskCanvas = game.add.graphics(0,0);
        detectionMaskCanvas.mask = detectionCanvas;
        
        // Wall Setup
        createWall(0,-10,5,9000,obstacleCanvas,true);
        createWall(-10,0,9000,5,obstacleCanvas,true);
        createWall(0,8000,9000,5,obstacleCanvas,true);
        createWall(8000,0,5,9000,obstacleCanvas,true);
        createWall(500,500,400,1000,obstacleCanvas,true);
        createWall(400,10,250,250,obstacleCanvas,true);
        //createWall(100,100,100,100,obstacleCanvas);
        createWall(0,0,8000,8000,obstacleCanvas,false);

        createCamrea(350,200);
        wallSprite = game.add.sprite(0,0);
        wallSprite.addChild(obstacleCanvas);
        game.physics.enable(wallSprite);
        game.physics.arcade.collide(player.body,wallSprite);
        
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
    function update() {        
        move();
    }

    function render(){

    }

};
