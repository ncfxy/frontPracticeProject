"use strict";

require(['../require-config','common', 'compareList', 'lazyload'],function(){
	require(['common', 'compareList', 'lazyload'],function(){
		var COMPARELIST = require('compareList');
		$(function(){
			new Index(COMPARELIST).begin();
		});

	});
});

function Index(COMPARELIST){

	this.begin = function begin(){
		// includeFiles();
		initData();
		COMPARELIST.justifyCompareList();
		eventRegister();
		$('img.lazy').lazyload();
	}

	function initData(){

		// parse request params
		var q1 = $.url().param('q1');
		$('input[name="q1"]').val(q1);
		var q2 = $.url().param('q2');
		$('input[name="q2"]').val(q2);
		var q3 = $.url().param('q3');
		$('input[name="q3"]').val(q3);

		// read data from database
		var emps;
		if(q3){
			var indexName = q3.split('=')[0];
			var value = q3.split('=')[1];
			if(indexName == 'number'){
				emps = alasql('SELECT * FROM emp WHERE number LIKE ?', [ '%' + value + '%' ]);
			}else if(indexName == 'name'){
				emps = alasql('SELECT * FROM emp WHERE name LIKE ?', [ '%' + value + '%' ]);
			}else{
				var appendixId = alasql("SELECT * FROM appendix_index WHERE index_name='"+indexName+"'")[0]['id'];
				emps = alasql('SELECT emp.id,emp.number,emp.name,emp.sex,emp.birthday,emp.tel FROM emp INNER JOIN appendix_appendix on emp.id = appendix_appendix.emp WHERE  appendix_appendix.appendix_id=' + appendixId + " and appendix_appendix.appendix_value='" + value +"'");
			}
		} else if (q1) {
			emps = alasql('SELECT * FROM emp WHERE number LIKE ?', [ '%' + q1 + '%' ]);
		} else if (q2) {
			emps = alasql('SELECT * FROM emp WHERE name LIKE ?', [ '%' + q2 + '%' ]);
		} else {
			emps = alasql('SELECT * FROM emp', []);
		}

		// create employee list
		var tbody = $('#tbody-emps');
		for (var i = 0; i < emps.length; i++) {
			var emp = emps[i];
			var tr = $('<tr></tr>');
			tr.append('<td><input type="checkbox" class="choosePerson"></td>');
			tr.append('<td><img height=40 class="img-circle lazy" data-original="img/' + (emp.id>40?40:emp.id) + '.jpg"></td>');
			tr.append('<td><a href="emp.html?id=' + emp.id + '">' + emp.number + '</a></td>');
			tr.append('<td>' + emp.name + '</td>');
			tr.append('<td>' + DB.choice(emp.sex) + '</td>');
			tr.append('<td>' + emp.birthday + '</td>');
			tr.append('<td>' + emp.tel + '</td>');
			tr.append('<td><button type="button" class="btn btn-primary btn-sm addPerson"><span class="glyphicon glyphicon-plus"></span> Add To Compare</button></td>');
			tr.appendTo(tbody);
		}
	}

	// 对该页面下的事件进行注册
	function eventRegister() {
		$("li").on("click","#deleteAll",function() {
			localStorage.setItem('selectedPerson','[]');
			COMPARELIST.refreshCompareList();
		});

		// 同时添加多个Person
		$("li").on("click","#addAllSelected",function() {
			var selectedPerson = COMPARELIST.getSelectedPerson();

			// 获取已经添加到表格中的id
			var hasIds = [];
			for(var i = 0;i < selectedPerson.length;i++){
				hasIds.push(selectedPerson[i]['id']);
			}

			var warningList = [];
			$('.choosePerson').each(function(){
				var numberTd = $(this).parent().next().next();
				var nameTd = $(this).parent().next().next().next();
				var hrefStr = numberTd.find('a').attr('href');
				var id = hrefStr.split('=')[1];

				if($(this).prop( "checked" ) && hasIds.indexOf(id) == -1){

					// 添加到localStorage
					var person = {};
					person['id'] = id;
					person['number'] = numberTd.text();
					person['name'] = nameTd.text();
					selectedPerson.push(person);
				}else if($(this).prop( "checked" ) && hasIds.indexOf(id) != -1){
					warningList.push(numberTd.text());
				}
			});
			if(warningList.length > 0){
				showWarning('Person: ' + warningList.join(",")+' have been added to the compare list.')
			}
			localStorage.setItem('selectedPerson',JSON.stringify(selectedPerson));
			COMPARELIST.refreshCompareList();
		});

		// 从列表中删除单个Person
		$('tbody').on("click","tr td .removeFromList",function() {
			var hrefStr = $(this).parent().next().find('a').attr('href');
			var id = hrefStr.split('=')[1];
			// 获取localStorage
			var selectedPerson = COMPARELIST.getSelectedPerson();

			var newSelectedPerson = [];
			for(var i = 0;i < selectedPerson.length;i++){
				if(selectedPerson[i]['id'] != id){
					newSelectedPerson.push(selectedPerson[i]);
				}
			}
			localStorage.setItem('selectedPerson',JSON.stringify(newSelectedPerson));
			COMPARELIST.refreshCompareList();
		});

		// 添加单个person
		$("#listTable").on('click','.addPerson',function(event){
			var selectedPerson = COMPARELIST.getSelectedPerson();

			// 获取已经添加到表格中的id
			var hasIds = [];
			for(var i = 0;i < selectedPerson.length;i++){
				hasIds.push(selectedPerson[i]['id']);
			}

			var numberTd = $(this).parent().prev().prev().prev().prev().prev();
			var nameTd = $(this).parent().prev().prev().prev().prev();
			var hrefStr = numberTd.find('a').attr('href');
			var id = hrefStr.split('=')[1];

			if(hasIds.indexOf(id) == -1){

				// 添加到localStorage
				var person = {};
				person['id'] = id;
				person['number'] = numberTd.text();
				person['name'] = nameTd.text();
				selectedPerson.push(person);
				localStorage.setItem('selectedPerson',JSON.stringify(selectedPerson));
			}else{
				showWarning("This person has been added to the compare list.")
			}
			COMPARELIST.refreshCompareList();
			return false;
		});
		
		// 全选或者非全选所有选项
		$('#listTable').on('change','#chooseAll',function(){
			var setValue = false;
			if($(this).prop("checked")){
				setValue = true;
			}
			$('.choosePerson').each(function(){
				$(this).prop( "checked", setValue );
				$(this).trigger("change");
			});
			return false;
		});

		// 选中某一行时进行高亮
		$('#listTable').on('change','.choosePerson',function(){
			if($(this).prop("checked")){
				$(this).parent().parent().css('background-color', "yellow");
			}else{
				$(this).parent().parent().css("background-color", "");
			}
			return false;
		});

		$('#listTable').on('click', 'tr', function(event){
			var tmp = $(this).find(".choosePerson, #chooseAll");
			// 防止重复点击
			if($(event.target).is('input')){
				tmp.trigger("change");
				return;
			}
			
			if(tmp.prop("checked")){
				tmp.prop("checked", false);
			}else{
				tmp.prop("checked", true);
			}
			tmp.trigger("change");
		});
		
		require(['jqueryui'],function(){
			$("#compareList").draggable();
		});
	}
}