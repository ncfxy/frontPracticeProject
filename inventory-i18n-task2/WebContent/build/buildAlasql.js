({

	baseUrl: "../lib",
    mainConfigFile: '../require-config.js',
    paths: {
        'alasql': '../lib/alasql',
    },

    name: "alasql",
    out: "../dist/alasql-build.js",

    // 生成source Map
    // generateSourceMaps: true,
    // preserveLicenseComments: false, 
    // optimize: "uglify2",
})