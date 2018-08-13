require('./style.css');
let chatService = require('./api-service.js');
let avatar = require('./components/avatar/avatar.js');
let chatMessage = require('./components/chat-message/chat-message.js');
let imgPreview = require('./components/img-preview/img-preview.js');
let moduleName = componentName = 'wiChat';

angular.module(moduleName, [chatService.name, avatar.name, chatMessage.name, imgPreview.name, 'ngFileUpload'])
    .component(componentName, {
        template: require('./index.html'),
        controller: Controller,
        controllerAs: componentName,
        bindings: {
            show: '='
        }
    });

function Controller(apiService, $scope, $element, $timeout) {
    const WIDTH_IMAGE_THUMB = 130;
    let self = this;
    this.token = window.localStorage.token;
    this.user = {};
    this.curConver = {};
    this.listConver = [];
    this.listUser = [];
    this.listUserSearch = [];
    let textMessage = $element.find('.text-message');
    let listMessage = $element.find('.list-message');
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
    function init() {
        console.log('wi-chat-angular');
        apiService.getListUser(self.token, {}, function (res) {
            self.listUser = res ? res : [];
            self.listUserSearch = res ? res : [];
            apiService.getListConversationOfUser(self.token, {}, function (res) {
                if (res) {
                    self.user = { username: res.username, color: res.color, role: res.role };
                    socket.emit('connected', self.user.username);
                    self.listConver = res.Conversations.length ? res.Conversations : [];
                    self.curConver = self.listConver.length ? self.listConver[0] : {};
                    self.listConver.forEach(function (conver) {
                        socket.emit('join-room', { username: self.user.username, idConversation: conver.id });
                    })
                    let helpDesk = self.listConver.filter(function (conver) { return conver.name == ('Help_Desk-' + self.user.username) })[0];
                    if (!helpDesk) {
                        apiService.getConversation(self.token, {
                            name: 'Help_Desk-' + self.user.username,
                            nameShow: '?',
                            type: 3,
                            color: 'red',
                            users: Array.from(new Set([self.user.username]))
                        }, function (res) {
                            if (res) {
                                self.listConver.push(res.conver);
                                self.curConver = self.listConver[0];
                                socket.emit('join-room', { username: self.user.username, idConversation: res.conver.id });
                            }
                        })
                    }
                }
            });
        });
    }
    socket.on('list-online', function(data) {
        if(self.listUser)
        $timeout(function() {
            data.forEach(function(username) {
                self.listUser.forEach(function(user, i) {
                    if(user.username == username) self.listUser[i].active = 'rgb(31, 179, 31)';
                })
            });
            console.log(self.listUser);
        })
    });
    socket.on('disconnected', function(data) {
        if(self.listUser)
        $timeout(function() {
            self.listUser.forEach(function(user) {
                if(user.username==data) user.active = 'z';
            })
        })
    })
    if (self.token) init();
    $scope.$watch(function () {
        return window.localStorage.token;
    }, function (newValue, oldValue) {
        if (newValue && newValue != oldValue) {
            self.token = window.localStorage.token;
            init();
        }
    });
    textMessage.keypress(function (e) {
        if (e.which == 13 && !e.shiftKey) {
            let content = textMessage.val();
            content = content.trim();
            if(content) {
                let message = {
                    content: preventXSS(content),
                    type: 'text',
                    username: self.user.username,
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
    socket.on('sendMessage', function (data) {
        console.log('on message')
        if(self.curConver.id == data.idConversation) {
            self.curConver.Messages = self.curConver.Messages?self.curConver.Messages:[];
            $timeout(function() {
                self.curConver.Messages.push(data);
                $timeout(function(){
                    listMessage.scrollTop(listMessage[0].scrollHeight);
                }, 500);
            });
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
    this.showNameCurConver = function () {
        if (self.curConver.type == 2) return self.curConver.name;
        if (self.curConver.type == 1) return angular.copy(self.curConver.name).replace(self.user.username, "");
        if (self.curConver.type == 3) return 'Help Desk';
    }
    this.getConver = function (conver) {
        if(!self.showAddUser) {
            let payload;
            if (conver.type == 1) {
                payload = {
                    name: self.user.username>conver.name?(conver.name+','+self.user.username):(self.user.username+','+conver.name),
                    type: 1,
                    nameShow: 'P',
                    color: 'steelblue',
                    users: [conver.name]
                }
            } else {
                payload = {
                    name: conver.name
                }
            }
            apiService.getConversation(self.token, payload, function (res) {
                if(res) {
                    self.curConver = res.conver;
                    // let check = self.listConver.filter(function(conver) {
                    //     return conver.id == res.conver.id;
                    // })[0];
                    // if(!check) {
                    //     self.listConver.push(res.conver);
                    //     socket.emit('join-room', {username: self.user.username, idConversation: res.conver.id});
                    //     console.log('join room res');
                    // }
                }
            })
        } else {
            if(conver.name && conver.name!=self.user.username) {
                if(!self.addUsers.find(function(username) {return username == conver.name;})){
                    $timeout(function(){
                        self.addUsers.push(conver.name);
                        console.log(self.addUsers);
                    })
                }
            }
        }
    }
    this.addUser = function() {
        // loai nhung ng da o trong gr hoac thang dang chat
        if(!self.addUsers.length) return;
        if(self.curConver.type==2) {
            self.addUsers = Array.from(new Set(self.addUsers));
            apiService.addUserToConversation(self.token, {
                idConversation: self.curConver.id,
                users: self.addUsers
            }, function(res) {
                if(res) $timeout(function() {
                    self.curConver.name = res.conver.name;
                })
            });
        }else{
            self.addUsers.push(self.user.username, angular.copy(self.curConver.name).replace(self.user.username, ""));
            self.addUsers = Array.from(new Set(self.addUsers));
            self.addUsers.sort();
            apiService.getConversation(self.token, {
                name: self.addUsers.join(),
                type: 2,
                nameShow: 'G',
                color: 'steelblue',
                users: self.addUsers
            }, function(res) {
                if(res) {
                    self.showGroups = true;
                    // $timeout(function() {
                    //     self.listConver.push(res.conver);
                    //     self.curConver = res.conver;
                    //     self.showGroups = true;
                    // })
                    // socket.emit('join-room', {username: self.user.username, idConversation: res.id});
                    // console.log('join room res add');
                }
            })
        }
    }
    socket.on('join-chat', function(data) {
        console.log('join chat', data);
        data.users.forEach(function(username) {
            if(self.user.username==username) {
                let check = self.listConver.filter(function(conver) {
                    return conver.id == data.conver.id;
                })[0];
                if(!check) {
                    console.log('join room');
                    $timeout(function() {
                        self.listConver.push(data.conver);
                        if(data.created == self.user.username || self.curConver.id == data.conver.id) self.curConver = data.conver;
                    })
                    socket.emit('join-room', {username: self.user.username, idConversation: data.conver.id});
                }
            }
        });
    })
    this.leaveConver = function() {
        apiService.leaveConversation(self.token, {username: self.user.username, idConversation: self.curConver.id}, function(res) {
            if(res) socket.emit('leave-room', {idConversation: self.curConver.id});
        });
    }
    this.filterUserSearch = function(username) {
        if(self.curConver && self.curConver.name){
            if(self.curConver.name.indexOf(username+',') == -1 && self.curConver.name.indexOf(','+username+',') == -1 && self.curConver.name.indexOf(','+username) == -1)
                return true;
        }
        return false;
    }
    ////////////////////
    let lengthUrl = BASE_URL.length;
    this.getImageOrigin = function (path) {
        let p = path.slice(lengthUrl + 1);
        return BASE_URL + '/api/imageOrigin/' + p + '?token=' + self.token;
    }
    this.download = function (path) {
        let p = path.slice(lengthUrl + 1);
        return BASE_URL + '/api/download/' + p + '?token=' + self.token;
    }
    this.thumb = function (path) {
        let p = path.slice(lengthUrl + 1);
        return BASE_URL + '/api/thumb/' + p + '?token=' + self.token;
    }
    this.fileName = function (path) {
        return path.substring(lengthUrl + 35 + self.curConver.name.length, path.length);
    }
    this.getDate = function (t1, t2) {
        let time1 = new Date(t1);
        let time2 = new Date(t2);
        return time1.toString().substring(0, 15) != time2.toString().substring(0, 15);
    }
    this.setNullOfTextarea = function() {
        $('.addUser').text('');
        $('.addUser').focus();
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
    $('.wraper').draggable({
        start: function () {
            $(this).css("bottom", "auto");
            $(this).css("right", "auto");
        },
        containment: 'window',
        cancel: '.content',
        cursor: 'move'
    })
};
