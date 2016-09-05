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

Environment.Current = (function() {
    var current_environment, current_weather;
    var temperature_range = [];

    function calculate_temperatures() {
        var current_temp = current_environment.base_temperature - 15;
        temperature_range = [];
        for(var i = 0; i < 12; ++i){
            temperature_range.push(current_temp);
            if(i < 8) {
                current_temp += 3;
            } else {
                current_temp -= 3;
            }
        }
    }

    return {
        //if trip is made to new environment
        change_environment : function(difficulty) {
            current_environment = Environment.Types.generate_environment(difficulty);
            Environment.Current.change_weather();
        },
        //when day changes
        change_weather : function() {
            current_weather = Environment.Weather.generate_weather(current_environment);
            calculate_temperatures();
        },
        get_environment : function() {
            return current_environment;
        },
        get_weather : function() {
            return current_weather;
        },
        get_temperature : function() {
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
            weather_severity: weather_severity
        }
    }

    var dry_weather = [
        weather_constructor("Clear", -1, -2, 10, 0, 0),
        weather_constructor("Clouds", 1, 0, 5, 0, 0.2),
        weather_constructor("Overcast", 2, 0, 0, 0, 0.3),
        weather_constructor("Dry storm", -1, -2, 5, 2, 0.5),
        weather_constructor("Sandstorm", -1 -2, 10, 2, 0.8),
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
        for(var i = 0; i < arr.length; ++i){
            if(arr[i].weather_severity >= lower_bound && arr[i].weather_severity <= upper_bound) {
                available_weather.push(arr[i]);
            }
        }
        return helper.get_random(arr);
    }

    function get_weather_by_name(name) {
        for(var i = 0; i < all_weather.length; ++i) {
            if(all_weather[i].weather_name === name){
                return all_weather[i];
            }
        }
        throw("Weather '" + name + "' not found");
    }

    return {
        generate_weather : function(environment) {
            var misc_or_susceptible_chance = Math.random();
            console.log(environment.env_condition);
            if(misc_or_susceptible_chance < 0.2 && environment.susceptible_weather != null) {
                //20% chance to select susceptible weather
                return get_weather_by_name(environment.susceptible_weather);
            } else if(misc_or_susceptible_chance < 0.1) {
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

Environment.Types = (function () {
    function environment_constructor(name, fuel, water, food, condition, dry_severity, wet_severity, weather, base_temperature) {
        return {
            env_name: name,
            env_fuel: fuel,
            env_water: water,
            env_food: food,
            env_condition: condition,
            dry_severity: dry_severity,
            wet_severity: wet_severity,
            susceptible_weather: weather,
            base_temperature: base_temperature
        };
    }

    //0 - 0.3 difficulty
    var class_A = [
        environment_constructor("Mountains", 2, 3, 3, 0.2, 0.1, 0.5, "Wet storm", 10),
        environment_constructor("Oasis", 1, 3, 3, 0.6, 0.1, 0.2, null, 20)
    ];

    //0.3-0.75 difficulty
    var class_B = [
        environment_constructor("Oil Sands", 3, 1, 1, 0.7, 0.3, 0.2, null, 20),
        environment_constructor("Ravines", 2, 3, 2, 0.3, 0.2, 0.6, "Floods", 15),
        environment_constructor("Prairie", 1, 2, 3, 0.4, 0.4, 0.4, "Hurricane", 25),
        environment_constructor("Scrublands", 2, 2, 2, 0.6, 0.6, 0.2, "Wildfire", 30)
    ];

    //0.75-1 difficulty
    var class_C = [
        environment_constructor("Salt Flats", 2, 1, 1, 0.8, 0.4, 0.1, "Drought", 20),
        environment_constructor("Wasteland", 1, 1, 2, 1, 0.8, 0, "Sandstorm", 35),
        environment_constructor("Ruins", 1, 2, 1, 0.5, 0.5, 0.5, "Earthquake", 15)
    ];

    var environment_types = class_A.concat(class_B.concat(class_C));

    return {
        generate_environment : function(difficulty) {
            var lower_bound = difficulty - 0.15;
            var upper_bound = difficulty + 0.15;
            var class_A_chance = 0, class_B_chance = 0, class_C_chance = 0;
            if(upper_bound < 0.3) {
                class_A_chance = 0.3;
            } else if(lower_bound < 0.3 && upper_bound > 0.3) {
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
            if(random_int < class_A_chance) {
                return helper.get_random(class_A);
            } else if (random_int < class_B_chance) {
                return helper.get_random(class_B);
            } else if (random_int <= class_C_chance) {
                return helper.get_random(class_C);
            }
        }
    }
}());