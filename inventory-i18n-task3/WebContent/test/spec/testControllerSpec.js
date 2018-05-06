describe("test angular controller sample", function(){

    angular.module('controllers',[])
        .controller('FirstController',['$scope','dataSvc', function($scope, dataSvc){
            $scope.saveData = function(){
                dataSvc.save($scope.bookDetails).then(function(result){
                    $scope.bookDetails = {};
                    $scope.bookForm.$setPristine();
                });
            };

            $scope.numberPattern = /^\d*$/;
        }]);

    beforeEach(function(){
        module(function($provide){
            $provide.factory('dataSvc',['$q', function($q){
                function save(data){
                    if(passPromise){
                        return $q.when();
                    }else{
                        return $q.reject();
                    }
                }
                return {
                    save: save
                };
            }]);
        });
        module('controllers');
    });

    var scope, mockDataSvc, firstController;
    beforeEach(inject(function($rootScope, $controller, dataSvc){
        scope = $rootScope.$new();
        mockDataSvc = dataSvc;
        spyOn(mockDataSvc, 'save').and.callThrough();
        firstController = $controller('FirstController', {
            $scope: scope,
            dataSvc: mockDataSvc
        });
    }));


    it('should have assign rightpattern to numberPattern', function(){
        expect(scope.numberPattern).toBeDefined();
        expect(scope.numberPattern.test("100")).toBe(true);
        expect(scope.numberPattern.test("100aa")).toBe(false);
        expect(5).toEqual(5);
    });

    it('should call save method on dataSvc on calling saveData', function(){
        scope.bookDetails = {
            bookId: 1,
            name: "Mastering Web application development using AngularJS",
            author: "Peter and Pawel"
        };
        scope.bookForm = {
            $setPristine: jasmine.createSpy('$setPristine')
        }
        passPromise = true;
        scope.saveData();
        scope.$digest();
        expect(mockDataSvc.save).toHaveBeenCalled();
        expect(scope.bookDetails).toEqual({});
        expect(scope.bookForm.$setPristine).toHaveBeenCalled();
    });


});