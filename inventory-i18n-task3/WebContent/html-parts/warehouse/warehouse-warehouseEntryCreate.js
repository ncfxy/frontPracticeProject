mainApp.controller('warehouseEntryCreateCtrl', ['$scope', '$rootScope', '$location', '$searchService', function($scope, $rootScope, $location, $searchService) {

    $scope.orderId = parseInt($location.search()['id']);
    $scope.maker = $location.search()['maker'] || $location.search()['warehouse'];
    $scope.createType = $location.search()['type'];



    $scope.initEntryData = function(){
        var sql = 'SELECT * FROM orders WHERE id = ?';
        $scope.order = alasql(sql, [$scope.orderId])[0];

        var planDisplay = {};

        var sql = 'SELECT * FROM orderstock WHERE order_id = ' + $scope.orderId;
        var orderDetailList = alasql(sql);
        for(var i = 0;i < orderDetailList.length;i++){
            orderDetailList[i].stock_id;
            orderDetailList[i].amount;
            var row = $searchService.getStockInformation(orderDetailList[i].stock_id);
            row['chooseAmount'] = orderDetailList[i].amount;
            if(planDisplay[row.maker] == undefined){
                planDisplay[row.maker] = {};
                planDisplay[row.maker]['data'] = [];
                planDisplay[row.maker]['total'] = 0;
            }
            row.receiveAmount = 0;
            row.purchasePrice = orderDetailList[i].purchase_price || 0;

            if($rootScope.user.warehouse_name == row.name){
                planDisplay[row.maker]['data'].push(row);
                planDisplay[row.maker]['total'] += row.price * row.chooseAmount;
            }


        }
        $scope.planDisplay = planDisplay;
    }

    $scope.initExitData = function(){
        $scope.warehouse = $scope.maker;

        var sql = 'SELECT * FROM sale_orders WHERE id = ?';
        $scope.order = alasql(sql, [$scope.orderId])[0];

        var planDisplay = {};

        sql = "SELECT b.stock_id, b.amount FROM sale_order_item a \
                JOIN sale_order_stock b ON a.id = b.sale_order_item_id \
                WHERE a.sale_order_id = ?";
        var orderDetailList = alasql(sql, [$scope.orderId]);
        for(var i = 0;i < orderDetailList.length;i++){
            orderDetailList[i].stock_id;
            orderDetailList[i].amount;
            var row = $searchService.getStockInformation(orderDetailList[i].stock_id);
            row['chooseAmount'] = orderDetailList[i].amount;
            row['exitAmount'] = 0;
            if(row.name != $scope.warehouse)continue;
            if(planDisplay[row.name] == undefined){
                planDisplay[row.name] = {};
                planDisplay[row.name]['data'] = [];
                planDisplay[row.name]['total'] = 0;
            }

            planDisplay[row.name]['data'].push(row);
        }

        $scope.planDisplay = planDisplay;

    }

    if($scope.createType == "Exit"){
        $scope.initExitData();
    }else if($scope.createType == "Entry"){
        $scope.initEntryData();
    }else{
        $scope.initEntryData();
    }

    $scope.submitEntryOrder = function(){
        var records = $scope.planDisplay[$scope.maker].data;

        var inId = DB.getNewId('warehouse_in_out');
        var sql = "INSERT INTO warehouse_in_out VALUES (?,?,?,?,?,?);";
        var now = new Date();
        alasql(sql,[inId, $scope.orderId, now.toISOString(), $rootScope.user.id, "Entry", $rootScope.user.belong_warehouse]);

        for(var i = 0;i < records.length;i++){
            var row = records[i];

            sql = "SELECT * FROM stock WHERE id = ?";
            var oldBalance = alasql(sql, [row.id])[0].balance;
            var newBalance = parseInt(oldBalance) + parseInt(row.receiveAmount);

            var transId = DB.getNewId('trans');
            var transSql = 'INSERT INTO trans VALUES (?,?,?,?,?,?);';
            alasql(transSql, [transId, row.id, new Date().toISOString(), parseInt(row.receiveAmount), newBalance, 'purchased' ]);

            var newId = DB.getNewId('warehouse_in_out_item');
            var sql = "INSERT INTO warehouse_in_out_item VALUES (?,?,?);";
            alasql(sql, [newId, inId, transId]);

            sql = "UPDATE stock SET balance = ? WHERE id = ?";
            alasql(sql, [newBalance, row.id]);

        }

        // 对入库操作进行记录
        var sql = "INSERT INTO orderoperation VALUES(?,?,?,?,?);";
        alasql(sql, [DB.getNewId("orderoperation"), $scope.orderId, $rootScope.user.id,
                "Warehouse Entry (id="+inId+")", new Date().toISOString()]);


        // 设置订单状态为正在出库
        sql = "UPDATE orders SET state = ? WHERE id = ?";
        alasql(sql, ["Warehouse Entering",$scope.orderId]);


        showSuccess("Add Warehouse Entry records success");
        window.location = "#/";
    }

    $scope.submitExitOrder = function(){

        var records = $scope.planDisplay[$scope.warehouse].data;
        for(var i = 0;i < records.length;i++){
            var row = records[i];
            if(row.balance < row.exitAmount){
                showError("The Exit Count can not bigger than the stock count");
                return;
            }
            if(row.exitAmount < 0){
                showError("The Exit Count can not less than zero!");
                return;
            }
            if(!(/^\d+$/.test(row.exitAmount))){
                showError("Please input integer!");
                return;
            }
        }



        var outId = DB.getNewId('warehouse_in_out');
        var sql = "INSERT INTO warehouse_in_out VALUES (?,?,?,?,?,?);";
        var now = new Date();
        alasql(sql,[outId, $scope.orderId, now.toISOString(), $rootScope.user.id, "Exit", $rootScope.user.belong_warehouse]);

        for(var i = 0;i < records.length;i++){
            var row = records[i];
            if(row.exitAmount <= 0){
                continue;
            }

            sql = "SELECT * FROM stock WHERE id = ?";
            var oldBalance = alasql(sql, [row.id])[0].balance;
            var newBalance = parseInt(oldBalance) - parseInt(row.exitAmount);

            var transId = DB.getNewId('trans');
            var transSql = 'INSERT INTO trans VALUES (?,?,?,?,?,?);';
            alasql(transSql, [transId, row.id, new Date().toISOString(), -parseInt(row.exitAmount), newBalance, 'Sold' ]);

            var newId = DB.getNewId('warehouse_in_out_item');
            var sql = "INSERT INTO warehouse_in_out_item VALUES (?,?,?);";
            alasql(sql, [newId, outId, transId]);

            sql = "UPDATE stock SET balance = ? WHERE id = ?";
            alasql(sql, [newBalance, row.id]);

        }

        // 对出库操作进行记录
        var sql = "INSERT INTO orderoperation VALUES(?,?,?,?,?);";
        alasql(sql, [DB.getNewId("orderoperation"), $scope.orderId, $rootScope.user.id,
                "Warehouse Exit (id="+outId+")", new Date().toISOString()]);


        // 设置订单状态为正在出库
        sql = "UPDATE sale_orders SET state = ? WHERE id = ?";
        alasql(sql, ["Warehouse Exiting",$scope.orderId]);

        showSuccess("Add Warehouse Exit records success");
        window.location = "#/";
    }

    $scope.submitOrder = function(){
        if($scope.createType == "Entry"){
            $scope.submitEntryOrder();
        }else if($scope.createType == "Exit"){
            $scope.submitExitOrder();
        }else{
            showError('The type is not right');
        }
    }

    $scope.verifyReceiveAmount = function(row){
        if(row.receiveAmount == null || row.receiveAmount == undefined || row.receiveAmount < 0){
            row.receiveAmount = 0;
        }
    }

    $scope.verifyExitAmount = function(row){
        if(row.exitAmount == null || row.exitAmount == undefined || row.exitAmount < 0){
            row.exitAmount = 0;
        }
    }

}]);