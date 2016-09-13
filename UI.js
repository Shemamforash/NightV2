/**
 * Created by samwe on 03/09/2016.
 */
/**
 * Created by samwe on 21/08/2016.
 */
function start() {
    UI.Menus.cache_selectors();
    UI.Update.cache_selectors();
    UI.Update.add_click_events();
    World.Time.start_loop();
}

var UI = {};

UI.Update = (function () {
    var food_quantity;
    var water_quantity;
    var fuel_quantity;

    var location_label;
    var day_number_label;
    var weather_label;
    var temperature_label;

    var event_one_label;
    var event_two_label;
    var event_three_label;
    var event_four_label;

    return {
        cache_selectors: function () {
            water_quantity = $("#water_label > .centre_text");
            food_quantity = $("#food_label > .centre_text");
            fuel_quantity = $("#fuel_label > .centre_text");

            location_label = $("#location_label > .centre_text");
            day_number_label = $("#day_number_label > .centre_text");
            weather_label = $("#weather_label > .centre_text");
            temperature_label = $("#temperature_label > .centre_text");

            event_one_label = $("#event_one");
            event_two_label = $("#event_two");
            event_three_label = $("#event_three");
            event_four_label = $("#event_four");
        },
        update_UI: function () {
            location_label.text(Environment.Current.get_environment().env_name);
            day_number_label.text("Day: " + World.Time.get_date_and_time().date + "  " + World.Time.get_date_and_time().time + ":00");
            weather_label.text(Environment.Current.get_weather().weather_name);
            temperature_label.text(Environment.Current.get_temperature() + "\xB0C");
            UI.Dynamic.update_elements();
        },
        post_event: function (event) {
            event_four_label.text(event_three_label.text());
            event_three_label.text(event_two_label.text());
            event_two_label.text(event_one_label.text());
            event_one_label.text(event);
        },
        add_click_events: function () {
            $(document).on("click", ".toggle_button", function () {
                $(this).toggleClass("down");
            });
            $(document).on("click", ".pause_button", UI.Menus.toggle_pause);
            $(document).on("click", "#next_day_button", function () {
                UI.Menus.change_day(false)
            });
            $(document).on("click", "#make_trip_button", function () {
                UI.Menus.change_day(true)
            });
        }
    }
}());

UI.Dynamic = (function () {
    var lower = $("#lower");
    var elements = [];

    return {
        update_elements: function () {
            for (var i = 0; i < elements.length; ++i) {
                elements[i].element.children(".food_resource").text(elements[i].survivor.required_food + " kcal");
                elements[i].element.children(".water_resource").text(elements[i].survivor.required_water + " ml");
            }
        },
        add_survivor_elements: function (s) {
            var $div = $("<div>", {id: s.survivor_name, "class": "survivor_div"});
            $("#lower").append($div);
            $div.append("<div class=\"survivor_name\">" + s.survivor_name + "</div>");
            $div.append("<div class=\"survivor_trait\">" + "trait 1" + "</div>");
            $div.append("<div class=\"survivor_trait\">" + "trait 2" + "</div>");
            $div.append("<div class=\"survivor_resource food_resource\">" + Helper.to_sf(s.required_food, 1) + "</div>");
            $div.append("<div class=\"survivor_resource water_resource\">" + Helper.to_sf(s.required_water, 1) + "</div>");
            $div.append("<div class=\"survivor_resource\">" + s.fuel_requirements + "</div>");
            $div.append("<div class=\"survivor_resource\">" + s.food_find + "</div>");
            $div.append("<div class=\"survivor_resource\">" + s.water_find + "</div>");
            $div.append("<div class=\"survivor_resource\">" + s.fuel_find + "</div>");

            var $toggle_div = $("<div>", {"class": "toggle_div"});
            $div.append($toggle_div);
            var $toggle_button = $("<a>", {"class": "toggle_button"});
            $toggle_button.click(function () {
                    s.set_preferred(!s.get_preferred());
                }
            );
            $toggle_div.append($toggle_button);
            elements.push(
                {
                    element: $div,
                    survivor: s
                }
            );
        },
        remove_survivor_elements: function (s) {
            for (var i = 0; i < elements.length; ++i) {
                if (elements[i].element.attr("id") === s.survivor_name) {
                    elements[i].remove();
                    break;
                }
            }
        }
    };
}());

UI.Menus = (function () {
    var container;
    var pause_button;

    return {
        cache_selectors: function () {
            container = $("#container");
            pause_button = $(".pause_button");

        },
        change_day: function (make_trip) {
            container.css({top: "0%"});
            make_trip ? World.Time.make_trip() : World.Time.next_day();
        },
        end_day: function () {
            container.css({top: "-200%"});
        },
        toggle_pause: function (e) {
            if (e.target.id === "pause_top") {
                pause_button.text("Unpause");
                World.Time.pause();
                container.css({top: "-100%"});
            } else {
                pause_button.text("Pause");
                World.Time.unpause();
                container.css({top: "0%"});
            }
        }
    };
}());


$(document).ready(start);