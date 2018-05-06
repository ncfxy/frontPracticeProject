
mainApp.controller("statisticPurchaseDetailCtrl", ['$scope', '$location', '$searchService', function($scope, $location, $searchService) {

    $scope.period = $location.search()['period'];
    $scope.year = $location.search()['year'];
    $scope.month = $location.search()['month'];
    $scope.stock_id = $location.search()['stock_id'];
    $scope.class = $location.search()['class'];


    // showSuccess($scope.period + $scope.year + $scope.month + $scope.stock_id);

    $scope.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    $scope.getMonthPurchaseStock = function(stock_id, year, month){
        var stock_id = parseInt(stock_id);
        var year = parseInt(year);
        var month = parseInt(month);
        var startTime = new Date("" + month + "/01/" + year);
        var endTime;
        if(month < 12){
            endTime = new Date("" + (month+1) + "/01/" + year);
        }else{
            endTime = new Date("01/01/" + (year+1) );
        }
        var sql = "SELECT * FROM orders \
                    JOIN orderstock ON orders.id = orderstock.order_id \
                    WHERE orders.state = 'Finished'";
        sql += " AND orders.create_time >= '" + startTime.toISOString() + "'";
        sql += " AND orders.create_time <= '" + endTime.toISOString() + "'";
        sql += " AND orderstock.stock_id = " + stock_id;

        var res = alasql(sql);
        var stocks = [];
        var sumAmount = 0;
        var totalCost = 0;
        for(var i = 0;i < res.length;i++){
            stocks.push($searchService.getStockInformation(res[i].stock_id));
            stocks[i].orderId = res[i].order_id;
            stocks[i].price = res[i].purchase_price;
            stocks[i].amount = res[i].amount;
            stocks[i].time = new Date(res[i].create_time).toLocaleString();
            sumAmount += res[i].amount;
            totalCost += res[i].amount * res[i].purchase_price;
        }
        return [sumAmount, totalCost, stocks];
    }

    $scope.monthlyPurchase = function(){
        $scope.title = "Detail Monthly Purchase Records For Stock "+ $scope.stock_id+" in " + $scope.monthNames[parseInt($scope.month)-1] + " "+$scope.year;

        var res = $scope.getMonthPurchaseStock($scope.stock_id, $scope.year, $scope.month);
        $scope.sumAmount = res[0];
        $scope.totalCost = res[1];
        $scope.stocks = res[2];
    }

    $scope.getMonthSaleStock = function(stock_id, year, month){
        var stock_id = parseInt(stock_id);
        var year = parseInt(year);
        var month = parseInt(month);
        var startTime = new Date("" + month + "/01/" + year);
        var endTime;
        if(month < 12){
            endTime = new Date("" + (month+1) + "/01/" + year);
        }else{
            endTime = new Date("01/01/" + (year+1) );
        }

        var sql = "SELECT b.amount as itemAmount, c.amount as stockAmount, a.id as sale_order_id,* FROM sale_orders a \
                    JOIN sale_order_item b ON a.id = b.sale_order_id \
                    JOIN sale_order_stock c ON b.id = c.sale_order_item_id \
                    WHERE a.state = 'Finished' ";
        sql += " AND a.create_time >= '" + startTime.toISOString() + "'";
        sql += " AND a.create_time <= '" + endTime.toISOString() + "'";
        sql += " AND c.stock_id = " + stock_id;

        var res = alasql(sql);
        var stocks = [];
        var sumAmount = 0;
        var totalCost = 0;
        for(var i = 0;i < res.length;i++){
            stocks.push($searchService.getStockInformation(res[i].stock_id));
            stocks[i].orderId = res[i].sale_order_id;
            stocks[i].price = res[i].price;
            stocks[i].amount = res[i].stockAmount;
            stocks[i].time = new Date(res[i].create_time).toLocaleString();
            sumAmount += res[i].stockAmount;
            totalCost += res[i].stockAmount * res[i].price;
        }
        return [sumAmount, totalCost, stocks];
    }

    $scope.monthlySales = function(){
        $scope.title = "Detail Monthly Sales Records For Stock "+ $scope.stock_id+" in " + $scope.monthNames[parseInt($scope.month)-1] + ","+$scope.year;

        var res = $scope.getMonthSaleStock($scope.stock_id, $scope.year, $scope.month);

        $scope.sumAmount = res[0];
        $scope.totalCost = res[1];
        $scope.stocks = res[2];
    }

    $scope.yearlyPurchase = function(){
        $scope.title = "Detail Yearly Purchase Records For Stock "+ $scope.stock_id+" in " + $scope.year;
        $scope.sumAmount = 0;
        $scope.totalCost = 0;
        $scope.stocks = [];
        $scope.monthStocks = [];
        $scope.monthSumAmount = [];
        $scope.monthTotalCost = [];

        for(var i = 1;i <= 12;i++){
            var res = $scope.getMonthPurchaseStock($scope.stock_id, $scope.year, i);
            $scope.sumAmount += res[0];
            $scope.totalCost += res[1];
            $scope.monthSumAmount.push(res[0]);
            $scope.monthTotalCost.push(res[1]);
            var stocks = res[2]
            for(var j = 0;j < stocks.length;j++){
                $scope.stocks.push(stocks[j]);
            }
            $scope.monthStocks.push(stocks);
        }
    }

    $scope.yearlySales = function(){
        $scope.title = "Detail Yearly Sales Records For Stock "+ $scope.stock_id+" in " + $scope.year;
        $scope.sumAmount = 0;
        $scope.totalCost = 0;
        $scope.stocks = [];
        $scope.monthStocks = [];
        $scope.monthSumAmount = [];
        $scope.monthTotalCost = [];

        for(var i = 1;i <= 12;i++){
            var res = $scope.getMonthSaleStock($scope.stock_id, $scope.year, i);
            $scope.sumAmount += res[0];
            $scope.totalCost += res[1];
            $scope.monthSumAmount.push(res[0]);
            $scope.monthTotalCost.push(res[1]);
            var stocks = res[2]
            for(var j = 0;j < stocks.length;j++){
                $scope.stocks.push(stocks[j]);
            }
            $scope.monthStocks.push(stocks);
        }
    }


    if($scope.period == "Monthly" && $scope.class == "purchase"){
        $scope.monthlyPurchase();
    }else if($scope.period == "Monthly" && $scope.class == "sales"){
        $scope.monthlySales();
    }else if($scope.period == "Yearly" && $scope.class == "purchase"){
        $scope.yearlyPurchase();
    }else if($scope.period == "Yearly" && $scope.class == "sales"){
        $scope.yearlySales();
    }

    $scope.printThis = function(event){
        $(event.currentTarget).parents(".panel").find('.panel-body').jqprint();
    }

    $scope.generateCsvByTalbe = function(htmlTable){
        var str = '';
        var table = $(htmlTable);
        var trs = table.find('tr');
        var nowMonth = '';
        for(var i = 0;i < trs.length;i++){
            var tr = $(trs[i]);
            var tds = tr.find('td,th');
            var line = '';
            if(tds.length == 9 && $scope.period == 'Yearly'){
                line += nowMonth + ','
            }
            for(var j = 0;j < tds.length;j++){
                if(tds.length == 10 && j == 0){
                    nowMonth = $(tds[j]).text().trim().replace(/:\s+/g,":").split(/\s+/g)[0]
                    line += '"'+ nowMonth +'"';

                }else{
                    line += '"'+$(tds[j]).text()+'"';
                }

                line += (j < tds.length -1) ? ',' : '\n';
            }
            str += line;
        }
        return str;
    }



    $scope.export = function(event, exportType){
        var table = $(event.currentTarget).parents(".panel").find('.panel-body').find('.table');
        var content = $scope.generateCsvByTalbe(table);
        var fileName = "report";
        fileName = $scope.title;

        FILE.doSave(content, "text/csv", fileName + ".csv");
    }


}]);
