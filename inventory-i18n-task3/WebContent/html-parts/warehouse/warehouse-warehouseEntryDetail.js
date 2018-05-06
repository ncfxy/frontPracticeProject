mainApp.controller('warehouseEntryDetailCtrl', ['$scope', '$location', '$searchService', function($scope, $location, $searchService) {

    $scope.recordId = parseInt($location.search()['id']);
    $scope.createType = $location.search()['type'];

    $scope.recordInfo = alasql("SELECT * FROM warehouse_in_out WHERE id = ?", [$scope.recordId])[0];
    $scope.recordInfo.entry_time = new Date($scope.recordInfo.entry_time).toLocaleString();
    $scope.recordInfo.name = alasql("SELECT * FROM users WHERE id = ?", [$scope.recordInfo.keeper_id])[0].name;


    var sql = "SELECT * FROM warehouse_in_out_item a \
                    JOIN trans b ON a.trans_id = b.id \
                    WHERE a.in_out_id = ?";
    var items = alasql(sql, [$scope.recordId]);

    $scope.initEntryData = function(){

        var planDisplay = {};
        for(var i = 0;i < items.length;i++){
            var row = $searchService.getStockInformation(items[i].stock);
            $scope.maker = row.maker;
            if(planDisplay[row.maker] == undefined){
                planDisplay[row.maker] = {};
                planDisplay[row.maker]['data'] = [];
                planDisplay[row.maker]['total'] = 0;
            }
            row.receiveAmount = items[i].qty;
            planDisplay[row.maker]['data'].push(row);
            planDisplay[row.maker]['total'] += row.price * row.chooseAmount;
        }
        $scope.planDisplay = planDisplay;
    }


    $scope.initExitData = function(){
        var planDisplay = {};
        for(var i = 0;i < items.length;i++){
            var row = $searchService.getStockInformation(items[i].stock);
            $scope.maker = row.name;
            if(planDisplay[row.name] == undefined){
                planDisplay[row.name] = {};
                planDisplay[row.name]['data'] = [];
                planDisplay[row.name]['total'] = 0;
            }
            row.exitAmount = -items[i].qty;
            planDisplay[row.name]['data'].push(row);
        }
        $scope.planDisplay = planDisplay;
    }

    $scope.init = function(){
        if($scope.createType == "Entry"){
            $scope.initEntryData();
        }else if($scope.createType == "Exit"){
            $scope.initExitData();
        }
    }

    $scope.init();


}]);