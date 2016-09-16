/**
 * Created by samwe on 03/09/2016.
 */
/*
 all things to do with survivors
 */
var Survivor = {};

//Edit as necessary
Survivor.Pilgrim = {
    survivor_name: "The Pilgrim",
    background: "The Holy Driver, wandering an empty path on an empty plain.",

    age: "??",
    ideal_age: 24,
    age_modifier: 1,
    gender: "??",
    strength: 100,
    weight: "??",
    ideal_weight: "??",
    thirst: 2.5,
    hunger: 2,
    dehydration_tolerance: 10,
    starvation_tolerance: 12,
    dehydration: 0,
    starvation: 0,
    required_water: 0,
    required_food: 0,
    skill_modifier: 1,

    water_find: 60,
    food_find: 60,
    fuel_find: 60,
    fuel_requirements: 20,
    preferred_temperature: 21,
    preferred_environments: [],
    trait_a: {},
    trait_b: {},
    actions: [],
};

Survivor.get_empty_survivor = function () {
    //returns how much resource consumed
    function consume(s, amount, debt_property, tolerance_property, required_property) {
        if (s[debt_property] >= s[tolerance_property]) { //if they die no water consumed
            Outpost.Survivors.kill_one(s);
            return 0;
        }
        if(s[debt_property] >= amount){                 //if they have a greater debt than the water provided all water consumed
            s[debt_property] -= amount;
            return amount;
        } else {
            var remainder = s[debt_property];           //otherwise consume the debt's worth and reset the debt to 0
            s[debt_property] = 0;
            return remainder;
        }
    }

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
        required_water: 0,
        required_food: 0,
        skill_modifier: 1,

        water_find: 0,
        food_find: 0,
        fuel_find: 0,
        fuel_requirements: 0,
        preferred_temperature: 21,
        preferred_environments: [],
        trait_a: {},
        trait_b: {},
        actions: [],
        preferred: false,

        calculate_required_water: function () {
            var temperature = Environment.Current.get_temperature();
            if (temperature > this.preferred_temperature) {
                var delta_temp = temperature - this.preferred_temperature;
                var temp_mod = 1 + delta_temp / 50;
                this.required_water = this.thirst / 12 * temp_mod;
            } else {
                this.required_water = this.thirst / 12;
            }
            this.dehydration += this.required_water;
        },
        calculate_required_food: function () {
            var temperature = Environment.Current.get_temperature();
            if (temperature < this.preferred_temperature) {
                var x_component = 7 - (20 - temperature) / 5;
                var pow = Math.pow(x_component, 2);
                var temp_mod = 1 + 1 / pow;
                this.required_food = this.hunger / 12 * temp_mod;
            } else {
                this.required_food = this.hunger / 12;
            }
            this.starvation += this.required_food;
        },
        get_strength: function () {
            return (this.strength / this.starvation_tolerance) * (this.starvation_tolerance - this.starvation);
        },
        update_listener: function () {
            this.calculate_skill_modifier();
            this.calculate_required_food();
            this.calculate_required_water();
        },
        calculate_skill_modifier: function () {
            var temperature = Environment.Current.get_temperature();
            var x_component = temperature - this.preferred_temperature;
            var pow = Math.pow(x_component, 2);
            var coefficient = -0.001;
            if (temperature < this.preferred_temperature) {
                coefficient = -0.0006;
            }
            this.skill_modifier = coefficient * pow + 1;
        },
        get_fuel_skill: function () {
            return this.skill_modifier * this.fuel_find;
        },
        get_water_skill: function () {
            return this.skill_modifier * this.water_find;
        },
        get_food_skill: function () {
            return this.skill_modifier * this.food_find;
        },
        set_preferred: function (b) {
            this.preferred = b;
        },
        get_preferred: function () {
            return this.preferred;
        },
        drink: function (amount) {
            return consume(this, amount, "dehydration", "dehydration_tolerance", "required_water");
        },
        eat: function (amount) {
            return consume(this, amount, "starvation", "starvation_tolerance", "required_food");
        }
    }
};

Survivor.generate_survivor = function () {
    var new_survivor = Survivor.get_empty_survivor();
    World.Time.hour_listener.add(new_survivor);

    new_survivor.survivor_name = Survivor.GenerationFunctions.create_name(new_survivor);
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
    new_survivor.fuel_requirements = Survivor.GenerationFunctions.calculate_fuel_requirement(new_survivor);
    new_survivor.actions = Survivor.Actions.get_generic_actions(new_survivor);
    Survivor.GenerationFunctions.calculate_skills(new_survivor);

    return new_survivor;
};

