require.config({
    shim: {
        "walrus": {
            exports: "Walrus"
        },
        "walrus.strings": {
            deps: ["walrus"]
        },
        "walrus.collections": {
            deps: ["walrus"]
        },
        "walrus.inflections": {
            deps: ["walrus"]
        }
    },
    paths: {
        "jquery": "vendor/jquery-2.1.0",
        "lodash": "vendor/lodash",
        "walrus": "vendor/walrus",
        "walrus.strings": "vendor/walrus.strings",
        "walrus.collections": "vendor/walrus.collections",
        "walrus.inflections": "vendor/walrus.inflections"
    }
});

require(['./set'], function(set) {
    set.init();
});
