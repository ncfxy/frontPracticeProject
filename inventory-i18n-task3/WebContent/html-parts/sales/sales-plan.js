

/*
    处理销售计划的控制器
*/
mainApp.controller('salePlanCtrl', ['$scope', '$searchService', function($scope, $searchService){


    $scope.update = function(){

    }

    planCommon($scope, "salesplan", $searchService);
}]);