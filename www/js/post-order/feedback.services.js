angular.module('order.feedback.services', [])

.service('reviewOrderService', function () {
        var orderid = '';
        var lastContent = '';

        return {
            getLatest: function () {
                return orderid;
            },
            setLatest: function(value, content) {
                orderid = value;
                lastContent = content;
            },
            getContent: function(){
              return lastContent;
            }

        };
})

;
