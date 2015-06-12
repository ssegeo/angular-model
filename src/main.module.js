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