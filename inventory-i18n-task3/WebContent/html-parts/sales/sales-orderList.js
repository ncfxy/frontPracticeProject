

mainApp.controller('salesOrderListCtrl', ['$scope', function($scope){

    $scope.states = ['All', 'create','Paid', 'Arranged','Warehouse Exiting','Delivered', 'Finished'];
    $scope.state = 'All';
    $scope.customerName = "";

    $scope.search = function(){
        var sql = "SELECT a.id as orderId, b.name as customerName, * FROM sale_orders a ";
        sql += "JOIN customer b ON a.customer = b.id ";
        sql += "WHERE b.name LIKE ? ";
        sql += $scope.state == 'All' ? '' : " AND a.state = '" + $scope.state + "'";
        sql += $scope.startTime == undefined ? '' : " AND a.create_time >= '" + $scope.startTime.toISOString() + "' ";
        if($scope.endTime != undefined){
            $scope.endTime.setHours(24);
        }
        sql += $scope.endTime == undefined ? '' : " AND a.create_time <= '" + $scope.endTime.toISOString() + "' ";

        $scope.orderList = alasql(sql, ["%" + $scope.customerName + "%"]);

        for(var i = 0;i < $scope.orderList.length;i++){
            $scope.orderList[i].create_time = $scope.orderList[i].create_time.slice(0,10);
            var deliveryManId = $scope.orderList[i].delivery;
            sql = "SELECT * FROM users WHERE id = ?";
            var res = alasql(sql, [deliveryManId]);
            if(res.length > 0){
              $scope.orderList[i].deliveryName = res[0].name;
          }
      }
    };

    $scope.search();

    $scope.goToArrange = function(event){
        window.location = $(event.currentTarget).attr("href");
        event.preventDefault();
        event.stopPropagation();
    };

}]);