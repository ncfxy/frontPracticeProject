mainApp.controller('ordersCtrl', ['$scope', '$rootScope', '$searchService', function($scope, $rootScope, $searchService) {

    $scope.updatePlanDisplay = function(){
        var planDisplay = {};
        if(localStorage.getItem('purchaseItems') == null || localStorage.getItem('purchaseItems') == ''){
            localStorage.setItem('purchaseItems','{}');
        }
        var purchaseItems = JSON.parse(localStorage.getItem('purchaseItems'));
        var k = Object.keys(purchaseItems);
        for(var i = 0;i < k.length;i++){
            var row = $searchService.getStockInformation(parseInt(k[i]));
            row['chooseAmount'] = purchaseItems[k[i]];
            if(planDisplay[row.maker] == undefined){
                planDisplay[row.maker] = {};
                planDisplay[row.maker]['data'] = [];
                planDisplay[row.maker]['total'] = 0;
            }
            planDisplay[row.maker]['data'].push(row);
            planDisplay[row.maker]['total'] += row.price * row.chooseAmount;
        }
        k = Object.keys(planDisplay);
        var costTotal = 0;
        for(var i = 0;i < k.length;i++){
            costTotal += planDisplay[k[i]]['total'];
        }
        $scope.costTotal = costTotal;
        console.log(planDisplay);
        $scope.planDisplay = planDisplay;
        $scope.hasRecord = Object.keys(planDisplay).length == 0;
    }
    $scope.updatePlanDisplay();

    $scope.addToProcurement = function(event){
        var id = $(event.currentTarget).parents('tr').attr('data-href').split("=")[1];
        console.log(id);
        var purchaseItems = JSON.parse(localStorage.getItem('purchaseItems') || '{}');
        if(purchaseItems[id] == undefined){
            purchaseItems[id] = 1;
        }else{
            purchaseItems[id] = purchaseItems[id] + 1;
        }
        $scope.purchaseItems = purchaseItems;

        localStorage.setItem('purchaseItems',JSON.stringify(purchaseItems));

        $scope.updatePlanDisplay();
    }

    $scope.removeFromProcurement = function(event){
        var id = $(event.currentTarget).parents('tr').attr('data-href').split("=")[1];
        console.log(id);
        var purchaseItems = JSON.parse(localStorage.getItem('purchaseItems') || '{}');
        if(purchaseItems[id] == undefined){
            return;
        }else if(purchaseItems[id] > 1){
            purchaseItems[id] = purchaseItems[id] - 1;
        }else if(purchaseItems[id] == 1){
            delete purchaseItems[id];
        }
        $scope.purchaseItems = purchaseItems;

        localStorage.setItem('purchaseItems',JSON.stringify(purchaseItems));
        $scope.updatePlanDisplay();
    }


    $scope.createOrder = function(){

        var orderId = DB.getNewId('orders');
        var sql = "INSERT INTO orders VALUES(?,?,?,?);";
        var now = new Date();
        alasql(sql,[orderId, now.toISOString(), 'create', 'purchase']);
        var purchaseItems = JSON.parse(localStorage.getItem('purchaseItems') || '{}');
        var k = Object.keys(purchaseItems);
        for(var i = 0;i < k.length;i++){
            var newId = DB.getNewId('orderstock');
            sql = "INSERT INTO orderstock VALUES(?,?,?,?,?);";
            alasql(sql,[newId, orderId, parseInt(k[i]), parseInt(purchaseItems[k[i]]), 0]);
        }
        var newId = DB.getNewId('orderoperation');
        sql = "INSERT INTO orderoperation VALUES(?,?,?,?,?);";
        alasql(sql,[newId, orderId, $rootScope.user.id, 'create',now.toISOString()]);
        localStorage.setItem('purchaseItems','{}');
        showSuccess('A new purchase order has been created.');
        $scope.updatePlanDisplay();

        setTimeout('window.location="#/"',1000);
    }

    $scope.changeChooseAmount = function(row){
        if(row.chooseAmount == null || row.chooseAmount == undefined || parseInt(row.chooseAmount) < 0){
            row.chooseAmount = 1;
        }

        var purchaseItems = JSON.parse(localStorage.getItem('purchaseItems') || '{}');
        purchaseItems[row.id] = parseInt(row.chooseAmount);
        if(parseInt(row.chooseAmount) == 0){
            delete purchaseItems[row.id];
            localStorage.setItem('purchaseItems', JSON.stringify(purchaseItems));
            $scope.updatePlanDisplay();
        }
        localStorage.setItem('purchaseItems', JSON.stringify(purchaseItems));
    }

    $scope.editAmount = function(event){
        var td = $(event.currentTarget);
        editTd(td, function(txt, newTxt){
            // 判断是否有修改
            if(newTxt != txt){
                if(/^\d+$/.test(newTxt)){
                    td.html(newTxt);
                    var id = td.parents("tr").attr("data-href").split("=")[1]
                    var purchaseItems = JSON.parse(localStorage.getItem('purchaseItems') || '{}');
                    purchaseItems[id] = parseInt(newTxt);
                    if(parseInt(newTxt) == 0){
                        delete purchaseItems[id];
                    }
                    localStorage.setItem('purchaseItems',JSON.stringify(purchaseItems));
                    $scope.updatePlanDisplay();
                    $scope.$apply();
                }else{
                    showError("please input integer")
                }

            }else{
                td.html(newTxt);
            }
        });
    }


}]);