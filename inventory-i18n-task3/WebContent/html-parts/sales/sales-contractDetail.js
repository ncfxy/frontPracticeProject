
mainApp.controller('contractDetailCtrl', ['$scope', '$location', function($scope, $location) {

    var id = parseInt($location.search()['id']);

    $scope.contractId = id;

    var sql = "SELECT a.id as contractId, a.type as contractType, b.name as customerName, c.name as salesmanName,* \
                FROM contract a JOIN customer b ON a.customer = b.id JOIN users c ON a.salesman = c.id\
                WHERE a.id = ?";
    $scope.contractInfo = alasql(sql, [id])[0];

    $scope.contractInfo.sign_time = $scope.contractInfo.sign_time.slice(0,10);
    $scope.contractInfo.delivery_time = $scope.contractInfo.delivery_time.slice(0,10);
    $scope.contractInfo.validity_time = $scope.contractInfo.validity_time.slice(0,10);


    sql = "SELECT item.id, kind.text, item.code, item.maker, item.detail, item.price, item.unit, contract_item.amount FROM contract_item \
            JOIN item ON contract_item.item_id = item.id\
            JOIN kind ON item.kind = kind.id\
            WHERE contract_id = ?";

    $scope.items = alasql(sql, [$scope.contractId]);


    sql = "SELECT a.sale_order_id as orderId, b.create_time, b.state, b.delivery \
            FROM sale_order_contract a \
            JOIN sale_orders b ON a.sale_order_id = b.id \
            WHERE a.contract_id = ? ";
    $scope.orderRecords = alasql(sql, [$scope.contractId]);
    formatAllDate($scope.orderRecords, 'create_time');
    for(var i = 0;i < $scope.orderRecords.length;i++){
        var deliveryInfo = alasql("SELECT * FROM users WHERE id = ?", [$scope.orderRecords[i].delivery]);
        if(deliveryInfo.length > 0){
            $scope.orderRecords[i].delivery = deliveryInfo.name;
        }else{
            $scope.orderRecords[i].delivery = '';
        }
    }



    $scope.addToSaleOrder = function(){
        var saleOrderContracts = localStorage.getItem('saleOrderContracts') || '[]';
        saleOrderContracts = JSON.parse(saleOrderContracts);

        if(saleOrderContracts.length > 0){
            var sql = "SELECT customer FROM contract WHERE id = ?";
            var old = alasql(sql,[parseInt(saleOrderContracts[0])])[0];
            var newCome = alasql(sql, [$scope.contractId])[0];
            if(old.customer != newCome.customer){
                showError("One order can only have one customer!!");
                return;
            }
        }

        var bo = true;
        for(var i = 0;i < saleOrderContracts.length;i++){
            if(saleOrderContracts[i] == $scope.contractId){
                bo = false;
            }
        }

        if(bo){
           saleOrderContracts.push($scope.contractId);
           localStorage.setItem('saleOrderContracts', JSON.stringify(saleOrderContracts));
           showSuccess("Add To Sale Order Success!");
           window.location = "#/createOrder";
        }else{
            showError("This Contract has been added.")
        }


    }

}]);
