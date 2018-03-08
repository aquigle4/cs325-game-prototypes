"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.
    var teapot;
    var ownedTeapots = 0;
    var teaPotBaseCost = 2;
    var teaPotCost = 2;
    var teaPotRate = 0.2;
    var teaPotText;
    
    var telly;
    var ownedTellies = 0;
    var tellyBaseCost = 50;
    var tellyCost = 50;
    var tellyRate = 2;
    var tellyText;
    
    var pub;
    var ownedPubs = 0;
    var pubBaseCost = 750;
    var pubCost = 750;
    var pubRate = 15;
    var pubText;
    
    var henge;
    var ownedHenges = 0;
    var hengeBaseCost = 3000;
    var hengeCost = 3000;
    var hengeRate = 125;
    var hengeText;
    
    var cricketTeam;
    var ownedCricketTeams  = 0;
    var cricketTeamBaseCost = 12500;
    var cricketTeamCost = 12500;
    var cricketTeamRate = 1000;
    var cricketTeamText;
    
    var score = 2;
    var scoreText;
    var scoreTextObj;
    function quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

    }
    function getTotalRate(){
        return ((teaPotRate*ownedTeapots)+ (tellyRate*ownedTellies) + (pubRate*ownedPubs) + (hengeRate*ownedHenges) + (cricketTeamRate*ownedCricketTeams));
        
    }
    function buy(ownedItems, baseCost, currentCost){
        console.log(score);
        console.log(ownedItems);
        if(score >= currentCost){
            score -= currentCost;
            currentCost = baseCost * Math.pow(1.15,ownedItems);
            ownedItems++;
        }
    }
    function buyTea(){
        if(score >= teaPotCost){
            score -= teaPotCost;
            teaPotCost = teaPotBaseCost * Math.pow(1.15,ownedTeapots+1);
            ownedTeapots++;
        }
    }
    function buyTelly(){
        if(score >= tellyCost){
            score -= tellyCost;
            tellyCost = tellyBaseCost * Math.pow(1.15,ownedTellies+1);
            ownedTellies++;
        }
    }
    function buyPub(){
        if(score >= pubCost){
            score -= pubCost;
            pubCost = pubBaseCost * Math.pow(1.15,ownedPubs+1);
            ownedPubs++;
        }
    }
    function buyHenge(){
        if(score >= hengeCost){
            score -= hengeCost;
            hengeCost = hengeBaseCost * Math.pow(1.15,ownedHenges+1);
            ownedHenges++;
        }
    }
    return {
    
        create: function () {
            game.add.sprite(0,0,'titlePage')
            teapot = game.add.sprite(300,10,'teapot');
            teapot.animations.add('boil');
            teapot.scale.x = 4;
            teapot.scale.y = 4;
            teapot.animations.play('boil',4,true);
            teapot.inputEnabled = true;
            teapot.events.onInputDown.add(buyTea);
            
            telly = game.add.sprite (300,138,'telly');
            telly.animations.add('flicker');
            telly.scale.x = 4;
            telly.scale.y = 4;
            telly.animations.play('flicker',3,true);
            telly.inputEnabled = true;
            telly.events.onInputDown.add(buyTelly);
            
            pub = game.add.sprite (300,266,'pub');
            pub.scale.x = 4;
            pub.scale.y = 4;
            pub.inputEnabled = ture;
            pub.events.onInputDown.add(buyPub);
            
            henge = game.add.sprite (300,394,'henge');
            henge.scale.x = 4;
            henge.scale.y = 4;
            henge.inputEnabled = ture;
            henge.events.onInputDown.add(buyHenge);
            
            
            
            scoreText = "GBP: " + score;
            var style = { font: "30px Arial", fill: "#ffffff", align: "center" ,stroke : '#000000'};
            style.strokeThickness = 4
            scoreTextObj = game.add.text(10,10, scoreText,style);
            
            teaPotText = game.add.text(450,74,"Teapots Owned: " + ownedTeapots + " Rate: 0.2/s",style);
            tellyText = game.add.text(450,202,"Tellies Owned: " + ownedTellies + " Rate: 2/s",style);
            pubText = game.add.text(450,330,"Pubs Owned: " + ownedPubs + " Rate: 15/s",style);
            hengeText = game.add.text(450,458, "Henges Owned: " + ownedHenges + " Rate: 125/s",style);
        },
    
        update: function () {
           
            var deltaTime=0;
            deltaTime = game.time.elapsed/1000;
            score+= getTotalRate() * deltaTime; 
            
            scoreTextObj.text = "GBP: " + Number.parseFloat(score).toFixed(2);
            teaPotText.text = "Teapot cost: " + Number.parseFloat(teaPotCost).toFixed(2) + " Teapots Owned: " + ownedTeapots + " Rate: 0.2/s";
            tellyText.text = "Telly Cost: "+ Number.parseFloat(tellyCost).toFixed(2) + " Tellies Owned: " + ownedTellies + " Rate: 2/s";
            pubText.text = "Pub Cost: "+ Number.parseFloat(pubCost).toFixed(2) + " Pubs Owned: " + ownedPubs + " Rate: 15/s";
            hengeText.text = "Henge Cost: " + Number.parseFloat(hengeCost).toFixed(2) + " Henges Owned: " + ownedHenges + " Rate: 125/s";
            
            
        }
    };
};
