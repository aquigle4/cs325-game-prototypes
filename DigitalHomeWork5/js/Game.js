"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.
    var teapot;
    var boil;
    
    function quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

    }
    
    return {
    
        create: function () {
            teapot = game.add.sprite(64,64,'teapot');
            boil = teapot.animations.add('boil');
            boil.frame = 1;
        },
    
        update: function () {
    
        }
    };
};
