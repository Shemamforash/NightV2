/**
 * Created by samwe on 03/09/2016.
 */
/**
 * Created by samwe on 21/08/2016.
 */
function start() {
    $(document).on("click", ".toggle_button", function(){
        $(this).toggleClass("down");
    });
    World.Time.start_loop();
}

function post_event(event) {
    $("#event_four").text($("#event_three").text());
    $("#event_three").text($("#event_two").text());
    $("#event_two").text($("#event_one").text());
    $("#event_one").text(event);
}

function update_UI() {
    $("#location_label").text(Environment.Current.get_environment().env_name);
    $("#day_number_label").text("Day: " + World.Time.get_date_and_time().date + "  " + World.Time.get_date_and_time().time + ":00");
    $("#weather_label").text(Environment.Current.get_weather().weather_name);
    $("#temperature_label").text(Environment.Current.get_temperature() + "\xB0C");
}

function toggle_pause() {
    var button = $("#pause_button");
    if(button.text() === "Pause") {
        button.text("Unpause");
        World.Time.pause();
        $("#screen_containers").css({top: "-100%"});
    } else {
        button.text("Pause");
        World.Time.unpause();
    }
}

$(document).ready(start);