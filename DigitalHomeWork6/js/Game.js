"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.
    var player;
    var facingLeft = true;
    var cursors;
    var jumpButton;
    var walls = [];
    var lines = [];
    var lineCurrentlyOn;
    var clicked = false;
    var totalLineLength;
    
    function quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

    }
    function drawLineFromPlayer(){
        //Draw a line to the pointer to get the angle
        let lineToPointer = new Phaser.Line(player.x,player.y,game.input.x,game.input.y);
        let lineExtrapolated = new Phaser.Line(player.x, player.y,(player.x + 2000*Math.cos(lineToPointer.angle)),(player.y + 2000*Math.sin(lineToPointer.angle)) );
        var smallestIntersectionDistance = 100000;
        var smallestIntersectionLine;
        walls.forEach(function(wall){
                //See if the line extrapolated intersects with a wall
                let intersectionPoint = lineExtrapolated.intersects(wall);
                //If the intersection point is not null (There is an intersection) Draw a line with the player pos and the intersection point, and get the distance
                if(intersectionPoint!= null){
                    let intersectedLine = (new Phaser.Line(player.x,player.y,intersectionPoint.x,intersectionPoint.y));
                    if(intersectedLine.length < smallestIntersectionDistance){
                        console.log(intersectionPoint);
                        smallestIntersectionDistance = intersectedLine.length;
                        smallestIntersectionLine = intersectedLine;
                    }
                }
            
            });
         lines.push(smallestIntersectionLine);
       
        
    }
    function drawWall(x,y, width, height){
        walls.push(new Phaser.Line(x,y,width+x,y));
        walls.push(new Phaser.Line(x,y,x,y+height));
        walls.push(new Phaser.Line(x,y+height,x+width,y+height));
        walls.push(new Phaser.Line(x+width,y,x+width,y+height));
    }
    return {
    
        create: function () {
    
            game.physics.startSystem(Phaser.Physics.ARCADE);
            game.physics.arcade.gravity.y = 250;
            game.add.sprite(0,0,'bg');
            
            player = game.add.sprite(1,1, 'whiteBox');
            player.anchor.x = 0.5;
            player.anchor.y = 0.5;
            game.physics.enable(player,Phaser.Physics.ARCADE);
            player.body.collideWorldBounds = true;
            //game.camera.follow(character); 
            
            cursors = game.input.keyboard.createCursorKeys();
            cursors.left = game.input.keyboard.addKey(Phaser.Keyboard.A);
            cursors.right = game.input.keyboard.addKey(Phaser.Keyboard.D);
            cursors.up = game.input.keyboard.addKey(Phaser.Keyboard.W);
            jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            
            drawWall(500,500,50,50);
            lines.push(new Phaser.Line(50,50,200,50));
            
        },
    
        update: function () {
            //On Floor movement stuff
            player.body.velocity.x = 0;

            if (cursors.left.isDown)
            {
                player.body.velocity.x = -150;


            }
            else if (cursors.right.isDown)
            {
                player.body.velocity.x = 150;


            }

            if (jumpButton.isDown && player.body.onFloor() )
            {
                player.body.velocity.y = -250;

            }
            if ((game.input.activePointer.isDown) && (!clicked))
            {
                drawLineFromPlayer();
                clicked = true;
            }
            if((game.input.activePointer.isUp)){
             clicked = false;   
            }

            },
        render: function(){
            lines.forEach(function(line){
                game.debug.geom(line,'rgb(255,255,255)');
            });
            walls.forEach(function(line){
                game.debug.geom(line);
            });
        }
        };
};
