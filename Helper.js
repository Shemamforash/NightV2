/**
 * Created by samwe on 05/09/2016.
 */
/**
 * Created by samwe on 24/08/2016.
 */
var helper = {};

helper.randomInt = function(i) {
    return Math.floor(Math.random() * i);
};

helper.create_function_wrapper = function(n, f){
    return {
        function_name: n,
        execute: f
    }
};

helper.shuffle = function(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
};

helper.get_random = function(arr) {
    return arr[helper.randomInt(arr.length)];
};

helper.resource_creator = function(name) {
    return {
        resource_name: name,
        remaining: 0,
        get_remaining : function() {
            return this.remaining;
        },
        increase : function(amnt) {
            this.remaining += amnt;
        },
        decrease : function(amnt) {
            this.remaining -= (amnt > this.remaining) ? this.remaining : amnt;
        }
    };
};