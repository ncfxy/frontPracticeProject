mainApp.controller('stockDetailCtrl', ['$scope', '$location', '$searchService', function($scope, $location, $searchService) {
    var id = parseInt($location.search()['id']);

    var row = $searchService.getStockInformation(id);

    $scope.stockInfo = row;

    $scope.trans = alasql('SELECT * FROM trans WHERE stock = ?', [ id ]);
    for(var i = 0;i < $scope.trans.length;i++){
        $scope.trans[i].date = new Date($scope.trans[i].date).toLocaleString();
    }


    $scope.editWarningLine = function(event){
        var td = $(event.currentTarget);
        editTd(td, function(txt, newTxt){
            // 判断是否有修改
            if(newTxt != txt){
                if(/^\d+$/.test(newTxt)){
                    td.html(newTxt);
                    var sql = 'UPDATE stock SET warning_line = ? WHERE id = ?';
                    alasql(sql, [parseInt(newTxt), $scope.stockInfo.id])
                    $scope.$apply();
                }else{
                    showError("please input integer")
                }

            }else{
                td.html(newTxt);
            }
        });

    }

    $scope.updateWarningLine = function(event){
        var sql = 'UPDATE stock SET warning_line = ? WHERE id = ?';
        alasql(sql, [$scope.stockInfo.warning_line, $scope.stockInfo.id])
        showSuccess("Update warning line success");

    }

    $scope.updateEnterKey = function(event){
        if(event.key == "Enter"){
            $scope.updateWarningLine(event);
        }
    }

}]);