const componentName = 'socketStatus';
const moduleName = 'socket-status';
require('../socket-status/socket-status.css');

Controller.$inject = ['$window', '$scope']
function Controller($window, $scope) {
    let self = this;
    let socket = window.socket

    self.$onInit = function() {
        preProcess()
        // socket.disconnect()
        socket.on('connect', function() {
            
            self.isOnline = true
        }) 

        socket.on('disconnect', function() {
            self.isOnline = false
        })

        $window.addEventListener('offline', function() {
            self.isOnline = false
            $scope.$digest()
            // socket.disconnect()
        })

        // //socket reconnect success
        // socket.on('reconnect', function() {
        //     self.isOnline = true
        // })
    }

    self.reconnect = function() {
        socket.connect()
    }

    function preProcess() {
        self.isOnline = false
    }

}


let app = angular.module(moduleName, []);
app.component(componentName, {
    template: require('../socket-status/socket-status.html'),
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        
    }
});

exports.name = moduleName;