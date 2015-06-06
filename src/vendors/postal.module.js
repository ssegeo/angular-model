(function (angular) {
    angular.module('postal', [])
        .provider('postal', {
            postal: angular.injector(['ng']).invoke(postal),
            $get: postal
        });

    postal.$inject = ['$window'];

    function postal($window) {
        return $window.postal;
    }
})(angular);