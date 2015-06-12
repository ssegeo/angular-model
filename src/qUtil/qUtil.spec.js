describe('qUtilsService', function () {
    var qUtil;

    beforeEach(module('angular.model'));
    beforeEach(inject(function (_qUtilService_) {
        qUtil = _qUtilService_;
    }));

    afterEach(function () {});

    describe('bindObject(): Bind object methods to a context', function () {
        it('is defined', function () {
            assert.isFunction(qUtil.bindObject);
        });

        it('sets context of object\'s methods ', function () {
            var obj1 = {
                    name: 'obj1',
                    getName: function () {
                        return this.name;
                    }
                },
                obj2 = {
                    name: 'obj2',
                    getName: function () {
                        return this.name;
                    }
                };

            qUtil.bindObject(obj2, obj1);
            expect(obj2.getName()).to.be.equal(obj1.getName());
        });
    });
});