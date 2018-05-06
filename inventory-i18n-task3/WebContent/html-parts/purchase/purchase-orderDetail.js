mainApp.controller('orderDetailCtrl', ['$scope', '$rootScope', '$location', '$searchService', function($scope, $rootScope, $location, $searchService) {
    var id = parseInt($location.search()['id']);

    $scope.orderId = id;

    var sql = 'SELECT * FROM orders WHERE id = ?';
    $scope.order = alasql(sql, [$scope.orderId])[0];

    $scope.steps = ['create','Confirmed Purchase Price','Paid','Warehouse Entering','Finished'];
    $scope.lines = [1,2,3,4];
    $scope.gap = 95/($scope.steps.length - 1);


    $scope.updateOperations = function(){
        var sql = 'SELECT * FROM orderoperation a JOIN users b ON a.operator = b.id WHERE a.order_id = ?';
        $scope.operations = alasql(sql, [$scope.orderId]);
        for(var i = 0;i < $scope.operations.length;i++){
            $scope.operations[i].operation_time = new Date($scope.operations[i].operation_time).toLocaleString();
        }
        for(var i = 0;i < $scope.operations.length;i++){
            if($scope.operations[i].operation.startsWith("Warehouse Entry")){
                var tmp = $scope.operations[i].operation.split("=")[1];
                tmp = tmp.slice(0,-1);
                $scope.operations[i].href = "#/warehouseEntryDetail?id="+tmp+"&type=Entry";
            }
        }

        $scope.nowStep = 0;
        $scope.stepColors = [];
        for(var i = 0;i < $scope.steps.length;i++){
            if($scope.order.state == $scope.steps[i]){
                $scope.nowStep = i;
            }
        }
        for(var i = 0;i < $scope.steps.length;i++){
            if(i <= $scope.nowStep){
                $scope.stepColors.push('#DD0000');
            }else{
                $scope.stepColors.push('#bbb');
            }
        }

    }

    // 得到所有相关入库操作的和
    $scope.getOperationSumAmount = function(orderId, stockId, operation){
        var sql = "SELECT * FROM warehouse_in_out a \
                    JOIN warehouse_in_out_item b ON a.id = b.in_out_id \
                    JOIN trans c ON b.trans_id = c.id \
                    WHERE a.order_id = ? AND c.stock = ? AND a.type = ? ";
        var res = alasql(sql, [orderId, stockId, operation]);
        var sum = 0;
        for(var i = 0;i < res.length;i++){
            sum += parseInt(res[i].qty);
        }
        return sum;
    }

    // 刷新要显示的订单中货物的信息
    $scope.updatePlanDisplay = function(){
        var planDisplay = {};
        var totalCost = 0;

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
            row.purchasePrice = orderDetailList[i].purchase_price || 0;
            row.receivedAmount = $scope.getOperationSumAmount($scope.orderId, orderDetailList[i].stock_id, "Entry");
            row.finished = (row.receivedAmount >= row.chooseAmount);
            planDisplay[row.maker]['data'].push(row);
            planDisplay[row.maker]['total'] += row.price * row.chooseAmount;
            totalCost += row.purchasePrice * row.chooseAmount;
        }
        $scope.planDisplay = planDisplay;
        $scope.totalCost = totalCost;

        $scope.updateOperations();
    }

    $scope.updatePlanDisplay();

    $scope.deleteOrder = function() {


        var sql = "DELETE FROM orders WHERE id = ?";
        var sqlStock = "DELETE FROM orderstock WHERE order_id = ?";
        var sqlOperation = "DELETE FROM orderoperation WHERE order_id = ?";
        alasql(sql,[$scope.orderId]);
        alasql(sqlStock,[$scope.orderId]);
        alasql(sqlOperation,[$scope.orderId]);

        showSuccess('This order is deleted success.');
        window.location = "purchase.html#/orderList"
    }

    $scope.confirmOrder = function(){

        var makers = Object.keys($scope.planDisplay);
        for(var i = 0;i < makers.length;i++){
            var rows = $scope.planDisplay[makers[i]].data;
            for(var j = 0;j < rows.length;j++){
                row = rows[j];
                if(!row.purchasePrice){
                    showError("Please input all purchase price.");
                    return;
                }
            }
        }


        var sql = 'UPDATE orders SET state = "Confirmed Purchase Price" WHERE id = ?';
        alasql(sql, [$scope.orderId]);

        // 添加操作记录
        var newId = DB.getNewId('orderoperation');
        var now = new Date();
        sql = "INSERT INTO orderoperation VALUES(?,?,?,?,?);";
        alasql(sql,[newId, $scope.orderId, $rootScope.user.id, 'Confirmed Purchase Price',now.toISOString()]);

        showSuccess("This purchase is submitted successfully.");
        var sql = 'SELECT * FROM orders WHERE id = ?';;
        $scope.order = alasql(sql, [$scope.orderId])[0];
        $scope.updateOperations();
    }

    $scope.payOrder = function(){
        var sql = 'UPDATE orders SET state = "Paid" WHERE id = ?';
        alasql(sql, [$scope.orderId]);


        // 添加操作记录
        var newId = DB.getNewId('orderoperation');
        var now = new Date();
        sql = "INSERT INTO orderoperation VALUES(?,?,?,?,?);";
        alasql(sql,[newId, $scope.orderId, $rootScope.user.id, 'Paid',now.toISOString()]);

        showSuccess("This purchase is paid successfully.");
        var sql = 'SELECT * FROM orders WHERE id = ?';;
        $scope.order = alasql(sql, [$scope.orderId])[0];
        $scope.updateOperations();
    }

    $scope.finishOrder = function(){

        var makers = Object.keys($scope.planDisplay);
        for(var i = 0;i < makers.length;i++){
            var rows = $scope.planDisplay[makers[i]].data;
            for(var j = 0;j < rows.length;j++){
                row = rows[j];
                if(!row.finished){
                    showError("You can not finish this order before warehouse receive all items.");
                    return;
                }
            }
        }


        var sql = "UPDATE orders SET state = 'Finished' WHERE id = ? ";
        alasql(sql, [$scope.orderId]);

        // 添加操作记录
        sql = "INSERT INTO orderoperation VALUES(?,?,?,?,?);";
        alasql(sql, [DB.getNewId('orderoperation'), $scope.orderId, $rootScope.user.id, 'Finished', new Date().toISOString()]);

        showSuccess("This order is finished successfully.");
        var sql = 'SELECT * FROM orders WHERE id = ?';;
        $scope.order = alasql(sql, [$scope.orderId])[0];
        $scope.updateOperations();
    }

    // 废除  用户双击采购价格时进行编辑
    $scope.editPurchasePrice = function(event){
        var td = $(event.currentTarget);
        editTd(td, function(txt, newTxt){
            // 判断是否有修改
            if(newTxt != txt){
                if(/^\d+$/.test(newTxt)){
                    td.html(newTxt);
                    var tdAll = td.parents("tbody").find('tr');
                    var tr = td.parents("tr");
                    var index = tdAll.index(tr);
                    var id = parseInt(tr.attr('data-href').split('=')[1]);
                    var row = $searchService.getStockInformation(id);

                    $scope.planDisplay[row.maker].data[index].purchasePrice = parseInt(newTxt);

                    var sql = 'UPDATE orderstock set purchase_price = ' + parseInt(newTxt) +' WHERE order_id = ? AND stock_id = ?';
                    alasql(sql, [$scope.orderId, row.id])


                    $scope.$apply();
                    //$scope.updatePlanDisplay();
                }else{
                    showError("please input integer")
                }

            }else{
                td.html(newTxt);
            }
        });
    }

    $scope.priceChange = function(row){

        if(row.purchasePrice == null || row.purchasePrice == undefined || parseInt(row.purchasePrice) < 0){
            row.purchasePrice = 0;
        }
        var sql = "UPDATE orderstock SET purchase_price = " + row.purchasePrice + " WHERE order_id = ? AND stock_id = ?";
        alasql(sql, [$scope.orderId, row.id]);
        $scope.updatePlanDisplay();
    }

    $scope.printThis = function(event){
        $(event.currentTarget).parents(".panel").find('.panel-body').jqprint();
    }

}]);