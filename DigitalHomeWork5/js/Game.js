"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.
    var teapot;
    var ownedTeapots;
    var teaPotBaseCost = 2;
    var teaPotCost = 2;
    var teaPotRate = 0.1;
    
    var telly;
    var ownedTellies;
    var tellyBaseCost = 50;
    var tellyCost = 50;
    var tellyRate = 2;
    
    var pub;
    var ownedPubs;
    var pubBaseCost = 750;
    var pubCost = 750;
    var pubRate = 15;
    
    var henge;
    var ownedHenges;
    var hengeBaseCost = 3000;
    var hengeCost = 3000;
    var hengeRate = 125;
    
    var cricketTeam;
    var ownedCricketTeams;
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
            scoreTextObj = game.add.text(game.world.centerX-300, 0, scoreText);
            
        },
    
        update: function () {
            var deltaTime=0;
            deltaTime = game.time.elapsed/1000;
            scoreTextObj.text = "GBP: " + score;
            score+= getTotalRate() * deltaTime; 
        }
    };
};
