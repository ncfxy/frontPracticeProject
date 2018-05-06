({

	baseUrl: "../lib",
    mainConfigFile: '../require-config.js',
    paths: {
        'index': '../js/index',
    },

    name: "index",
    out: "../dist/index-build.js",

    // 生成source Map
    generateSourceMaps: true,
    preserveLicenseComments: false, 
    optimize: "uglify2",
})