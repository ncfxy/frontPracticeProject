mainApp.controller('orderListCtrl', ['$scope',function($scope) {




    $scope.states = ['All', 'create','Confirmed Purchase Price','Paid', 'Warehouse Entering', 'Finished'];
    $scope.state = "All";

    $scope.search = function(){
        $scope.orderList = [];
        var sql = "SELECT * FROM orders WHERE type = 'purchase' ";

        sql += $scope.state == 'All' ? '' : 'AND state = "' + $scope.state + '" ';
        sql += $scope.startTime == undefined ? '' : " AND create_time >= '" + $scope.startTime.toISOString() + "' ";
        if($scope.endTime != undefined){
            $scope.endTime.setHours(24);
        }
        sql += $scope.endTime == undefined ? '' : " AND create_time <= '" + $scope.endTime.toISOString() + "' ";
        sql += " ORDER BY id DESC";

        var orders = alasql(sql);
        for(var i = 0;i < orders.length;i++){
            var tmp = {};
            tmp.orderId = orders[i].id;
            tmp.createTime = new Date(orders[i].create_time).toLocaleString();
            tmp.state = orders[i].state;

            sql = "SELECT * FROM orderoperation JOIN users ON orderoperation.operator = users.id WHERE orderoperation.order_id = ? and orderoperation.operation = ?";
            var res = alasql(sql, [tmp.orderId, 'create'])[0];

            tmp.createPerson = res.name;

            $scope.orderList.push(tmp);
        }
    }

    $scope.search();

    $scope.detail = function(event){

    }

}]);