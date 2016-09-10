/**
 * Created by samwe on 03/09/2016.
 */
/*
 all things to do with survivors
 */
var Survivor = {};

Survivor.get_empty_survivor = function () {
    return {
        survivor_name: "none",
        background: "none",

        age: "none",
        ideal_age: 24,
        age_modifier: 0,
        gender: "none",
        strength: 0,
        weight: 0,
        ideal_weight: 0,
        thirst: 0,
        hunger: 0,
        dehydration_tolerance: 0,
        starvation_tolerance: 0,
        dehydration: 0,
        starvation: 0,
        water_find: 0,
        food_find: 0,
        fuel_find: 0,
        fuel_requirements: 0,
        preferred_temperature: -240,
        preferred_environments: [],
        trait_a: {},
        trait_b: {},
        actions: [],
        preferred: false,

        get_required_water: function (temperature) {
            if (temperature > this.preferred_temperature) {
                var delta_temp = temperature - this.preferred_temperature;
                var temp_mod = 1 + delta_temp / 50;
                return this.thirst / 12 * temp_mod;
            }
            return 1;
        },
        get_required_food: function (temperature) {
            if (temperature < this.preferred_temperature) {
                var x_component = 7 - (20 - temperature) / 5;
                var pow = Math.pow(x_component, 2);
                return 1 + 1 / pow;
            }
            return 1;
        },
        get_strength: function () {
            return (this.strength / this.starvation_tolerance) * (this.starvation_tolerance - this.starvation);
        },
        set_preferred: function (b) {
            this.preferred = b;
        },
        get_preferred : function() {
            return this.preferred;
        }
    }
};

Survivor.generate_survivor = function () {
    var new_survivor = Survivor.get_empty_survivor();

    new_survivor.age = Survivor.GenerationFunctions.calculate_age();
    new_survivor.gender = Survivor.GenerationFunctions.assign_gender();
    new_survivor.age_modifier = Survivor.GenerationFunctions.calculate_age_modifier(new_survivor);
    new_survivor.strength = Survivor.GenerationFunctions.calculate_strength(new_survivor);
    new_survivor.ideal_weight = Survivor.GenerationFunctions.calculate_ideal_weight(new_survivor);
    new_survivor.weight = Survivor.GenerationFunctions.calculate_weight(new_survivor);
    new_survivor.thirst = Survivor.GenerationFunctions.calculate_thirst(new_survivor);
    new_survivor.hunger = Survivor.GenerationFunctions.calculate_hunger(new_survivor);
    new_survivor.dehydration_tolerance = Survivor.GenerationFunctions.calculate_dehydration_tolerance(new_survivor);
    new_survivor.starvation_tolerance = Survivor.GenerationFunctions.calculate_starvation_tolerance(new_survivor);
};

Survivor.GenerationFunctions = {
    create_name : function() {
        var female_names = ["Alette", "Temika", "Jeri", "Melinda", "Marcia", "Corine", "Heike", "Krishna", "Letitia", "Naomi", "Yasuko", "Karie", "Grazyna", "Ethelene", "Audry", "Melda", "Katherine", "Nell"];
        var male_names = ["Hai", "Riley", "Kristoff", "Angbard", "Rob", "Alvaro", "James", "Abel", "Stephen", "Mikki", "Alexander", "Paolo", "Vladimir", "Harald", "Max", "Michael", "Emory", "Byron", "Daniel"];
        var surnames = ["Copeland", "Delgado", "Hess", "Horton", "Garrett", "Freysson", "Yang", "Blackeye", "Longscab", "Redhand", "Deepdweller", "Sungazer", "Bottomeater", "Eaton", "Koch", "Diaz", "O'connoll", "Divider"];

        var first_name = (gender === "Male") ? (male_names[helper.randomInt(male_names.length)]) : (female_names[helper.randomInt(female_names.length)]);
        var surname = surnames[helper.randomInt(surnames.length)];
        var full_name = first_name + " " + surname;
        for(var s in survivor.CharacterManager.get_all()) {
            if(s.survivor_name === full_name) {
                if(i === 0){
                    return null;
                }
                return generate_name(i + 1);
            }
        }
        return full_name;
    },
    calculate_age: function () {
        var rand = Math.random();
        if (rand < 0.1) {
            return Helper.randomInt(6) + 15;
        } else if (rand < 0.6) {
            return Helper.randomInt(11) + 20;
        } else if (rand < 0.9) {
            return Helper.randomInt(21) + 30;
        }
        return Helper.randomInt(21) + 50;
    },
    assign_gender: function () {
        if (Math.random() < 0.5) {
            return "Female";
        }
        return "Male";
    },
    calculate_age_modifier: function (s) {
        if (s.age < s.ideal_age) {
            return -0.0045 * Math.pow(s.age - s.ideal_age, 2) + 1;
        }
        return -0.0001 * Math.pow(s.age - s.ideal_age, 2) + 1;
    },
    calculate_strength: function (s) {
        if (s.gender === "Female") {
            return Math.ceil(s.age_modifier * 10) - 2;
        }
        return Math.ceil(s.age_modifier * 10);
    },
    calculate_ideal_weight: function (s) {
        if (s.gender === "Female") {
            return 15 * s.age_modifier + 40;
        }
        return 15 * s.age_modifier + 50;
    },
    calculate_weight: function (s) {
        var min_weight = 10 * s.age_modifier + 40;
        var max_weight = 25 * s.age_modifier + 55;
        var delta = max_weight - min_weight;
        var random_delta = Helper.randomInt(delta + 1);
        if (s.gender === "Female") {
            return min_weight + random_delta - 10;
        }
        return min_weight + random_delta;
    },
    calculate_thirst: function (s) {
        var age_thirst_modifier = s.age_modifier;
        var weight_thirst_modifier = 1 - (s.ideal_weight - s.weight) / 50;
        var actual_thirst = 3;
        if (s.gender === "Female") {
            actual_thirst = 2.5;
        }
        return actual_thirst * age_thirst_modifier * weight_thirst_modifier;
    },
    calculate_hunger: function (s) {
        var age_hunger = s.age_modifier * s.age_modifier;
        var weight_hunger_modifier = 1 + (s.ideal_weight - s.weight) / 50;
        var actual_hunger_modifier = 2;
        if (s.gender === "Female") {
            actual_hunger_modifier = 1.5;
        }
        return actual_hunger_modifier * age_hunger * weight_hunger_modifier;
    },
    calculate_dehydration_tolerance: function (s) {
        var age_tolerance = s.age_modifier * 18;
        var weight_tolerance = -2 * (s.ideal_weight - s.weight) / 3;
        return age_tolerance + weight_tolerance;
    },
    calculate_starvation_tolerance: function (s) {
        var age_tolerance = s.age_modifier * 48;
        var weight_tolerance = s.ideal_weight - s.weight;
        return age_tolerance + weight_tolerance;

    }

};