define(['jquery','bootstrap','purl','db', 'compareList'], function () {

	var COMPARELIST = require('compareList');
	var COMPARETABLE = {
		addPopoverForClassCanAdd: function(){
		// 为每个可以添加到analysis的表头增加popover属性
			$('.canAdd  span:nth-child(1)').each(function(){
				var text = $(this).text();
				text = text.replace('Add to Analyze', '');
				$(this).empty();
				// var tmp = $('<a href="javascript:this.focus();" data-placement="top" data-toggle="popover" title="" ></a>');
				// tmp.appendTo($(this));
				// tmp.append(text);
				var anotherChoose
				if($(this).parents('.canAdd').attr('name').startsWith('appendix')){
					anotherChoose = '<li class="divider"></li><li><a href="#" class="changeAllColumn">Edit All</a></li>'
				}else{
					anotherChoose = '';
				}
				
				var str = '<div class="dropdown">'
						+ '<a class="dropdown-toggle" data-toggle="dropdown" style="cursor: pointer">'
						+	text
						+ '</a>'
						+ 	'<ul class="dropdown-menu">'
						+      '<li><a href="#analysisContainer" class="addToAnalyze">Add to Analyze</a></li>'
						+		anotherChoose
						+    '</ul>'
						+  '</div>';
				$(this).html(str);
			});

			// 设置popover的属性
			 $('.canAdd:not([name^="appendix"]) [data-toggle="popover"]').popover({
			 	html: true,
			 	trigger: "focus",
			 	title: '',
			 	delay: {show: 0, hide: 100},
			 	content: ''
			 				+ '<ul class="list-group" style="margin-bottom:0px;">'
			 				+ '<a href="#analysisContainer" class="addToAnalyze list-group-item">Add to Analyze</a>'
			 				+ '</ul>'

			 }); 

			 // 设置popover的属性
			 $('.canAdd[name^="appendix"] [data-toggle="popover"]').popover({
			 	html: true,
			 	trigger: "focus",
			 	title: '',
			 	delay: {show: 0, hide: 100},
			 	content: ''
			 				+ '<ul class="list-group" style="margin-bottom:0px;">'
			 				+ '<a href="#analysisContainer" class="addToAnalyze list-group-item">Add to Analyze</a>'
			 				+ '<a href="#" class="list-group-item changeAllColumn">Edit All</a>'
			 				+ '</ul>',
			 }); 

			 
		},

		// 更新对比表的表头
		updateTableHead: function(){
			// 修改appendix页面的表头
			var appendix_indexes = alasql('SELECT * FROM appendix_index;');
			$('#thead-appendix').empty();
			var content = "<tr>";
			content += '<th>Number</th>';
			content += '<th>Employee Name</th>';
			for(var j = 0;j < appendix_indexes.length;j++){
				var tmp = $('<a href="javascript:this.focus();" data-toggle="popover" title="" data-content="<a href=\'#analysisContainer\'>Add to Analyze</a>"></a>');
				tmp.append(appendix_indexes[j]['index_name']);
				content += '<th  class="canAdd" name="appendix.'+appendix_indexes[j]['index_name']+'"><span>'+tmp.html()+'</span> <span><a href="#" class="glyphicon glyphicon-minus" style="color:#D9534F"></a></span></th>';
			}
			content += '<th><span><a data-toggle="modal" href="#addAppendixModal" class="glyphicon glyphicon-plus" style="color:#5CB85C"></a></span></th>';
			content += "</tr>"
			$('#thead-appendix').html(content)

			// 修改performance页面的表头
			var columns = DB.describe('performance')['columnName'];
			content = "<tr>";
			content += '<th>Number</th>';
			content += '<th>Employee Name</th>';
			for(var i = 2;i < columns.length;i++){
				content += '<th class="canAdd" name="performance.'+columns[i]+'"><span>'+columns[i]+'</span></th>';
			}
			content += "</tr>"
			$('#thead-performance').html(content);


			COMPARETABLE.addPopoverForClassCanAdd();

		},

		// 更新对比表中的内容
		updateTableData: function(panelFilter) {

			COMPARETABLE.updateTableHead();


			// read personal info
			var selectedPerson = COMPARELIST.getSelectedPersonUsingFilter(panelFilter);
			selectedPerson.sort(function(a, b){return a['number'] > b['number']});
			
			var personalInfo = '';
			var addrInfo = '';
			var familyInfo = '';
			var eduInfo = '';
			var appendixInfo = '';
			var performanceInfo = '';

			// $(personalInfoTable).empty();
			// $(tbodyAddr).empty();
			// $(tbodyFamily).empty();
			// $(tbodyEdu).empty();
			// $(tbodyAppendix).empty();
			// $(tbodyPerformance).empty();

			// 获取当前appendix表有哪些列
			var appendix_indexes = alasql('SELECT * FROM appendix_index;');

			var line = '';

			for(var i = 0;i < selectedPerson.length;i++){
				var id = selectedPerson[i]['id'];
				
				// read personal info
				// var emp = alasql('SELECT * FROM emp WHERE id=?',[parseInt(id)])[0];
				var emp = DB.selectEmpById(id)[0]
				line = '<tr>';
				line += '<td><img height=40 class="img-circle lazy" data-original="img/' + (emp.id>40?40:emp.id) + '.jpg"></td>';
				line += '<td><a href="emp.html?id=' + emp.id + '">' + emp.number + '</a></td>';
				line += '<td>' + emp.name + '</td>';
				line += '<td>' + DB.choice(emp.sex) + '</td>';
				line += '<td>' + emp.birthday + '</td>';
				line += '<td>' + emp.tel + '</td>';
				line += '<td>' + emp.ctct_name + '</td>';
				line += '<td>' + emp.ctct_addr + '</td>';
				line += '<td>' + emp.ctct_tel + '</td>';
				line += '<td>' + emp.pspt_no + '</td>';
				line += '<td>' + emp.pspt_date + '</td>';
				line += '<td>' + emp.pspt_name + '</td>';
				line += '<td>' + DB.choice(emp.rental) + '</td>';
				line += '</tr>';
				personalInfo += line;
				line = '';


				// read address info
				// var addrs = alasql('SELECT * FROM addr WHERE emp=?', [ parseInt(id) ]);
				var addrs = DB.selectTableByEmpId('addr', id);
				
				if(addrs.length == 0){
					line = '<tr>';
					line += '<td><a href="emp.html?id=' + emp.id + '">' + emp.number + '</a></td>';
					line += '<td>' + emp.name + '</td>';
					line += '<td></td>';
					line += '<td></td>';
					line += '<td></td>';
					line += '<td></td>';
					line += '<td></td>';
					line += '<td></td>';
					line += '</tr>';
				}
				for(var j = 0;j < addrs.length;j++){
					var addr = addrs[j];
					if(!panelFilter(emp, "addr", addr)){continue;}
					line = '<tr>';
					line += '<td><a href="emp.html?id=' + emp.id + '">' + emp.number + '</a></td>';
					line += '<td>' + emp.name + '</td>';
					line += '<td>' + addr.zip + '</td>';
					line += '<td>' + addr.state + '</td>';
					line += '<td>' + addr.city + '</td>';
					line += '<td>' + addr.street + '</td>';
					line += '<td>' + addr.bldg + '</td>';
					line += '<td>' + DB.choice(addr.house) + '</td>';
					line += '</tr>'
				}
				addrInfo += line;
				line = '';


				// read family info
				// var families = alasql('SELECT * FROM family WHERE emp=?', [ parseInt(id) ]);
				var families = DB.selectTableByEmpId('family', id);
				if(families.length == 0){
					line = '<tr>';
					line += '<td><a href="emp.html?id=' + emp.id + '">' + emp.number + '</a></td>';
					line += '<td>' + emp.name + '</td>';
					line += '<td>0</td>';
					line += '<td></td>';
					line += '<td></td>';
					line += '<td></td>';
					line += '<td></td>';
					line += '<td></td>';
					line += '<td></td>';
					line += '</tr>'
				}
				for(var j = 0;j < families.length;j++){
					var family = families[j];
					if(!panelFilter(emp, "family", family)){continue;}
					line = '<tr>';
					line += '<td><a href="emp.html?id=' + emp.id + '">' + emp.number + '</a></td>';
					line += '<td>' + emp.name + '</td>';
					line += '<td>' + families.length + '</td>';
					line += '<td>' + family.name + '</td>';
					line += '<td>' + DB.choice(family.sex) + '</td>';
					line += '<td>' + family.birthday + '</td>';
					line += '<td>' + family.relation + '</td>';
					line += '<td>' + DB.choice(family.cohabit) + '</td>';
					line += '<td>' + DB.choice(family.care) + '</td>';
					line += '</tr>';
				}
				familyInfo += line;
				line = '';

				// read academic history
				// var edus = alasql('SELECT * FROM edu WHERE emp=?', [ parseInt(id)]);
				var edus = DB.selectTableByEmpId('edu', id);
				if(edus.length == 0){
					line = '<tr>';
					line += '<td><a href="emp.html?id=' + emp.id + '">' + emp.number + '</a></td>';
					line += '<td>' + emp.name + '</td>';
					line += '<td></td>';
					line += '<td></td>';
					line += '<td></td>';
					line += '</tr>';
				}
				for(var j = 0;j < edus.length;j++){
					var edu = edus[j];
					if(!panelFilter(emp, "edu", edu)){continue;}
					line = '<tr>';
					line += '<td><a href="emp.html?id=' + emp.id + '">' + emp.number + '</a></td>';
					line += '<td>' + emp.name + '</td>';
					line += '<td>' + edu.school + '</td>';
					line += '<td>' + edu.major + '</td>';
					line += '<td>' + edu.grad + '</td>';
					line += '</tr>';
				}
				eduInfo += line;
				line = '';

				// 向appendix表中添加数据
				line = '<tr>';
				line += '<td><a href="emp.html?id=' + emp.id + '">' + emp.number + '</a></td>';
				line += '<td>' + emp.name + '</td>';
				for(var j = 0;j < appendix_indexes.length;j++){
					var appendix_values = alasql('SELECT * FROM appendix_appendix WHERE emp=? and appendix_id=?', [emp.id, appendix_indexes[j]['id']]);
					if(appendix_values.length){
						line += '<td class="editable">'+appendix_values[0]['appendix_value']+'</td>';
					}else{
						line += '<td class="editable"></td>';
					}
				}
				line += '</tr>';
				appendixInfo += line;
				line = '';

				// 向performance表中添加数据
				// var performances = alasql('SELECT * FROM performance WHERE emp=?', [ parseInt(id) ]);
				var performances = DB.selectTableByEmpId('performance', id);
				var columns = DB.describe('performance')['columnName'];
				if(performances.length == 0){
					line = '<tr>';
					line += '<td><a href="emp.html?id=' + emp.id + '">' + emp.number + '</a></td>';
					line += '<td>' + emp.name + '</td>';
					for(var j = 2; j < columns.length;j++){
						line += '<td></td>';
					}
					line += '</tr>';
				}
				for(var j = 0;j < performances.length;j++){
					var performance = performances[j];
					if(!panelFilter(emp, "performance", performance)){continue;}
					line = '<tr>';
					line += '<td><a href="emp.html?id=' + emp.id + '">' + emp.number + '</a></td>';
					line += '<td>' + emp.name + '</td>';
					for(var k = 2;k < columns.length;k++){
						line += '<td>' + performance[columns[k]] + '</td>';
					}
					line += '</tr>';
				}
				performanceInfo += line;
				line = '';
			}
			$('#personalInfoTable tbody').html(personalInfo);
			$('#tbody-addr').html(addrInfo);
			$('#tbody-family').html(familyInfo);
			$('#tbody-edu').html(eduInfo);
			$('#tbody-appendix').html(appendixInfo);
			$('#tbody-performance').html(performanceInfo);
		},
		// 传入刷新界面的函数
		eventRegister : function eventRegister(refreshAll){
			// 触发添加功能
			$('.table').on('click','.canAdd a.addToAnalyze',function(){
				var analysisList = JSON.parse(localStorage.getItem('analysisList'));
				var analysisInfo = {};
				analysisInfo['name'] = $(this).parents('th.canAdd').attr('name');
				analysisInfo['displayText'] = $(this).parents('th.canAdd').children('span:nth-child(1)').children('div.dropdown').children('a').text();
				analysisInfo['transform'] = 1;
				analysisInfo['state'] = 'table';
				analysisInfo['filter'] = '';
				analysisList.push(analysisInfo);
				localStorage.setItem('analysisList',JSON.stringify(analysisList));


				// 动画效果的添加
				var template = $($('#analysisModelTemplate').html());
				template.appendTo($('#analysisDivPanel'));
				template.hide();
				template.show("slow",function() {
					refreshAll();
					// ANALYSIS.updateAnalysisPanel();
				})
			});

			// 删除用户新加的列
			$('#thead-appendix').on('click', '.glyphicon-minus', function(){
				var name = $(this).parents('.canAdd').children('span:nth-child(1)').children('div.dropdown').children('a').text();
				var result = confirm("Are you sure to delete Column '"+name+"' permanent?");
				if(result){
					var appendixId = alasql("SELECT * FROM appendix_index WHERE index_name='"+name+"'")[0]['id'];
					alasql("DELETE FROM appendix_index WHERE index_name='" + name + "'");
					alasql('DELETE FROM appendix_appendix WHERE appendix_id = ' + appendixId);
					refreshAll();
				}
			});

			// Edit all 按钮事件
			$('#thead-appendix').on('click', '.changeAllColumn', function(){
				var newValue = $('#changeValuesInput').val();
				var line = $(this).parents('tr').find('th');
				var th = $(this).parents('th');
				var index = $(line).index($(th));
				localStorage.setItem('changeAllColumnIndex', index);
				$('#changeAllColumnValueModal').modal("show");
			});



			// 添加appendix Index支持用Enter确定输入
			$('#addAppendixModal').on('keypress', "#appendixNameInput", function(e){
				console.log(e.key);
				if(e.key == 'Enter'){
					$('#addAppendixModal #addAppendixSubmit').trigger("click");
				}
			});
			// 通过modal添加新的appendix_index
			$("#addAppendixModal").on('click','#addAppendixSubmit',function(){
				var newAppendix = $('#appendixNameInput').val().trim();
				if(newAppendix == null || newAppendix == ''){
					alert("Please Input right Name");
					return;
				}
				var records = alasql("SELECT * FROM appendix_index WHERE index_name='"+newAppendix+"'");
				if(records.length){
					alert("This idex name has been used");
					return;
				}

				var newId = DB.generateId('appendix_index');
				alasql('INSERT INTO appendix_index VALUES(?, ?);', [newId, newAppendix]);
				DB.loadAppendix();
				$('#addAppendixModal').modal('hide');
				refreshAll();

			});

			// 支持用Enter确定输入
			$('#changeAllColumnValueModal').on('keypress', "#changeValuesInput", function(e){
				console.log(e.key);
				if(e.key == 'Enter'){
					$('#changeAllColumnValueModal #changeValuesSubmit').trigger("click");
				}
			});
			// 更改当前的所有记录
			$('#changeAllColumnValueModal').on('click','#changeValuesSubmit', function(){
				var newValue = $('#changeValuesInput').val();
				var index = localStorage.getItem('changeAllColumnIndex');
				var trs = $('#tbody-appendix tr');
				for(var i = 0;i < trs.length;i++){
					var td = $(trs[i]).find('td').eq(index);
					td.text(newValue);
					var indexName = $('#thead-appendix').find('th').eq(index).find('span').eq(0).children('div.dropdown').children('a').text();
				 	var appendixId = alasql("SELECT * FROM appendix_index WHERE index_name='"+indexName+"'")[0]['id'];

				 	var hrefStr = td.parent().find('td').eq(0).find('a').attr('href');
				 	var empId = parseInt(hrefStr.split('=')[1]);
				 	insertByAppendixAndEmp(appendixId, empId, newValue);
				}
				$('#changeAllColumnValueModal').modal('hide');
				refreshAll();
			});

			// 双击支持编辑表格内容
			$('#tbody-appendix').on('dblclick','td.editable', function(){
				var td = $(this);
				var txt = td.text();
				var input = $('<input type="text" class="form-control" value="' + txt + '"/>');
				td.html(input);
				input.click(function(){return false;});
				// 获取焦点
				input.trigger("focus");
				// 失去焦点后提交内容，重新变为文本
				input.blur(function(){
					var newTxt = $(this).val();
					// 判断是否有修改
					if(newTxt != txt){
						td.html(newTxt);
						var hrefStr = td.parent().find('td').eq(0).find('a').attr('href');
						var empId = parseInt(hrefStr.split('=')[1]);

						var line = td.parents('tr');
						var index = line.find('td').index(td);
						var indexName = $('#thead-appendix').find('th').eq(index).find('span').eq(0).children('div.dropdown').children('a').text();
				 		var appendixId = alasql("SELECT * FROM appendix_index WHERE index_name='"+indexName+"'")[0]['id'];
				 		insertByAppendixAndEmp(appendixId, empId, newTxt);
				 		refreshAll();
					}else{
						td.html(newTxt);
					}
				});
				input.keypress(function(e){
					if(e.key == 'Enter'){
						$(this).trigger("blur");
					}
				});

			});

			function insertByAppendixAndEmp(appendixId, empId, newValue){
				var records = alasql("SELECT * FROM appendix_appendix WHERE appendix_id=" + appendixId + " and emp=" + empId);
			 	if(records.length){
			 		alasql("UPDATE appendix_appendix SET appendix_value='"+newValue+"' WHERE appendix_id=" + appendixId + " and emp=" + empId);
			 	}else{
			 		var newId = DB.generateId('appendix_appendix');
			 		alasql('INSERT INTO appendix_appendix VALUES(?, ?, ?, ?);', [newId, empId, appendixId, newValue]);
			 	}
			 	DB.loadAppendix();
			}


		}

	};

	return COMPARETABLE;

})
