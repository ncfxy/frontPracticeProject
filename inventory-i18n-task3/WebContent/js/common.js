
// 通过ncfxy-include标签来载入静态文件
function includeFiles(){
    $('[ncfxy-include]').each(function(){
        var filename = $(this).attr('ncfxy-include');
        var target = $(this);
        $.get({
            url: filename,
            async: false		// 同步进行加载
        }).done(function(data){
            target.html(data);
        }).fail(function(data){
            target.html(data.responseText);
        });
    });
}

// includeFiles();


function formatAllDate(array, key){
    for(var i = 0;i < array.length;i++){
        array[i][key] = new Date(array[i][key]).toLocaleString();
    }
}


// 编辑td,并使用invoke函数来处理txt和newTxt
function editTd(td, invoke){
    // var td = $(event.currentTarget);
    if(td.find('input').length > 0)return;
    var txt = td.text();
    var input = $('<input type="text" class="form-control  input-sm text-center" value="' + txt + '"/>');
    td.html(input);
    input.click(function(){return false;});
    // 获取焦点
    input.trigger("focus");
    input.trigger("select");
    // 失去焦点后提交内容，重新变为文本
    input.blur(function(){
        var newTxt = $(this).val();
        invoke(txt,newTxt);

    });
    input.keypress(function(e){
        if(e.key == 'Enter'){
            $(this).trigger("blur");
        }
    });
}

