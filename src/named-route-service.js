angular.module('ngNamedRoute').provider('namedRouteService', function ($locationProvider) {
    'use strict';

    this.$get = /*@ngInject*/ function ($route, $location) {
        //map name to route
        var routemap = {};

        Object.keys($route.routes).forEach(function (path) {
            var route = $route.routes[path];
            if (route.name) {
                if (routemap.hasOwnProperty(route.name)) {
                    throw new Error("Route name [" + route.name + "] defined more than once.");
                }
                routemap[route.name] = {
                    path: path,
                    route: route
                };
            }
        });

        function reverse(name, args, query_params) {
            var idx = -1,
                url,
                route_obj,
                path,
                route,
                prefix = '',
                redirect_to = '';

            if (!routemap.hasOwnProperty(name)) {
                throw new Error("Route name [" + name + "] not known.");
            }

            route_obj = routemap[name];
            route = route_obj.route;
            path = route_obj.path;

            // then work with the redirectTo path instead
            if (route.hasOwnProperty('redirectTo')) {
                // first get the redirectTo path...
                if (typeof route.redirectTo === 'function') {
                    redirect_to = route.redirectTo(args);
                } else {
                    redirect_to = route.redirectTo;
                }

                // first extract and save the prefix (http:// or https://) or
                // else the regex below will break it
                prefix = redirect_to.match(/https?:\/\//);
                prefix = prefix ? prefix[0] : '';

                path = redirect_to.replace(prefix, '');
            }

            url = path.replace(/(:\w+[\*\?]{0,1})/g, function (match, p) {
                idx++;

                p = p.substring(1);

                var placeholder = p[p.length - 1] === '?' ? '' : '?';
                if (p[p.length - 1] === '*' || p[p.length - 1] === '?') {
                    p = p.substring(0, p.length - 1);
                }

                //arguments is an array: resolve positional parameter
                if (angular.isArray(args)) {
                    return idx < args.length ? args[idx] : placeholder;
                }

                //argument is an object: resolve property
                if (angular.isObject(args)) {
                    if (args.hasOwnProperty(p)) {
                        return args[p];
                    }
                    return placeholder;
                }

                //it's string or number, return as is, unless more than one is required
                if (!idx) {
                    return args === undefined ? placeholder : args;
                }

                return '?';
            });

            if (prefix) {
                url = prefix + url;
            }

            if (query_params) {
                url += '?' + Object.keys(query_params).map(function (key) {
                    var val = query_params[key];
                    if (angular.isArray(val)) {
                        return val.map(function (val) {
                            return key + '=' + encodeURIComponent(val);
                        }).join('&');
                    }
                    return key + '=' + encodeURIComponent(val);
                }).join('&');
            }
            return url;
        }

        return {
            reverse: reverse,
            open: function (name, args) {
                $location.path(reverse(name, args));
            },
            hashPrefix: function () { return $locationProvider.hashPrefix(); }
        };
    };
});
