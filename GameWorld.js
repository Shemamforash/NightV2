/**
 * Created by samwe on 03/09/2016.
 */
/*
 entrypoint in to game
 controls game loop, pausing, unpausing, day and location change etc.
 */
var World = {};

var Listener = {};

Listener.Update = (function() {
    var listeners = [];
    return {
        add_listener : function(s) {
            listeners.push(s);
        },
        remove_listener : function(s){
            listeners.remove(s);
        },
        update_listeners : function() {
            for (var i = 0; i < listeners.length; ++i) {
                listeners[i].receive_hour();
            }
        }
    }
}());

Listener.Proto = {
    receive_hour: function () {}
};

Listener.LinkToObject = function(s){
    s.prototype = new Listener.Proto();
    Listener.Update.add_listener(s);
};

World.Time = (function () {
    var time = 6;
    var day = 0;
    var prev_time;
    var total_time = 0;
    var paused = true;
    var hour_counter = 0;
    var hour_length_millis = 1000;

    function advance_hour() {
        time == 18 ? end_day() : time += 1;
        Listener.Update.update_listeners();
    }

    function advance_day() {
        Environment.Current.change_weather();
        day += 1;
        time = 6;
    }

    function update_loop() {
        var delta = Date.now() - prev_time;
        total_time += delta;
        prev_time = Date.now();
        if (!paused) {
            hour_counter += delta;
            if (hour_counter >= hour_length_millis) {
                hour_counter -= hour_length_millis;
                advance_hour();
            }
        }
        update_UI();
    }

    function new_game() {
        Outpost.Status.make_trip();
        Outpost.Survivors.add_survivor();
        advance_day();
    }

    return {
        get_date_and_time: function () {
            return {
                date: day,
                time: time
            };
        },
        pause: function () {
            paused = true;
        },
        unpause: function () {
            paused = false;
        },
        start_loop: function () {
            // todo load_game();
            prev_time = Date.now();
            setInterval(update_loop, 17);
            new_game();
            paused = false;
        },
        next_day: function () {
            advance_day();
        },
        make_trip: function () {
            new_game(); //probably should rename this...
        }
    }
}());