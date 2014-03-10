require.config({
    paths: {
        "jquery": "vendor/jquery-2.0.0.min",
        "lodash": "vendor/lodash",
        "walrus": "vendor/walrus",
        "walrus.strings": "vendor/walrus.strings",
        "walrus.collections": "vendor/walrus.collections",
        "walrus.inflections": "vendor/walrus.inflections"
    }
});

require(['core/set'], function(set) {
    set.init();
});
