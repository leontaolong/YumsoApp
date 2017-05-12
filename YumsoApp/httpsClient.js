var Promise = require('bluebird');
var AsyncStorage = require('react-native').AsyncStorage;
var commonAlert = require('./commonModules/commonAlert');
var config = require('./config');
const AppVersion = config.AppVersion;
const timeoutLength = config.timeoutLength;

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
                    return token;
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
            if (response.statusCode === 200 || response.statusCode === 202) {
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
        return accessToken.getToken()
        .then((token) =>{
            var options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'bearer ' + token,
                    'YumsoAppVersion': AppVersion
                },
                body: JSON.stringify(data)
            };
            console.log(data);
            console.log(options);
            return request(partialUrl, options);
        });
    };
    
    this.postWithoutAuth = function (partialUrl, data) {
        var options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'YumsoAppVersion': AppVersion
            },
            body: JSON.stringify(data)
        };
        return request(partialUrl, options);
    };
    
    this.getWithAuth = function (partialUrl) {
        return accessToken.getToken()
            .then(function (token) {
                var options = {
                    method: 'GET',
                    headers: {
                        'Authorization': 'bearer ' + token,
                        'YumsoAppVersion': AppVersion
                    }
                };
                return request(partialUrl, options);
            });
    };
    
    this.getWithoutAuth = function(partialUrl) {
        var options = {
            method: 'GET',
            headers: {
                        'YumsoAppVersion': AppVersion
                     }
        };
        return request(partialUrl, options);
    };
     
    var request = function (partialUrl, options) {    
        var url = self.host+partialUrl;
        var status;
        var timeout = new Promise(function (resolve, reject) {
                setTimeout(()=>reject(new Error('Request timeout. Please try again later.')),timeoutLength);
            }).catch((err)=>{
                throw err;
            });

        var p = Promise.race([
                fetch(url, options).then((response)=>{
                    status = response.status;
                    var contentType = response.headers.get("content-type");
                    if((response.status == 200 || response.status == 202) && contentType && contentType.indexOf("application/json") != -1){
                       return response.json();
                    }else if(response.status == 412){
                       var err = {statusCode:412};
                       throw err;
                    }else if(response.status == 500){
                       return response.json();
                    }else{
                       return response.text(); 
                    }
                }).then((result)=>{
                    return {
                        statusCode:status,
                        data:result
                    };
                }).catch((err)=>{
                    if(err.statusCode == 412){
                       throw err;
                    }else{
                       throw new Error('Please check your network connection');
                    }
                }),
                timeout
            ])

        return p;
    };
};

module.exports = HttpsClient;