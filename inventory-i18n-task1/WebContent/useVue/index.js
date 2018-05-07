// read data from database
var employees = alasql('SELECT * FROM employees;');

var app = new Vue({
    el: '#app',
    data: {
        message: 'hello',
        lines: employees
    },
    methods:{
        initDB: function () {
            DB.init();
        }
    }
});