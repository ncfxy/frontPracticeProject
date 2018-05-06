
function writeHeader(pageName){
    document.write('<link href="https://cdn.bootcss.com/bootstrap/3.3.6/css/bootstrap.css" rel="stylesheet" />');
    document.write('<link href="css/main.css" rel = "stylesheet" />');
    document.write('<script src="https://cdn.bootcss.com/alasql/0.2.6/alasql.min.js"></script>');
    document.write('<script src="https://cdn.bootcss.com/jquery/2.2.4/jquery.min.js"></script>');
    document.write('<script src="https://cdn.bootcss.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>');
    document.write('<script src="https://cdn.bootcss.com/angular.js/1.4.8/angular.min.js"></script>');
    document.write('<script src="https://cdn.bootcss.com/angular.js/1.4.8/angular-route.min.js"></script>');
    document.write('<script src="https://cdn.bootcss.com/Chart.js/2.5.0/Chart.min.js"></script>');
    document.write('<script src="https://cdn.bootcss.com/require.js/2.3.3/require.min.js"></script>');
    document.write('<script src="js/common.js"></script>');
    document.write('<script src="js/db.js"></script>');
    document.write('<script src="js/util.js"></script>');
    document.write('<script src="js/print-helper.js"></script>');
    document.write('<script src="js/'+pageName+'.js"></script>');
    document.write('<script src="build/controller-build.js"></script>');
}
