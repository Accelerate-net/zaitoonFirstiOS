angular.module('order.track.services', [])

.service('trackOrderService', function () {
        var orderid = '';

        return {
            getOrderID: function () {
                return orderid;
            },
            setOrderID: function(value) {
                orderid = value;
            }
        };
})

;
