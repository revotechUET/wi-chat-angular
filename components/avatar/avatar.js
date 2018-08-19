let moduleName = componentName = 'avatar';

function Controller() {
    let self = this;
    this.name = function () {
        return self.username.substring(0, 1).toUpperCase();
    }
    this.getColor = function() {
        if(self.color) return self.color;
        var str = self.username;
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var colour = '#';
        for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 0xFF;
            colour += ('00' + value.toString(16)).substr(-2);
        }
        return colour;
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    template: require('../avatar/avatar.html'),
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        username: '<',
        size: '<',
        color: '<'
    }
});

exports.name = moduleName;
