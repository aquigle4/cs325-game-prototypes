"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.
    var teapot;
    var ownedTeapots = 0;
    var teaPotBaseCost = 2;
    var teaPotCost = 2;
    var teaPotRate = 0.1;
    
    var telly;
    var ownedTellies = 0;
    var tellyBaseCost = 50;
    var tellyCost = 50;
    var tellyRate = 2;
    
    var pub;
    var ownedPubs = 0;
    var pubBaseCost = 750;
    var pubCost = 750;
    var pubRate = 15;
    
    var henge;
    var ownedHenges = 0;
    var hengeBaseCost = 3000;
    var hengeCost = 3000;
    var hengeRate = 125;
    
    var cricketTeam;
    var ownedCricketTeams  = 0;
    var cricketTeamBaseCost = 12500;
    var cricketTeamCost = 12500;
    var cricketTeamRate = 1000;
    
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
        score -= currentCost;
        currentCost = baseCost * Math.pow(1.15,ownedItems);
    }
    return {
    
        create: function () {
            teapot = game.add.sprite(64,64,'teapot');
            teapot.animations.add('boil');
            
            scoreText = "GBP: " + score;
            var style = { font: "65px Arial", fill: "#ffffff", align: "center" };
            scoreTextObj = game.add.text(150, 150, scoreText,style);
            
        },
    
        update: function () {
            console.log(score);
            var deltaTime=0;
            deltaTime = game.time.elapsed/1000;
            scoreTextObj.text = "GBP: " + score;
            score+= getTotalRate() * deltaTime; 
        }
    };
};
