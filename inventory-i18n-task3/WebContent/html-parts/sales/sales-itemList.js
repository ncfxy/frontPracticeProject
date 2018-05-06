/*
    $scope.warehouse 保存所有的warehouse选项
    $scope.classificationChoice 保存商品的所有分类


*/
mainApp.controller('itemListCtrl', ['$scope', '$selectService', function($scope, $selectService) {
    // 设定warehouse的选项
    $scope.warehouseChoice = $selectService.getWarehouseListWithAll();

    // 设定classification的选项
    $scope.classificationChoice = $selectService.getClassificationListWithAll();

    // 设定maker的选项
    $scope.makerChoice = $selectService.getMakerListWithAll();

    // 初始化
    $scope.q1 = $scope.warehouseChoice[0];
    $scope.q2 = $scope.classificationChoice[0];
    $scope.makerQuery = $scope.makerChoice[0];
    $scope.inputCode = '';




    $scope.search = function(event){
        // 查找records
        var q1 = $scope.q1.warehouseId;
        var q2 = $scope.q2.classificationId;
        var q3 = $scope.inputCode;
        var maker = $scope.makerQuery.maker;

        // build sql
        var sql = 'SELECT item.id, kind.text, item.code, item.maker, item.detail, item.price, item.unit \
            FROM item \
            JOIN kind on kind.id = item.kind \
            WHERE item.code LIKE ?';

        sql += maker != 'All' ? " AND item.maker = '" + maker + "' " : '';
        sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';
        // send query
        var items = alasql(sql, [ '%' + q3 + '%' ]);
        $scope.records = items;
    }

    $scope.search();

}]);


// 查看单一商品时，搜索得到商品的详细信息
mainApp.controller('itemDetailCtrl', ['$scope', '$location', function($scope, $location) {

    var id = parseInt($location.search()['id']);

    // build sql
    var sql = 'SELECT item.id, kind.text, item.code, item.maker, item.detail, item.price, item.unit \
        FROM item \
        JOIN kind on kind.id = item.kind \
        WHERE item.id = ?';
    var item = alasql(sql, [id])[0];
    $scope.itemInfo = item;

}]);