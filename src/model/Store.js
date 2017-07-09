(function (
    exports, 
    _, 
    Redux, 
    thunk, 
    createSelector
    ) {

    var acctReducer = function (acct, action) {
        switch (action.type) {
            case 'INSERT': 
                var o = {};
                o[action.acct.id] = action.acct;
                return _.extend({}, acct, o);
            default: return acct || {};
        }
    }


    var rootReducer = Redux.combineReducers({
        accts: acctReducer
    });


    exports.store = Redux.createStore(rootReducer, Redux.applyMiddleware(thunk));


})(
window, 
_, 
window.Redux, 
window.ReduxThunk['default'], 
window.createSelector
);