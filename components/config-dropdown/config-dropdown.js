const componentName = 'configDropdown';
const moduleName = 'config-dropdown';
require('./config-dropdown.less');

Controller.$inject = ['$window', '$scope']
function Controller($window, $scope) {
    let self = this;

    $(document).ready(function(){
        // Show hide popover
        $(".wi-chat-config-dropdown .dropdown").click(function(){
            $(".wi-chat-config-dropdown .dropdown-menu").slideToggle("fast");
        });
    });
    $(document).on("click", function(event){
        var $trigger1 = $(".wi-chat-config-dropdown .dropdown");
        var $trigger2 = $(".wi-chat-config-dropdown .dropdown-menu");
        if($trigger1 !== event.target && $trigger2 !== event.target
            && !$trigger1.has(event.target).length && !$trigger2.has(event.target).length){
            $(".wi-chat-config-dropdown .dropdown-menu").slideUp("fast");
        }            
    });

    this.$onInit = function () {
    }

    this.getItemLabel = function(label) {
        if (typeof label === 'function') {
            return label();
        }
        return label;
    }
}

let app = angular.module(moduleName, []);
app.component(componentName, {
    template: require('./config-dropdown.html'),
    controller: Controller,
    controllerAs: 'self',
    bindings: {
        itemList: '<'
    }
});

exports.name = moduleName;