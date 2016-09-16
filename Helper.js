/**
 * Created by samwe on 05/09/2016.
 */
/**
 * Created by samwe on 24/08/2016.
 */
var Helper = {};

Helper.randomInt = function (i) {
    return Math.floor(Math.random() * i);
};

Helper.array_remove = function (arr, element) {
    arr.splice(arr.indexOf(element), 1);
};

Helper.wrap = function (n, f) {
    return {
        function_name: n,
        execute: f
    }
};

Helper.to_sf = function (n, p) {
    return Math.floor(n * Math.pow(10, p));
};

Helper.shuffle = function (a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
};

Helper.get_random = function (arr) {
    return arr[Helper.randomInt(arr.length)];
};

Helper.get_new_resources = function () {
    function Resource(n) {
        this.resource_name = n;
        this.quantity = 0;
    }

    Resource.prototype = {
        add: function (q) {
            this.quantity += q;
        },
        remove: function (q) {
            this.quantity = (q >= this.quantity) ? 0 : this.quantity - q;
        },
        remaining: function () {
            return this.quantity;
        }
    };

    function generate_new() {
        return {
            water: new Resource("Water"),
            fuel: new Resource("Fuel"),
            food: new Resource("Food")
        };
    }

    return generate_new();
};

Helper.to_kcal = function (amnt) {
    return Helper.to_sf(amnt, 3) + " kcal";
};

Helper.to_ml = function (amnt) {
    if (amnt < 1) {
        return Helper.to_sf(amnt, 3) + " ml";
    }
    return Helper.to_sf(amnt, 3) / 1000 + " l";
};

Helper.Listener_Builder = (function () {
    function Listener() {
        this.listeners = [];
    };

    Listener.prototype.add = function (new_listener) {
        this.listeners.push(new_listener);
    };

    Listener.prototype.remove = function (listener) {
        Helper.array_remove(this.listeners, listener);
    };

    Listener.prototype.update = function () {
        for (var i = 0; i < this.listeners.length; ++i) {
            // console.log(this.listeners[i]);
            this.listeners[i].update_listener();
        }
    };

    return function () {
        return new Listener();
    }
}());


