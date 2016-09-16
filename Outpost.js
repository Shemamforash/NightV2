/**
 * Created by samwe on 03/09/2016.
 */
/*
 contains current information related to colony
 - resources left
 - number of survivors
 - buildings in the camp
 - difficulty
 */

var Outpost = {};

Outpost.Survivors = (function () {
    var alive = [], dead = [], all = [];

    return {
        add: function () {
            var new_survivor = Survivor.generate_survivor();
            alive.push(new_survivor);
            all.push(new_survivor);
            UI.Dynamic.add(new_survivor);
        },
        kill_one: function (s) {
            dead.push(s);
            Helper.array_remove(alive, s);
            World.Time.hour_listener.remove(s);
            UI.Dynamic.remove(s);
        },
        all: function () {
            return all;
        },
        alive: function () {
            return alive;
        },
        find: function (n) {
            for (var i = 0; i < alive.length; ++i) {
                if (alive[i].survivor_name === n) {
                    return alive[i];
                }
            }
        }
    };
}());

Outpost.Resources = Helper.get_new_resources();
Outpost.Resources.group_fuel = (function () {
    var fuel_requirement = 0;
    return {
        calculate: function (s) {
            if (s.get_preferred()) {
                fuel_requirement += s.fuel_requirements;
            } else {
                fuel_requirement -= s.fuel_requirements;
            }
            if (fuel_requirement < 0) {
                fuel_requirement = 0;
            }
        },
        get: function () {
            return fuel_requirement;
        }
    }
}());
Outpost.Resources.Consumer = {
    sort: function (arr, property) {
        var j, t;
        for (var i = 0; i < arr.length; ++i) {
            j = i;
            while (j > 0 && arr[j - 1][property] > arr[j][property]) {
                t = arr[j];
                arr[j] = arr[j - 1];
                arr[j - 1] = t;
                j = j - 1;
            }
        }
    },
    consume_resource: function (property) {
        var consumed = 1;
        var preferred_survivors = [];
        var alive = Outpost.Survivors.alive();
        var amount, remaining;

        for (var i = 0; i < alive.length; ++i) {
            if (alive[i].preferred === true) {
                preferred_survivors.push(alive[i]);
            }
        }

        while (consumed !== 0 && preferred_survivors.length !== 0) {
            Outpost.Resources.Consumer.sort(preferred_survivors, property);
            for (i = 0; i < preferred_survivors.length; ++i) {
                if (property === "dehydration") {
                    remaining = Outpost.Resources.water.remaining();
                    amount = (remaining > 0.1) ? 0.1 : remaining;
                    if (remaining === 0) {
                        consumed = 0;
                        break;
                    }
                    consumed = preferred_survivors[i].drink(amount);
                    Outpost.Resources.water.remove(consumed);
                } else {
                    remaining = Outpost.Resources.food.remaining();
                    if (remaining === 0) {
                        consumed = 0;
                        break;
                    }
                    amount = (remaining > 0.1) ? 0.1 : remaining;
                    consumed = preferred_survivors[i].eat(amount);
                    Outpost.Resources.food.remove(consumed);
                }
            }
        }
    },
    update_listener: function () {
        Outpost.Resources.Consumer.consume_resource("dehydration");
        Outpost.Resources.Consumer.consume_resource("starvation");
    }
};


Outpost.Status = (function () {
    var difficulty = 0;
    var trip = 0;

    function increase_difficulty() {
        if (trip === 3) {
            difficulty = 0.1;
        } else if (trip === 4) {
            difficulty = 0.5;
        } else {
            difficulty += 0.1;
        }
    }

    return {
        make_trip: function () {
            trip += 1;
            increase_difficulty();
            Environment.Current.change_environment(difficulty);
        }
    }
}());

Outpost.Miasma = (function () {
    var distance = 1000;
    var danger = 0; //todo something with this danger

    function calculate_danger() {
        danger = Math.floor(distance / 100) / 10;
    }

    return {
        change_day: function () {
            distance -= 90 + Helper.randomInt(20);
            if (distance < 0) {
                distance = 0;
            }
            calculate_danger();
        },
        make_trip: function () {
            distance += 400;
            var fuel_left = Outpost.Resources.fuel.remaining();
            var extra_distance = Math.floor(fuel_left * 10);
            distance += extra_distance;
            Outpost.Resources.fuel.remove(fuel_left);
            calculate_danger();
        },
        distance: function () {
            return distance;
        }
    };
}());