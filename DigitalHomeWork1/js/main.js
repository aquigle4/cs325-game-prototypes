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
        game.load.image( 'logo', 'assets/phaser.png' );
        game.load.image( 'smug', 'assets/smugbg.png');
        game.load.image( 'planet', 'assets/planet1.png');
        game.load.image( 'player', 'assets/spaceGEOLOGIST.png');
        //Physics Loading
        this.game.load.physics("physics", "assets/physics.json");
    }
    
    var planet;
    var player;
 
    var dirKeys;
    function create() {
        
        game.physics.startSystem(Phaser.Physics.P2JS);
        //game.add.tileSprite(0,0,8000,8000, 'smug');
        
        //Bounds stuff
        game.world.setBounds(0,0,4800,3600);
        // Create a sprite at the center of the screen using the 'logo' image.
        planet = game.add.sprite( game.world.centerX, game.world.centerY, 'planet',4 );
        
        player = game.add.sprite(game.world.centerX,50, 'player');
    
        // Anchor the sprite at its center, as opposed to its top-left corner.
        // so it will be truly centered.

        game.physics.p2.enable(player);
        game.physics.p2.enable(planet);
        //Planet stuff
        planet.body.clearShapes();
        planet.body.loadPolygon("physics", "Planet1",8);
        planet.body.kinematic = true;
        //Physics Materials
        var planetMaterial = game.physics.p2.createMaterial('planetMaterial',planet.body);
        var playerMaterial = game.physics.p2.createMaterial('playerMaterial', player.body);
        
        var contactMaterial = game.physics.p2.createContactMaterial(planetMaterial,playerMaterial, {friction: 0.9,restitution: 0.0});
        
        //Camera
        game.camera.follow(player,Phaser.Camera.FOLLOW_LOCKON,0.1,0.1);
        //Input
        dirKeys = game.input.keyboard.createCursorKeys();

    }
    function gravitateTowards(body1,body2, speed, up){
        if (typeof speed === 'undefined') { speed = 60; }
        var angle = Math.atan2(body2.y - body1.y, body2.x - body1.x);
        body1.body.rotation = angle + game.math.degToRad(-90);  // adjust the angle of the sprite so its always 'down'
        if(!up){
            body1.body.force.x += Math.cos(angle) * speed;    // accelerateToObject 
            body1.body.force.y += Math.sin(angle) * speed;
        }else{
            body1.body.force.x += Math.cos(angle) * speed * -2;    // accelerateToObject 
            body1.body.force.y += Math.sin(angle) * speed * -2;
        }
    }
    
    function accelerateTangent(body1,body2,speed,clockwise){
        if (typeof speed === 'undefined') { speed = 60; }
        var angle = Math.atan2(body2.y - body1.y, body2.x - body1.x);
        body1.body.rotation = angle + game.math.degToRad(-90);
        if(clockwise){
            body1.body.force.x += Math.abs(Math.sin(angle)) * speed;
            body1.body.force.y += Math.abs(Math.cos(angle)) * speed;
            if(angle <= 0){
                body1.body.force.x -= Math.sin(angle) * speed;
                body1.body.force.y -= Math.cos(angle) * speed;
            }
        }else{
            body1.body.force.x -= Math.abs(Math.sin(angle)) * speed * -1;
            body1.body.force.y -= Math.abs(Math.cos(angle)) * speed * -1;
        }
    }
    
    function update() {
        gravitateTowards(player,planet,60,dirKeys.up.isDown);
        if(dirKeys.right.isDown){
            accelerateTangent(player,planet,60,true);
        }else if (dirKeys.left.isDown){
            accelerateTangent(player,planet,60,false);
        }

        
        
    }

    function render(){
        game.debug.text(Math.sin(Phaser.Math.angleBetweenPoints(player,planet)),100,100);
        game.debug.text(Math.cos(Phaser.Math.angleBetweenPoints(player,planet)),100,200);
        game.debug.text(player.body.force.x,100,300);
    }

};
