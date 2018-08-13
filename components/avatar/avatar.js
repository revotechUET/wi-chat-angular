let moduleName = componentName = 'avatar';

function Controller(){
    let self = this;
    this.name = function() {
        return self.username.substring(0,1).toUpperCase();
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
