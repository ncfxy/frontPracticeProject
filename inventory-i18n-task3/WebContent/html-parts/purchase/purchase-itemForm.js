

mainApp.controller('itemFormCtrl', ['$scope', function($scope){

    var sql = "SELECT * FROM kind";
    $scope.kinds = alasql(sql);

    sql = "SELECT maker FROM item GROUP BY maker";
    $scope.makers = alasql(sql);

    // $scope.code = "";
    // $scope.maker = "";
    // $scope.detail = "";
    $scope.price = 0;
    $scope.unit = "Pcs";

    $scope.kindChange = function(){
        var sql = "SELECT * FROM item WHERE kind = ? ORDER BY code DESC";
        var res = alasql(sql, [$scope.chooseKind.id]);
        res = res || [];
        if(res.length == 0){
            $scope.code = $scope.chooseKind.text + "01";
        }else{
            code = res[0].code;
            $scope.code = code.slice(0,-1) + (parseInt(code.slice(-1)) + 1);
        }


    }



    $scope.addItem = function(event){
        if(!$scope.chooseKind || !$scope.code || !$scope.maker || !$scope.detail || !$scope.price || !$scope.unit){
            showError("Please input all information.");
            return;
        }

        var newId = DB.getNewId("item");
        var sql = "INSERT INTO item VALUES(?,?,?,?,?,?,?)";
        alasql(sql, [newId, $scope.code, $scope.chooseKind.id, $scope.detail, $scope.maker.maker, parseInt($scope.price), $scope.unit]);

        showSuccess("Add Item Success");
    }



}]);