Survivor.GenerationFunctions = {
    create_name: function (s) {
        var female_names = ["Alette", "Temika", "Jeri", "Melinda", "Marcia", "Corine", "Heike", "Krishna", "Letitia", "Naomi", "Yasuko", "Karie", "Grazyna", "Ethelene", "Audry", "Melda", "Katherine", "Nell"];
        var male_names = ["Hai", "Riley", "Kristoff", "Angbard", "Rob", "Alvaro", "James", "Abel", "Stephen", "Mikki", "Alexander", "Paolo", "Vladimir", "Harald", "Max", "Michael", "Emory", "Byron", "Daniel"];
        var surnames = ["Copeland", "Delgado", "Hess", "Horton", "Garrett", "Freysson", "Yang", "Blackeye", "Longscab", "Redhand", "Deepdweller", "Sungazer", "Bottomeater", "Eaton", "Koch", "Diaz", "O'connoll", "Divider"];

        //todo this should be more efficient

        var first_name = (s.gender === "Male") ? (Helper.get_random(male_names)) : (Helper.get_random(female_names));
        var surname = surnames[Helper.randomInt(surnames.length)];
        var full_name = first_name + " " + surname;
        for (var s in Outpost.Survivors.all()) {
            if (s.survivor_name === full_name) {
                return Survivor.GenerationFunctions.create_name(s);
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
        var age_tolerance = s.age_modifier * s.thirst * 2;
        var weight_tolerance = -2 * (s.ideal_weight - s.weight) / 12;
        return age_tolerance + weight_tolerance;
    },
    calculate_starvation_tolerance: function (s) {
        var age_tolerance = s.age_modifier * 4;
        var weight_tolerance = (s.ideal_weight - s.weight) / 5;
        return age_tolerance + weight_tolerance;
    },
    calculate_fuel_requirement: function (s) {
        return Math.floor(s.weight / 10);
    },
    calculate_skills: function (s) {
        var total_points = 150;
        var rand = Helper.randomInt((total_points > 100) ? 100 : total_points);
        total_points -= rand;
        s.water_find = rand;
        rand = Helper.randomInt((total_points > 100) ? 100 : total_points);
        total_points -= rand;
        s.food_find = rand;
        s.fuel_find = total_points;
    }
};

Survivor.Actions = (function () {
    function create_action(name, f, d, s) {
        var wrapped = Helper.wrap(name, f);
        wrapped.duration = d;
        wrapped.counter = 0;
        wrapped.active = false;
        wrapped.update_listener = function () {
            if (this.active) {
                this.counter += 1;
                if (this.counter === this.duration) {
                    this.counter = 0;
                    wrapped.active = false;
                    wrapped.execute();
                    UI.Dynamic.reset_actions(s);
                }
            }
        };
        wrapped.activate = function () {
            wrapped.active = true;
        };
        World.Time.hour_listener.add(wrapped);
        return wrapped;
    }

    var find_action_constructor = function (s, type) {
        return create_action("Find " + type, function () {
            Environment.gather_resources(type, s);
        }, 1, s);
    };

    return {
        get_generic_actions: function (s) {
            return [
                find_action_constructor(s, "Water"),
                find_action_constructor(s, "Food"),
                find_action_constructor(s, "Fuel")
            ];
        },
        find_and_activate: function (s, n) {
            for (var i = 0; i < s.actions.length; ++i) {
                if (s.actions[i].function_name === n) {
                    s.actions[i].activate();
                }
            }
        }
    }
}());

Survivor.Traits = (function () {
    var traits = [
        Helper.wrap("Hunter", function (s) {
            s.food_find += 20;
            if (s.food_find > 100) {
                s.food_find = 100;
            }
        }),
        Helper.wrap("Diviner", function (s) {
            s.water_find += 20;
            if (s.water_find > 100) {
                s.water_find = 100;
            }
        }),
        Helper.wrap("Fractionator", function (s) {
            s.fuel_find += 20;
            if (s.fuel_find > 100) {
                s.fuel_find = 100;
            }
        })
    ];

    return {
        get_traits: function () {
            var first = Helper.get_random(traits);
            var second = null;
            while (second !== first) {
                second = Helper.get_random(traits);
            }
            return {
                trait_a: first,
                trait_b: second
            }
        }
    };
}());