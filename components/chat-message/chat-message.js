const componentName = 'chatMessage';
const moduleName = 'chat-message';
const iconTextRules = require('./rules');
require('../chat-message/chat-message.css');

Controller.$inject = [];
function Controller() {
    const self = this;

    this.$onInit = function () {
        preProcess();
    }

    function preProcess() {
        self.text = replaceText(self.text);
    }

    function replaceText(str) {
        if (!str) return str;
        return replaceLink(replaceIcon(str));
    }

    const linkRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
    function replaceLink(str) {
        return str.replace(linkRegex, (p1) => `<a href="${p1}" target="_blank">${p1}</a>`);
    }

    const rules = Object.entries(iconTextRules);
    const iconRegex = toRegex();

    //change str -> regexable str
    function preRegex(str) {
        return str
            .split('') //to list char
            .reduce((pre, cur) => `${pre}\\${cur}`, ''); //to string with \ attach to each char
    }

    function toRegex() {
        const listIcon = rules
            .reduce((pre, cur) => {
                const curIcons = cur[1]["text-replace"];
                return [...pre, ...curIcons];
            }, [])
        const regexStr = listIcon
            .reduce((pre, cur, i) => {
                const cur_regex_str = preRegex(cur);
                if (i === 0) return pre + cur_regex_str;
                let str = `${pre}|${cur_regex_str}`;
                if (i === listIcon.length - 1) str += ')';
                return str;
            }, '(');
        return new RegExp(regexStr, 'g');
    }

    function findIcon(text) {
        const obj = rules
            .find(o => {
                const listIcons = o[1]["text-replace"];
                return !!listIcons.filter(i => i === text).length;
            });
        if (obj) return obj[1].icon;
        return null;
    }

    function replaceIcon(str) {
        const listIconsVerbose = str.match(iconRegex);
        if(!listIconsVerbose || !listIconsVerbose.length) return str;
        const listIcons = listIconsVerbose.filter((val, i) => listIconsVerbose.indexOf(val) === i);
        let result = str;
        for (let icon of listIcons) {
            const _regex = new RegExp(preRegex(icon));
            const replaceIcon = findIcon(icon);
            const iconHtml = toHtmlWithIcon(replaceIcon);
            if(replaceIcon) result = result.replace(_regex, iconHtml);
        }
        return result;
    }

    function toHtmlWithIcon(className) {
        return `<div class="${className}"></div>`
    }
}


let app = angular.module(moduleName, []);
app.component(componentName, {
    template: require('../chat-message/chat-message.html'),
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        text: '<',
        color: '<'
    }
});

exports.name = moduleName;