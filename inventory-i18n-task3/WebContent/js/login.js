
"use strict";

    var mainApp = angular.module("mainApp", []);

    dealWithHeader(mainApp);

    mainApp.controller('loginCtrl', function($scope) {
        $scope.username = 'buyer1';
        $scope.password = 'buyer1';

        $scope.login = function(){
            var username = $scope.username;
            var pwd = UTIL.md5($scope.password);

            var sql = "SELECT * FROM users WHERE user_id = ?";
            var users = alasql(sql, [username]);
            if(users.length == 0){
                alert("This user is not exist.");
                return;
            }else{
                var user = users[0];
                if(user.password != pwd){
                    alert("Password is not right, Please try again.");
                    return;
                }else{
                    user.password = null;
                    user.warehouse_name = alasql("SELECT * FROM whouse WHERE id = ?",[user.belong_warehouse])[0].name;
                    localStorage.setItem('user', JSON.stringify(user));
                    window.location = "index.html";
                }
            }

        }
    });
