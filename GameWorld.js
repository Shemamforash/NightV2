/**
 * Created by samwe on 03/09/2016.
 */
/*
entrypoint in to game
controls game loop, pausing, unpausing, day and location change etc.
 */
var World = {};

World.Time = (function(){
    var time = 6;
    var day = 0;
    var prev_time;
    var total_time = 0;
    var paused = true;

    function advance_hour() {
        time == 19 ? advance_day() : time += 1;
    }

    function advance_day() {

    }

    function start_loop() {
        // todo load_game();
        prev_time = Date.now();
        setInterval(update_loop, 17);
        paused = false;
    }

    function update_loop() {
        if(!paused) {
            total_time += Date.now() - prev_time;
            prev_time = Date.now();
            if (total_time % 10000 === 0) {
                advance_hour();
            }
        }
    }

    return {
        get_date_and_time : function() {
            return {
                date: day,
                time: time
            };
        },
        pause : function() {
            paused = true;
        },
        unpause : function() {
            paused = false;
        }
    }
}());