/**
 * Created by samwe on 03/09/2016.
 */
/*
 all things environmental:
 - environments
 - weather
 - resources both
 */

var Environment = {};

Environment.Current = (function () {
    var current_environment, current_weather;
    var temperature_range = [];

    function calculate_temperatures() {
        temperature_range = [];
        var temperature_val;
        var min_max_diff;
        for (var i = 0; i < 13; ++i) {
            //equation for temperature is (max_temp - min_temp)*sin(c * x) + min_temp
            //increase i coefficient for an earlier peak temperature
            temperature_val = Math.sin(i * 0.21);
            min_max_diff = current_environment.max_temp - current_environment.min_temp;
            temperature_val = min_max_diff * temperature_val + current_environment.min_temp;
            temperature_val += current_weather.temperature_mod;
            temperature_range.push(Math.floor(temperature_val));
        }
    }

    return {
        //if trip is made to new environment
        change_environment: function (difficulty) {
            current_environment = Environment.Types.generate_environment(difficulty);
            Environment.Current.change_weather();
        },
        //when day changes
        change_weather: function () {
            World.Time.hour_listener.remove_listener(current_weather);
            current_weather = Environment.Weather.generate_weather(current_environment);
            World.Time.hour_listener.add_listener(current_weather);
            calculate_temperatures();
        },
        get_environment: function () {
            return current_environment;
        },
        get_weather: function () {
            return current_weather;
        },
        get_temperature: function () {
            return temperature_range[World.Time.get_date_and_time().time - 6];
        }
    }
}());

Environment.Weather = (function () {
    function weather_constructor(name, food_mod, water_mod, temperature_mod, weather_danger, weather_severity) {
        return {
            weather_name: name,
            water_mod: water_mod,
            food_mod: food_mod,
            temperature_mod: temperature_mod,
            weather_danger: weather_danger,
            weather_severity: weather_severity,
            update_listener: function () {
                Environment.Current.get_environment().resources.water.add(this.water_mod / 12);
                Environment.Current.get_environment().resources.food.add(this.food_mod / 12);
            }
        }
    }

    var dry_weather = [
        weather_constructor("Clear", -1, -2, 10, 0, 0),
        weather_constructor("Clouds", 1, 0, 5, 0, 0.2),
        weather_constructor("Overcast", 2, 0, 0, 0, 0.3),
        weather_constructor("Dry storm", -1, -2, 5, 2, 0.5),
        weather_constructor("Sandstorm", -1 - 2, 10, 2, 0.8),
        weather_constructor("Drought", -2, -2, 15, 0, 0.9),
        weather_constructor("Wildfire", -3, -4, 20, 3, 1)
    ];
    var wet_weather = [
        weather_constructor("Drizzle", 1, 1, -2, 0, 0),
        weather_constructor("Rain", 2, 2, -5, 1, 0.2),
        weather_constructor("Foggy", 2, 0, -5, 1, 0.3),
        weather_constructor("Wet storm", -1, 2, -5, 2, 0.4),
        weather_constructor("Frost", -1, -1, -19, 2, 0.6),
        weather_constructor("Floods", -1, 3, -5, 3, 0.8),
        weather_constructor("Ice storm", -2, -1, -15, 3, 0.9)
    ];
    var misc_weather = [
        weather_constructor("Breezy", 1, 0, -3, 0, 0),
        weather_constructor("Windy", 0, 0, -7, 1, 0.2),
        weather_constructor("Hurricane", -2, 0, -10, 3, 0.4),
        weather_constructor("Earthquake", -1, 0, 0, 4, -0.4)
    ];

    var all_weather = dry_weather.concat(wet_weather.concat(misc_weather));

    function get_weather_around_severity(arr, severity) {
        var available_weather = [];
        var lower_bound = severity - 0.4, upper_bound = severity + 0.4;
        for (var i = 0; i < arr.length; ++i) {
            if (arr[i].weather_severity >= lower_bound && arr[i].weather_severity <= upper_bound) {
                available_weather.push(arr[i]);
            }
        }
        return Helper.get_random(arr);
    }

    function get_weather_by_name(name) {
        for (var i = 0; i < all_weather.length; ++i) {
            if (all_weather[i].weather_name === name) {
                return all_weather[i];
            }
        }
        throw("Weather '" + name + "' not found");
    }

    return {
        generate_weather: function (environment) {
            var misc_or_susceptible_chance = Math.random();
            if (misc_or_susceptible_chance < 0.2 && environment.susceptible_weather !== null) {
                //20% chance to select susceptible weather
                return get_weather_by_name(environment.susceptible_weather);
            } else if (misc_or_susceptible_chance < 0.1) {
                //10% chance to select misc weather
                return get_weather_around_severity(misc_weather, 0.2);
            } else if (Math.random() > environment.env_condition) {
                //wet weather
                return get_weather_around_severity(wet_weather, environment.wet_severity);
            } else {
                //dry weather
                return get_weather_around_severity(dry_weather, environment.dry_severity);
            }
        }
    }
}());

