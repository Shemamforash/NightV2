/**
 * Created by samwe on 03/09/2016.
 */
/*
 entrypoint in to game
 controls game loop, pausing, unpausing, day and location change etc.
 */
var World = {};

World.Time = (function () {
    var time = 6;
    var day = 0;
    var prev_time;
    var total_time = 0;
    var paused = true;
    var hour_counter = 0;
    var hour_length_millis = 10000;
    var hour_listener = Helper.Listener_Builder.get_new_listener();

    function advance_hour() {
        time == 18 ? UI.Menus.end_day() : time += 1;
        hour_listener.update_listeners();
        if (Math.random > 0.05) {
            Outpost.Survivors.add_survivor();
        }
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
        UI.Update.update_UI();
    }

    function make_trip() {
        Outpost.Status.make_trip();
        if (Math.random > 0.4) {
            Outpost.Survivors.add_survivor();
        }
        advance_day();
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
        un_pause: function () {
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
            make_trip(); //probably should rename this...
        },
        hour_listener: hour_listener
    }
}());