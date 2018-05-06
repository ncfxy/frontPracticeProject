"use strict";

require(['../require-config','common', 'compareList','analysis', 'compareTable','lazyload'],function(){
	require(['common', 'compareList','analysis', 'compareTable','lazyload'],function(){
		var COMPARELIST = require('compareList');
		var ANALYSIS = require('analysis');
		var COMPARETABLE = require('compareTable');
		$(function() {
			new Compare(COMPARELIST, ANALYSIS, COMPARETABLE).init();
		});
	});
});

function Compare(COMPARELIST, ANALYSIS, COMPARETABLE){

	this.init = function init() {
		
		// includeFiles();
		if(localStorage.getItem('analysisList') == null || localStorage.getItem('analysisList') == ''){
			localStorage.setItem('analysisList','[]');
		}
		var backupPool = [];
		localStorage.setItem('backupPool',JSON.stringify(backupPool));


		COMPARELIST.justifyCompareList();
		refreshAll();

		eventRegister();
		$('img.lazy').lazyload({'container': '.tab-pane'});
		
	};

	// 对页面中所有组件进行对应的刷新
	function refreshAll(){
		COMPARELIST.refreshCompareListUsingFilter(ANALYSIS.panelFilter);
		COMPARETABLE.updateTableData(ANALYSIS.panelFilter);
		ANALYSIS.updateAnalysisPanel();
	}

	function eventRegister(argument) {

		ANALYSIS.eventRegister(refreshAll);
		COMPARETABLE.eventRegister(refreshAll);

		// 从列表中删除单个Person
		$('tbody').on("click","tr td .removeFromList",function() {
			var hrefStr = $(this).parent().next().find('a').attr('href');
			var id = hrefStr.split('=')[1];
			// 获取localStorage
			var selectedPerson = COMPARELIST.getSelectedPerson();
			var tmp = localStorage.getItem('backupPool');
			var backupPool = JSON.parse(tmp);

			var newSelectedPerson = [];
			for(var i = 0;i < selectedPerson.length;i++){
				if(selectedPerson[i]['id'] != id){
					newSelectedPerson.push(selectedPerson[i]);
				}else{
					backupPool.push(selectedPerson[i]);
				}
			}
			localStorage.setItem('selectedPerson',JSON.stringify(newSelectedPerson));
			localStorage.setItem('backupPool',JSON.stringify(backupPool));
			refreshAll();
		});

		// 撤销删除操作
		$(document).on('click','#backupDelete',function(){
			var tmp = localStorage.getItem('backupPool');
			if(tmp == '[]'){
				showWarning('No Data can backup');
				return;
			}
			var backupPool = JSON.parse(tmp);
			var lastPerson = backupPool.pop();

			var selectedPerson = COMPARELIST.getSelectedPerson();
			selectedPerson.push(lastPerson);

			localStorage.setItem('selectedPerson',JSON.stringify(selectedPerson));
			localStorage.setItem('backupPool',JSON.stringify(backupPool));
			refreshAll();
		});

		require(['jqueryui'],function(){
			$("#compareList").draggable();
		});

	}
}