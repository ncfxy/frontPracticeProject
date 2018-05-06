var DB = {};

DB.init = function() {
    if (window.confirm('are you sure to initialize database?')) {
        DB.load();
    }
};

DB.AllTablesInfo = [
    {
        "tableName": "kind",
        "describeString": "(id INT IDENTITY, text STRING)",
        "fileName": "KIND-KIND",
        "values": "(?,?)"
    },
    {
        "tableName": "item",
        "describeString": "(id INT IDENTITY, code STRING, kind INT, detail STRING, maker STRING, price INT, unit STRING)",
        "fileName": "ITEM-ITEM",
        "values": "(?,?,?,?,?,?,?)"
    },
    {
        "tableName": "whouse",
        "describeString": "(id INT IDENTITY, name STRING, addr STRING, tel STRING)",
        "fileName": "WHOUSE-WHOUSE",
        "values": "(?,?,?,?)"
    },
    {
        "tableName": "stock",
        "describeString": "(id INT IDENTITY, item INT, whouse INT, balance INT, warning_line INT)",
        "fileName": "STOCK-STOCK",
        "values": "(?,?,?,?,?)"
    },
    {
        "tableName": "trans",
        "describeString": "(id INT IDENTITY, stock INT, date DATE, qty INT, balance INT, memo STRING)",
        "fileName": "TRANS-TRANS",
        "values": "(?,?,?,?,?,?)"
    },
    {
        "tableName": "users",
        "describeString": "(id INT IDENTITY, user_id STRING, password STRING, name STRING, type STRING, belong_warehouse INT)",
        "fileName": "USER-USER",
        "values": "(?,?,?,?,?,?)"
    },
    {
        "tableName": "salesplan",
        "describeString": "(id INT IDENTITY, stock_id INT, year INT, month INT, plan_value INT)",
        "fileName": "SALESPLAN-SALESPLAN",
        "values": "(?,?,?,?,?)"
    },
    {
        "tableName": "purchaseplan",
        "describeString": "(id INT IDENTITY, stock_id INT, year INT, month INT, plan_value INT)",
        "fileName": "PURCHASEPLAN-PURCHASEPLAN",
        "values": "(?,?,?,?,?)"
    },
    {
        "tableName": "orders",
        "describeString": "(id INT IDENTITY, create_time STRING, state STRING, type STRING)",
        "fileName": "ORDERS-ORDERS",
        "values": "(?,?,?,?)"
    },
    {
        "tableName": "orderoperation",
        "describeString": "(id INT IDENTITY, order_id INT, operator INT, operation STRING, operation_time STRING)",
        "fileName": "ORDEROPERATION-ORDEROPERATION",
        "values": "(?,?,?,?,?)"
    },
    {
        "tableName": "orderstock",
        "describeString": "(id INT IDENTITY, order_id INT, stock_id INT, amount INT, purchase_price INT)",
        "fileName": "ORDERSTOCK-ORDERSTOCK",
        "values": "(?,?,?,?,?)"
    },
    {
        "tableName": "warehouse_in_out",
        "describeString": "(id INT IDENTITY, order_id INT, entry_time STRING, keeper_id INT, type STRING, whouse_id INT)",
        "fileName": "WHOUSEINOUT-WHOUSEINOUT",
        "values": "(?,?,?,?,?,?)"
    },
    {
        "tableName": "warehouse_in_out_item",
        "describeString": "(id INT IDENTITY, in_out_id INT, trans_id INT)",
        "fileName": "WHOUSEINOUTITEM-WHOUSEINOUTITEM",
        "values": "(?,?,?)"
    },
    {
        "tableName": "customer",
        "describeString": "(id INT IDENTITY, name STRING, contact_person STRING, sex INT, tel STRING, addr STRING)",
        "fileName": "CUSTOMER-CUSTOMER",
        "values": "(?,?,?,?,?,?)"
    },
    {
        "tableName": "contract",
        "describeString": "(id INT IDENTITY, customer INT, salesman INT, type STRING, sign_time STRING, delivery_time STRING, periodic INT, validity_time STRING, state STRING)",
        "fileName": "CONTRACT-CONTRACT",
        "values": "(?,?,?,?,?,?,?,?,?)"
    },
    {
        "tableName": "contract_item",
        "describeString": "(id INT IDENTITY, contract_id INT, item_id INT, amount INT, price INT)",
        "fileName": "CONTRACTITEM-CONTRACTITEM",
        "values": "(?,?,?,?,?)"
    },
    {
        "tableName": "sale_orders",
        "describeString": "(id INT IDENTITY, create_time STRING, state STRING, type STRING, customer INT, delivery INT)",
        "fileName": "SALEORDERS-SALEORDERS",
        "values": "(?,?,?,?,?,?)"
    },
    {
        "tableName": "sale_order_item",
        "describeString": "(id INT IDENTITY, sale_order_id INT, item_id INT, amount INT, price INT)",
        "fileName": "SALEORDERITEM-SALEORDERITEM",
        "values": "(?,?,?,?,?)"
    },
    {
        "tableName": "sale_order_stock",
        "describeString": "(id INT IDENTITY, sale_order_item_id INT, stock_id INT, amount INT)",
        "fileName": "SALEORDERSTOCK-SALEORDERSTOCK",
        "values": "(?,?,?,?)"
    },
    {
        "tableName": "sale_order_contract",
        "describeString": "(id INT IDENTITY, sale_order_id INT, contract_id INT)",
        "fileName": "SALEORDERCONTRACT-SALEORDERCONTRACT",
        "values": "(?,?,?)"
    }
];


