angular.module('ngNamedRoute').directive('namedRoute', function ($location, namedRouteService) {
    'use strict';

    return {
        restrict: 'A',
        scope: {
            name: '=namedRoute',
            args: '=routeParams',
            query_params: '=routeQueryParams'
        },
        link: function ($scope, $element) {

            function updateHref() {
                if ($scope.name !== undefined) {
                    $element.attr('href', ($location.$$html5 ? '' : '#' + namedRouteService.hashPrefix()) + namedRouteService.reverse($scope.name, $scope.args, $scope.query_params));
                    var url,
                        route = namedRouteService.reverse($scope.name, $scope.args, $scope.query_params);
                    if (route.startsWith('http')) {
                        url = route;
                    } else {
                        url = ($location.$$html5 ? '' : '#' + namedRouteService.hashPrefix()) + route;
                    }
                    $element.attr('href', url);
                }
            }

            $scope.$watch('name', updateHref);
            $scope.$watch('args', updateHref, true);
            $scope.$watch('query_params', updateHref, true);
        }
    };
});
