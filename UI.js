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
    World.Time.start();
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
        text: function (element, text) {
            if(text !== undefined) {
                element.children(".centre_text").text(text);
            } else {
                return element.children(".centre_text").text();
            }
        },
        cache_selectors: function () {
            water_quantity = $("#water_label");
            food_quantity = $("#food_label");
            fuel_quantity = $("#fuel_label");

            location_label = $("#location_label");
            day_number_label = $("#day_number_label");
            weather_label = $("#weather_label");
            temperature_label = $("#temperature_label");

            event_one_label = $("#event_one");
            event_two_label = $("#event_two");
            event_three_label = $("#event_three");
            event_four_label = $("#event_four");
        },
        update: function () {
            UI.Update.text(water_quantity, Helper.to_ml(Outpost.Resources.water.remaining()));
            UI.Update.text(food_quantity, Helper.to_kcal(Outpost.Resources.food.remaining()));
            UI.Update.text(fuel_quantity, Helper.to_ml(Outpost.Resources.fuel.remaining()) + " / " + Helper.to_ml(Outpost.Resources.group_fuel.get()));

            UI.Update.text(location_label, Environment.Current.get_environment().env_name);
            UI.Update.text(day_number_label, "Day: " + World.Time.date_and_time().date + "  " + World.Time.date_and_time().time + ":00");
            UI.Update.text(weather_label, Environment.Current.get_weather().weather_name);
            UI.Update.text(temperature_label, Environment.Current.get_temperature() + "\xB0C");
            UI.Dynamic.update();
        },
        post_event: function (event) {
            UI.Update.text(event_four_label, UI.Update.text(event_three_label));
            UI.Update.text(event_three_label, UI.Update.text(event_two_label));
            UI.Update.text(event_two_label, UI.Update.text(event_one_label));
            UI.Update.text(event_one_label, event);
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
    var i;

    function find(s, optional_f) {
        for (i = 0; i < elements.length; ++i) {
            if (elements[i].survivor === s) {
                if (optional_f !== undefined) {
                    optional_f();
                }
                return elements[i];
            }
        }
    }

    return {
        update: function () {
            for (i = 0; i < elements.length; ++i) {
                elements[i].element.children(".food_resource").children(".centre_text").text(
                    Helper.to_kcal(elements[i].survivor.required_food) + " / " +
                    Helper.to_kcal(elements[i].survivor.starvation)
                );
                elements[i].element.children(".water_resource").children(".centre_text").text(
                    Helper.to_ml(elements[i].survivor.required_water) + " / " +
                    Helper.to_ml(elements[i].survivor.dehydration)
                );
            }
        },
        add: function (s) {
            var $div = $("<div>", {id: s.survivor_name, "class": "survivor_div"});
            $("#lower").append($div);
            $div.append("<div class=\"survivor_name\"><div class=\"centre_text\">" + s.survivor_name + "</div></div>");
            $div.append("<div class=\"survivor_trait\"><div class=\"centre_text\">" + "trait 1" + "</div></div>");
            $div.append("<div class=\"survivor_trait\"><div class=\"centre_text\">" + "trait 2" + "</div></div>");
            $div.append("<div class=\"survivor_resource food_resource\"><div class=\"centre_text\"></div></div>");
            $div.append("<div class=\"survivor_resource water_resource\"><div class=\"centre_text\"></div></div>");
            $div.append("<div class=\"survivor_resource\"><div class=\"centre_text\">" + s.fuel_requirements + "</div>");
            $div.append("<div class=\"survivor_resource\"><div class=\"centre_text\">" + s.food_find + "</div></div>");
            $div.append("<div class=\"survivor_resource\"><div class=\"centre_text\">" + s.water_find + "</div></div>");
            $div.append("<div class=\"survivor_resource\"><div class=\"centre_text\">" + s.fuel_find + "</div></div>");

            var $toggle_div = $("<div>", {"class": "toggle_div"});
            $div.append($toggle_div);
            var $toggle_button = $("<a>", {"class": "toggle_button"});
            $toggle_button.click(function () {
                    s.set_preferred(!s.get_preferred());
                    Outpost.Resources.group_fuel.calculate(s);
                }
            );
            $toggle_div.append($toggle_button);
            elements.push(
                {
                    element: $div,
                    survivor: s
                }
            );

            var $dropdown = $("<select>", {"class": "survivor_actions"});
            $div.append($dropdown);
            $dropdown.change(function () {
                var action = $($dropdown).find(":selected").text();
                var survivor_name = $($dropdown).find(":selected").val();
                var s = Outpost.Survivors.find(survivor_name);
                Survivor.Actions.find_and_activate(s, action);
                $dropdown.prop("disabled", true);
            });

            $dropdown.append("<option selected disabled hidden value=\"original\">Choose activity</option>");

            for (var i = 0; i < s.actions.length; ++i) {
                $dropdown.append("<option value=\"" + s.survivor_name + "\">" + s.actions[i].function_name + "</option>");
            }
        },
        reset_actions: function (s) {
            find(s, function () {
                var $dropdown = elements[i].element.children(".survivor_actions");
                $dropdown.prop("disabled", false);
                $dropdown.val("original");
            });
        },
        remove: function (s) {
            find(s, function () {
                    elements[i].element.remove();
                    Helper.array_remove(elements, elements[i]);
                }
            );
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
                World.Time.un_pause();
                container.css({top: "0%"});
            }
        }
    };
}());


$(document).ready(start);