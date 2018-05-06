mainApp.controller('warehouseRecordListCtrl', ['$scope', '$rootScope', '$location', '$selectService', function($scope, $rootScope, $location, $selectService) {

    $scope.searchType = $location.search()['type'];

    $scope.show = ($scope.searchType == 'Entry' || $scope.searchType == 'Exit');
    $scope.searchOrderId = '';

    // 设定warehouse的选项
    $scope.warehouseChoice = $selectService.getWarehouseListWithAll();
    $scope.q1 = $scope.warehouseChoice[0];

    if($rootScope.user.type == 'warehouse'){
        $scope.q1 = $scope.warehouseChoice[$rootScope.user.belong_warehouse];
        $('#q1').attr('disabled','disabled');
    }


    $scope.search = function(){
        var sql = 'SELECT a.id as recordId,c.name as whouse_name, * FROM warehouse_in_out as a \
                    JOIN users as b ON a.keeper_id = b.id \
                    JOIN whouse as c ON a.whouse_id = c.id \
                    WHERE 1 = 1 ';
        var q1 = $scope.q1.warehouseId;
        sql += q1 ? ' AND a.whouse_id = ' + q1 + ' ' : '';
        sql += ($scope.show ? " AND a.type = '" + $scope.searchType +"'" : '');
        sql += ($scope.searchOrderId && $scope.searchOrderId.trim()) ? " AND a.order_id = "+$scope.searchOrderId+"" : ''
        sql += $scope.startTime == undefined ? '' : " AND a.entry_time >= '" + $scope.startTime.toISOString() + "' ";
        if($scope.endTime != undefined)$scope.endTime.setHours(24);
        sql += $scope.endTime == undefined ? '' : " AND a.entry_time <= '" + $scope.endTime.toISOString() + "' ";

        $scope.records = alasql(sql);

        for(var i = 0;i < $scope.records.length;i++){
            $scope.records[i].entry_time = new Date($scope.records[i].entry_time).toLocaleString();
        }
    }

    $scope.search();

    $scope.addNew = function(event){

        if($scope.searchType == "Entry"){
            window.location = "warehouse.html#/purchaseOrderList";
        }else if($scope.searchType == "Exit"){
            window.location = "warehouse.html#/salesOrderList";
        }

    }

}]);