// parse request parameters
var emp_no = parseInt($.url().param('emp_no'));
console.log('emp_no: ' + emp_no);

// read data from database
var employees = alasql('SELECT * FROM employees WHERE emp_no = ' + emp_no + ';');
var employee = employees[0]; // only one employee
console.log('emp: ' + employee);

var app = new Vue({
    el: '#app',
    data: {
        emp_no: emp_no,
        first_name: employee.first_name,
        last_name: employee.last_name,
        gender: employee.gender
    }
})