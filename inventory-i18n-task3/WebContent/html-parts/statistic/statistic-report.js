
mainApp.controller('purchaseReportCtrl', ['$scope', '$location', '$searchService', function($scope, $location, $searchService) {

    $scope.class = $location.search()['class'];

    $scope.show = ($scope.class == 'purchase' || $scope.class == 'sales');
    if(!$scope.show){
        // 默认显示采购统计报告
        $scope.class = 'purchase';
    }

    $scope.titleName = $scope.class == 'sales'?'Sales':'Purchase';

    $scope.period = "Monthly";

    $scope.monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    var now = new Date();
    $scope.year = now.getFullYear().toString();
    $scope.month = (now.getMonth()+1).toString();
    $scope.monthName = "";
    $scope.reportType = "amount";

    $scope.allPurchaseRecords;
    $scope.allSalesRecords;

    $scope.getAllRecords = function(){
        var sql = "SELECT * FROM orders \
                    JOIN orderstock ON orders.id = orderstock.order_id \
                    WHERE orders.state = 'Finished'";
        $scope.allPurchaseRecords = alasql(sql);
        var sql = "SELECT b.amount as itemAmount, c.amount as stockAmount, * FROM sale_orders a \
                    JOIN sale_order_item b ON a.id = b.sale_order_id \
                    JOIN sale_order_stock c ON b.id = c.sale_order_item_id \
                    WHERE a.state = 'Finished' ";
        $scope.allSalesRecords = alasql(sql);
    }
    $scope.getAllRecords();

    $scope.searchInMem = function(stock_id, year, month, startTime, endTime, type){
        var all;
        if(type == 'purchase'){
            all = $scope.allPurchaseRecords;
        }else{
            all = $scope.allSalesRecords;
        }
        var res = [];
        for(var i = 0;i < all.length;i++){
            var row = all[i];
            if(row.create_time >= startTime.toISOString()
                && row.create_time <= endTime.toISOString()
                && row.stock_id == stock_id){
                res.push(all[i]);
            }
        }
        return res;
    }

    $scope.getOneMonthPurchaseAmount = function(stock_id, year, month, startTime, endTime){


        var sql = "SELECT * FROM orders \
                    JOIN orderstock ON orders.id = orderstock.order_id \
                    WHERE orders.state = 'Finished'";
        sql += " AND orders.create_time >= '" + startTime.toISOString() + "'";
        sql += " AND orders.create_time <= '" + endTime.toISOString() + "'";
        sql += " AND orderstock.stock_id = " + stock_id;

        var res = $scope.searchInMem(stock_id, year, month, startTime, endTime, 'purchase');//alasql(sql);
        var sumAmount = 0;
        var totalCost = 0;
        for(var i = 0 ;i < res.length;i++){
            sumAmount += res[i].amount;
            totalCost += res[i].amount * res[i].purchase_price;
        }
        return [sumAmount, totalCost];
    }

    $scope.getOneMonthSalesAmount = function(stock_id, year, month, startTime, endTime){

        var sql = "SELECT b.amount as itemAmount, c.amount as stockAmount, * FROM sale_orders a \
                    JOIN sale_order_item b ON a.id = b.sale_order_id \
                    JOIN sale_order_stock c ON b.id = c.sale_order_item_id \
                    WHERE a.state = 'Finished' ";
        sql += " AND a.create_time >= '" + startTime.toISOString() + "'";
        sql += " AND a.create_time <= '" + endTime.toISOString() + "'";
        sql += " AND c.stock_id = " + stock_id;

        var res = $scope.searchInMem(stock_id, year, month, startTime, endTime, 'sales');//alasql(sql);
        var sumAmount = 0;
        var totalCost = 0;
        for(var i = 0;i < res.length;i++){
            sumAmount += res[i].stockAmount;
            totalCost += res[i].stockAmount * res[i].price;
        }
        return [sumAmount, totalCost];
    }

    $scope.getOneMonthAmount = function(stock_id, year, month){
        stock_id = parseInt(stock_id);
        year = parseInt(year);
        month = parseInt(month);
        var startTime = new Date('' + month + '/01/' + year);
        if(month < 12){
            endTime = new Date('' + (month+1) + '/01/' + year);
        }else{
            var endTime = new Date('01/01/' + (year+1) );
        }
        if($scope.class == 'sales'){
            return $scope.getOneMonthSalesAmount(stock_id, year, month, startTime, endTime);
        }else{
            return $scope.getOneMonthPurchaseAmount(stock_id, year, month, startTime, endTime);
        }
    }

    $scope.search = function(){
        $scope.monthName = $scope.monthNames[parseInt($scope.month)-1];
        var sql = 'SELECT stock.id, whouse.name, kind.text, item.code, item.maker, \
                item.detail, item.price, stock.balance, item.unit, stock.warning_line \
                FROM stock \
                JOIN whouse ON whouse.id = stock.whouse \
                JOIN item ON item.id = stock.item \
                JOIN kind ON kind.id = item.kind';
        var stocks = alasql(sql);
        var all = $searchService.getAllPlanValue("purchaseplan");
        for(var i = 0;i < stocks.length;i++){
            var plan = $searchService.getPlanValueFromAll("purchaseplan",stocks[i].id, $scope.year, $scope.month, all);
            stocks[i].planAmount = plan.plan_value;

            var res = $scope.getOneMonthAmount(stocks[i].id, $scope.year, $scope.month);
            stocks[i].realPurchaseAmount = res[0];
            stocks[i].totalCost = res[1];

            stocks[i].yearAmount = [];
            stocks[i].yearCost = [];
            for(var j = 0;j < $scope.monthNames.length;j++){
                var res = $scope.getOneMonthAmount(stocks[i].id, $scope.year, j+1);
                stocks[i].yearAmount.push(res[0]);
                stocks[i].yearCost.push(res[1]);
            }
        }
        $scope.stocks = stocks;
    }

    $scope.search();

    $scope.printThis = function(event){
        $(event.currentTarget).parents(".panel").find('.panel-body').jqprint();
    }


    $scope.generateCsvByTalbe = function(htmlTable){
        var str = '';
        var table = $(htmlTable);
        var trs = table.find('tr');
        for(var i = 0;i < trs.length;i++){
            var tr = $(trs[i]);
            var tds = tr.find('td,th');
            var line = '';
            for(var j = 0;j < tds.length;j++){
                line += $(tds[j]).text();
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
        if(exportType == "Monthly"){
            fileName = "MonthlyReport-" + $scope.monthName + '-' + $scope.year;
        }else if(exportType == "YearlyAmount"){
            fileName = "YearlyAmountReport-" + $scope.year;
        }else if(exportType == "YearlyCost"){
            fileName = "YearlyCostReport-" + $scope.year;
        }else if(exportType == "YearlyIncome"){
            fileName = "YearlyIncomeReport-" + $scope.year;
        }
        FILE.doSave(content, "text/csv", fileName + ".csv");
    }


}]);
