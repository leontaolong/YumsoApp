var Promise = require('bluebird');
var AsyncStorage = require('react-native').AsyncStorage;

var HttpsClient = function (host, useTokenFromStorage, username, password, authEndpoint) {    
    var self = this;
    self.host = host;
    self.username = username;
    self.password = password;
    self.authEndpoint = authEndpoint;
    
    this.updateCredentials = function(username, password){
        self.username = username;
        self.password = password;
    };
    
    var accessToken = {};
    accessToken.token ="";
    accessToken.timeAquired = new Date('7/13/1990');
    accessToken.getToken = function(){
        if(useTokenFromStorage){
            return AsyncStorage.getItem('token')
                .then((token) => {
                    if (token == null) {
                       throw new Error('Token not exist in storage');
                    }
                });      
        }
        if(Math.ceil((new Date().getTime()- accessToken.timeAquired.getTime())/(1000*60))>3) {
            return accessToken.AquireOrRefreshToken().then(function(){
               return accessToken.token; 
            });
        }else{
            return Promise.resolve(accessToken.token);
        }
    }
    
    accessToken.AquireOrRefreshToken = function () {
        return self.postWithoutAuth(self.authEndpoint, {
            email: self.username,
            password: self.password
        }).then( (response) =>{
            if (response.statusCode === 200) {
                accessToken.timeAquired = new Date();
                accessToken.token = response.data.token;
            } else {
                if(response){
                    console.log(response.data);
                }
                throw 'fail get token';
            }
        });
    };
    
    this.postWithAuth = function (partialUrl, data) {
        var postData = JSON.stringify(data);
        return accessToken.getToken()
        .then((token) =>{
            var options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'bearer ' + token
                },
                body: JSON.stringify(data)
            };
            return request(partialUrl, options, postData);
        });
    };
    
    this.postWithoutAuth = function (partialUrl, data) {
        var postData = JSON.stringify(data); 
        var options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        };
        return request(partialUrl, options, postData);
    };
    
    this.getWithAuth = function (partialUrl) {
        return accessToken.getToken()
            .then(function (token) {
                var options = {
                    method: 'GET',
                    headers: {
                        'Authorization': 'bearer ' + token
                    }
                };
                return request(partialUrl, options);
            });
    };
    
    this.getWithoutAuth = function(partialUrl) {
        var options = {
            method: 'GET',
        };
        return request(partialUrl, options);
    };
     
    var request = function (partialUrl, options) {    
        var url = self.host+partialUrl;
        var status;
        return fetch(url, options)
            .then((response)=>{
                status = response.status
                if(response.status!==200){
                    return response.text();
                }else{
                    return response.json();
                }
            }).then((result)=>{
                return {
                    statusCode:status,
                    data:result
                };
            });
    };
};

module.exports = HttpsClient;