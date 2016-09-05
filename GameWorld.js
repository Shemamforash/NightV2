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
    var hour_counter = 0;
    var hour_length_millis = 5000;

    function advance_hour() {
        time == 19 ? advance_day() : time += 1;
    }

    function advance_day() {
        Environment.Current.change_weather();
        day += 1;
        time = 6;
    }

    function update_loop() {
        if(!paused) {
            var delta = Date.now() - prev_time;
            total_time += delta;
            hour_counter += delta;
            prev_time = Date.now();
            if (hour_counter >= hour_length_millis) {
                hour_counter -= hour_length_millis;
                advance_hour();
            }
        }
        update_UI();
    }

    function new_game() {
        Outpost.Status.make_trip();
        advance_day();
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
        },
        start_loop : function() {
            // todo load_game();
            prev_time = Date.now();
            setInterval(update_loop, 17);
            new_game();
            paused = false;
        }
    }
}());