/*
    $scope.warehouse 保存所有的warehouse选项
    $scope.classificationChoice 保存商品的所有分类
    $scope.year当前是哪一年的销售计划
    $scope.hideMonthlyPlan 是否显示月度计划
    $scope.yearlyPlan 保存各商品整年的计划
    $scope.monthlyPlan 保存选定商品各个月的计划
    $scope.chooseItem 保存选定的商品信息
    $scope.records 符号搜索条件的商品列表
    $scope.q1 搜索条件一
    $scope.q2 搜索条件二
    $scope.inputCode 搜索条件三
    这个函数中保存的是销售和采购计划共用的配置
*/
function planCommon($scope, dbName, $searchService){
    // 设定warehouse的选项
    var warehouse = [{warehouseId:0, warehouseName: "All"}];
    var rows = alasql('SELECT * FROM whouse;');
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var tmp = {};
        tmp.warehouseId = row.id;
        tmp.warehouseName = row.name;
        warehouse.push(tmp);
    }
    $scope.warehouseChoice = warehouse;


    // 设定classification的选项
    var classification = [{classificationId: 0, classificationName: "All"}];
    var rows = alasql('SELECT * FROM kind;');
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var tmp = {};
        tmp.classificationId = row.id;
        tmp.classificationName = row.text;
        classification.push(tmp);
    }
    $scope.classificationChoice = classification;


    // 初始化
    $scope.q1 = warehouse[0];
    $scope.q2 = classification[0];
    $scope.inputCode = '';


    $scope.year = '2017';
    $scope.hideMonthlyPlan = true;

    $scope.months = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];

    // 更换选定商品
    $scope.itemChange = function(event){
        var yearlyPlan = [];
        var monthlyPlan = [];
        var saleMonthlyPlan = [];
        if($scope.chooseItem == undefined || $scope.chooseItem == null){
            var allPlanValue = $searchService.getAllPlanValue(dbName);
            for(var i = 0;i < $scope.records.length;i++){
                var tmp = {};
                tmp.warehouse = $scope.records[i].name;
                tmp.item = $scope.records[i].text + ': '+$scope.records[i].detail;
                tmp.warning_line = $scope.records[i].warning_line;
                tmp.planValue = 0;
                for(var j = 0;j < 12;j++){
                    // var sql = "SELECT * FROM " + dbName + " WHERE stock_id=? AND year=? AND month=?";
                    // var result = alasql(sql, [$scope.records[i].stock_id, parseInt($scope.year), (j+1)])[0];
                    var result = $searchService.getPlanValueFromAll(dbName,$scope.records[i].stock_id, parseInt($scope.year), (j+1),allPlanValue);
                    tmp.planValue += result.plan_value;
                }
                tmp.unit = $scope.records[i].unit;
                yearlyPlan.push(tmp);
            }
            $scope.hideMonthlyPlan = true;
        }else{

            var yearValuePlan = 0;
            for(var i = 0;i < 12;i++){
                tmp = {};
                tmp.month = $scope.months[i];
                var sql = "SELECT * FROM " + dbName + " WHERE stock_id=? AND year=? AND month=?";
                var result = alasql(sql, [$scope.chooseItem.stock_id, parseInt($scope.year), (i+1)])[0];
                tmp.planValue = result.plan_value;
                monthlyPlan.push(tmp);
                yearValuePlan += tmp.planValue;

                saleTmp = {};
                sql = "SELECT * FROM salesplan WHERE stock_id=? AND year=? AND month=?";
                result = alasql(sql, [$scope.chooseItem.stock_id, parseInt($scope.year), (i+1)])[0];
                saleTmp.planValue = result.plan_value;
                saleMonthlyPlan.push(saleTmp);
            }
            $scope.hideMonthlyPlan = false;

            var tmp = {};
            tmp.warehouse = $scope.chooseItem.name;
            tmp.item = $scope.chooseItem.text + ': '+$scope.chooseItem.detail;
            tmp.planValue = yearValuePlan;
            tmp.unit = $scope.chooseItem.unit;
            tmp.warning_line = $scope.chooseItem.warning_line;
            yearlyPlan.push(tmp);
        }
        $scope.yearlyPlan = yearlyPlan;
        $scope.monthlyPlan = monthlyPlan;
        $scope.saleMonthlyPlan = saleMonthlyPlan;
        if($scope.chooseItem){
            $scope.drawChart();
        }
        $scope.update();
    }

    // 画出月度销售计划的统计图
    $scope.drawChart = function(){
        var values = [];
        var purchaseCal = 0;
        var chartLable = 'Default label';
        for(var i = 0;i < $scope.monthlyPlan.length;i++){
            if(dbName == 'purchaseplan'){
                purchaseCal += $scope.monthlyPlan[i].planValue - $scope.saleMonthlyPlan[i].planValue;
                values.push(purchaseCal);
            }else{
                values.push($scope.monthlyPlan[i].planValue);
            }
        }
        if($scope.chooseItem != undefined && $scope.chooseItem != null){
            if(dbName == 'purchaseplan'){
                chartLable = 'Inventory variation for '  + $scope.chooseItem.detail + " in " + $scope.year;
            }else{
                chartLable = 'Sale Plan for ' + $scope.chooseItem.detail + " in " + $scope.year;
            }
        }

        var ctx = $('#monthlySalePlanCanvas canvas').get(0).getContext("2d");
        var config = {
            type: 'line',
            data:{
                labels: $scope.months,
                datasets:[
                    {
                        label: chartLable,
                        backgroundColor : "rgba(54,162,235,0.2)",
                        borderColor : "rgba(54,162,235,1)",
                        data : values //[28,48,40,19,96,27,100]
                    }
                ],
                borderWidth: 1
            },
            options: {
                onClick:function(event,obj,a){
                    if(obj.length < 1)return;
                    var filterValue = obj[0]._chart.config.data.labels[obj[0]._index];
                    ANALYSIS.chartOnclickHandler(event, obj, filterValue);
                },
                scales:{
                    yAxes:[{
                        ticks:{
                            beginAtZero: true
                        }
                    }]
                }
            }
        }

        for(var i in Chart.instances){
            Chart.instances[i].destroy();
        }
        var myChart = new Chart(ctx, config);
        // myChart.destroy();
    }

    // 将用户修改的月度销售计划更新到数据库中
    $scope.updateMonthlyPlan = function(event){
        var table = $(event.currentTarget).parents(".panel-footer").prev().find(".table");
        var trs = table.find("tbody").find("tr");
        for(var i = 0;i < trs.length;i++){
            var tr = trs[i];
            sql = 'UPDATE ' + dbName + ' SET plan_value = ? WHERE stock_id=? AND year=? AND month=?';
            var result = alasql(sql, [parseInt($scope.monthlyPlan[i].planValue), $scope.chooseItem.stock_id, parseInt($scope.year),(i+1)]);
        }
        showSuccess("update success!");
    }

    // 双击编辑月度销售计划
    $scope.editMonthlyPlan = function(event){
        var td = $(event.currentTarget);
        editTd(td, function(txt, newTxt){
            // 判断是否有修改
            if(newTxt != txt){
                if(/^\d+$/.test(newTxt)){
                    td.html(newTxt);
                    var tdAll = td.parents("tbody").find('tr');
                    var tr = td.parents("tr");
                    var index = tdAll.index(tr);
                    $scope.monthlyPlan[index].planValue=newTxt;
                    $scope.drawChart();
                    $scope.yearlyPlan[0].planValue = $scope.yearlyPlan[0].planValue - parseInt(txt) + parseInt(newTxt);
                    $scope.update();
                    $scope.$apply();
                }else{
                    showError("please input integer")
                }

            }else{
                td.html(newTxt);
            }
        });

    }

    // 重年度销售计划中选取某商品，查看月度销售计划
    $scope.chooseItemFromYearlyPlan = function(event){
        if($scope.chooseItem != undefined){
            $scope.itemChange();
            return;
        }
        var tr = $(event.currentTarget);
        var all = tr.parent().find("tr");
        var index = all.index(tr);
        $scope.chooseItem = $scope.records[index];
        $scope.itemChange();
    }

    // 导出计划成csv格式
    $scope.export = function(){
        var content = "warehouse, maker, code, detail, stock_id, year, month, plan_value\n";

        for(var i = 0;i < $scope.records.length;i++){
            for(var j = 0;j < 12;j++){
                var sql = "SELECT * FROM " + dbName + " WHERE stock_id=? AND year=? AND month=?";
                var result = alasql(sql, [$scope.records[i].stock_id, parseInt($scope.year), (j+1)])[0];

                var stock = $searchService.getStockInformation(result.stock_id);
                content += stock.name + "," + stock.maker + "," + stock.code + "," + stock.detail + ",";
                content += result.stock_id + ","+ result.year + "," + result.month + "," + result.plan_value +"\n";

            }
        }

        var name = dbName;
        var now = new Date();
        var timeString = ''+now.getFullYear()
                        +((now.getMonth()+1) > 9? now.getMonth(): '0'+(now.getMonth()+1))
                        +(now.getDate() > 9?now.getDate():'0'+now.getDate())
                        +(now.getHours()>9?now.getHours():'0'+now.getHours())
                        +(now.getMinutes()>9?now.getMinutes():'0'+now.getMinutes())
                        +(now.getSeconds()>9?now.getSeconds():'0'+now.getSeconds())

        FILE.doSave(content, "text/csv", name +'-'+timeString+ ".csv");

        $scope.search();

        // $("#exportContent").text(content);
        // $("#exportModal").modal("show");
    }

    // 导入csv格式的数据
    $scope.importData = function(event){

        var x = $("#importFileUpload");
        var file = x.get(0).files[0]
        var reader = new FileReader();
        reader.onload = function( evt ){
            var data = evt.target.result;
            var lines = data.split("\n");
            for(var i = 1;i < lines.length;i++){
                var str = lines[i].split(",");
                var stock_id = parseInt(str[4]);
                var year = parseInt(str[5]);
                var month = parseInt(str[6]);
                var plan_value = parseInt(str[7]);
                var sql = "SELECT * FROM " + dbName + " WHERE stock_id=? AND year=? AND month=?";
                var result = alasql(sql, [stock_id,year,month]);
                if(result.length > 0){
                    sql = 'UPDATE ' + dbName + ' SET plan_value = ? WHERE stock_id=? AND year=? AND month=?';
                    alasql(sql,[plan_value,stock_id,year,month])
                }else{
                    sql = 'INSERT INTO '+ dbName + ' VALUES(?,?,?,?,?);';
                    var newId = DB.getNewId(dbName);
                    alasql(sql, [newId,stock_id,year,month,plan_value]);
                }
            }
            showSuccess("import success");
            $("#importModal").modal("hide");
            $scope.search();
        }
        reader.readAsText(file);


    }

    // 根据搜索条件搜索商品
    $scope.search = function(event){
        // 查找records
        var q1 = $scope.q1.warehouseId;
        var q2 = $scope.q2.classificationId;
        var q3 = $scope.inputCode;

        var stocks = $searchService.searchStockInformation(q1, q2, q3);

        $scope.records = stocks;
        $scope.chooseItem = undefined;
        $scope.itemChange();
    }

    $scope.search();

    // 月度计划的值发生修改
    $scope.changePlan = function(month){
        if(month.planValue == null || month.planValue == undefined || parseInt(month.planValue) < 0){
            month.planValue = 0;
        }
        // month.planValue = 123;

        $scope.drawChart();
        // $scope.yearlyPlan[0].planValue = $scope.yearlyPlan[0].planValue - parseInt(txt) + parseInt(newTxt);
        $scope.yearlyPlan[0].planValue = 0;
        for(var i = 0;i < $scope.monthlyPlan.length;i++){
            $scope.yearlyPlan[0].planValue += parseInt($scope.monthlyPlan[i].planValue);
        }
        $scope.update();
        // $scope.$apply();
    }
}


