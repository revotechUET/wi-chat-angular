const moduleName = 'apiServiceModule';
const serviceName = 'apiService';
const GET_LIST_USER = '/api/user/list';
const GET_LIST_CONVERSATION_OF_USER = '/api/conversation/list';
const GET_CONVERSATION = '/api/conversation';
const LEAVE_CONVERSATION = '/api/conversation/leave';
const ADD_USER_TO_CONVERSATION = '/api/conversation/user/add'
const POST_MESSAGE = '/api/message/new'
const UPLOAD = '/api/upload'

angular.module(moduleName, []).service(serviceName, function ($http, Upload) {
    function doPost(URL, token, data, cb) {
        $http({
            method: 'POST',
            url: BASE_URL+URL,
            headers: {
                'Authorization': token
            },
            data: data
        }).then(function successCallback(response) {
            if (response.data.code != 200) {
                console.error(response.data.reason);
                cb();
            } else {
                cb(response.data.content);
            }
        }, function errorCallback(response) {
            console.error(response);
            if (__toastr) __toastr.error(response);
            cb();
        });
    }
    this.getListUser = function(token, data, cb) {
        doPost(GET_LIST_USER, token, data, cb);
    }
    this.getListConversationOfUser = function(token, data, cb) {
        doPost(GET_LIST_CONVERSATION_OF_USER, token, data, cb);
    }
    this.getConversation = function(token, data, cb) {
        doPost(GET_CONVERSATION, token, data, cb);
    }
    this.leaveConversation = function(token, data, cb) {
        doPost(LEAVE_CONVERSATION, token, data, cb);
    }
    this.postMessage = function(token, data, cb) {
        doPost(POST_MESSAGE, token, data, cb);
    }
    this.addUserToConversation = function(token, data, cb) {
        doPost(ADD_USER_TO_CONVERSATION, token, data, cb);
    }
    this.upload = (token, data, cb) => {
        Upload.upload({
            url: BASE_URL+UPLOAD,
            headers: {
                'Authorization': token
            },
            file: data.file,
            fields: data.fields
        }).then(
            (response) => {
                if (response.data.code != 200) {
                    console.error(response.data.reason);
                    cb();
                } else {
                    cb(response.data.content);
                }
            },
            (error) => {
                console.error(error);
                cb();
            });
    }
    return this;
});
module.exports.name = moduleName;