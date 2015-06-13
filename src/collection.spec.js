describe('Collection', function () {
    var Model,
        Collection,
        postal;

    beforeEach(module('angular.model'));
    beforeEach(inject(function (_ModelFactory_, _postal_, _CollectionFactory_) {
        Model = _ModelFactory_;
        Collection = _CollectionFactory_;
        postal = _postal_;
    }));

    afterEach(function () {});

    describe('Constructor', function () {
        it('optionally accepts a predefined array of models', function () {
            var collection = new Collection([new Model]);

            expect(collection.count()).to.be.equal(1);
        });

    });

    describe('Collection Items', function () {
        it('maintains a list|array of models', function () {
            var collection = new Collection();

            expect(collection.$items).to.be.ok;
        });
    });

    describe('count(): determines the number of models in the collection', function () {
        it('is defined', function () {
            var collection = new Collection();

            assert.isFunction(collection.count);
        });

    });

    describe('add(): Add models|items to the collection', function () {
        it('is defined', function () {
            var collection = new Collection();

            assert.isFunction(collection.add);
        });

        it('add model instance to collection', function () {
            var collection = new Collection(),
                model = new Model({
                    id: 404,
                    name: 'israel'
                });

            collection.add({
                id: 809,
                name: 'sqomp'
            });

            expect(collection.count()).to.be.equal(1);

            expect(collection.$items[0]).to.be.an.instanceOf(Model);

            collection.add(model);
            expect(collection.count()).to.be.equal(2);
        });
    });

    describe('create(): collection factory', function () {
        it('is defined', function () {
            var collection = new Collection();

            assert.isFunction(collection.create);
        });

        xit('creates collections instance', function () {
            var collection = new Collection(),
                collection2 = collection.create();

            expect(collection2).to.be.an.instanceOf(Collection);
        });
    });

    describe('reset(): reset collection\'s contents', function () {
        it('is defined', function () {
            var collection = new Collection;

            assert.isFunction(collection.reset);
        });

        it('resets collection\'s contents', function () {
            var collection = new Collection([{
                id: 404,
                name: 'sqomp'
            }, {
                id: 809,
                name: 'israel'
            }]);

            collection.reset({
                id: 505,
                name: 'skomp'
            });

            expect(collection.count()).to.be.equal(1);

            collection.reset([{
                id: 666,
                name: 'lucifer'
            }, {
                id: 123,
                name: 'linda'
            }]);

            expect(collection.count()).to.be.equal(2);
        });
    });

    describe('clear(): clear the collection\'s contents', function () {
        it('is defined', function () {
            var collection = new Collection;

            assert.isFunction(collection.clear);
        });

        it('clears the entire collection\'s contents', function () {
            var collection = new Collection;

            var collection = new Collection([{
                id: 809,
                name: 'sqomp'
            }]);

            collection.clear();

            expect(collection.count()).to.be.equal(0);
        });
    });

    describe('unset(): remove a model from a collection', function () {
        it('is defined', function () {
            var collection = new Collection();

            assert.isFunction(collection.unset);
        });

        it('removes a model from a collection', function () {
            var model1 = new Model({
                    name: 'israel'
                }),
                model2 = new Model({
                    id: 809,
                    name: 'sqomp'
                }),
                collection = new Collection([{
                        id: 409,
                        name: 'skomp'
                    },
                    model1,
                    model2
                ]);

            expect(collection.count()).to.be.equal(3);

            collection.unset(409);

            expect(collection.count()).to.be.equal(2);

            collection.unset(model2);

            expect(collection.count()).to.be.equal(1);

            collection.unset(model1);

            expect(collection.count()).to.be.equal(0);
        });
    });
});