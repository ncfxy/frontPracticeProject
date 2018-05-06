"use strict";


define(['jquery','bootstrap','purl','db', 'compareList', 'compareTable'], function () {

	var COMPARELIST = require('compareList');
	var COMPARETABLE = require('compareTable');

	var ANALYSIS = {

		// 删除所有已有的model
		clearExistingModel : function(){
			$('#analysisDivPanel div.analysisModel:visible').remove();
		},

		// 读取和初始化模板
		readAndInitTemplate : function(analysisItem){
			var template = $($('#analysisModelTemplate').html());
			template.attr("name",analysisItem['name']);
			template.find('.panel-heading .modelTitle').text(analysisItem['displayText']+(analysisItem['filter'] == ''?'':'(filtered)'));
			var state = analysisItem['state'];
			template.find('.panel-body table').css('display',"none");
			template.find('.panel-body .myCanvasBar').css('display',"none");
			template.find('.panel-body .myCanvasLine').css('display',"none");
			template.find('.panel-body .myCanvasPie').css('display',"none");
			if(state == 'chartPie'){
				template.find('.panel-body .myCanvasPie').css('display',"block");
			}else if(state == 'chartBar'){
				template.find('.panel-body .myCanvasBar').css('display',"block");
			}else if(state == 'chartLine'){
				template.find('.panel-body .myCanvasLine').css('display',"block");
			}else{
				template.find('.panel-body table').css('display',"table");
			}
			var changeTransform = 
			'<form>'
			+'<div class="form-group">'
  			+'<label>Transform Method:</label>'
			  +'<select class="form-control changeTransformSelect">'
			    +'<option value="1">original value</option>'
			    //+'<option value="2">remove blank</option>'
			    //+'<option value="3">trim</option>'
			    +'<option value="4">firstn</option>'
			    +'<option value="5">lastn</option>'
			  +'</select>'
			+'</div>'
			+'<div class="form-group" ' +(analysisItem['transform']<=3?'style="display:none"':'')+'>'
			+'<input type="text" class="form-control changeTransformInput" value="'+analysisItem['transform-length']+'"">'
			+'</div>'
			+'<div class="form-group" style="text-align:center;">'
			+'<button type="button" class="btn btn-success changeTransformSubmit">Submit</button>'
			+'<button type="button" class="btn btn-danger changeTransformCancel">Cancel</button>'
			+'</div>'
			+'</form>';
			changeTransform = $(changeTransform);
			$(changeTransform).find('select').find('[value='+analysisItem['transform']+']').attr('selected', 'selected');
			changeTransform = changeTransform.html();
			// template.find('.panel-heading .modelTitle').parent().popover({
			// 	html: true,
			// 	trigger: "click",
			// 	content: changeTransform
			// }); 
			return template;
		},

		panelFilter : function panelFilter(selectedPerson, tableName, record){

			var id = selectedPerson['id'];
			var analysisList = JSON.parse(localStorage.getItem('analysisList'));
			var result = true;
			for(var i = 0;i < analysisList.length;i++){
				if(analysisList[i]['filter'] == '')continue;
				var choice = false;		// 在数据库中是否是使用choice的方式保存
				var table = '';
				var value = '';
				var sp = analysisList[i]['name'].split(".");
				choice = sp[0] == 'choice';
				table = sp[choice ? 1 : 0];
				value = sp[choice ? 2 : 1];


				var sql = '';
				var sqlResult;
				switch(table){
					case 'emp':
						// sql = 'SELECT id,'+ value +' FROM emp WHERE id = ' + id;
						// sqlResult = alasql(sql);
						sqlResult = DB.selectEmpById(id);
						break;
					case 'addr':
						// sql = 'SELECT id,'+value+' FROM addr  WHERE emp = ' + id;
						// sqlResult = alasql(sql);
						sqlResult = DB.selectTableByEmpId('addr', id);
						break;
					case 'family':
						// sql = 'SELECT id,'+value+' FROM family WHERE emp = ' + id;
						// sqlResult = alasql(sql);
						sqlResult = DB.selectTableByEmpId('family', id);
						break;
					case 'edu':
						// sql = 'SELECT id,'+value+' FROM edu WHERE emp = ' + id;
						// sqlResult = alasql(sql);
						sqlResult = DB.selectTableByEmpId('edu', id);
						break;
					case 'performance':
						// sql = 'SELECT id,' + value + ' FROM performance WHERE emp = ' + id;
						// sqlResult = alasql(sql);
						sqlResult = DB.selectTableByEmpId('performance', id);
						break;

					case 'appendix':
						var appendixId = alasql("SELECT * FROM appendix_index WHERE index_name='"+value+"'")[0]['id'];
						sql = 'SELECT * FROM appendix_appendix WHERE emp = ' + id + ' and appendix_id = ' + appendixId;
						sqlResult = alasql(sql);
						break;
				}

				//如果是对记录进行验证时使用
				var recordBool = true;
				// 只要该用户存在任一记录则保留该用户
				var tmpbool = false;
				for(var x = 0; x < sqlResult.length;x++){
					var testValue = table == 'appendix'?sqlResult[x]['appendix_value']:sqlResult[x][value];
					if(choice){
						testValue = DB.choice(testValue);
					}
					var transformedValue = ANALYSIS.dealTransform(testValue,analysisList[i]['transform'], analysisList[i]['transform-length']);
					var comparedValue = analysisList[i]['filter'] == '(blank)' ? '': analysisList[i]['filter'];
					function compareHere(a,b){
						var compareType = analysisList[i]['filterType'];
						switch(compareType){
							case "1":
								return a == b;
							case "2":
								return a > b;
							case "3":
								return a < b;
							case "4":
								return a >= b;
							case "5":
								return a <= b;
							default:
								return a == b;
						}
					}
					if(compareHere(transformedValue , comparedValue)){
						tmpbool = true;
					}else{
						if(tableName != undefined && record != undefined && sqlResult[x]['id'] == record['id']){
							recordBool = false;
						}
					}
				}
				// 处理blank的情况
				if(analysisList[i]['filter'] == '(blank)' && sqlResult.length == 0)tmpbool = true;


				result &= tmpbool;
				result &= recordBool;

			}
			return result;
		},

		// 针对不同的Model获取相应数据
		getInitalShowData : function(analysisItem){
			var choice = false;		// 在数据库中是否是使用choice的方式保存
			var table = '';
			var value = '';
			var sp = analysisItem['name'].split(".");
			choice = sp[0] == 'choice';
			table = sp[choice ? 1 : 0];
			value = sp[choice ? 2 : 1];

			var showData = {};
			var selectedPerson = COMPARELIST.getSelectedPersonUsingFilter(ANALYSIS.panelFilter);
			for(var j = 0;j < selectedPerson.length;j++){
				var id = selectedPerson[j]['id'];
				var emp = DB.selectEmpById(id)[0];//alasql('SELECT * FROM emp WHERE id=?',[parseInt(id)])[0];
				var addrs = DB.selectTableByEmpId('addr', id);//alasql('SELECT * FROM addr WHERE emp=?', [ parseInt(id) ]);
				var families = DB.selectTableByEmpId('family', id);//alasql('SELECT * FROM family WHERE emp=?', [ parseInt(id) ]);
				var edus = DB.selectTableByEmpId('edu', id);//alasql('SELECT * FROM edu WHERE emp=?', [ parseInt(id)]);
				var performances = DB.selectTableByEmpId('performance', id);//alasql('SELECT * FROM performance WHERE emp=?', [ parseInt(id)]);
				if(table == 'emp'){
					var tmp = '';
					tmp = choice ? DB.choice(emp[value]) : emp[value];
					showData[tmp] == null ? showData[tmp] = 1 : showData[tmp]++;
				}else{
					switch(table){
						case 'addr':
							if(addrs.length == 0){
								showData[''] == null ? showData[''] = 1:showData['']++;
							}
							for(var k = 0;k < addrs.length;k++){
								var addr = addrs[k];
								if(!ANALYSIS.panelFilter(emp, "addr", addr)){continue;}
								var tmp = '';
								tmp = choice ? DB.choice(addr[value]) : addr[value];
								showData[tmp] == null ? showData[tmp] = 1 : showData[tmp]++;
							}
							break;
						case 'family':
							if(families.length == 0){
								showData[''] == null ? showData[''] = 1:showData['']++;
							}
							for(var k = 0;k < families.length;k++){
								var family = families[k];
								if(!ANALYSIS.panelFilter(emp, "family", family)){continue;}
								var tmp = '';
								tmp = choice ? DB.choice(family[value]) : family[value];
								showData[tmp] == null ? showData[tmp] = 1 : showData[tmp]++;
							}
							break;
						case 'edu':
							if(edus.length == 0){
								showData[''] == null ? showData[''] = 1:showData['']++;
							}
							for(var k = 0;k < edus.length;k++){
								var edu = edus[k];
								if(!ANALYSIS.panelFilter(emp, "edu", edu)){continue;}
								var tmp = '';
								tmp = choice ? DB.choice(edu[value]) : edu[value];
								showData[tmp] == null ? showData[tmp] = 1 : showData[tmp]++;
							}
							break;
						case 'performance':
							if(performances.length == 0){
								showData[''] == null ? showData[''] = 1:showData['']++;
							}
							for(var k = 0;k < performances.length;k++){
								var performance = performances[k];
								if(!ANALYSIS.panelFilter(emp, "performance", performance)){continue;}
								var tmp = '';
								tmp = performance[value];
								showData[tmp] == null ? showData[tmp] = 1 : showData[tmp]++;
							}
							break;
						case 'appendix':
							var indexName = value;
			 				var appendixId = alasql("SELECT * FROM appendix_index WHERE index_name='"+indexName+"'")[0]['id'];
			 				var records = alasql("SELECT * FROM appendix_appendix WHERE appendix_id=" + appendixId + " and emp=" + parseInt(id));
			 				var tmp = '';
			 				if(records.length){
			 					tmp = records[0]['appendix_value'];
			 				}
			 				showData[tmp] == null ? showData[tmp] = 1 : showData[tmp]++;
							break;
					}
				}
			}
			return showData;
		},

		// 对数据进行变换,返回变换后的数据
		dealTransform : function(originalValue, transformMethod, length){
			var newValue = originalValue.toString();
			switch(transformMethod){
				case 1:
					newValue = newValue;
					break;
				case 2:
					newValue = newValue.split(' ').join("").split("　").join("");
					break;
				case 3:
					newValue = newValue.trim();
					break;
				case 4:
					newValue = newValue.slice(0,length);
					break;
				case 5:
					newValue = newValue.slice(-length);
					break;
				default:
					newValue = newValue;
					break;
			}
			return newValue;
		},

		// 对信息进行变换
		transformShowData : function(analysisItem,showData){
			var finalShowData = {};
			if(analysisItem['transform'] != null){
				$.each(showData,function(value, count){
					var newKey =  ANALYSIS.dealTransform(value, analysisItem['transform'],analysisItem['transform-length']);
					
					newKey = newKey == '' ? '(blank)' : newKey;
					finalShowData[newKey] = finalShowData[newKey] == null ? count : finalShowData[newKey] + count;
				});	
			}else{
				finalShowData = showData;
			}

			if(analysisItem['filter'] != '' && finalShowData[analysisItem['filter']] == null){
				finalShowData[analysisItem['filter']] = 0;
			}
			return finalShowData;
		},

		// 根据用户点击的chart生成filter
		chartOnclickHandler: function chartOnclickHandler(event, obj, filterValue){
			var all = $('#analysisDivPanel div.analysisModel:visible');
			var index = all.index($(event.target).parents('div.analysisModel:visible'));
			var analysisList = JSON.parse(localStorage.getItem('analysisList'));
			if(analysisList[index]['filter'] == filterValue){
				analysisList[index]['filter'] = "";
			}else{
				analysisList[index]['filter'] = filterValue;
			}
			localStorage.setItem('analysisList', JSON.stringify(analysisList));
			COMPARELIST.refreshCompareListUsingFilter(ANALYSIS.panelFilter);
			COMPARETABLE.updateTableData(ANALYSIS.panelFilter);
			ANALYSIS.updateAnalysisPanel();

		},


		drawPie: function drawPie(template, finalShowData, ctx){
			var keys = Object.keys(finalShowData);
			keys.sort();
			var myLabel = [];
			var myData = [];
			var data = [];
			var color = []
			for(var i = 0;i < keys.length;i++){
				myLabel.push(keys[i]);
				myData.push(finalShowData[keys[i]]);
				data.push(finalShowData[keys[i]]);
				var c = "rgba(" + Math.floor(Math.random() * 255)+","+Math.floor(Math.random() * 255)+","+Math.floor(Math.random() * 255)+",0.4)";
				color.push(c);
			}
			var config = {
				type: 'pie',
				data:{
					labels: myLabel,
					datasets:[
						{
							backgroundColor : color,
							data : myData //[28,48,40,19,96,27,100]
						}
					],
				},
				options: {
					onClick:function(event,obj){
						if(obj.length < 1)return;
						var filterValue = obj[0]._model.label;
						ANALYSIS.chartOnclickHandler(event, obj, filterValue);
					}
				}
			}
			var myChart = new Chart(ctx, config);
			// var myChart = new Chart(ctx);
			// myChart.Pie(data);
		},



		drawLine : function drawLine(template, finalShowData, ctx){
			var keys = Object.keys(finalShowData);
			keys.sort();
			var myLabel = [];
			var myData = [];
			for(var i = 0;i < keys.length;i++){
				myLabel.push(keys[i]);
				myData.push(finalShowData[keys[i]]);
			}
			var data = {
				labels : myLabel, //["January","February","March","April","May","June","July"],
				datasets : [
					
					{
						fillColor : "rgba(151,187,205,0.5)",
						strokeColor : "rgba(151,187,205,1)",
						pointColor : "rgba(151,187,205,1)",
						pointStrokeColor : "#fff",
						data : myData //[28,48,40,19,96,27,100]
					}
				]
			}

			var config = {
				type: 'line',
				data:{
					labels: myLabel,
					datasets:[
						{
							label: 'Data Line Compare',
							backgroundColor : "rgba(54,162,235,0.2)",
							borderColor : "rgba(54,162,235,1)",
							data : myData //[28,48,40,19,96,27,100]
						}
					],
				},
				options: {
					onClick:function(event,obj,a){
						if(obj.length < 1)return;
						var filterValue = obj[0]._chart.config.data.labels[obj[0]._index];
						ANALYSIS.chartOnclickHandler(event, obj, filterValue);
					},
					scales:{
						yAxes:[{
							ticks:{
								beginAtZero: true
							}
						}]
					}
				}
			}
			var myChart = new Chart(ctx, config);
			// new Chart(ctx).Line(data);
		},

		drawBar : function drawBar(template, finalShowData, ctx){
			var keys = Object.keys(finalShowData);
			keys.sort();
			var myLabel = [];
			var myData = [];
			for(var i = 0;i < keys.length;i++){
				myLabel.push(keys[i]);
				myData.push(finalShowData[keys[i]]);
			}
			var data = {
				labels : myLabel, //["January","February","March","April","May","June","July"],
				datasets : [
					
					{
						fillColor : "rgba(151,187,205,0.5)",
						strokeColor : "rgba(151,187,205,1)",
						data : myData //[28,48,40,19,96,27,100]
					}
				]
			}
			// new Chart(ctx).Bar(data);
			var config = {
				type: 'bar',
				data:{
					labels: myLabel,
					datasets:[
						{
							label: 'Data Bar Compare',
							backgroundColor : "rgba(54,162,235,0.2)",
							borderColor : "rgba(54,162,235,1)",
							data : myData //[28,48,40,19,96,27,100]
						}
					],
					borderWidth: 1
				},
				options: {
					onClick:function(event,obj,a){
						if(obj.length < 1)return;
						var filterValue = obj[0]._chart.config.data.labels[obj[0]._index];
						ANALYSIS.chartOnclickHandler(event, obj, filterValue);
					},
					scales:{
						yAxes:[{
							ticks:{
								beginAtZero: true
							}
						}]
					}
				}
			}
			var myChart = new Chart(ctx, config);
		},

		// 在analysis model的canvas上画图
		drawCanvas : function drawCanvas(template, finalShowData){

			require(['chart'],function(){
				var c = template.find('.panel-body .myCanvasBar canvas').get(0);	
				var ctx = c.getContext("2d");
				ANALYSIS.drawBar(template, finalShowData, ctx);
				ctx = template.find('.panel-body .myCanvasLine canvas').get(0).getContext("2d");
				ANALYSIS.drawLine(template, finalShowData, ctx);
				ctx = template.find('.panel-body .myCanvasPie	 canvas').get(0).getContext("2d");
				ANALYSIS.drawPie(template, finalShowData, ctx);
				// ctx.clearRect(0,0,c.width, c.height);
			});

		},

		// 根据localStorage来进行AnalysisPanel的调整
		updateAnalysisPanel : function updateAnalysisPanel() {
			ANALYSIS.clearExistingModel();
			var analysisList = JSON.parse(localStorage.getItem('analysisList'));
			for(var i = 0;i < analysisList.length;i++){
				var template = ANALYSIS.readAndInitTemplate(analysisList[i]);
				var showData = ANALYSIS.getInitalShowData(analysisList[i]);
				// console.log(showData);
				var finalShowData = ANALYSIS.transformShowData(analysisList[i],showData);
				

				var keys = Object.keys(finalShowData);
				keys.sort();
				for(var x = 0;x < keys.length;x++){
					var key = keys[x];
					var value = finalShowData[key];
					var linkKey = '<a style="cursor: pointer;'+(key == analysisList[i]['filter']?'color:red':'')+'">'+key+'</a>'
					template.find('.panel-body tbody').append('<tr><td>'+linkKey+'</td><td>' + value+'</td></tr>');
				}

				ANALYSIS.drawCanvas(template,finalShowData);

				// $.each(finalShowData,function(key, value){
				// 	key = key == '' ? '(blank)' : key;
				// 	template.find('.panel-body tbody').append('<tr><td>'+key+'</td><td>' + value+'</td></tr>');
				// });

				template.appendTo($('#analysisDivPanel'));
			}
		},

		// 传入刷新界面的函数
		eventRegister : function eventRegister(refreshAll) {

			if(typeof(refreshAll) != "function"){
				refreshAll = ANALYSIS.updateAnalysisPanel;
			}


			// 点击dataModal题目时操作
			$('#analysisDivPanel').on('click','.panel-heading .modelTitle',function(){
				var all = $('#analysisDivPanel div.analysisModel:visible');
				var index = all.index($(this).parents('div.analysisModel:visible'));
				localStorage.setItem('editAnalysisModalIndex', index);

				var analysisList = JSON.parse(localStorage.getItem('analysisList'));
				var analysisItem = analysisList[index];
				$('.changeTransformInput').val(analysisItem['transform-length']);
				$('.changeFilterInput').val(analysisItem['filter']);

				$('.changeTransformSelect').find('option').removeAttr('selected');
				$('.changeFilterSelect').find('option').removeAttr('selected');
				$('.changeTransformSelect').val(analysisItem['transform']);
				$('.changeFilterSelect').val(analysisItem['filterType']);
				// $('.changeTransformSelect').find('[value='+analysisItem['transform']+']').attr('selected', 'selected');
				// $('.changeFilterSelect').find('[value='+analysisItem['filterType']+']').attr('selected', 'selected');
				$('#transformIntro').text(transformDescription[analysisItem['transform']]);
				if(analysisItem['filterType'] != undefined && analysisItem['filterType'] != ''){
					$('#filterIntro').text(filterDescription[analysisItem['filterType']]);
				}

				$('#dataModalSetting').modal("show");
			})



			var transformDescription = [
				"",
				"(This method will not transform data)",
				"(This method will remove the blanks in the value string)",
				"(This method will remove the starting or ending blanks)",
				"(This method will cut the first n characters, while n is the value you input)",
				"(This method will cut the last n characters, while n is the value you input)"
			];
			var filterDescription = [
				"",
				"(This model will filter the value which is equals to your input, input nothing will clear the filter)",
				"(This model will filter the value which is greater than your input, input nothing will clear the filter)",
				"(This model will filter the value which is less than your input, input nothing will clear the filter)",
				"(This model will filter the value which is greater than or equal to your input, input nothing will clear the filter)",
				"(This model will filter the value which is less than or equal to your input, input nothing will clear the filter)"
			]
			// transform的select选项改变
			$('#dataModalSetting').on("change",".changeTransformSelect",function(){
				// if($(this).val() > 3){
				// 	// 大于3时需要显示输入框，否则不显示
				// 	$(this).parents('.panel-heading').find('.changeTransformInput').parent().show("slow");
				// }else{
				// 	$(this).parents('.panel-heading').find('.changeTransformInput').parent().hide("slow");
				// }
				var v = $(this).val();
				$('#transformIntro').text(transformDescription[v]);
			});

			// filter的select选项改变
			$('#dataModalSetting').on('change','.changeFilterSelect',function(){
				var v = $(this).val();
				$('#filterIntro').text(filterDescription[v]);
			})

			
			// 支持用Enter确定输入
			$('#dataModalSetting').on('keypress', ".modal-dialog", function(e){
				console.log(e.key);
				if(e.key == 'Enter'){
					$('#dataModalSetting .changeSettingsSubmit').trigger("click");
				}
			});
			// analysisSettings 页面提交
			$('#dataModalSetting').on('click','.changeSettingsSubmit',function(){
				var transformSelect = $('.changeTransformSelect').val();
				var filterType = $('.changeFilterSelect').val();
				var transformLength = $('.changeTransformInput').val();
				var filter = $('.changeFilterInput').val();

				var analysisList = JSON.parse(localStorage.getItem('analysisList'));
				var index = localStorage.getItem('editAnalysisModalIndex');
				analysisList[index]['transform'] = parseInt(transformSelect);
				if(transformSelect > 3){
					analysisList[index]['transform-length'] = transformLength;
				}
				if(filter == '' || filter == undefined){
					analysisList[index]['filter'] = "";
					analysisList[index]['filterType'] = 1;
				}else{
					analysisList[index]['filter'] = filter;
					analysisList[index]['filterType'] = filterType;
				}
				localStorage.setItem('analysisList', JSON.stringify(analysisList));
				$('#dataModalSetting').modal("hide");
				refreshAll();
			})



			// 支持用Enter确定输入
			$('#analysisDivPanel').on('keypress', ".changeTransformInput", function(e){
				console.log(e.key);
				if(e.key == 'Enter'){
					$('#analysisDivPanel .changeTransformSubmit').trigger("click");
				}
			});
			// 提交transform语句的修改
			$('#analysisDivPanel').on("click",".changeTransformSubmit",function(){
				var val = $(this).parents('.panel-heading').find('.changeTransformInput').val();
				var val_select = $(this).parents('.panel-heading').find('.changeTransformSelect').val();
				val_select = parseInt(val_select);
				
				var all = $('#analysisDivPanel div.analysisModel:visible');
				var index = all.index($(this).parents('div.analysisModel:visible'));
				var analysisList = JSON.parse(localStorage.getItem('analysisList'));
				analysisList[index]["transform"] = val_select;
				if(val_select > 3 && (val == null) || val.trim() == ''){
					val = 10000;
				}
				if(val != null && val != ''){
					analysisList[index]['transform-length'] = val;
				}
				// 更改transform的时候清空filter
				analysisList[index]['filter'] = '';
				localStorage.setItem('analysisList', JSON.stringify(analysisList));

				$(this).parents('.panel-heading').find('[data-toggle="popover"]').popover("hide");
				refreshAll();
			});
			// 关闭transform语句修改窗口
			$('#analysisDivPanel').on("click",".changeTransformCancel",function(){
				$(this).parents('.panel-heading').find('[data-toggle="popover"]').popover("hide");
			});

			// 删除model
			$('#analysisDivPanel').on('click','div.analysisModel a.removeModel', function(){
				var all = $('#analysisDivPanel div.analysisModel:visible');
				var index = all.index($(this).parents('div.analysisModel:visible'));
				$(this).parents('div.analysisModel:visible').hide("slow", function() {
					var analysisList = JSON.parse(localStorage.getItem('analysisList'));
					var newAnalysisList = [];
					for(var i = 0;i < analysisList.length;i++){
						if(i != index){
							newAnalysisList.push(analysisList[i]);
						}
					}
					localStorage.setItem('analysisList', JSON.stringify(newAnalysisList));
					refreshAll();
				});
				
			});

			// 切换显示状态
			$('#analysisDivPanel').on('click','div.analysisModel a.changeState', function(){
				var all = $('#analysisDivPanel div.analysisModel:visible');
				var index = all.index($(this).parents('div.analysisModel:visible'));
				var analysisList = JSON.parse(localStorage.getItem('analysisList'));
				if($(this).text() == "Table"){
					analysisList[index]['state'] = 'table';
				}else if($(this).text() == "Bar Chart"){
					analysisList[index]['state'] = 'chartBar';
				}else if($(this).text() == "Line Chart"){
					analysisList[index]['state'] = 'chartLine';
				}else if($(this).text() == "Pie Chart"){
					analysisList[index]['state'] = 'chartPie';
				}
				localStorage.setItem('analysisList', JSON.stringify(analysisList));
				ANALYSIS.updateAnalysisPanel();
			});
			

			// 选择value进行过滤
			$('#analysisDivPanel').on('click','.panel-body tbody a',function(){
				var filterValue;
				if($(this).css('color') == 'rgb(255, 0, 0)'){
					filterValue = "";
					$(this).css('color', '#337AB7');
				}else{
					filterValue = $(this).text();
					$(this).parent().parent().parent().find('a').css('color','#337AB7');
					$(this).css('color', 'red');
				}

				var all = $('#analysisDivPanel div.analysisModel:visible');
				var index = all.index($(this).parents('div.analysisModel:visible'));
				var analysisList = JSON.parse(localStorage.getItem('analysisList'));
				analysisList[index]['filter'] = filterValue;
				analysisList[index]['filterType'] = 1;
				localStorage.setItem('analysisList', JSON.stringify(analysisList));
				refreshAll();
			});

			require(['jqueryui'],function(){

				 // 使用jQuery UI进行拖动排序
				$('#analysisDivPanel').sortable({
					cursor: "move",
					update: function( event, ui ) {
						var list  = [];
						var bo = [];
						$('#analysisDivPanel div.analysisModel:visible').each(function(){
							var name = $(this).attr('name');
							list.push(name);
							bo.push(false);
						});
						var analysisList = JSON.parse(localStorage.getItem('analysisList'));
						var newAnalysisList = [];
						for(var i = 0;i < list.length;i++){
							newAnalysisList.push(find(list[i]));
						}

						// 查找未使用的analysisList
						function find(name){
							for(var j = 0;j < list.length;j++){
								if(bo[j] == false && name == analysisList[j]['name']){
									bo[j] = true;
									return analysisList[j];
								}
							}
						}
						localStorage.setItem('analysisList',JSON.stringify(newAnalysisList));
					}
				});
			});
		}

	};
	return ANALYSIS;

});