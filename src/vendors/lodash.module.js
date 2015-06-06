(function (angular) {
    angular.module('lodash', [])
        .provider('_', {
            _: angular.injector(['ng']).invoke(lodash),

            $get: lodash
        });

    lodash.$inject = ['$window'];

    function lodash($window) {
        $window._.mixin($window.s.exports());

        return $window._;
    }
})(angular);