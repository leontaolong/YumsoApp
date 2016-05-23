var HttpsClient = require('./httpsClient');
var principalKey = 'principal';
var authTokenKey = 'token';
var eaterKey = 'eater';
var AsyncStorage = require('react-native').AsyncStorage;
var config = require('./config');
var FBLoginManager = require('NativeModules').FBLoginManager;

import React, {
  Alert
} from 'react-native';

class AuthService {   
    constructor(props){
        this.client = new HttpsClient(config.baseUrl, true);
    }
    
    async getPrincipalInfo(){
        let eaterStr = await AsyncStorage.getItem(principalKey);
        if(eaterStr==undefined || eaterStr==null){
            return undefined;
        }
        return JSON.parse(eaterStr);
    }

    async getEater(){
        let eaterStr = await AsyncStorage.getItem(eaterKey);
        if(eaterStr==undefined || eaterStr==null){
            return undefined;
        }   
        return JSON.parse(eaterStr);   
    }
    
    async updateCacheEater(eater){
        await AsyncStorage.multiSet([[eaterKey, JSON.stringify(eater)]]);
    }
    
    async saveEater(eater){
        let response = await this.client.postWithAuth(config.eaterUpdateEndpoint, {eater:eater});
        if(response.statusCode===200){
            await this.updateCacheEater(eater);
        }else{
            return response.data; //todo: return reason. err
        }
       
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
        let response = await this.client.postWithoutAuth(config.authEndpointEmail, {
            email: email,
            password: password
        });
        if(response.statusCode!=200){
            Alert.alert( 'Warning', response.data,[ { text: 'OK' }]); 
            return undefined;
        }
        await AsyncStorage.multiSet([
            [principalKey, JSON.stringify(response.data.principal)],
            [authTokenKey, response.data.token]
        ]);
        let res = await this.client.getWithAuth(config.eaterEndpoint);
        if(res.statusCode!==200){
            Alert.alert( 'Warning', 'Failed login and get your profile',[ { text: 'OK' }]); 
            return undefined;          
        }
        await AsyncStorage.multiSet([
            [eaterKey, JSON.stringify(res.data.eater)]
        ]); 
        Alert.alert( '', 'Successfully logged in',[ { text: 'OK' }]);
        return res.data.eater;
    }
    
    async loginWithFbToken(token){
        let response = await this.client.postWithoutAuth(config.authEndpointFacebook, {
            token:token
        });
        if(response.statusCode!==200){
            Alert.alert( 'Warning', 'Failed login to facebook with its token',[ { text: 'OK' }]); 
            return undefined;
        }
        await AsyncStorage.multiSet([
            [principalKey, JSON.stringify(response.data.principal)],
            [authTokenKey, response.data.token]
        ]);    
        let res = await this.client.getWithAuth(config.eaterEndpoint);
        if(res.statusCode!==200){
            Alert.alert( 'Warning', 'Failed login and get your profile',[ { text: 'OK' }]); 
            return undefined;          
        }
        await AsyncStorage.multiSet([
            [eaterKey, JSON.stringify(res.data.eater)]
        ]); 
        Alert.alert( '', 'Successfully logged in through Facebook',[ { text: 'OK' }]);      
        return res.data.eater;   
    }
    
    async logOut(){
        await FBLoginManager.logout(function(error, data){
            if (!error) {
                console.log("fb logged out");
            } else {
                console.log(error, data);
            }
        });              
        await AsyncStorage.multiRemove([principalKey,authTokenKey,eaterKey]);
    }
    
    getLoginStatus(){
        return this.client.getWithAuth(config.authStatusEndpoint)
        .then((res)=>{
            if(res.statusCode===200){
                return true;
            }else{
                return AsyncStorage.multiRemove([principalKey,authTokenKey,eaterKey])
                .then(()=>{
                    return false;
                });
            }
        }).catch((err)=>{
            return AsyncStorage.multiRemove([principalKey,authTokenKey,eaterKey])
                .then(()=>{
                    return false;
                });     
        });
    }
    //todo: refresh token behind the scene.
}

module.exports = new AuthService();