var FILE = {};

FILE.doSave = function(value, type, name){
    // value 要保存的数据
    // type 要保存的文件类型
    // name 要保存的文件名
    var blob;
    if (typeof window.Blob == "function") {
        blob = new Blob([value], {type: type});
    } else {
        var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder;
        var bb = new BlobBuilder();
        bb.append(value);
        blob = bb.getBlob(type);
    }
    var URL = window.URL || window.webkitURL;
    var bloburl = URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    if ('download' in anchor) {
        anchor.style.visibility = "hidden";
        anchor.href = bloburl;
        anchor.download = name;
        document.body.appendChild(anchor);
        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, true);
        anchor.dispatchEvent(evt);
        document.body.removeChild(anchor);
    } else if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, name);
    } else {
        location.href = bloburl;
    }
}

// 设定login区域的显示，如果已经登陆，显示用户名和logout，否则显示login链接
function dealWithHeader(app){
    var headerApp = app;
    headerApp.controller('loginShowCtrl',function($scope){
        $scope.isLogin = false;
        var user = localStorage.getItem('user');
        if(user != null || user != undefined){
            user = JSON.parse(user);
            if(user.user_id != null && user.type != null && user.user_id != '' && user.type != '' ){
                $scope.isLogin = true;
                $scope.username = user.user_id;
            }
        }

        $scope.logout = function(){
            localStorage.removeItem("user");
        }
    })
}

