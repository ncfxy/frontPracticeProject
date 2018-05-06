mainApp.controller('analysisCtrl', ['$scope', '$selectService', '$searchService', function($scope, $selectService, $searchService) {
    // 设定warehouse的选项
    $scope.warehouseChoice = $selectService.getWarehouseListWithAll();

    // 设定classification的选项
    $scope.classificationChoice = $selectService.getClassificationListWithAll();

    // 初始化
    $scope.q1 = $scope.warehouseChoice[0];
    $scope.q2 = $scope.classificationChoice[0];
    $scope.inputCode = '';

    if(localStorage.getItem('purchaseItems') == null || localStorage.getItem('purchaseItems') == ''){
        localStorage.setItem('purchaseItems','{}');
    }
    $scope.purchaseItems = JSON.parse(localStorage.getItem('purchaseItems'));



    $scope.search = function(event){
        // 查找records
        var q1 = $scope.q1.warehouseId;
        var q2 = $scope.q2.classificationId;
        var q3 = $scope.inputCode;

        var stocks = $searchService.searchStockInformation(q1, q2, q3);

        for(var i = 0;i < stocks.length;i++){
            var tmp = $scope.purchaseItems[stocks[i].stock_id];
            tmp = (tmp == undefined ? 0 : tmp);
            if(stocks[i].balance + tmp < stocks[i].warning_line){
                stocks[i].backgroundColor = 'red';
            }else{
                stocks[i].backgroundColor = 'white';
            }
        }
        $scope.records = stocks;
    }

    $scope.search();

    // 添加到localStorage中去
    $scope.addToProcurement = function(event){
        var id = $(event.currentTarget).parents('tr').attr('data-href').split("=")[1];
        console.log(id);
        var purchaseItems = JSON.parse(localStorage.getItem('purchaseItems'));
        if(purchaseItems[id] == undefined){
            purchaseItems[id] = 1;
        }else{
            purchaseItems[id] = purchaseItems[id] + 1;
        }
        $scope.purchaseItems = purchaseItems;

        localStorage.setItem('purchaseItems',JSON.stringify(purchaseItems));
        $scope.search();


        event.preventDefault();
        event.stopPropagation();
        return false;
    }

    // 从localStorage中减一
    $scope.removeFromProcurement = function(event){
        var id = $(event.currentTarget).parents('tr').attr('data-href').split("=")[1];
        console.log(id);
        var purchaseItems = JSON.parse(localStorage.getItem('purchaseItems'));
        if(purchaseItems[id] == undefined){
            return;
        }else if(purchaseItems[id] > 1){
            purchaseItems[id] = purchaseItems[id] - 1;
        }else if(purchaseItems[id] == 1){
            delete purchaseItems[id];
        }
        $scope.purchaseItems = purchaseItems;

        localStorage.setItem('purchaseItems',JSON.stringify(purchaseItems));
        $scope.search();


        event.preventDefault();
        event.stopPropagation();
        return false;
    }

}]);