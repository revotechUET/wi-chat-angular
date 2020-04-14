require('./style.css');
let chatService = require('./api-service.js');
let avatar = require('./components/avatar/avatar.js');
let chatMessage = require('./components/chat-message/chat-message.js');
let imgPreview = require('./components/img-preview/img-preview.js');
let socketStatus = require('./components/socket-status/socket-status');
let moduleName = componentName = 'wiChat';

angular.module(moduleName, [chatService.name, avatar.name, chatMessage.name, imgPreview.name,socketStatus.name, 'ngFileUpload'])
    .component(componentName, {
        template: require('./index.html'),
        controller: Controller,
        controllerAs: componentName,
        bindings: {
            show: '=',
            token: '=',
            username: '=',
            groupName: '=',
            owner: '=',
            url: '<',
            getListUser: '<'
        }
    });
Controller.$inject = ['apiService', '$scope', '$element', '$timeout'];
function Controller(apiService, $scope, $element, $timeout) {
    const WIDTH_IMAGE_THUMB = 130;
    let self = this;
    this.user = null;
    this.curConver = {};
    this.listConver = [];
    this.listUser = [];
    this.curConverId = -9999;
    let textMessage = $element.find('.text-message');
    let listMessage = $element.find('.list-message');

    function init() {
        let oldHelpDeskId =( self.listConver[0] || {} ).id;
        self.curConver = {}; self.listConver = [];
        getConversation('Help_Desk-' + self.username, function(res) {
            if(res) {
                self.user = res.user;
                self.curConver = res.conver;
                self.listConver[0] = res.conver;
                if(oldHelpDeskId) socket.emit('off-project', { username: self.user.username, idConversation: oldHelpDeskId });
                socket.emit('join-room', { username: self.user.username, idConversation: res.conver.id });
            }
        });
        changeGroup();
    }
    function getConversation(nameConversation, cb) {
        apiService.getConversation(self.token, {
            name: nameConversation
        }, function(res) {
            if(res) {
                cb && cb(res);
            }
            else cb && cb();
        })
    }
    function getListUser(project_name, owner, cb) {
        apiService.getListUser(self.token, {
            project_name: project_name,
            owner: owner
        }, function(res) {
            if(res) cb && cb(res);
            else cb && cb();
        })
    }
    function seenMessage() {
        apiService.seenMessage(self.token, {
            idUser: self.user.id,
            nameConversation: self.curConver.name
        }, function(res) {
            if(res) {
                $timeout(function() {
                    self.listConver.filter(function(c) {return c.id==self.curConver.id;})[0].lastMessFontWeight = '';
                })
            }
        });
    }
    function changeGroup() {
        if(self.groupName) {
            let oldConversationId = self.curConver.id;
            getListUser(self.groupName, self.owner, function(listUser) {
                if(listUser && listUser.length>=2) {
                    getConversation(self.groupName, function(res) {
                        if(res) {
                            if(!self.user) self.user = res.user;
                            self.listUser = listUser;
                            self.curConver = res.conver;
                            self.listConver[1] = res.conver;
                            socket.emit('off-project', { idConversation: oldConversationId, username: self.user.username });
                            socket.emit('join-room', { username: self.user.username, idConversation: res.conver.id });
                        }
                    })
                }else{
                    self.listConver.splice(1,1);
                    self.curConver = self.listConver[0];
                }
            })
        }
    }
    this.$onInit = function() {
        console.log(self.url, self.getListUser);
        lengthUrl = self.url.length;
        apiService.BASE_URL = self.url;
        apiService.GET_LIST_USER = self.getListUser;
        socket = io(self.url);
        socketOn();
        if(self.token) {
            init();
        }
    }
    $scope.$watch(function() {
        return self.token;
    }, function(newValue, oldValue) {
        if(newValue && newValue!=oldValue) {
            init();
        }
    })
    window.list = self.listConver;
    $scope.$watch(function() {
        return self.groupName;
    }, function(newValue, oldValue) {
        if(newValue && newValue!=oldValue) {
            changeGroup();
        }else if(!newValue) {
            self.listConver.splice(1,1);
            self.curConver = self.listConver[0];
        }
    })
    textMessage.keypress(function (e) {
        if (e.which == 13 && !e.shiftKey) {
            let content = textMessage.val();
            content = content.trim();
            if(content) {
                let message = {
                    content: preventXSS(content),
                    type: 'text',
                    idSender: self.user.id,
                    username: self.user.username,
                    nameConversation: self.curConver.name,
                    idConversation: self.curConver.id,
                    User: self.user,
                    sendAt: new Date()
                };
                apiService.postMessage(self.token, message, function (res) {
                });
            }
            e.preventDefault();
            textMessage.val('');
        }
    });

    this.upload = function (files) {
        async.forEachOfSeries(files, (file, i, _done) => {
            let type = file.type.substring(0, 5);
            apiService.upload(self.token, {
                file: file,
                fields: {'name': self.curConver.name, 'width': WIDTH_IMAGE_THUMB}
            }, (res) => {
                if(res) {
                    let message = {
                        content: res,
                        type: type=='image'?'image':'file',
                        username: self.user.username,
                        nameConversation: self.curConver.name,
                        idSender: self.user.id,
                        idConversation: self.curConver.id,
                        User: self.user,
                        sendAt: new Date()
                    }
                    apiService.postMessage(self.token, message, (res) => {
                        _done();
                    });
                }
            })
        }, (err) => {

        });
    }
    this.changeCurConver = function (conver) {

        self.curConverId = conver.id;

        if(self.curConver.id!=conver.id) {
            getConversation(conver.name, function(res) {
                if(res) {
                    self.curConver = res.conver;
                    if(self.curConver.lastMessFontWeight) seenMessage();
                }
            })
        } else {
            if(self.curConver.lastMessFontWeight) seenMessage();
        }
    }

    ////////////////////
    let lengthUrl;
    this.getImageOrigin = function (path) {
        let p = path.slice(lengthUrl + 1);
        return self.url + '/api/imageOrigin/' + p + '?token=' + self.token;
    }
    this.download = function (path) {
        let p = path.slice(lengthUrl + 1);
        return self.url + '/api/download/' + p + '?token=' + self.token;
    }
    this.thumb = function (path) {
        let p = path.slice(lengthUrl + 1);
        return self.url + '/api/thumb/' + p + '?token=' + self.token;
    }
    this.fileName = function (path) {
        return path.substring(lengthUrl + 35 + self.curConver.name.length, path.length);
    }
    this.getDate = function (t1, t2) {
        let time1 = new Date(t1);
        let time2 = new Date(t2);
        return time1.toString().substring(0, 15) != time2.toString().substring(0, 15);
    }
    this.seenMessage = function() {
        if(self.curConver.lastMessFontWeight) seenMessage();
    }
    function preventXSS(text) {
        const rule = {
            '<': {
                regex: /\</g,
                replaceStr: '&lt'
            },
            '>': {
                regex: /\>/g,
                replaceStr: '&gt'
            }
        };
        text = text.replace(rule['>'].regex, rule['>'].replaceStr);
        text = text.replace(rule['<'].regex, rule['<'].replaceStr);
        return text;
    }
    $scope.$watch(function() {return self.curConver}, function(newValue, oldValue) {
        if(newValue) {
            $timeout(function() {
                listMessage.scrollTop(listMessage[0].scrollHeight);
            }, 500)
        }
    })
    $scope.$watch(function() {return self.show}, function(newValue, oldValue) {
        if(newValue) {
            $timeout(function() {
                listMessage.scrollTop(listMessage[0].scrollHeight);
            }, 500)
        }
    })
    $('.wraper').draggable({
        start: function () {
            $(this).css("bottom", "auto");
            $(this).css("right", "auto");
        },
        containment: 'window',
        cancel: '.content',
        cursor: 'move'
    })
    function socketOn() {
        socket.on('sendMessage', function (data) {
            if(data.username!=self.user.username && !self.show){
                if(data.idConversation==self.listConver[0].id){
                    __toastr.success('Admin has sent message to Help Desk');
                }
                else {
                    __toastr.success(data.username + ' has sent message to ' + data.nameConversation + ' group');
                }
            }
            if(self.curConver.id == data.idConversation) {
                self.curConver.Messages = self.curConver.Messages?self.curConver.Messages:[];
                $timeout(function() {
                    self.curConver.Messages.push(data);
                    $timeout(function(){
                        listMessage.scrollTop(listMessage[0].scrollHeight);
                    }, 500);
                });
            }
            if(!(self.curConver.id == data.idConversation && $('.text-message').is(':focus')) && self.user.username!=data.username) {
                $timeout(function() {
                    self.listConver.filter(function(c) {return c.id == data.idConversation})[0].lastMessFontWeight = 'bolder';
                });
            }
        });
        socket.on('send-members-online', function(data) {
            if(self.listUser)
            $timeout(function(){
                for(x of data) {
                    self.listUser.forEach(function(user) {
                        if(user.username==x) user.active = 'rgb(66, 183, 42)';
                    })
                }
            })
        })
        socket.on('disconnected', function(data) {
            if(self.listUser)
            $timeout(function() {
                self.listUser.forEach(function(user) {
                    if(user.username==data) user.active = '';
                })
            })
        })
        socket.on('off-project', function(data) {
            if(self.listUser)
            $timeout(function() {
                self.listUser.forEach(function(user) {
                    if(user.username==data.username) user.active = '';
                })
            })
        })
    }
};
