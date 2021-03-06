var HttpsClient = require('./httpsClient');
var principalKey = 'principal';
var authTokenKey = 'token';
var eaterKey = 'eater';
var AsyncStorage = require('react-native').AsyncStorage;
var config = require('./config');

import {FBLoginManager} from 'react-native-facebook-login';
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

    async getDeviceTokenFromCache(){
        let deviceToken = await AsyncStorage.getItem('deviceToken');
        if(!deviceToken){
            return 'No_Device_Token';
        }   
        return deviceToken;   
    }
    
    async updateCacheEater(eater){
        await AsyncStorage.multiSet([[eaterKey, JSON.stringify(eater)]]);
    }

    async updateCacheDeviceToken(deviceToken) {
        await AsyncStorage.setItem('deviceToken', deviceToken);
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
        if(response.statusCode==200 || response.statusCode==202){
            //Alert.alert( 'Verify Your Email', 'Please click to verify through the email just sent to you. Check spam in case you do not find it in inbox',[ { text: 'OK' }]); 
            return true;
        }else{
            Alert.alert( 'Warning', response.data,[ { text: 'OK' }]);
            return false; 
        }
    }
    
    async forgotPasswordWithEmail(email){
        let response = await this.client.postWithoutAuth(config.forgotPasswordEndpointEmail + email, {});
        if(response.statusCode==200 || response.statusCode==202){
            Alert.alert( 'Success', 'Please reset the password through the link sent to '+email,[ { text: 'OK' }]); 
            return true;
        }else{
            Alert.alert( 'Warning', response.data,[ { text: 'OK' }]);
            return false; 
        }
    }
    
    async resetPassword(email, oldPassword, newPassword){
        let response = await this.client.postWithoutAuth(config.resetPasswordEndpoint, {
            email: email,
            oldPassword: oldPassword,
            newPassword: newPassword,
        });
        if(response.statusCode==200 || response.statusCode==202){
            Alert.alert( 'Success', 'You password has been updated',[ { text: 'OK' }]); 
            return true;
        }else{
            Alert.alert( 'Error', response.data,[ { text: 'OK' }]);
            return false; 
        }
    }
        
    async loginWithEmail(email, password,deviceToken){
        let response = await this.client.postWithoutAuth(config.authEndpointEmail, {
            email: email,
            password: password,
            deviceToken: deviceToken
        });
        if(response.statusCode!=200 && response.statusCode!=202){
            if(response.data && response.data.includes('verify')){
              Alert.alert( 'Email Not Verified', response.data,[ { text: 'OK' }]);
            }else{
              Alert.alert( 'Error', response.data,[ { text: 'OK' }]);
            }
            return undefined;
        }
        await AsyncStorage.multiSet([
            [principalKey, JSON.stringify(response.data.principal)],
            [authTokenKey, response.data.token]
        ]);
        let res = await this.client.getWithAuth(config.eaterEndpoint);
        if(res.statusCode!==200 && res.statusCode!==202){
            Alert.alert( 'Warning', 'Failed login and get your profile',[ { text: 'OK' }]); 
            return undefined;          
        }
        await AsyncStorage.multiSet([
            [eaterKey, JSON.stringify(res.data.eater)]
        ]); 
        //Alert.alert( '', 'Successfully logged in',[ { text: 'OK' }]);
        return res.data.eater;
    }
    
    async loginWithFbToken(token,deviceToken){
        console.log("loginWithDeviceToken: " + deviceToken);
        let response = await this.client.postWithoutAuth(config.authEndpointFacebook, {
            token:token,
            deviceToken:deviceToken
        });
        if(response.statusCode!==200 && response.statusCode!==202){
            Alert.alert( 'Warning', 'Failed login to facebook with its token',[ { text: 'OK' }]); 
            return undefined;
        }
        await AsyncStorage.multiSet([
            [principalKey, JSON.stringify(response.data.principal)],
            [authTokenKey, response.data.token]
        ]);    
        let res = await this.client.getWithAuth(config.eaterEndpoint);
        if(res.statusCode!==200 && res.statusCode!==202){
            Alert.alert( 'Warning', 'Failed login and get your profile',[ { text: 'OK' }]); 
            return undefined;          
        }
        await AsyncStorage.multiSet([
            [eaterKey, JSON.stringify(res.data.eater)]
        ]); 
        //Alert.alert( '', 'Successfully logged in through Facebook',[ { text: 'OK' }]);      
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
            if(res.statusCode===200 || res.statusCode===202){
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