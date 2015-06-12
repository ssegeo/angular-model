describe('Model', function () {
    var Model,
        Collection,
        model,
        postal;

    beforeEach(module('angular.model'));
    beforeEach(inject(function (_ModelFactory_, _postal_ /*, _CollectionFactory_*/ ) {
        Model = _ModelFactory_;
        // Collection = _CollectionFactory_;
        model = new Model();
        postal = _postal_;
    }));

    afterEach(function () {});

    it('defines a model factory', function () {
        assert.isFunction(Model);
    });

    it('defines a default channel name', function () {
        var model = new Model();
        expect(model.$channelName).to.be.ok;
    });

    it('defines a utility functions namespace (fn)', function () {
        var model = new Model();

        assert.isObject(model.fn, "No model utility functions namespace defined");
    });

    xit('keeps local instances in sync', function () {
        var model1 = new Model({
                id: 809,
                name: 'skomp'
            }),
            model2 = new Model({
                id: 809,
                name: 'skomp'
            }),
            model3 = new Model({
                id: 444,
                name: 'israel'
            });

        model1.name = 'sqomp';
        expect(model2.name).to.be.equal(model1.name);
        expect(model1.name).not.to.be.equal(model3.name);

        delete model2.name;
        expect(model1.name).not.to.be.ok;

    });

    it('defines an $idAttribute property', function () {
        var model = new Model();
        expect(model.$idAttribute).to.be.ok;
    });

    describe('Model Constructor', function () {
        it('initiates model attributes', function () {
            var model = new Model({
                name: 'sqomp'
            });

            expect(model.name).to.equal('sqomp');
        });

        it('generates a unique identifier for each model instatiated', function () {
            expect(model.$uid).to.be.ok;
        });

        it('sets up an event bus channel', function () {
            assert.isObject(model.$channel, 'Model instance Lacks an event bus channel');
        });

        it('sets a unique shadow id ($id) for each model', function () {
            var model = new Model();

            expect(model.$id).to.be.ok;
        });

        xit('setups an observer on its attributes', function () {
            var model = new Model();

            var onChangeSpy = sinon.spy();

            model.$channel.subscribe('*.changed', onChangeSpy);

            model.id = 809;

            expect(onChangeSpy).to.have.been.called;
        });
    });

});