DB.load = function() {
    alasql.options.joinstar = 'overwrite';

    // Classes
    // alasql('DROP TABLE IF EXISTS kind;');
    // alasql('CREATE TABLE kind(id INT IDENTITY, text STRING);');
    // var pkind = alasql.promise('SELECT MATRIX * FROM CSV("data/KIND-KIND.csv", {headers: true})').then(function(kinds) {
    // 	for (var i = 0; i < kinds.length; i++) {
    // 		var kind = kinds[i];
    // 		alasql('INSERT INTO kind VALUES(?,?);', kind);
    // 	}
    // });

    var tables = []; //[ pkind, pitem, pwhouse, pstock, ptrans, users ];

    function createTables(tableName, describeString, fileName, values){
        alasql('DROP TABLE IF EXISTS '+ tableName +';');
        alasql('CREATE TABLE '+tableName+describeString+';');
        var lists = alasql.promise('SELECT MATRIX * FROM CSV("data/'+fileName+'.csv", {headers: true})').then(
            function(lists){
                for(var i = 0;i < lists.length;i++){
                    var list = lists[i];
                    alasql("INSERT INTO "+tableName+" VALUES"+values+";", list);
                }
            })
        tables.push(lists);


    }

    for(var i = 0;i < DB.AllTablesInfo.length;i++){
        var table = DB.AllTablesInfo[i];
        createTables(table.tableName, table.describeString, table.fileName, table.values);
    }


    // Reload page
    Promise.all(tables).then(function() {
        window.location.reload(true);
    });
};


// 将数据写回到文件中进行保存
DB.writeBackToFile = function(tableName){
    var tableInfo = null;
    for(var i = 0;i < DB.AllTablesInfo.length;i++){
        if(tableName == DB.AllTablesInfo[i].tableName){
            tableInfo = DB.AllTablesInfo[i];
            break;
        }
    }
    if(tableInfo == null){
        alert("This table don't exist");
        return;
    }

    var str = DB.outputTable(tableInfo.tableName);
    FILE.doSave(str, 'text/csv', tableInfo.fileName+".csv");
}

// 将所有的数据库写回到文件
DB.writeAllBackToFile = function(){
    for(var i = 0;i < DB.AllTablesInfo.length;i++){
        DB.writeBackToFile(DB.AllTablesInfo[i].tableName);
    }
}

// 为该表生成新的可插入的id
DB.getNewId = function(dbName){
    var sql = "SELECT * FROM " + dbName + " order by id DESC;";
    var result = alasql(sql)[0];
    return result.id + 1;
}


// 输出整个Table中的记录
DB.outputTable = function(tableName){
    var sql = 'SELECT * FROM ' + tableName;
    var res = alasql(sql);
    var k = Object.keys(res[0]);
    var str = "";
    str += k[0];
    for(var j = 1;j < k.length;j++){
        str += "," + k[j];
    }
    str += "\n";
    for(var i = 0;i < res.length;i++){
        str += res[i][k[0]];
        for(var j = 1;j < k.length;j++){
            str += "," + res[i][k[j]] ;
        }
        str += "\n";
    }
    console.log(str);
    return str;
}




DB.remove = function() {
    if (window.confirm('are you sure to delete dababase?')) {
        alasql('DROP localStorage DATABASE STK')
    }
    localStorage.clear();
};

// add commas to number
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// DO NOT CHANGE!
alasql.promise = function(sql, params) {
    return new Promise(function(resolve, reject) {
        alasql(sql, params, function(data, err) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

// connect to database
try {
    alasql('ATTACH localStorage DATABASE STK;');
    alasql('USE STK;');
} catch (e) {
    alasql('CREATE localStorage DATABASE STK;');
    alasql('ATTACH localStorage DATABASE STK;');
    alasql('USE STK;');
    DB.load();
}
