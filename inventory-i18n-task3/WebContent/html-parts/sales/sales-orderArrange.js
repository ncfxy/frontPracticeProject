

mainApp.controller('orderArrangeCtrl', ['$scope', '$location', '$searchService', '$rootScope', function($scope, $location, $searchService, $rootScope){

    var id = parseInt($location.search()['id']);

    $scope.orderId = id;

    var sql = "SELECT a.id as orderId, b.name as customerName, \
                 * FROM sale_orders a \
                JOIN customer b ON a.customer = b.id \
                WHERE a.id = ?";

    $scope.order = alasql(sql,[$scope.orderId])[0];


    $scope.updateItems = function(){
        var sql = "SELECT item.id as item_id, kind.text, item.code, item.maker, item.detail, item.price, item.unit,* FROM sale_order_item \
                JOIN item ON sale_order_item.item_id = item.id \
                JOIN kind ON item.kind = kind.id \
                WHERE sale_order_item.sale_order_id = ?";

        $scope.items = alasql(sql, [$scope.orderId]);
        $scope.arrangedStocks = [];
        for(var i = 0;i < $scope.items.length;i++){
            var sql = "SELECT * FROM sale_order_item \
                        WHERE sale_order_id = ? \
                        AND item_id = ?";
            var res = alasql(sql, [$scope.orderId, $scope.items[i].item_id])[0];
            var sql = "SELECT * FROM sale_order_stock WHERE sale_order_item_id = ?";
            var arrangedStocks = alasql(sql, [res.id]);
            $scope.items[i].arrangedAmount = 0;
            for(var j = 0;j < arrangedStocks.length;j++){
                $scope.items[i].arrangedAmount += parseInt(arrangedStocks[j].amount);
                $scope.arrangedStocks.push(arrangedStocks[j]);
            }
        }
    }

    $scope.updateItems();


    $scope.getSubmittedArrangedAmount = function(stock_id){
        var sql = 'SELECT c.amount, * FROM sale_orders a \
                    JOIN sale_order_item b ON a.id = b.sale_order_id \
                    JOIN sale_order_stock c ON b.id = c.sale_order_item_id \
                    WHERE a.state = ? AND c.stock_id = ?';
        var res = alasql(sql, ['Arranged', stock_id]);
        var sum = 0;
        for(var i = 0;i < res.length;i++){
            sum += res[i].amount;
        }
        return sum;
    }


    $scope.deliveryMen = alasql("SELECT * FROM users WHERE type = 'delivery'")
    $scope.stocks = [];
    $scope.choosedItemId = 0;
    $scope.arrange = function(event, item){

        $scope.choosedItemId = item.item_id;
        var sql = 'SELECT stock.id, whouse.name, kind.text, item.code, item.maker, item.detail, item.price, stock.balance, item.unit, stock.warning_line \
            FROM stock \
            JOIN whouse ON whouse.id = stock.whouse \
            JOIN item ON item.id = stock.item \
            JOIN kind ON kind.id = item.kind \
            WHERE item.id = ?';
        $scope.stocks = alasql(sql, [item.item_id]);
        for(var i= 0;i < $scope.stocks.length;i++){
            var sql = "SELECT * FROM sale_order_item \
                    WHERE sale_order_id = ? \
                    AND item_id = ?";
            var res = alasql(sql, [$scope.orderId, $scope.choosedItemId])[0];
            var sql = "SELECT * FROM sale_order_stock WHERE sale_order_item_id = ? AND stock_id = ?";
            var have = alasql(sql, [res.id, $scope.stocks[i].id]);
            $scope.stocks[i].arrangeAmount = (have.length == 0 ? 0 : have[0].amount);
            $scope.stocks[i].submittedArrangedAmount = $scope.getSubmittedArrangedAmount($scope.stocks[i].id);

        }
        $('#selectStockModal').modal("show");
        console.log(event);
        console.log(item);
    }

    $scope.showArrangeResult = function(){
        var sql = "SELECT sale_order_stock.stock_id, sale_order_stock.amount FROM sale_order_item \
                    JOIN sale_order_stock ON sale_order_item.id = sale_order_stock.sale_order_item_id \
                    WHERE sale_order_item.sale_order_id = ?"
        var stocks = alasql(sql, [$scope.orderId]);
        console.log(stocks);

        var planDisplay = {};
        for(var i = 0;i < stocks.length;i++){
            var row = $searchService.getStockInformation(stocks[i].stock_id);
            if(planDisplay[row.name] == undefined){
                planDisplay[row.name] = {};
                planDisplay[row.name]['data'] = [];
            }
            row.amount = stocks[i].amount;
            planDisplay[row.name]['data'].push(row);
        }

        $scope.planDisplay = planDisplay;
        if(Object.keys($scope.planDisplay) == 0){
            $scope.hasArrange = false;
        }else{
            $scope.hasArrange = true;
        }


    }

    $scope.showArrangeResult();


    $scope.confirm = function($event){

        var sql = "SELECT * FROM sale_order_item \
                    WHERE sale_order_id = ? \
                    AND item_id = ?";
        var res = alasql(sql, [$scope.orderId, $scope.choosedItemId])[0];

        var realAmount = 0;
        for (var i = 0;i < $scope.stocks.length;i++){
            realAmount += parseInt($scope.stocks[i].arrangeAmount);
            if($scope.stocks[i].arrangeAmount > $scope.stocks[i].balance){
                showError("Arrange amount can not over the stock's balance.");
                return;
            }

            if($scope.stocks[i].arrangeAmount < 0){
                showError("Arrange amount can not input negative number");
                return;
            }
        }

        if(realAmount > res.amount){
            showError("The sum of the amount can not over the item's amount.");
            return;
        }

        for(var i = 0;i < $scope.stocks.length;i++){
            if($scope.stocks[i].submittedArrangedAmount + parseInt($scope.stocks[i].arrangeAmount) > $scope.stocks[i].balance){
                showError("The Stock in line "+ (i+1) + " exceed stock balance");
                return;
            }
        }

        for(var i = 0;i < $scope.stocks.length;i++){
            var sql = "SELECT * FROM sale_order_stock WHERE sale_order_item_id = ? AND stock_id = ?";
            var have = alasql(sql, [res.id, $scope.stocks[i].id]);
            if($scope.stocks[i].arrangeAmount > 0){
                if(have.length > 0){
                    alasql("UPDATE sale_order_stock SET amount = ? WHERE sale_order_item_id = ? AND stock_id = ?",
                        [$scope.stocks[i].arrangeAmount, res.id, $scope.stocks[i].id]);
                }else{
                    alasql("INSERT INTO sale_order_stock VALUES(?,?,?,?)",
                        [DB.getNewId('sale_order_stock'), res.id, $scope.stocks[i].id, parseInt($scope.stocks[i].arrangeAmount)]);
                }
            }else{
                if(have.length > 0){
                    alasql("DELETE FROM sale_order_stock WHERE sale_order_item_id = ? AND stock_id = ?",
                        [res.id, $scope.stocks[i].id]);
                }
            }
        }
        $scope.showArrangeResult();
        $scope.updateItems();
        $('#selectStockModal').modal("hide");
    }


    $scope.confirmEnterKey = function(event){
        if(event.key == "Enter"){
            $scope.confirm(event);
        }
    }


    $scope.submitArrangeOrder = function(){
        if($scope.deliveryMan == undefined){
            showError("Please Select a delivery man.");
            return;
        }

        var bo = true;
        for(var i = 0;i < $scope.items.length;i++){
            if($scope.items[i].amount != $scope.items[i].arrangedAmount){
                bo = false;
                break;
            }
        }

        if(bo == false){
            showError("Please arrange all the items before submit.");
            return;
        }



        for(var i = 0;i < $scope.arrangedStocks.length;i++){
            var submittedArrangedAmount = $scope.getSubmittedArrangedAmount($scope.arrangedStocks[i].stock_id);
            var inStock = $searchService.getStockInformation($scope.arrangedStocks[i].stock_id);
            if(submittedArrangedAmount + $scope.arrangedStocks[i].amount > inStock.balance){
                showError("The arranged stock(" + inStock.detail+ " in "+ inStock.name + ") has exceed its balance, Please check")
                return false;
            }
        }

        var sql = "UPDATE sale_orders SET state = ? WHERE id = ?";
        alasql(sql, ['Arranged', $scope.orderId]);

        var sql = "UPDATE sale_orders SET delivery = ? WHERE id = ?";
        alasql(sql, [$scope.deliveryMan.id, $scope.orderId]);

        sql = "INSERT INTO orderoperation VALUES(?,?,?,?,?);";
        alasql(sql, [DB.getNewId('orderoperation'), $scope.orderId, $rootScope.user.id, "Arranged", new Date().toISOString()]);

        showSuccess("This order arrangement submit success.");

        window.location = "#/orderList";
    }




}]);