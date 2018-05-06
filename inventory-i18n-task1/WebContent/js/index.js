// read data from database
var employees = alasql('SELECT * FROM employees;');

// creating html table
var tbody = $('tbody');
for (var i = 0; i < employees.length; i++) {
	var employee = employees[i];
	var tr = $('<tr></tr>');
	tr.append('<td><a href="detail.html?emp_no=' + employee.emp_no + '">' + employee.emp_no + '</a></td>');
	tr.append('<td>' + employee.first_name + '</td>');
	tr.append('<td>' + employee.last_name + '</td>');
	tr.append('<td>' + employee.gender + '</td>');
	tr.appendTo(tbody);
}
