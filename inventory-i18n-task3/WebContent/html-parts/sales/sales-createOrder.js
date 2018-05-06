

mainApp.controller('createSalesOrderCtrl', ['$scope', '$rootScope', function($scope, $rootScope){


    $scope.updatePage = function(){

        var saleOrderContracts = localStorage.getItem('saleOrderContracts') || '[]';
        var saleOrderContracts = JSON.parse(saleOrderContracts);

        var sumItems = {};
        $scope.contractList = [];

        if(saleOrderContracts.length == 0){
            $scope.hasRecord = true;
        }else{
            $scope.hasRecord = false;
        }


        for(var i = 0;i < saleOrderContracts.length;i++){
            var sql = "SELECT a.id as contractId, a.type as contractType, \
                    b.name as customerName, c.name as salesmanName,* \
                    FROM contract a JOIN customer b ON a.customer = b.id \
                    JOIN users c ON a.salesman = c.id \
                    WHERE a.id = ?";
            var contract = alasql(sql, [parseInt(saleOrderContracts[i])])[0];
            contract.sign_time = contract.sign_time.slice(0,10);
            contract.delivery_time = contract.delivery_time.slice(0,10);
            contract.validity_time = contract.validity_time.slice(0,10);

            $scope.contractList.push(contract);

            sql = "SELECT item.id, kind.text, item.code, item.maker, \
                item.detail, item.price, item.unit, contract_item.amount FROM contract_item \
                JOIN item ON contract_item.item_id = item.id\
                JOIN kind ON item.kind = kind.id\
                WHERE contract_id = ?";

            var tmps = alasql(sql, [parseInt(saleOrderContracts[i])]);
            for(var j = 0;j < tmps.length;j++){
                if(sumItems[tmps[j].id] == undefined){
                    sumItems[tmps[j].id] = tmps[j].amount;
                }else{
                    sumItems[tmps[j].id] = sumItems[tmps[j].id] + tmps[j].amount;
                }
            }
        }

        $scope.items = [];
        var k = Object.keys(sumItems);
        for(var i = 0; i < k.length;i++){
            var sql = 'SELECT item.id, kind.text, item.code, item.maker, item.detail, item.price, item.unit \
                FROM item \
                JOIN kind on kind.id = item.kind \
                WHERE item.id = ?';
            var itemInfo = alasql(sql,[parseInt(k[i])])[0];
            itemInfo.amount = sumItems[k[i]];
            $scope.items.push(itemInfo);
        }
    }

    $scope.updatePage();

    $scope.removeContract = function(event, contractId){
        var saleOrderContracts = localStorage.getItem('saleOrderContracts') || '[]';
        var saleOrderContracts = JSON.parse(saleOrderContracts);

        var newSaleOrderContracts = [];
        for(var i = 0;i < saleOrderContracts.length;i++){
            if(saleOrderContracts[i] != contractId){
                newSaleOrderContracts.push(saleOrderContracts[i]);
            }
        }

        localStorage.setItem('saleOrderContracts',JSON.stringify(newSaleOrderContracts));

        $scope.updatePage();
        // $scope.$apply();

        event.preventDefault();
        event.stopPropagation();
        return false;
    }


    $scope.createSaleOrder = function(){

        var sql = "INSERT INTO sale_orders VALUES(?,?,?,?,?,?);";
        var orderId = DB.getNewId("sale_orders");
        var now = new Date();
        alasql(sql, [orderId, now.toISOString(), 'create', 'sale', $scope.contractList[0].customer, 0]);

        var contracts = JSON.parse(localStorage.getItem('saleOrderContracts') || '[]');
        for(var i = 0;i < contracts.length;i++){
            sql = "INSERT INTO sale_order_contract VALUES(?,?,?)";
            alasql(sql, [DB.getNewId('sale_order_contract'), orderId, contracts[i]]);
        }


        sql = "INSERT INTO sale_order_item VALUES(?,?,?,?,?)";
        for(var i = 0;i < $scope.items.length;i++){
            var newId = DB.getNewId("sale_order_item");
            alasql(sql, [newId, orderId, $scope.items[i].id, $scope.items[i].amount, $scope.items[i].price]);
        }

        sql = "INSERT INTO orderoperation VALUES(?,?,?,?,?);";
        alasql(sql, [DB.getNewId('orderoperation'), orderId, $rootScope.user.id, "create", new Date().toISOString()]);

        localStorage.setItem('saleOrderContracts','[]');

        showSuccess("Create sales order success!");

        $scope.updatePage();
        window.location = "#/";
    }

}]);