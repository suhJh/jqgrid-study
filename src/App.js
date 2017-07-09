(function ($, Controller, store, createSelector) {

    var gridContainer = $('<table id="grid" />').appendTo('#App');
    var pager         = $('<div id="pager" />').appendTo('#App');


    var pickAcct = function (state) {
        return state.accts;
    }

    var selector = createSelector(pickAcct, function (accts) {
        return _.map(accts, function (item) {
            return item;
        });
    });

    var categories = ['먹을거', '음료수', '놀이', '책', '차비'];
    for (var i = 0; i < 30; i++) {
        store.dispatch({
            type: 'INSERT',
            acct: {
                id: _.random(1, 1000),
                amount: _.random(100, 100000),
                category: categories[_.random(0, 4)],
                when: new Date()
            }
        });
    }

    var App = Controller.create({
        elements: {
            '#grid'      :   'grid',
            '#pager'     :   'pager'
        },
        init: function () {
            this.initGrid()
                .then(this.proxy(function () {
                    store.subscribe(this.proxy(this.refresh));
                    return $.Deferred().resolve();
                }))
                .then(function () {
                    setTimeout(function () {
                        store.dispatch({
                            type: 'INSERT',
                            acct: {
                                id: _.random(1, 10),
                                amount: _.random(100, 1000),
                                category: categories[_.random(0, 4)],
                                when: new Date()
                            }
                        });
                    }, 3000);
                });
        },
        refresh: function () {
            this.grid.setGridParam({
                data: selector(store.getState())
            })
            .trigger('reloadGrid');
        },
        initGrid: function () {
            var promise = $.Deferred();

            this.grid.jqGrid({
                datatype: 'local',
                data: (function () {
                    return selector(store.getState());
                })(),
                pager: '#pager',
                colModel: [
                    {
                        name: 'id',
                        key: true,
                        width: 75,
                        formatter: 'integer',
                    },
                    {
                        name: 'category',
                        width: 80,
                    },
                    {
                        name: 'amount',
                        width: 85,
                        formatter: 'currency',
                        sortable: true,
                        sorttype: 'integer'
                    },
                    {
                        name: 'when',
                        width: 80,
                        formatter: 'y-m-d H:m:s'
                    },
                ],
                width: 1200,
                height: 400,
                loadComplete: this.proxy(function () {
                    promise.resolve();
                })
            });

            return promise.promise();
        }
    });

    new App({
        el: $('#App'),
    });


})(jQuery, Controller, window.store, window.createSelector);