({

	baseUrl: ".",
    mainConfigFile: './require-config.js',
    paths: {
        'all-controller': 'all-controller',
    },

    name: "all-controller",
    out: "./controller-build.js",
    optimize: "uglify",
})