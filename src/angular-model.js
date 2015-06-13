(function (angular, _) {
    // ensure function.bind is defined
    if (!Function.prototype.bind) {
        Function.prototype.bind = function bind(context) {
            var self = this;
            return function () {
                var args = Array.prototype.slice.call(arguments);
                return self.apply(context || null, args);
            };
        };
    }

    /**
     * Binds an object's methods to a custom context
     * @param  {object} obj object whose methods are be bound
     * @param  {object} context target context
     * @return {n/a}
     */
    function bindObject(obj, context) {
        angular.forEach(obj, function (method, key) {
            if (angular.isFunction(method)) {
                obj[key] = method.bind(context);
            }
        });
    }

    _.bindObject = bindObject;

    angular.module('angular.model', ['ngResource', 'lodash', 'postal', 'qutil']);
})(angular, _);
angular.module('qutil', ['lodash']);
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
(function (angular) {
    angular.module('angular.model')
        .factory('ModelFactory', ModelFactory);

    ModelFactory.$inject = ['$resource', '_', 'postal', 'ModelUtilitiesFactory', 'qUtilService'];

    function ModelFactory($resource, _, postal, ModelUtilities, qUtil) {
        function Model(attrs, options) {
            attrs || (attrs = {});
            options || (options = {});

            // comment out when in production
            // if (!angular.isDefined(this.$resource)) {
            //     throw new Error('Undefined $resource: Missing Model Remote End Points');
            // }

            angular.extend(this, {
                $uid: _.uniqueId(this.$channelName),
                $id: _.uniqueId('m'),
            });

            this.$fn = new ModelUtilities(this);

            // bind model specific utility functions|methods to the model context
            angular.isObject(this.$utils) && qUtil.bindObject(this.$utils, this);

            // setup model's channel instance
            this.$channel = postal.channel(this.$channelName + '.' + this.$fn.getId() + '.sync');

            // setup local model syncs for attribute changes
            this.$channel.subscribe('*.changed', _attributeChanged.bind(this));

            // setup local model syncs for attribute deletes
            this.$channel.subscribe('*.deleted', _attributeDeleted.bind(this));

            // setup observer to watch for attribute changes
            Object.observe(this, _onAttributeChanged.bind(this));

            // prefill model attributes
            angular.extend(this, attrs);
        }

        Model.prototype = {
            $channelName: 'model',
            $idAttribute: 'id',
            $busy: false,

        };

        return Model;

        /**
         * observes changes to model attributes
         * @param  {object} changes
         * @return {n/a}
         */
        function _onAttributeChanged(changes) {
            angular.forEach(changes, function (change) {
                if (!/^\$|_/.test(change.name)) {
                    var data = {};

                    data[change.name] = change.object[change.name];

                    switch (change.type) {
                    case 'delete':
                        this.$channel.publish({
                            topic: change.name + '.deleted',
                            data: data,
                            $origin: this,
                            $attr: change.name,
                            $value: change.object[change.name]
                        });

                        break;
                    case 'add':
                    case 'update':
                    default:
                        this.$channel.publish({
                            topic: change.name + '.changed',
                            data: data,
                            $origin: this,
                            $attr: change.name,
                            $value: change.object[change.name]
                        });

                        break;
                    }
                }
            }.bind(this));
        }

        /**
         * syncs attribute changes from respective models instances
         * @param  {object} attrs    changed attribute definition
         * @param  {object} envelope event bus additional data
         * @return {n/a}
         */
        function _attributeChanged(attrs, envelope) {
            angular.extend(this, attrs);
        }

        /**
         * syncs attribute deletes from respective models instances
         * @param  {object} attrs    changed attribute definition
         * @param  {object} envelope event bus additional data
         * @return {n/a}
         */
        function _attributeDeleted(attrs, envelope) {
            if (angular.isDefined(this[envelope.$attr])) {
                delete this[envelope.$attr];
            }
        }
    }
})(angular);
(function (angular) {
    angular.module('angular.model')
        .factory('ModelUtilitiesFactory', ModelUtilitiesFactory);

    ModelUtilitiesFactory.$inject = ['$q', '_', 'postal', 'qUtilService'];

    function ModelUtilitiesFactory($q, _, postal, qUtil) {
        function ModelUtilities($modelInstance) {
            this.$model = $modelInstance;

            angular.extend(this, {
                getId: getId,
                save: save,
                remove: remove,
                isBusy: isBusy,
                isNew: isNew
            });

            qUtil.bindObject(this, $modelInstance);

            /**
             * Get Model's id
             * @return {mixed} integer|string
             */
            function getId() {
                return this[this.$idAttribute] || this.$id;
            }

            /**
             * Save model attributes to the server
             * @param  {attrs} attrs optional attributes to set before saving
             * @return {promise}
             */
            function save(attrs) {
                var deferred = $q.defer();

                return deferred.promise;
            }

            /**
             * persistently remove|delete a model
             * @return {promise}
             */
            function remove() {
                var deferred = $q.defer();

                return deferred.promise;
            }

            /**
             * checks if there is an http request pending
             * @return {Boolean}
             */
            function isBusy() {
                return this.$busy;
            }

            /**
             * determine a model is newl created
             * @return {Boolean}
             */
            function isNew() {
                return !angular.isDefined(this[this.$idAttribute]);
            }
        }

        return ModelUtilities;
    }
})(angular);
(function (angular) {
    angular.module('qutil')
        .service('qUtilService', qUtilService);

    qUtilService.$inject = ['_'];

    function qUtilService() {
        function qUtil() {}

        qUtil.prototype = {
            bindObject: bindObject
        };

        return new qUtil();

        /**
         * Binds an object's methods to a custom context
         * @param  {object} obj object whose methods are be bound
         * @param  {object} context target context
         * @return {n/a}
         */
        function bindObject(obj, context) {
            angular.forEach(obj, function (method, key) {
                if (angular.isFunction(method)) {
                    obj[key] = method.bind(context);
                }
            });
        }
    }
})(angular);