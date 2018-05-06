
mainApp.controller('customerCtrl', ['$scope',function($scope) {

    $scope.customers = alasql("SELECT * FROM customer");

    for(var i = 0;i < $scope.customers.length;i++){
        $scope.customers[i].sex = $scope.customers[i].sex == 1 ? "Male" : "Female";
    }

}]);



mainApp.controller('customerFormCtrl', ['$scope',function($scope) {

    $scope.sexes = [];
    var tmp1 = {}; tmp1.value = 1;tmp1.text = "Male";
    var tmp2 = {}; tmp2.value = 2;tmp2.text = "Female";
    $scope.sexes.push(tmp1);
    $scope.sexes.push(tmp2);

    $scope.sex = $scope.sexes[0];

    var newId = DB.getNewId("customer");
    $scope.id = newId;

    $scope.addCustomer = function(event){
        if(!$scope.id || !$scope.name || !$scope.contact_person || !$scope.sex || !$scope.tel || !$scope.addr){
            showError("Please input all information.");
            return;
        }

        var sql = "INSERT INTO customer VALUES(?,?,?,?,?,?)";
        alasql(sql, [parseInt($scope.id), $scope.name, $scope.contact_person, $scope.sex.value, $scope.tel, $scope.addr]);
        showSuccess("Add customer success!");
        window.location = "sales.html#/customers";
    }


}]);






