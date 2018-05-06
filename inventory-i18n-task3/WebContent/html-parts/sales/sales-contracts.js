
mainApp.controller('contractsCtrl', ['$scope', function($scope) {



    $scope.searchType = "All";
    $scope.state = "All";
    $scope.customerName = "";


    $scope.search = function(){
        var sql = "SELECT a.id as contractId, a.type as contractType, \
                b.name as customerName, c.name as salesmanName,* \
                FROM contract a JOIN customer b ON a.customer = b.id \
                JOIN users c ON a.salesman = c.id \
                WHERE b.name  LIKE ? ";
        sql += $scope.searchType == 'All' ? '' : " AND a.type = '" + $scope.searchType + "'";
        sql += $scope.state == 'All' ? '' : " AND a.state = '" + $scope.state + "'";
        sql += $scope.startTime == undefined ? '' : " AND a.delivery_time >= '" + $scope.startTime.toISOString().slice(0,10) + "' ";
        if($scope.endTime != undefined)$scope.endTime.setHours(24);
        sql += $scope.endTime == undefined ? '' : " AND a.delivery_time <= '" + $scope.endTime.toISOString().slice(0,10) + "' ";

        $scope.contracts = alasql(sql, ["%"+$scope.customerName+"%"]);


        for(var i = 0;i < $scope.contracts.length;i++){
            $scope.contracts[i].sign_time = new Date($scope.contracts[i].sign_time).toLocaleString();
            $scope.contracts[i].delivery_time = new Date($scope.contracts[i].delivery_time).toLocaleString();
            $scope.contracts[i].validity_time = new Date($scope.contracts[i].validity_time).toLocaleString();
        }
    }

    $scope.search();

}]);
