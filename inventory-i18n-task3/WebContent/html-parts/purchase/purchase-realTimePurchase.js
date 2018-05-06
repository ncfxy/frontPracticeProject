mainApp.controller('createPurchaseOrderCtrl', ['$scope', '$searchService', function($scope, $searchService) {

    $scope.year = '2017';
    $scope.month = (new Date().getMonth() + 1).toString();

    $scope.readFromDataBase = function(){
        var sql = "SELECT * FROM purchaseplan WHERE month = ? and plan_value > 0";
        var purchasePlans = alasql(sql,[parseInt($scope.month)]);

        $scope.candidatePurchaseOrder = [];
        for(var i = 0;i < purchasePlans.length;i++){
            var stock = $searchService.getStockInformation(purchasePlans[i].stock_id);
            var tmp = {};
            tmp.warehouse = stock.name;
            tmp.code = stock.code;
            tmp.maker = stock.maker;
            tmp.detail = stock.detail;
            tmp.realStock = stock.balance;
            tmp.purchasePlan = purchasePlans[i].plan_value;

            tmp.stock_id = purchasePlans[i].stock_id;
            tmp.planStock = $searchService.calculateExpectStock(purchasePlans[i].stock_id,$scope.year, $scope.month);
            tmp.purchaseCount = Math.max(0,purchasePlans[i].plan_value + tmp.planStock - tmp.realStock);

            $scope.candidatePurchaseOrder.push(tmp);
        }
    }

    $scope.readFromDataBase();

    $scope.itemChange = function(){
        $scope.readFromDataBase();
    }

    $scope.editPurchaseCount = function(event){
        var td = $(event.currentTarget);
        editTd(td, function(txt, newTxt){
            // 判断是否有修改
            if(newTxt != txt){
                if(/^\d+$/.test(newTxt)){
                    td.html(newTxt);
                    var tdAll = td.parents("tbody").find('tr');
                    var tr = td.parents("tr");
                    var index = tdAll.index(tr);
                    $scope.candidatePurchaseOrder[index].purchaseCount = parseInt(newTxt);

                    $scope.$apply();
                }else{
                    showError("please input integer")
                }

            }else{
                td.html(newTxt);
            }
        });
    }

    $scope.addToPurchaseOrder = function(){
        var purchaseItems = JSON.parse(localStorage.getItem('purchaseItems') || '{}');
        for(var i = 0;i < $scope.candidatePurchaseOrder.length;i++){
            var stock_id = $scope.candidatePurchaseOrder[i].stock_id;
            var count = $scope.candidatePurchaseOrder[i].purchaseCount;
            if(count > 0){
                purchaseItems[stock_id] = count;
            }
        }

        localStorage.setItem('purchaseItems',JSON.stringify(purchaseItems));
        showSuccess("Import to purchase order success!");

        window.location = "#/createOrder";
    }


}]);