Environment.Resources = (function () {
    function get_amount(strength, remaining, range_min, range_max) {
        var found = Math.random() * (range_max - range_min) + range_min;
        if (found > remaining) {
            found = remaining;
        }
        if (found > strength) {
            found = strength;
        }
        return found;
    }

    function update_water_in_world(quantity_found, from) {
        Environment.Current.get_environment().resources.water.remove(quantity_found);
        Outpost.Resources.water.add(quantity_found);
        UI.Update.post_event("Found " + Helper.convert_to_ml(quantity_found) + " water in a " + from);
    }

    return {
        gather_water: function (s) {
            var env = Environment.Current.get_environment();
            var quantity_found = (Math.random() + (s.water_find / 100)) / 2;
            var from;
            if (quantity_found < 0.1 && env.resources.water.remaining() > 6) {
                quantity_found = get_amount(s.strength, env.resources.water.remaining(), 6, 10);
                from = "stream";
            } else if (quantity_found < 0.3 && env.resources.water.remaining() > 3) {
                quantity_found = get_amount(s.strength, env.resources.water.remaining(), 3, 6);
                from = "pool";
            } else if (quantity_found < 0.6 && env.resources.water.remaining() > 1) {
                quantity_found = get_amount(s.strength, env.resources.water.remaining(), 1, 3);
                from = "trickle";
            } else {
                quantity_found = get_amount(s.strength, env.resources.water.remaining(), 0, 1);
                from = "puddle";
            }
            update_water_in_world(quantity_found, from);
        }
    };
}());

Environment.Types = (function () {
    function environment_constructor(name, fuel, water, food, condition, dry_severity, wet_severity, weather, min_temp, max_temp) {
        return {
            env_name: name,
            env_fuel: fuel,
            env_water: water,
            env_food: food,
            resources: Helper.get_new_resources(),
            env_condition: condition,
            dry_severity: dry_severity,
            wet_severity: wet_severity,
            susceptible_weather: weather,
            min_temp: min_temp,
            max_temp: max_temp
        };
    }

    //0 - 0.3 difficulty
    var class_A = [
        environment_constructor("Mountains", 1, 1.5, 1.5, 0.2, 0.1, 0.5, "Wet storm", -10, 15),
        environment_constructor("Oasis", 0.5, 1.5, 1.5, 0.6, 0.1, 0.2, null, 18, 24)
    ];

    //0.3-0.75 difficulty
    var class_B = [
        environment_constructor("Oil Sands", 1.5, 0.5, 0.5, 0.7, 0.3, 0.2, null, 15, 30),
        environment_constructor("Ravines", 1, 1.5, 1, 0.3, 0.2, 0.6, "Floods", -5, 10),
        environment_constructor("Prairie", 0.5, 1, 1.5, 0.4, 0.4, 0.4, "Hurricane", 20, 35),
        environment_constructor("Scrublands", 1, 1, 1, 0.6, 0.6, 0.2, "Wildfire", 28, 35)
    ];

    //0.75-1 difficulty
    var class_C = [
        environment_constructor("Salt Flats", 1, 0.5, 0.5, 0.8, 0.4, 0.1, "Drought", 15, 25),
        environment_constructor("Wasteland", 0.5, 0.5, 1, 1, 0.8, 0, "Sandstorm", 18, 45),
        environment_constructor("Ruins", 0.5, 1, 0.5, 0.5, 0.5, 0.5, "Earthquake", 10, 17)
    ];

    function generate_resources(env) {
        var survivors_support = Outpost.Survivors.get_alive_survivors().length + 1;
        var water_amount = survivors_support * 1.75 * Helper.randomInt(3) + 4;
        water_amount *= env.env_water;
        env.resources.water.add(water_amount);
        var food_amount = survivors_support * 2.75 * Helper.randomInt(3) + 4;
        food_amount *= env.env_food;
        env.resources.food.add(food_amount);
        return env;
    }

    return {
        generate_environment: function (difficulty) {
            var lower_bound = difficulty - 0.15;
            var upper_bound = difficulty + 0.15;
            var class_A_chance = 0, class_B_chance = 0, class_C_chance = 0;
            if (upper_bound < 0.3) {
                class_A_chance = 0.3;
            } else if (lower_bound < 0.3 && upper_bound > 0.3) {
                class_A_chance = 0.3 - lower_bound;
                class_B_chance = 0.3;
            } else if (upper_bound < 0.75 && lower_bound > 0.3) {
                class_B_chance = 0.3;
            } else if (upper_bound > 0.75 && lower_bound < 0.75) {
                class_B_chance = 0.75 - lower_bound;
                class_C_chance = 0.3;
            } else {
                class_C_chance = 0.3;
            }
            var random_int = Math.random() * 0.3;
            if (random_int < class_A_chance) {
                return generate_resources(Helper.get_random(class_A));
            } else if (random_int < class_B_chance) {
                return generate_resources(Helper.get_random(class_B));
            } else if (random_int <= class_C_chance) {
                return generate_resources(Helper.get_random(class_C));
            }
        }
    }
}());