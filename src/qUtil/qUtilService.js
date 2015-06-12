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