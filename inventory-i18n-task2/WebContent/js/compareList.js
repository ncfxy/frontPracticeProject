define(['jquery','bootstrap','purl','db'], function () {
	var COMPARELIST = {

		justifyCompareList : function justifyCompareList(argument) {
			
			COMPARELIST.setCompareListHeight();
			COMPARELIST.refreshCompareList();

			$( window ).scroll(function() {
				COMPARELIST.setCompareListHeight();
			});

		},

		// 对compareList的位置进行调整
		setCompareListHeight : function(){
			var original = $(".navbar").outerHeight()+20;
			var final = Math.max($(document).scrollTop() + 20,original);
			$("#compareList").css("top",final);
			$("#collapse1 .panel-body").css('max-height', ($(window).height()-original-100) + "px");
		},

		// 获取localStorage数据
		getSelectedPerson : function getSelectedPerson() {
			var selectedPerson = localStorage.getItem('selectedPerson');
			if(selectedPerson == null){
				selectedPerson = '[]';
			}
			selectedPerson = JSON.parse(selectedPerson);
			return selectedPerson;
		},

		// 获取经过过滤的localStorage数据
		getSelectedPersonUsingFilter : function getSelectedPersonUsingFilter(filterFunction) {
			var selectedPerson = localStorage.getItem('selectedPerson');
			if(selectedPerson == null){
				selectedPerson = '[]';
			}
			selectedPerson = JSON.parse(selectedPerson);
			var newSelectedPerson = [];
			for(var i = 0;i < selectedPerson.length;i++){
				if(filterFunction(selectedPerson[i])){
					newSelectedPerson.push(selectedPerson[i]);
				}
			}
			return newSelectedPerson;
		},

		// 使用filter刷新数据
		refreshCompareListUsingFilter: function refreshCompareListUsingFilter(filterFunction) {
			var selectedPerson = COMPARELIST.getSelectedPersonUsingFilter(filterFunction);
			selectedPerson.sort(function(a, b){return a['number'] > b['number']});
			var content = ''
			for(var i = 0;i < selectedPerson.length;i++){
				content += '<tr>'
				content += '<td><a href="#" class="btn btn-danger btn-xs removeFromList"><span class="glyphicon glyphicon-trash"></span></a></td>';
				content += '<td><a href="'+'emp.html?id='+selectedPerson[i]['id']+'">'+selectedPerson[i]['number']+'</a></td>';
				content += '<td>'+selectedPerson[i]['name']+'</td>';
				content += '</tr>'
			}
			$('#compareListTable tbody').html(content);
		},

		// 通过localStorage中的数据刷新compareList
		refreshCompareList : function refreshCompareList() {
			var selectedPerson = COMPARELIST.getSelectedPerson();
			selectedPerson.sort(function(a, b){return a['number'] > b['number']});
			var content = '';
			var  tbody = $('#compareListTable tbody');
			for(var i = 0;i < selectedPerson.length;i++){
				content += '<tr>';
				content += '<td><a href="#" class="btn btn-danger btn-xs removeFromList"><span class="glyphicon glyphicon-trash"></span></a></td>';
				content += '<td><a href="'+'emp.html?id='+selectedPerson[i]['id']+'">'+selectedPerson[i]['number']+'</a></td>';
				content += '<td>'+selectedPerson[i]['name']+'</td>';
				content += '</tr>';
			}
			$('#compareListTable tbody').html(content);
		}

	};

	return COMPARELIST;

});