function showWarning(msg){
    $('#alertWarningMsg').html(msg);
    $('#myWarningAlert').show().delay( 2000 ).fadeOut('slow');
}

function showSuccess(msg){
    $('#alertSuccessMsg').html(msg);
    $('#mySuccessAlert').show().delay( 2000 ).fadeOut('slow');
}

function showError(msg){
    $('#alerErrortMsg').html(msg);
    $('#myErrorAlert').show().delay( 2000 ).fadeOut('slow');
}




MyService = {};
MyService.$selectService = function(){
    // 从数据库中获取所有的warehouse记录
    this.getWarehouseList = function(){
        var warehouse = [];
        var rows = alasql('SELECT * FROM whouse;');
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var tmp = {};
            tmp.warehouseId = row.id;
            tmp.warehouseName = row.name;
            warehouse.push(tmp);
        }
        return warehouse;
    };

    // 从数据库中获取所有的warehouse记录，外加All选项
    this.getWarehouseListWithAll = function(){
        var warehouse = [{warehouseId:0, warehouseName: "All"}];
        warehouse = warehouse.concat(this.getWarehouseList());
        return warehouse;
    };

    // 从数据库中获取所有的item记录
    this.getItemList = function(){
        var itemList = [];
        var rows = alasql("SELECT * FROM item;");
        for(var i = 0; i < rows.length; i++){
            var row = rows[i];
            itemList.push(row)
        }
        return itemList;
    }

    // 从数据库中获取所有的classification记录，外加All选项
    this.getClassificationListWithAll = function(){
        var classification = [{classificationId: 0, classificationName: "All"}];
        var rows = alasql('SELECT * FROM kind;');
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var tmp = {};
            tmp.classificationId = row.id;
            tmp.classificationName = row.text;
            classification.push(tmp);
        }
        return classification;
    }

    // 从数据库中获取所有的maker信息，外加All选项
    this.getMakerListWithAll = function(){
        var makers = [{maker: "All"}];
        var rows = alasql("SELECT maker FROM item GROUP BY maker;");
        for(var i = 0;i < rows.length;i++){
            makers.push(rows[i]);
        }
        return makers;
    }

}

