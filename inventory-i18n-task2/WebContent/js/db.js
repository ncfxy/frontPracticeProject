var DB = {};

DB.init = function() {
	if (window.confirm('are you sure to initialize database?')) {
		DB.load();
	}
};

DB.load = function() {
	// personal info
	alasql('DROP TABLE IF EXISTS emp;');
	alasql('CREATE TABLE emp(id INT IDENTITY, number STRING, name STRING, sex INT, birthday DATE, tel STRING, ctct_name STRING, ctct_addr STRING, ctct_tel STRING, pspt_no STRING, pspt_date STRING, pspt_name STRING, rental STRING);');
	var pemp = alasql.promise('SELECT MATRIX * FROM CSV("data/EMP-EMP.csv", {headers: true})').then(function(emps) {
		for (var i = 0; i < emps.length; i++) {
			alasql('INSERT INTO emp VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?);', emps[i]);
		}
	});

	// address
	alasql('DROP TABLE IF EXISTS addr;');
	alasql('CREATE TABLE addr(id INT IDENTITY, emp INT, zip STRING, state STRING, city STRING, street STRING, bldg STRING, house INT);');
	var paddr = alasql.promise('SELECT MATRIX * FROM CSV("data/ADDR-ADDR.csv", {headers: true})').then(
			function(addresses) {
				for (var i = 0; i < addresses.length; i++) {
					alasql('INSERT INTO addr VALUES(?,?,?,?,?,?,?,?);', addresses[i]);
				}
			});

	// family
	alasql('DROP TABLE IF EXISTS family;');
	alasql('CREATE TABLE family(id INT IDENTITY, emp INT, name STRING, sex INT, birthday STRING, relation STRING, cohabit INT, care INT);');
	var pfamily = alasql.promise('SELECT MATRIX * FROM CSV("data/FAMILY-FAMILY.csv", {headers: true})').then(
			function(families) {
				for (var i = 0; i < families.length; i++) {
					alasql('INSERT INTO family VALUES(?,?,?,?,?,?,?,?);', families[i]);
				}
			});

	// education
	alasql('DROP TABLE IF EXISTS edu;');
	alasql('CREATE TABLE edu(id INT IDENTITY, emp INT, school STRING, major STRING, grad STRING);');
	var pedu = alasql.promise('SELECT MATRIX * FROM CSV("data/EDU-EDU.csv", {headers: true})').then(function(edus) {
		for (var i = 0; i < edus.length; i++) {
			alasql('INSERT INTO edu VALUES(?,?,?,?,?);', edus[i]);
		}
	});

	// choice
	alasql('DROP TABLE IF EXISTS choice;');
	alasql('CREATE TABLE choice(id INT IDENTITY, name STRING, text STRING);');
	var pchoice = alasql.promise('SELECT MATRIX * FROM CSV("data/CHOICE-CHOICE.csv", {headers: true})').then(
			function(choices) {
				for (var i = 0; i < choices.length; i++) {
					alasql('INSERT INTO choice VALUES(?,?,?);', choices[i]);
				}
			});

	// appendix_index
	alasql('DROP TABLE IF EXISTS appendix_index;');
	alasql('CREATE TABLE appendix_index(id INT IDENTITY, index_name STRING);');
	var pappendix_index = alasql.promise('SELECT MATRIX * FROM CSV("data/APPENDIX-INDEX.csv", {headers: true})').then(
		function(apps){
			for(var i = 0;i < apps.length;i++){
				alasql('INSERT INTO appendix_index VALUES(?, ?);', apps[i]);
			}
		});

	// appendix_appendix
	alasql('DROP TABLE IF EXISTS appendix_appendix;');
	alasql('CREATE TABLE appendix_appendix(id INT IDENTITY, emp INT, appendix_id INT, appendix_value STRING);');
	var pappendix_appendix = alasql.promise('SELECT MATRIX * FROM CSV("data/APPENDIX-APPENDIX.csv", {headers: true})').then(
		function(apps){
			for(var i = 0;i < apps.length;i++){
				alasql('INSERT INTO appendix_appendix VALUES(?, ?, ?, ?);', apps[i]);
			}
		});

	// performance
	alasql('DROP TABLE IF EXISTS performance');
	alasql('CREATE TABLE performance(id INT IDENTITY, emp INT, time STRING, target_action INT, organization INT, independence INT, commitment INT, adaptability INT, innovation INT, initiative INT, communication INT, leadership INT, overall DECIMAL(2,2));');
	var pperformance  = alasql.promise('SELECT MATRIX * FROM CSV("data/PERFORMANCE-PERFORMANCE.csv", {headers: true})').then(
		function(apps){
			for(var i = 0;i < apps.length;i++){
				alasql('INSERT INTO performance VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?);', apps[i]);
			}
		});


	// reload html
	Promise.all([ pemp, paddr, pfamily, pedu, pchoice, pappendix_index, pappendix_appendix, pperformance]).then(function() {
		window.location.reload(true);
	});
};

