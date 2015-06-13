(function (angular) {
    angular.module('angular.model')
        .factory('CollectionFactory', CollectionFactory);

    CollectionFactory.$inject = ['_', 'postal', 'ModelFactory', 'qUtilService'];

    function CollectionFactory(_, postal, Model, qUtil) {
        function Collection(models, options) {
            models || (models = []);
            options || (options = {});

            this.$items || (this.$items = []);

            this.$model || (this.$model = Model);

            this.add(models);
        }

        Collection.prototype = {
            $idAttribute: '',
            count: count,
            add: add,
            create: create,
            reset: reset,
            clear: clear,
            unset: unset
        };

        return Collection;

        function count() {
            return this.$items.length;
        }

        function add(model, options) {
            options || (options = {});

            if (angular.isArray(model)) {
                var models = model;

                angular.forEach(models, function (model) {
                    this.add(model, {
                        silent: true
                    });
                }.bind(this));

                // @todo: fire a set event here

                return;
            }

            if (!angular.isObject(model)) return false;

            if (!(model instanceof this.$model)) {
                model = new this.$model(model);

                // set the id attribute if not set yet
                this.$idAttribute || (this.$idAttribute = model.$idAttribute);
            }

            this.$items.push(model);

            if (!options.silent) {
                // @todo trigger an add event here
            }
        }

        function attachCollectionUtils() {
            var utils = ['find', 'filter'];

            angular.forEach(utils, function (util) {
                this[util] = _.wrap(_[util], function (_fn) {
                    var args = Array.prototype.slice.call(arguments, 1);

                    // add collection array to the args
                    args.unshift(this.$items);

                    return _fn.apply(this.$items, args);
                }.bind(this));
            }, this);
        }

        /**
         * collection secondary factory method
         * @param  {array} models  array of models to prefill collection with
         * @param  {option} options
         * @return {n/a}
         */
        function create(models, options) {
            return new this.constructor(models, options);
        }

        /**
         * reset the collection with a whole set of models discarding the previous models
         * @param  {array | object} models
         * @return {n/a}
         */
        function reset(models) {
            this.$items = [];

            this.add(models);
        }

        /**
         * clear the entire collection's contents
         * @return {n/a}
         */
        function clear() {
            this.$items = [];

            // @todo triger a clear event here		
        }

        /**
         * remove a specific model from the collection
         * @param  {mixed} id      model or model id
         * @param  {object} options
         * @return {n/a}
         */
        function unset(id, options) {
            var index, filter = {};

            if (angular.isObject(id)) {
                var model = id;
                if (model instanceof this.$model) {
                    id = model.$fn.getId();

                    if (model.$fn.isNew()) {
                        filter.$id = id;
                    } else {
                        filter[this.$idAttribute] = id;
                    }
                } else {
                    throw new Error('Invalid Model Parsed to collection::unset()');
                }
            } else {
                filter[this.$idAttribute] = id;
            }

            var removed = _.remove(this.$items, filter);

            if (removed) {
                // @todo trigger a remove event here
            }
        }
    }
})(angular);