MyService.$searchService = function(){
    // 通过stock_id来查询stock的详细信息
    this.getStockInformation = function(stock_id){
        sql = ' SELECT stock.id, whouse.name, kind.text, item.code, item.maker, item.detail, ';
        sql += ' item.price, stock.balance, item.unit, stock.warning_line, stock.item ';
        sql += ' FROM stock ';
        sql += ' JOIN whouse ON whouse.id = stock.whouse ';
        sql += ' JOIN item ON item.id = stock.item ';
        sql += ' JOIN kind ON kind.id = item.kind ';
        sql += ' WHERE stock.id = ? ';
        var stock = alasql(sql, [stock_id])[0];
        return stock;
    }

    this.searchStockInformation = function(whouse_id, kind_id, code){
        if(!code){
            code = "";
        }
        // build sql
        var sql = 'SELECT stock.id as stock_id, whouse.name, kind.text, item.code, item.maker, ';
        sql += ' item.detail, item.price, stock.balance, item.unit, stock.warning_line ';
        sql += ' FROM stock ';
        sql += ' JOIN whouse ON whouse.id = stock.whouse ';
        sql += ' JOIN item ON item.id = stock.item ';
        sql += ' JOIN kind ON kind.id = item.kind ';
        sql += ' WHERE item.code LIKE ?';

        sql += whouse_id ? 'AND whouse.id = ' + whouse_id + ' ' : '';
        sql += kind_id ? 'AND kind.id = ' + kind_id + ' ' : '';
        // send query
        var stocks = alasql(sql, [ '%' + code + '%' ]);
        return stocks;
    }

    // 查询某年某月某商品的计划数值
    this.getPlanValue = function(tableName, stock_id, year, month){
        stock_id = parseInt(stock_id);
        year = parseInt(year);
        month = parseInt(month);
        var sql = "SELECT * FROM " + tableName;
        sql += " WHERE stock_id = ? ";
        sql += " AND year = ? ";
        sql += " AND month = ? ";
        var res = alasql(sql, [stock_id, year, month]);
        if(res.length > 0){
            return res[0];
        }else{
            return {};
        }
    }

    // 获取所有的计划值
    this.getAllPlanValue = function(tableName){
        var sql = "SELECT * FROM " + tableName;
        var res = alasql(sql);
        return res;
    }

    // 查询某年某月某商品的计划数值，在all中搜索
    this.getPlanValueFromAll = function(tableName, stock_id, year, month, all){
        var res = [];
        for(var i = 0;i < all.length;i++){
            if(all[i].stock_id == stock_id && all[i].year == year && all[i].month == month){
                return all[i];
            }
        }
        return undefined;
    }

    // 查询入库记录或出库记录的详细系信息
    this.getWarehouseInOutByType = function(type, orderId){
        var sql = 'SELECT a.id as recordId,* FROM warehouse_in_out as a ';
        sql += ' JOIN users as b on a.keeper_id = b.id WHERE 1 = 1 ';
        if(type != undefined){
            sql += 'AND a.type = ' + "'" + type +"'";
        }
        if(orderId != undefined){
            sql += 'AND a.order_id = ' + orderId;
        }
        var results = alasql(sql);
        return results;
    }

    // 计算当前月需要采购的商品数量
    this.calculateExpectStock = function(stock_id, year, month){
        if(month == 1)return 0;
        var sql = 'select * from purchaseplan where stock_id = ? and year = ? order by month ASC';
        var purchasePlan = alasql(sql,[stock_id, parseInt(year)]);
        sql = 'select * from salesplan where stock_id = ? and year = ? order by month ASC';
        var salesplan = alasql(sql, [stock_id, parseInt(year)]);
        var sum = 0;
        for(var i = 0;i < month - 1;i++){
            sum += purchasePlan[i].plan_value - salesplan[i].plan_value;
        }
        return sum;
    }

    // 手动更新stock记录，可以是添加
    this.editStockRecord = function(whouse, item, qty, date, comment){

        // update stock record
        var rows = alasql("SELECT id, balance FROM stock WHERE whouse = ? AND item = ?", [ whouse, item ]);
        var stock_id, balance = 0;
        if(rows.length > 0){
            stock_id = rows[0].id;
            balance = rows[0].balance;
            if(balance + qty < 0){
                showError("Retrieval quantity exceed the amount in stock");
                return false;
            }
            alasql('UPDATE stock SET balance = ? WHERE id = ?', [balance + qty, stock_id]);
        } else {
            if(balance + qty < 0){
                showError("Retrieval quantity exceed the amount in stock");
                return false;
            }
            var stock_id = DB.getNewId('stock');
            alasql('INSERT INTO stock VALUES(?,?,?,?,?)', [stock_id, item, whouse, balance + qty, 0]);
        }

        // add trans record
        var trans_id =  DB.getNewId('trans');
        alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, stock_id, date.toISOString(), qty, balance + qty, comment]);
        return true;
    }
}


function registerService(mainApp){
    mainApp.service('$selectService', MyService.$selectService);
    mainApp.service('$searchService', MyService.$searchService);
}