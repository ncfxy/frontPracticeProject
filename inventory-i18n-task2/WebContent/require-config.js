require.config({
	baseUrl : 'lib',
	paths:{
		app: '..',
		jquery: 'jquery',
		bootstrap:'bootstrap',
		alasql: 'alasql',
		purl: 'purl',
		chart: 'Chart',
		lazyload: 'jquery.lazyload',
		db: '../js/db',
		common: '../js/common',
		index: '../js/index',
		compare: '../js/compare',
		analysis: '../js/analysis',
		compareList: '../js/compareList',
		compareTable: '../js/compareTable',
		jqueryui: 'jquery-ui',
	},
	shim:{
		'bootstrap':{
			deps:['jquery'],
			exports:'bootstrap'
		},
		'purl':{
			deps:['jquery'],
			exports:'purl'
		},
		'lazyload':{
			deps:['jquery'],
			exports:'lazyload'
		}
	}
});

