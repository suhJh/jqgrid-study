(function (exports){

    function defaultEqualityCheck(a, b) {
        return a === b;
    }
    function areArgumentsShallowlyEqual(equalityCheck, prev, next) {
        if (prev === null || next === null || prev.length !== next.length) {
            return false;
        }
        // Do this in a for loop (and not a `forEach` or an `every`) so we can determine equality as fast as possible.
        var length = prev.length;
        for (var i = 0; i < length; i++) {
            if (!equalityCheck(prev[i], next[i])) {
                return false;
            }
        }
        return true;
    }
    function defaultMemoize(func, equalityCheck) {
        if (equalityCheck === void 0) { equalityCheck = defaultEqualityCheck; }
        var lastArgs = null;
        var lastResult = null;
        // we reference arguments instead of spreading them for performance reasons
        return function () {
            if (!areArgumentsShallowlyEqual(equalityCheck, lastArgs, arguments)) {
                // apply arguments instead of spreading for performance.
                lastResult = func.apply(null, arguments);
            }
            lastArgs = arguments;
            return lastResult;
        };
    }
    exports.defaultMemoize = defaultMemoize;
    function getDependencies(funcs) {
        var dependencies = Array.isArray(funcs[0]) ? funcs[0] : funcs;
        if (!dependencies.every(function (dep) { return typeof dep === 'function'; })) {
            var dependencyTypes = dependencies.map(function (dep) { return typeof dep; }).join(', ');
            throw new Error('Selector creators expect all input-selectors to be functions, ' +
                ("instead received the following types: [" + dependencyTypes + "]"));
        }
        return dependencies;
    }
    function createSelectorCreator(memoize) {
        var memoizeOptions = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            memoizeOptions[_i - 1] = arguments[_i];
        }
        return function () {
            var funcs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                funcs[_i - 0] = arguments[_i];
            }
            var recomputations = 0;
            var resultFunc = funcs.pop();
            var dependencies = getDependencies(funcs);
            var memoizedResultFunc = memoize.apply(void 0, [function () {
                recomputations++;
                // apply arguments instead of spreading for performance.
                return resultFunc.apply(null, arguments);
            }].concat(memoizeOptions));
            // If a selector is called with the exact same arguments we don't need to traverse our dependencies again.
            var selector = defaultMemoize(function () {
                var params = [];
                var length = dependencies.length;
                for (var i = 0; i < length; i++) {
                    // apply arguments instead of spreading and mutate a local list of params for performance.
                    params.push(dependencies[i].apply(null, arguments));
                }
                // apply arguments instead of spreading for performance.
                return memoizedResultFunc.apply(null, params);
            });
            selector.resultFunc = resultFunc;
            selector.recomputations = function () { return recomputations; };
            selector.resetRecomputations = function () { return recomputations = 0; };
            return selector;
        };
    }
    exports.createSelectorCreator = createSelectorCreator;
    exports.createSelector = createSelectorCreator(defaultMemoize);
    function createStructuredSelector(selectors, selectorCreator) {
        if (selectorCreator === void 0) { selectorCreator = exports.createSelector; }
        if (typeof selectors !== 'object') {
            throw new Error('createStructuredSelector expects first argument to be an object ' +
                ("where each property is a selector, instead received a " + typeof selectors));
        }
        var objectKeys = Object.keys(selectors);
        return selectorCreator(objectKeys.map(function (key) { return selectors[key]; }), function () {
            var values = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                values[_i - 0] = arguments[_i];
            }
            return values.reduce(function (composition, value, index) {
                composition[objectKeys[index]] = value;
                return composition;
            }, {});
        });
    }
    exports.createStructuredSelector = createStructuredSelector;

})(window);



