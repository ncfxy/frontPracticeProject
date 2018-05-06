mainApp.controller('addStockCtrl', ['$scope', '$selectService', '$searchService', function($scope, $selectService, $searchService) {
    // 设定warehouse的选项
    $scope.warehouseChoice = $selectService.getWarehouseList();

    // 设定item的选项
    $scope.itemList = $selectService.getItemList();

    // 初始化
    $scope.warehouse = $scope.warehouseChoice[0];
    $scope.item = $scope.itemList[0];
    $scope.time = new Date();

    $scope.update = function(){
        var rows = alasql("SELECT id, balance FROM stock WHERE whouse = ? AND item = ?", [ $scope.warehouse.warehouseId, $scope.item.id ]);
        if(rows.length > 0){
            $scope.nowInStock = rows[0].balance;
        }else{
            $scope.nowInStock = 0;
        }
    }
    $scope.update();

    $scope.submit = function(){
        if(!$scope.warehouse || !$scope.item || !$scope.time || !$scope.quantity || !$scope.comment){
            showError("Please input the necessary fields.");
            return;
        }
        var whouse = $scope.warehouse.warehouseId;
        var item = $scope.item.id;
        var qty = parseInt($scope.quantity);
        var date = $scope.time;
        var comment = $scope.comment;

        var updateResult = $searchService.editStockRecord(whouse, item, qty, date, comment);
        if(!updateResult){
            return false;
        }

        showSuccess("Change stock success!");
        $('#update').attr('disabled', 'disabled');

        // reload page
        setTimeout("window.location.assign('#/allStocks');",1000);


    }

}]);