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