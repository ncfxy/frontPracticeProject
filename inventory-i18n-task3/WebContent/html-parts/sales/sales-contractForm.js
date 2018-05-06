
mainApp.controller('contractFormCtrl', ['$scope',function($scope) {


    var type1 = {}; type1.text = "once";
    var type2 = {}; type2.text = "periodic";
    $scope.contractTypes = [];
    $scope.contractTypes.push(type1);
    $scope.contractTypes.push(type2);

    $scope.contractId = DB.getNewId('contract');
    $scope.customers = alasql("SELECT * FROM customer");
    $scope.salesmen = alasql("SELECT * FROM users WHERE type = 'salesman'");
    $scope.contractType = $scope.contractTypes[0];
    $scope.sign_time = "";
    $scope.delivery_time = "";
    $scope.periodic = "0";
    $scope.validity_time = "";


    var sql = "SELECT item.id, kind.text, item.code, item.maker, item.detail, item.price, item.unit FROM item \
            JOIN kind ON item.kind = kind.id";

    $scope.allItems = alasql(sql);
    for(var i = 0;i < $scope.allItems.length;i++){
        $scope.allItems[i].amount = 0;
    }

    $scope.chooseItems = [];

    $scope.updateChooseItems = function(){
        $scope.chooseItems = [];
        for(var i = 0;i < $scope.allItems.length;i++){
            if($scope.allItems[i].amount > 0){
                $scope.chooseItems.push($scope.allItems[i]);
            }
        }
    }

    $scope.editAmount = function(event){
        var td = $(event.currentTarget);
        editTd(td, function(txt,newTxt){
            // 判断是否有修改
            if(newTxt != txt){
                if(/^\d+$/.test(newTxt)){
                    td.html(newTxt);
                    var tdAll = td.parents("tbody").find('tr');
                    var tr = td.parents("tr");
                    var index = tdAll.index(tr);
                    $scope.allItems[index].amount = parseInt(newTxt);
                    $scope.updateChooseItems();
                    $scope.$apply();
                }else{
                    showError("please input integer")
                }

            }else{
                td.html(newTxt);
            }
        })
    }

    $scope.validDate = function(date){
        var time = new Date(date);
        if(time.toString() == "Invalid Date"){
            return false;
        }else{
            return true;
        }
    }

    $scope.addContract = function(event){

        if(!$scope.customer || !$scope.salesman
            || !$scope.contractType || !$scope.sign_time
            || !$scope.delivery_time || !$scope.periodic
            || !$scope.validity_time){
            showError("Please input all information.");
            return;
        }

        if(!$scope.validDate($scope.sign_time)){
            showError('Sign time is invalid');
            return;
        }

        if(!$scope.validDate($scope.delivery_time)){
            showError('Delivery time is invalid');
            return;
        }

        if(!$scope.validDate($scope.validity_time)){
            showError('Validity time is invalid');
            return;
        }

        if(!(/^\d+$/.test($scope.periodic))){
            showError("Please input integer in periodic");
            return;
        }

        if($scope.chooseItems.length == 0){
            showError("You must select at least one items in a contract");
            return;
        }

        var sql = "INSERT INTO contract VALUES(?,?,?,?,?,?,?,?,?)";
        alasql(sql, [DB.getNewId('contract'),
                    $scope.customer.id,
                    $scope.salesman.id,
                    $scope.contractType.text,
                    new Date($scope.sign_time).toISOString(),
                    new Date($scope.delivery_time).toISOString(),
                    $scope.periodic,
                    new Date($scope.validity_time).toISOString(),
                    'valid']);

        for(var i = 0;i < $scope.chooseItems.length;i++){
            var sql = "INSERT INTO contract_item VALUES (?,?,?,?,?)";
            var newId = DB.getNewId('contract_item');
            alasql(sql, [newId, $scope.contractId, $scope.chooseItems[i].id, $scope.chooseItems[i].amount, $scope.chooseItems[i].price]);

        }

        showSuccess("Add success.");

        window.location = "#/";

    }


}]);
