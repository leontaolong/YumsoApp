var HttpsClient = require('./httpsClient');
var principalKey = 'principal';
var authTokenKey = 'token';
var AsyncStorage = require('react-native').AsyncStorage;
var config = require('./config');
var FBLoginManager = require('NativeModules').FBLoginManager;

import React, {
  Alert
} from 'react-native';

class AuthService {   
    constructor(props){
        this.client = new HttpsClient(config.baseUrl);
    }
    
    async getPrincipalInfo(){
        let eaterStr = await AsyncStorage.getItem('principal');
        return JSON.parse(eaterStr);
    }

    async registerWithEmail(firstname, lastname, email, password, password_re){
        let response = await this.client.postWithoutAuth(config.registerEndpointEmail, {
            entity:{
                firstname:firstname, 
                lastname:lastname,
                email: email,
                password: password,
                password_re:password_re
            }
        });
        if(response.statusCode==200){
            Alert.alert( 'Success', 'successfully registered. Please confirm your email. You will not be able to log in till your email is verified',[ { text: 'OK' }]); 
            return true;
        }else{
            Alert.alert( 'Warning', response.data,[ { text: 'OK' }]);
            return false; 
        }
    }
        
    async loginWithEmail(email, password){
        var response = await this.client.postWithoutAuth(config.authEndpointEmail, {
            email: email,
            password: password
        });
        console.log(response);
        if(response.statusCode!=200){
            Alert.alert( 'Warning', response.data,[ { text: 'OK' }]); 
            return false;
        }
        await AsyncStorage.multiSet([
            [principalKey, JSON.stringify(response.data.principal)],
            [authTokenKey, response.data.token]
        ]);
        return true;
    }
    
    async loginWithFbToken(token){
        var response = await this.client.postWithoutAuth(config.authEndpointFacebook, {
            token:token
        });
        console.log(response);
        if(response.statusCode!=200){
            Alert.alert( 'Warning', 'Failed login to facebook with its token',[ { text: 'OK' }]); 
            return false;
        }
        await AsyncStorage.multiSet([
            [principalKey, JSON.stringify(response.data.principal)],
            [authTokenKey, response.data.token]
        ]);    
        return true;   
    }
    
    async logOut(){
        FBLoginManager.logout(function(error, data){
            if (!error) {
                console.log("fb logged out");
            } else {
                console.log(error, data);
            }
        });
        await AsyncStorage.multiRemove([principalKey,authTokenKey]);
    }
    
    //todo: refresh token behind the scene.
}

module.exports = new AuthService();