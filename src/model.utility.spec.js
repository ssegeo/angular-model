describe('Model Utitlity Functions', function () {
    var Model,
        Collection,
        model,
        ModelUtilities,
        $q;

    beforeEach(module('angular.model'));
    beforeEach(inject(function (_$q_, _ModelFactory_, _ModelUtilitiesFactory_) {
        Model = _ModelFactory_;
        ModelUtilities = _ModelUtilitiesFactory_;

        model = new Model();
    }));

    afterEach(function () {});

    describe('Constructor', function () {
        it('keeps a reference to the model instance', function () {
            var model = {
                $id: 809
            };

            var utilities = new ModelUtilities(model);
            expect(utilities.$model).to.be.ok;

            expect(utilities.$model.$id).to.be.equal(809);
        });

        it('binds all its methods to the model instance', function () {
            var utilities = new ModelUtilities({
                $id: 809
            });

            expect(utilities.getId()).to.equal(809);
        });
    });

    describe('getId()', function () {
        it('is defined', function () {
            assert.isFunction(model.$fn.getId);
        });

        it('always returns a unique id for a model instance', function () {
            var model = new Model();

            // before explicitly setting an id for the model
            expect(model.$fn.getId()).to.be.ok;

            // implicit model id
            model.id = 809;
            expect(model.$fn.getId()).to.be.equal(809);
        });
    });

    describe('save(): Persistently Save Model Attributes to the server', function () {
        it('is defined', function () {
            assert.isFunction(model.$fn.save);
        });

        it('returns a promise', function () {
            var promise = model.$fn.save();

            assert.isFunction(promise.then);
        });
    });

    describe('remove(): Persistently delete a Model', function () {
        it('is defined', function () {
            assert.isFunction(model.$fn.remove);
        });

        it('returns a promise', function () {
            var promise = model.$fn.remove();

            assert.isFunction(promise.then);
        });
    });

    describe('isBusy(): Check if there is an active http request', function () {
        it('is defined', function () {
            assert.isFunction(model.$fn.isBusy);
        });
    });

    describe('isNew(): determine if a model is newly created', function () {
        it('is defined', function () {
            assert.isFunction(model.$fn.isNew);
        });

        it('determines if a model is new', function () {
            var model1 = new Model({
                    name: 'sqomp'
                }),
                model2 = new Model({
                    id: 809,
                    name: 'israel'
                });

            expect(model1.$fn.isNew()).to.be.true;
            expect(model2.$fn.isNew()).to.be.false;
        });
    });
});