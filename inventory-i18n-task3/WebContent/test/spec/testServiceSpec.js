
describe("test mock angular service sample", function(){

    angular.module('services',[])
    .service('sampleSvc', ['$window', 'modalSvc',function($window, modalSvc){
        this.showDialog = function(message, title){
            if(title){
                modalSvc.showModalDialog({
                    title: title,
                    message: message
                });
            } else {
                $window.alert(message);
            }
        };
    }]);

    var mockWindow, mockModalSvc, sampleSvcObj;
    beforeEach(function(){
        module(function($provide){
            $provide.service('$window', function(){
                this.alert = jasmine.createSpy('alert');
            });
            $provide.service('modalSvc', function(){
                this.showModalDialog = jasmine.createSpy('showModalDialog');
            });
        });
        module('services');
    });

    beforeEach(inject(function($window, modalSvc, sampleSvc){
        mockWindow = $window;
        mockModalSvc = modalSvc;
        sampleSvcObj = sampleSvc;
    }))

    it('should show alert when title is not passed into showDialog', function(){
        var message = "Some message";
        sampleSvcObj.showDialog(message);

        expect(mockWindow.alert).toHaveBeenCalledWith(message);
        expect(mockModalSvc.showModalDialog).not.toHaveBeenCalled();
    });

})


describe("test angular services", function() {

    describe("test $selectService", function(){

        var $selectService = new MyService.$selectService();

        it('should get right warehouse List',function(){
            var warehouseObj = [
                    {"warehouseId":1,"warehouseName":"Tokyo"},
                    {"warehouseId":2,"warehouseName":"Shanghai"},
                    {"warehouseId":3,"warehouseName":"Singapore"},
                    {"warehouseId":4,"warehouseName":"Delhi"}];
            expect($selectService.getWarehouseList()).toEqual(warehouseObj);
            var allOption = {"warehouseId":0,"warehouseName":"All"}
            warehouseObj.unshift(allOption);
            expect($selectService.getWarehouseListWithAll()).toEqual(warehouseObj);
        });

        it('should get all item List', function(){
            expect($selectService.getItemList().length).toEqual(18);
        });

        it('should get all classification', function(){
            var classification = [
                {"classificationId":0,"classificationName":"All"},
                {"classificationId":1,"classificationName":"CPU"},
                {"classificationId":2,"classificationName":"Motherboard"},
                {"classificationId":3,"classificationName":"Memory"},
                {"classificationId":4,"classificationName":"Video Card"},
                {"classificationId":5,"classificationName":"HDD"},
                {"classificationId":6,"classificationName":"Case"},
                {"classificationId":7,"classificationName":"Globe"},
                {"classificationId":8,"classificationName":"Tools"}];
            expect($selectService.getClassificationListWithAll()).toEqual(classification);
        });

        it('should get all makers', function(){
            var allMakers = [
                {"maker":"All"},{"maker":"Intel"},
                {"maker":"AMD"},{"maker":"ASUS"},
                {"maker":"ASRock"},{"maker":"GIGABYTE"},
                {"maker":"PATRIOT"},{"maker":"CFD"},
                {"maker":"ZOTAC"},{"maker":"MSI"},
                {"maker":"WesternDigital"},{"maker":"Seagate"},
                {"maker":"Antec"},{"maker":"ZALMAN"},
                {"maker":"Maruwa"},{"maker":"HOZAN"},{"maker":"E-value"}];
            expect($selectService.getMakerListWithAll()).toEqual(allMakers);
        })

    });

    describe("test $searchService", function(){
        var $searchService = new MyService.$searchService();

        it('should get the detail information of this stock', function(){
            var stockDetail = {
                "id":1, "name":"Tokyo", "text":"CPU", "code":"CPU01", "maker":"Intel",
                "detail":"Core i7-6700K", "price":38871, "balance":69, "unit":"Pcs",
                "warning_line":30, "item":1};
            expect($searchService.getStockInformation(1)).toEqual(stockDetail);
        });

        it('should get the right stocks', function(){
            var stocks = $searchService.searchStockInformation(1,null,null);
            for(var i = 0;i < stocks.length;i++){
                expect(stocks[i].name).toEqual('Tokyo');
            }

            var stocks = $searchService.searchStockInformation(1,1,null);
            for(var i = 0;i < stocks.length;i++){
                expect(stocks[i].name).toEqual('Tokyo');
                expect(stocks[i].text).toEqual('CPU');
            }

            var stocks = $searchService.searchStockInformation(1,1,"01");
            for(var i = 0;i < stocks.length;i++){
                expect(stocks[i].name).toEqual('Tokyo');
                expect(stocks[i].text).toEqual('CPU');
                expect(stocks[i].code).toContain('CPU');
            }

        })
    });



});