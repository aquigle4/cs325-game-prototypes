"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.
    var player;
    var pointOnLine;
    var facingLeft = true;
    var cursors;
    var jumpButton;
    var stickButton;
    var walls = [];
    var lines = [];
    var wallSprites = [];
    
    var lineCurrentlyOn;
    var isCurrentlyOnALine = false;
    var lineCurrentlyOnRight = true;
    var lineCurrentlyOnUp = true;
    var clicked = false;
    var totalLineLength = 0;
    
    var shortestIntersectionRay;
    var shortestIntersectionRayDistance = 100000;
    var shortestIntersectionPoint;
    var shortestLineThatsIntersected;
    var foundIntersection = false;
    
    var webCooldownMax = 120;
    var webCooldownCurrent = 0;
    
    var maxPlayerLineStickRange = 50;
    function quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

    }
    
    
    function drawLineFromPlayer(){
        //Draw a line to the pointer to get the angle
        let lineToPointer = new Phaser.Line(player.x,player.y,game.input.worldX,game.input.worldY);
        let lineExtrapolated = new Phaser.Line(player.x, player.y,(player.x + 2000*Math.cos(lineToPointer.angle)),(player.y + 2000*Math.sin(lineToPointer.angle)) );
        var smallestIntersectionDistance = 100000;
        var smallestIntersectionLine;
        // Towards the player
        walls.forEach(function(wall){
                //See if the line extrapolated intersects with a wall
                let intersectionPoint = lineExtrapolated.intersects(wall);
                //If the intersection point is not null (There is an intersection) Draw a line with the player pos and the intersection point, and get the distance
                if(intersectionPoint!= null){
                    let intersectedLine = (new Phaser.Line(player.x,player.y,intersectionPoint.x,intersectionPoint.y));
                    if(intersectedLine.length < smallestIntersectionDistance){
                      
                        smallestIntersectionDistance = intersectedLine.length;
                        smallestIntersectionLine = intersectedLine;
                    }
                }
            
            });
            
        totalLineLength+= smallestIntersectionLine.length;
        let forwardLine = smallestIntersectionLine;  
        //Away from the the player

        lineExtrapolated = new Phaser.Line(player.x, player.y,(player.x + 2000*Math.cos(lineToPointer.angle+ Math.PI)),(player.y + 2000*Math.sin(lineToPointer.angle+ Math.PI)) );
        smallestIntersectionDistance = 100000;
        smallestIntersectionLine = 0;
        walls.forEach(function(wall){
                //See if the line extrapolated intersects with a wall
                let intersectionPoint = lineExtrapolated.intersects(wall);
                //If the intersection point is not null (There is an intersection) Draw a line with the player pos and the intersection point, and get the distance
                if(intersectionPoint!= null){
                    let intersectedLine = (new Phaser.Line(player.x,player.y,intersectionPoint.x,intersectionPoint.y));
                    if(intersectedLine.length < smallestIntersectionDistance){
                      
                        smallestIntersectionDistance = intersectedLine.length;
                        smallestIntersectionLine = intersectedLine;
                    }
                }
            
            });
        totalLineLength+= smallestIntersectionLine.length;
        console.log(smallestIntersectionLine.length);
        let backwardLine = smallestIntersectionLine;
        console.log("forward"+ forwardLine.end);
        console.log("Back: " + backwardLine.end);
        var combinedLine = new Phaser.Line(backwardLine.end.x,backwardLine.end.y,forwardLine.end.x,forwardLine.end.y); 
        lines.push(combinedLine);
        webCooldownCurrent = 0;
    }
    
    function jumpToLine(){
        //Draw a bunch of lines (180) around the mouse pointer
        shortestIntersectionRay;
        shortestIntersectionRayDistance = 100000;
        shortestIntersectionPoint;
        shortestLineThatsIntersected;
        foundIntersection = false;
        //RayBurst
        //Find The closest line intersection to any of those lines
        for(var i = 0; i <= 360; i +=2){
            var rayBustRay = new Phaser.Line(game.input.worldX, game.input.worldY,(game.input.worldX + 200*Math.cos(i)),(game.input.worldY + 2000*Math.sin(i)));
            //Nested loops yay
            lines.forEach(function(line){
                //If the ray burst line intersects with a webline in the array lines[]
                try{
                    var intersectionPoint = rayBustRay.intersects(line);
                }catch(e){
                    console.log("You somethign fucked up and I had to skip a ray of a line");
                }
                //Get the distance of intersection, if that distance is less than the shortest intersection ray
                //It becomes the new intersection ray
                if(intersectionPoint!= null){
                    var intersectedLine = (new Phaser.Line(game.input.worldX,game.input.worldY,intersectionPoint.x,intersectionPoint.y));
                    if(intersectedLine.length< shortestIntersectionRayDistance){
                        shortestLineThatsIntersected = line;
                        shortestIntersectionRayDistance = intersectedLine.length;
                        shortestIntersectionRay = intersectedLine;
                        shortestIntersectionPoint = intersectionPoint;
                        foundIntersection = true;
                    }
                        
                    
                }
                });
        //Draw a line from the player to that point, if its within range, attach to it
        if(foundIntersection){
            
            let lineFromPlayer = new Phaser.Line(player.x,player.y,shortestIntersectionPoint.x,shortestIntersectionPoint.y)
            if(lineFromPlayer.length <= maxPlayerLineStickRange){
                
                player.body.velocity.x = 0;
                player.body.velocity.y = 0;
                isCurrentlyOnALine = true;
                player.x = shortestIntersectionPoint.x;
                player.y = shortestIntersectionPoint.y;
                pointOnLine = shortestIntersectionPoint;
                lineCurrentlyOn = shortestLineThatsIntersected;
               
                //Line facing stuff
                if(lineCurrentlyOn.start.x <= lineCurrentlyOn.end.x){
                    lineCurrentlyOnRight = true;
                }else{
                    lineCurrentlyOnRight = false;
                }
                if(lineCurrentlyOn.start.y <= lineCurrentlyOn.end.y){
                    lineCurrentlyOnUp = true;
                }else{
                    lineCurrentlyOnUp = false;
                }
                player.body.gravity.y = 0
            }        
        }
    }
    }
    function drawWall(x,y, width, height, fillingKey){
        walls.push(new Phaser.Line(x,y,width+x,y));
        walls.push(new Phaser.Line(x,y,x,y+height));
        walls.push(new Phaser.Line(x,y+height,x+width,y+height));
        walls.push(new Phaser.Line(x+width,y,x+width,y+height));
        if(fillingKey != null){
            var wall = game.add.tileSprite(x,y,width,height,fillingKey);
            game.physics.enable(wall);
            //Lock The new wall from moving
            wall.body.immovable = true;
            wall.body.moves = false;
            game.physics.arcade.collide(player.body,wall.body);
            //Add the wall to the array of walls
            wallSprites.push(wall);
        }
    }
    return {
    
        create: function () {
    
            game.physics.startSystem(Phaser.Physics.ARCADE);
            game.add.sprite(0,0,'bg');
            
            player = game.add.sprite(1,700, 'whiteBox');
            player.anchor.x = 0.5;
            player.anchor.y = 0.5;
            
            game.physics.enable(player,Phaser.Physics.ARCADE);
            player.body.gravity.y = 350;
            player.body.collideWorldBounds = true;
            //game.camera.follow(character); 
            
            cursors = game.input.keyboard.createCursorKeys();
            cursors.left = game.input.keyboard.addKey(Phaser.Keyboard.A);
            cursors.right = game.input.keyboard.addKey(Phaser.Keyboard.D);
            cursors.up = game.input.keyboard.addKey(Phaser.Keyboard.W);
            jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            stickButton = game.input.keyboard.addKey(Phaser.Keyboard.E);
            
            drawWall(500,500,50,50,'brick');
            drawWall(100,100,150,50,'brick');
            game.world.setBounds(0,0,1500,3000);
            drawWall(1,1,1497, 2997,null);
            game.camera.follow(player);
        },
    
        update: function () {
            if(webCooldownCurrent < webCooldownMax){
                webCooldownCurrent++;
            }
            player.body.velocity.x = 0;
            
            if(isCurrentlyOnALine){
                player.body.velocity.y = 0
                
                if(lineCurrentlyOnRight){
                    if((player.x < lineCurrentlyOn.start.x) ||(player.x > lineCurrentlyOn.end.x)){
                        isCurrentlyOnALine = false;
                        player.body.gravity.y = 350;
                    }
                }else{
                     if((player.x > lineCurrentlyOn.start.x) ||(player.x < lineCurrentlyOn.end.x)){
                        isCurrentlyOnALine = false;
                         player.body.gravity.y = 350;
                    }
                }
                if (jumpButton.isDown)
                {
                    isCurrentlyOnALine = false;
                    player.body.gravity.y = 350;
                }
                //So long as you are no further than the start or end of the line
                var movementLine;
                    if(cursors.left.isDown){
                        if(lineCurrentlyOnRight){
                            game.physics.arcade.velocityFromAngle(((lineCurrentlyOn.angle)*180/Math.PI),-150,player.body.velocity);
                        }else{
                             game.physics.arcade.velocityFromAngle(((lineCurrentlyOn.angle)*180/Math.PI),150,player.body.velocity);
                        }
                    }
                    if(cursors.right.isDown){
                        if(lineCurrentlyOnRight){
                            game.physics.arcade.velocityFromAngle(((lineCurrentlyOn.angle)*180/Math.PI),150,player.body.velocity);
                        }else{
                             game.physics.arcade.velocityFromAngle(((lineCurrentlyOn.angle)*180/Math.PI),-150,player.body.velocity);
                        }
                    }                
                
            }
            if(!isCurrentlyOnALine){
            //not on a line movement
            if (cursors.left.isDown)
            {
                player.body.velocity.x = -150;


            }
            else if (cursors.right.isDown)
            {
                player.body.velocity.x = 150;


            }
            if(stickButton.isDown && !isCurrentlyOnALine ){
                jumpToLine();
            }
            if (jumpButton.isDown && player.body.onFloor() )
            {
                player.body.velocity.y = -250;

            }
            }
            if ((game.input.activePointer.isDown) && (!clicked))
            {
                if(webCooldownCurrent >= webCooldownMax){
                    drawLineFromPlayer();
                    clicked = true;
                }else{
                    console.log("Web stil on cd");
                }
            }
            if((game.input.activePointer.isUp)){
             clicked = false;   
            }
            for(var i =0; i <wallSprites.length; i++){
                game.physics.arcade.collide(player,wallSprites[i]);
            }
            },
        render: function(){
            lines.forEach(function(line){
                game.debug.geom(line,'rgb(255,255,255)');
            });
            walls.forEach(function(line){
                game.debug.geom(line);
            });
            game.debug.text(totalLineLength,25,25);
        }
        };
};
