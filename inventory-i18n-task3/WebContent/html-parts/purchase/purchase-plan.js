
/*
    处理采购计划页面的控制器
*/
mainApp.controller('purchasePlanCtrl', ['$scope', '$searchService', function($scope, $searchService){




    $scope.holdingCost = 0;
    $scope.orderCost = 0;
    $scope.perPrice = 0;
    // 对计算的值进行更新
    $scope.update = function(){
        $scope.totalCost = 0;
        var stock = 0;
        for(var i = 0;i < $scope.monthlyPlan.length;i++){
            stock += $scope.monthlyPlan[i].planValue - $scope.saleMonthlyPlan[i].planValue;
            $scope.totalCost += parseInt($scope.holdingCost) * (stock < 0 ? 0 : stock);
            $scope.totalCost += parseInt($scope.monthlyPlan[i].planValue) * parseInt($scope.perPrice);
            $scope.totalCost += (parseInt($scope.monthlyPlan[i].planValue) > 0 ? parseInt($scope.orderCost): 0);
        }
        $scope.totalCost = ($scope.totalCost < 0) ? 0 : $scope.totalCost;
    }
    // $scope.update();

    planCommon($scope, "purchaseplan", $searchService);
}]);