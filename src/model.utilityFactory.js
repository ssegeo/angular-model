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