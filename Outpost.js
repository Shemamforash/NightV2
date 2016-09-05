/**
 * Created by samwe on 03/09/2016.
 */
/*
 contains current information related to colony
 - resources left
 - number of survivors
 - buildings in the camp
 - difficulty
 */

var Outpost = {};

Outpost.Survivors = (function() {
    var alive = [], dead = [];
}());

Outpost.Resources = (function() {
    var water, fuel, food;
}());



Outpost.Status = (function() {
    var difficulty = 0;
    var trip = 0;

    function increase_difficulty() {
        if(trip === 3) {
            difficulty = 0.1;
        } else if (trip === 4){
            difficulty = 0.5;
        } else {
            difficulty += 0.1;
        }
    }

    return {
        make_trip : function() {
            trip += 1;
            increase_difficulty();
            Environment.Current.change_environment(difficulty);
        }
    }
}());