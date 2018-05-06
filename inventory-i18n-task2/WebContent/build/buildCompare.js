({

	baseUrl: "../lib",
    mainConfigFile: '../require-config.js',
    paths: {
        'compare': '../js/compare',
    },

    name: "compare",
    out: "../dist/compare-build.js",

    // 生成source Map
    generateSourceMaps: true,
    preserveLicenseComments: false, 
    optimize: "uglify2",
})