DB.remove = function() {
	if (window.confirm('are you sure do delete dababase?')) {
		alasql('DROP localStorage DATABASE EMP')
	}
};

DB.choice = function(id) {
	// var choices = alasql('SELECT text FROM choice WHERE id = ?', [ id ]);
	// if (choices.length) {
	// 	return choices[0].text;
	// } else {
	// 	return '';
	// }
	cs = DB.memoryData['choice'];
	for(var i = 0;i < cs.length;i++){
		if(cs[i].id == id)return cs[i].text;
	}
	return '';
};

DB.choices = function(name) {
	return alasql('SELECT id, text FROM choice WHERE name = ?', [ name ]);
};

DB.dechoice = function(txt) {
	var choices = alasql('SELECT id FROM choice WHERE text = ?', [ txt ]);
	if(choices.length){
		return choices[0].id;
	}else{
		return '';
	}
}

DB.describe = function(tableName){
	var tableDescription = {
		'emp':{
			columnName: ['id','number','name','sex','birthday','tel','ctct_name','ctct_addr', 'ctct_tel', 'pspt_no', 'pspt_date', 'pspt_name', 'rental'],
			needChoice: [0,0,0,1,0,0,0,0,0,0,0,0,1]
		},
		'performance':{
			columnName: ['id','emp','time','target_action','organization','independence','commitment','adaptability','innovation','initiative','communication','leadership','overall']
		}

	}

	return tableDescription[tableName];
}

DB.generateId = function(tableName){
	var records = alasql('SELECT * FROM '+ tableName);
 	var max = 1;
 	for(var i = 0;i < records.length;i++){
 		if(records[i]['id'] > max){
 			max = records[i]['id'];
 		}
 	}
 	return max + 1;
}

DB.memoryData = {}

DB.loadToMemory = function(){
	DB.memoryData['emp'] = alasql('SELECT * FROM emp');
	DB.memoryData['addr'] = alasql('SELECT * FROM addr');
	DB.memoryData['family'] = alasql('SELECT * FROM family');
	DB.memoryData['edu'] = alasql('SELECT * FROM edu');
	DB.memoryData['choice'] = alasql('SELECT * FROM choice');
	DB.memoryData['appendix_index'] = alasql('SELECT * FROM appendix_index');
	DB.memoryData['appendix_appendix'] = alasql('SELECT * FROM appendix_appendix');
	DB.memoryData['performance'] = alasql('SELECT * FROM performance');
}

DB.loadAppendix = function(){
	DB.memoryData['appendix_index'] = alasql('SELECT * FROM appendix_index');
	DB.memoryData['appendix_appendix'] = alasql('SELECT * FROM appendix_appendix');
}

DB.selectEmpById = function(id){
	var result = [];
	var emps = DB.memoryData['emp'];
	for(var i = 0;i < emps.length;i++){
		if(id == emps[i]['id']){
			result.push(emps[i]);
		}
	}
	return result;
}

DB.selectTableByEmpId = function(tableName, empId){
	var result = [];
	var records = DB.memoryData[tableName];
	for(var i = 0;i < records.length;i++){
		if(empId == records[i]['emp']){
			result.push(records[i]);
		}
	}
	return result;
}



// connect to database
try {
	alasql('ATTACH localStorage DATABASE EMP');
	alasql('USE EMP');
} catch (e) {
	alasql('CREATE localStorage DATABASE EMP');
	alasql('ATTACH localStorage DATABASE EMP');
	alasql('USE EMP');
	DB.load();
}

DB.loadToMemory();