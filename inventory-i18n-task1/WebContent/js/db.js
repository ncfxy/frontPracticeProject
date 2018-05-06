var DB = {
	init : function() {
		if (window.confirm('are you sure to initialize database？')) {
			DB.load();
		}
	},

	load : function() {
		// load csv file
		console.log('creating table..');
		alasql('DROP TABLE IF EXISTS employees;');
		alasql('CREATE TABLE employees(emp_no INT, first_name STRING, last_name STRING, gender STRING);');
		var pemployees = alasql.promise('SELECT MATRIX * FROM CSV("data/employees.csv", {headers: true})').then(
				function(employees) {
					console.log('adding employee..');
					for (var i = 0; i < employees.length; i++) {
						alasql('INSERT INTO employees VALUES(?,?,?,?);', employees[i]);
					}
				});

		// reload html
		Promise.all([ pemployees ]).then(function() {
			console.log('reloading html..');
			window.location.reload(true);
		});
	},

	remove : function() {
		if (window.confirm('do you really want to delete database?')) {
			alasql('DROP localStorage DATABASE TEST');
		}
	}
};

// initialize database
try {
	alasql('ATTACH localStorage DATABASE TEST');
	alasql('USE TEST');
	console.log('connected to database');
} catch (e) {
	console.log('creating database..');
	alasql('CREATE localStorage DATABASE TEST');
	alasql('ATTACH localStorage DATABASE TEST');
	alasql('USE TEST');
	DB.load();
}
