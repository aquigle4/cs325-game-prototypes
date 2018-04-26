"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.
    var player = null;
    var hitbox;
    var cursors;
    var fireButton;
    var fireTimer = 0;
    var fireRate = 3;
    var playerBullets = new Phaser.ArraySet([]);
    var enemys = new Phaser.ArraySet([]);
    var enemyBullets = new Phaser.ArraySet([]);
    var playerBulletSpeed = -700;
    function quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

    }
    
    function checkOverlap(spriteA, spriteB) {

        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();

        return Phaser.Rectangle.intersects(boundsA, boundsB);

    }
    function EnemyBulletOut(bullet){
        enemyBullets.remove(bullet);
        console.log("deleting");
        bullet.destroy();
    }
    function bulletOut(bullet){
        playerBullets.remove(bullet);
        console.log("deleting");
        bullet.destroy();
    }
    function enemyOut(enemy){
        enemys.remove(enemy);
        console.log("enemyDeleted");
        enemy.destroy;
    }
    function createBurst(enemy, numBullets,speed){
        for(var i = 0; i< numBullets;i++){
            var newBullet = game.add.sprite(enemy.x,enemy.y,'enemyBullet');
            game.physics.arcade.enable(newBullet);
            var angle = i * (360/numBullets);
            game.physics.arcade.velocityFromAngle(angle,speed,newBullet.body.velocity);
            newBullet.rotation = Phaser.Math.degToRad(angle);
            newBullet.checkWorldBounds = true;
            newBullet.events.onOutOfBounds.add(EnemyBulletOut,this);
            enemyBullets.add(newBullet);
        }
    }
    function shootToPlayer(enemy,speed){
        var newBullet = game.add.sprite(enemy.x,enemy.y,'enemyBullet');
        game.physics.arcade.enable(newBullet);
        var angle = Phaser.Math.radToDeg( game.physics.arcade.angleBetween(enemy,player));
        console.log(angle);
        newBullet.rotation = game.physics.arcade.angleBetween(enemy,player);
        game.physics.arcade.velocityFromAngle(angle,550,newBullet.body.velocity);
        newBullet.checkWorldBounds = true;
        newBullet.events.onOutOfBounds.add(EnemyBulletOut,this);
        enemyBullets.add(newBullet);
    }
    function createShootToPlayerEnemy(x,y,fireRate= 3,burstLength= 30,burstDelay=60,bulletSpeed = 400, health = 5){
        var newEnemy = game.add.sprite(x,y,'whiteBox');
        newEnemy.fireRate = fireRate;
        newEnemy.bulletSpeed = bulletSpeed;
        newEnemy.currentBurstLength = 0;
        newEnemy.currentFireTime = 0;
        newEnemy.currentBurstDelay = 0;
        newEnemy.health = health;
        newEnemy.firing = false;
        newEnemy.burstDelay = burstDelay;
        newEnemy.burstLength = burstLength;
        newEnemy.AI = "Aimed";
        game.physics.arcade.enable(newEnemy);
        newEnemy.anchor.x = 0.5;
        newEnemy.anchor.y = 0.5;
        newEnemy.checkWorldBounds = true;
        newEnemy.events.onOutOfBounds.add(enemyOut,this);
        enemys.add(newEnemy);
    }
    function createBurstFireEnemy(x,y,fireRate =30,bulletsPerBurst = 10,bullestSpeed = 400,health = 5){
        var newEnemy = game.add.sprite(x,y,'whiteBox');
        newEnemy.fireRate= fireRate;
        newEnemy.currentFireTime = 0;
        newEnemy.bulletsPerBurst = 10;
        newEnemy.health = health;
        newEnemy.bulletSpeed = bullestSpeed;
        newEnemy.AI = "Burst";
        game.physics.arcade.enable(newEnemy);
        newEnemy.anchor.x = 0.5;
        newEnemy.anchor.y = 0.5;
        newEnemy.checkWorldBounds = true;
        newEnemy.events.onOutOfBounds.add(enemyOut,this);
        enemys.add(newEnemy)
    }
    return {
    
        create: function () {
            game.physics.startSystem(Phaser.Physics.ARCADE);

            player = game.add.sprite(400,684,'whiteBox');
            game.physics.arcade.enable(player);
            
            player.anchor.x = 0.5;
            player.anchor.y = 0.5;
            hitbox = game.add.sprite(400,684,'whiteBox');
            hitbox.anchor.x = 0.5;
            hitbox.anchor.y = 0.5;
            hitbox.scale.x = 0.1;
            hitbox.scale.y = 0.1;
            hitbox.tint = 0xff0000
            
            
            createShootToPlayerEnemy(200,200,3,60,30);
            createBurstFireEnemy(600,200,45,15,600,5);
            player.body.collideWorldBounds=true;
            cursors = game.input.keyboard.createCursorKeys();
            fireButton = game.input.keyboard.addKey(Phaser.Keyboard.Z);
        },
    
        update: function () {
            hitbox.x = player.x;
            hitbox.y = player.y;
            if(cursors.up.isDown){
                player.body.velocity.y = -250;
            }
            else if(cursors.down.isDown){
                player.body.velocity.y = 250;
            }else{
                player.body.velocity.y = 0;
            }
            if(cursors.left.isDown){
                player.body.velocity.x = -250;
            }
            else if(cursors.right.isDown){
                player.body.velocity.x = 250;
            }else{
                player.body.velocity.x = 0;
            }
            if(fireButton.isDown){
                fireTimer++;
                if(fireTimer >= fireRate){
                    var newBullet = game.add.sprite(player.x,player.y-32,'playerBullet');
                    game.physics.arcade.enable(newBullet);
                    newBullet.body.velocity.y = playerBulletSpeed;
                    newBullet.checkWorldBounds = true;
                    newBullet.events.onOutOfBounds.add(bulletOut,this);
                    playerBullets.add(newBullet);
                    fireTimer = 0;
                }
            }
            var enemy = enemys.first;
            for(var i = 0; i< enemys.total;i++){
                
                if(enemy.AI == "Aimed"){
                    
                    if(enemy.firing){
                        enemy.currentBurstLength++;
                        enemy.currentFireTime++;
                        if(enemy.currentFireTime >= enemy.fireRate){
                            shootToPlayer(enemy,enemy.bulletSpeed);
                            enemy.currentFireTime = 0;
                        }
                        if(enemy.currentBurstLength >= enemy.burstLength){
                            enemy.currentBurstLength = 0;
                            enemy.firing = false;
                        }
                    }else{
                        enemy.currentBurstDelay++;
                        if(enemy.currentBurstDelay >= enemy.burstDelay){
                            enemy.firing = true;
                            enemy.currentBurstDelay = 0;
                        }
                    }
                    
                }
                if(enemy.AI == "Burst"){
                    enemy.currentFireTime++;
                    console.log(enemy.currentFireTime);
                    if(enemy.currentFireTime >= enemy.fireRate){
                        createBurst(enemy,enemy.bulletsPerBurst,enemy.bulletSpeed);
                        enemy.currentFireTime = 0;
                    }
                }
                var bullet = playerBullets.first;
                for(var j = 0; j < playerBullets.total;j++){
                    console.log(enemy.getbounds);
                    if(checkOverlap(enemy,bullet)){
                        enemy.health--;
                        
                        if(enemy.health <= 0){
                            enemys.remove(enemy);
                            enemy.destroy();
                            break;
                        }
                    }
                    bullet= playerBullets.next;
                }
                enemy = enemys.next;
            }
            enemy = enemys.first
        },
        render: function(){
            game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");
        },
    };
};