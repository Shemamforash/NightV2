/**
 * Created by samwe on 03/09/2016.
 */
/**
 * Created by samwe on 21/08/2016.
 */
function start() {
    add_click_events();
    World.Time.start_loop();
}

function post_event(event) {
    $("#event_four").text($("#event_three").text());
    $("#event_three").text($("#event_two").text());
    $("#event_two").text($("#event_one").text());
    $("#event_one").text(event);
}

function update_UI() {
    $("#location_label > .centre_text").text(Environment.Current.get_environment().env_name);
    $("#day_number_label > .centre_text").text("Day: " + World.Time.get_date_and_time().date + "  " + World.Time.get_date_and_time().time + ":00");
    $("#weather_label > .centre_text").text(Environment.Current.get_weather().weather_name);
    $("#temperature_label > .centre_text").text(Environment.Current.get_temperature() + "\xB0C");
}

function add_click_events() {
    $(document).on("click", ".toggle_button", function(){
        $(this).toggleClass("down");
    });
    $(document).on("click", ".pause_button", toggle_pause);
    $(document).on("click", "#next_day_button", change_day);
}

function change_day() {
    $("#container").css({top: "0%"});
    World.Time.next_day();
}

function end_day() {
    $("#container").css({top: "-200%"});
}

function toggle_pause(e) {
    if(e.target.id === "pause_top") {
        $(".pause_button").text("Unpause");
        World.Time.pause();
        $("#container").css({top: "-100%"});
    } else {
        $(".pause_button").text("Pause");
        World.Time.unpause();
        $("#container").css({top: "0%"});
    }
}

$(document).ready(start);