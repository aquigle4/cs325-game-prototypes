"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.
    var player;
    var pointOnLine;
    var facingLeft = true;
    var cursors;
    var jumpButton;
    var stickButton;
    var interactButton;
    var walls = [];
    var lines = [];
    var wallSprites = [];
    
    var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
    var sectionTexts = [];
    var sectionHitboxes = [];
    
    var isColliding;
    var jumpCoolDownMax = 90;
    var jumpCoolDownCurrent = 90;
    
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
    var webCooldownCurrent = 120;
    
    var maxPlayerLineStickRange = 50;
    //0=100, 1 =200, etc
    var currentSectionGoal = 0;
    var time = 0;
    var score = 0;
    var currentlyHeldBookSection = -1;
    var turnInHitbox;
    
    function checkOverlap(spriteA, spriteB) {

    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();

    return Phaser.Rectangle.intersects(boundsA, boundsB);

    }
    
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
    var wall;
    function drawWall(x,y, width, height, fillingKey){
        walls.push(new Phaser.Line(x,y,width+x,y));
        walls.push(new Phaser.Line(x,y,x,y+height));
        walls.push(new Phaser.Line(x,y+height,x+width,y+height));
        walls.push(new Phaser.Line(x+width,y,x+width,y+height));
        if(fillingKey != null){
            wall = game.add.tileSprite(x,y,width,height,fillingKey);
            game.physics.enable(wall);
            //Lock The new wall from moving
            wall.body.immovable = true;
            wall.body.moves = false;
            game.physics.arcade.collide(player.body,wall.body);
            //Add the wall to the array of walls
            wallSprites.push(wall);
        }
    }
    function drawFilledBookShelf(x,y,acessSide = 'right'){
        drawWall(x,y,64,98,'bookshelfFull');
        sectionTexts.push(game.add.text(x,y-40,(sectionTexts.length+1)*100,style));
        if(acessSide == 'right'){
            var newHitbox = game.add.sprite(x+66,y+34,'whiteBox');    
        }else{
            var newHitbox = game.add.sprite(x-66,y+34,'whiteBox');
        }
        newHitbox.sectionNumber = sectionHitboxes.length;
        newHitbox.alpha = 0.2;
        newHitbox.scale.setTo(2,2);
        sectionHitboxes.push(newHitbox);
    }
    function randomizeSections(){
        for (var i = sectionTexts.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = sectionHitboxes[i];
            var tempNumbers = sectionTexts[i];
            sectionHitboxes[i] = sectionHitboxes[j];
            sectionTexts[i] = sectionTexts[j];
            sectionHitboxes[j] = temp;
            sectionTexts[j] = tempNumbers;
            console.log(temp);
        }
    }
    return {
    
        create: function () {
    
            game.physics.startSystem(Phaser.Physics.ARCADE);
            //game.add.sprite(0,0,'bg');
            game.world.setBounds(0,0,1300,1800);
            player = game.add.sprite(1000,1700, 'whiteBox');
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
            interactButton = game.input.keyboard.addKey(Phaser.Keyboard.R);
            //Platforms
            drawWall(1100,600,50,1000,'brick');
            drawWall(1100,1600,500,75,'brick');
            drawWall(200,600,50,2000,'brick');
            drawWall(950,1300,150,20,'brick');
            drawWall(200,1775,5000,25,'brick');
            drawWall(0,550,250,50,'brick');
            drawWall(1100,550,800,50,'brick');
            drawWall(725,0,50,250,'brick');
            drawWall(600,1400,50,375, 'brick');
            
            drawWall(1036,1320,64,196,'bookshelfEmpty');
            drawWall(536,1488,64,96*3,'bookshelfEmpty');
            
            drawFilledBookShelf(1036,1204,'left');
    
            drawFilledBookShelf(250,1676);
            
            drawFilledBookShelf(250,600);
            
            drawFilledBookShelf(0,350);
            drawWall(0,442,64,96,'bookshelfEmpty');
            drawFilledBookShelf(1236,449,'left');
            
            turnInHitbox = game.add.sprite(1000,1710,'whiteBox');
            turnInHitbox.alpha = 0.1;
            turnInHitbox.tint = 0x00ff00
            turnInHitbox.scale.setTo(2,2);
            randomizeSections();
            currentSectionGoal = Math.floor(Math.random() * sectionHitboxes.length);
            drawWall(1,1,1298, 1998,null);
            game.camera.follow(player);
        },
    
        update: function () {
            isColliding  = game.physics.arcade.collide(player,wallSprites);
            if(webCooldownCurrent < webCooldownMax){
                webCooldownCurrent++;
            }
            player.body.velocity.x = 0;
            for(var i = 0; i < sectionHitboxes.length ;i++){
                if(checkOverlap(sectionHitboxes[i],player)){
                    if(interactButton.isDown){
                        currentlyHeldBookSection = sectionHitboxes[i].sectionNumber;
                    }
                }
            }
            if(checkOverlap(player,turnInHitbox)){
                if(interactButton.isDown){
                    if(currentlyHeldBookSection == currentSectionGoal){
                        currentlyHeldBookSection = -1;
                        score++;
                        currentSectionGoal = Math.floor(Math.random() * sectionHitboxes.length);
                    }
                }
            }
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

                //So long as you are no further than the start or end of the line
  
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
                if (jumpButton.isDown)
                {
                    isCurrentlyOnALine = false;
                    
                    player.body.gravity.y = 350;
                    player.body.velocity.y = -250;
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

                    if(jumpCoolDownCurrent < jumpCoolDownMax){
                        jumpCoolDownCurrent++;
                    }
                    if(stickButton.isDown && !isCurrentlyOnALine ){
                        jumpToLine();
                    }
                    if (jumpButton.isDown && isColliding )
                    {
                        if(jumpCoolDownCurrent >= jumpCoolDownMax){
                            player.body.velocity.y = -250;
                            jumpCoolDownCurrent = 0;
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
                }
            },
        render: function(){
            lines.forEach(function(line){
                game.debug.geom(line,'rgb(255,255,255)');
            });
            walls.forEach(function(line){
                game.debug.geom(line);
            });
            game.debug.text(Math.round( totalLineLength),25,25);
            game.debug.text("Section of book Currently Requested: "+ ((currentSectionGoal+1) * 100),25,50);
            game.debug.text("Section of book Currently held: " + (currentlyHeldBookSection+1) * 100,25,75);
            game.debug.text("Score: "+ score,25,100);
        }
        };
};
