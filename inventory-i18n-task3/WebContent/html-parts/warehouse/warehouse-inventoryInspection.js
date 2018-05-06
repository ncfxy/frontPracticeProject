mainApp.controller('inventoryInspectionCtrl', ['$scope', '$rootScope', '$selectService', function($scope, $rootScope, $selectService) {
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

    if($rootScope.user.type == 'warehouse'){
        $scope.q1 = $scope.warehouseChoice[$rootScope.user.belong_warehouse];
        $('#q1').attr('disabled','disabled');
    }



    $scope.search = function(){
        // 查找records
        var q1 = $scope.q1.warehouseId;
        var q2 = $scope.q2.classificationId;
        var q3 = $scope.inputCode;
        // build sql
        var sql = 'SELECT stock.id, whouse.name, kind.text, item.code, item.maker, \
            item.detail, item.price, stock.balance, item.unit, stock.warning_line \
            FROM stock \
            JOIN whouse ON whouse.id = stock.whouse \
            JOIN item ON item.id = stock.item \
            JOIN kind ON kind.id = item.kind \
            WHERE item.code LIKE ?';

        sql += q1 ? 'AND whouse.id = ' + q1 + ' ' : '';
        sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';
        // send query
        var stocks = alasql(sql, [ '%' + q3 + '%' ]);
        for(var i = 0;i < stocks.length;i++){
            if(stocks[i].balance < stocks[i].warning_line){
                stocks[i].backgroundColor = 'red';
            }else{
                stocks[i].backgroundColor = 'white';
            }
        }
        $scope.records = stocks;
    }

    $scope.search();


}]);