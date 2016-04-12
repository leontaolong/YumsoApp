var HttpsClient = require('./httpsClient');
var princpalKey = 'principal';
var authTokenKey = 'token';
var AsyncStorage = require('react-native').AsyncStorage;
var config = require('./config');
class AuthService {
   
    constructor(props){
        this.client = new HttpsClient(config.baseUrl);
    }
    
    async getPrincipalInfo(){
        let eaterStr = await AsyncStorage.getItem('principal');
        return JSON.parse(eaterStr);
    }
    
    async loginWithEmail(email, password){
        var response = await this.client.postWithoutAuth(config.authEndpointEmail, {
            email: email,
            password: password
        });
        console.log(response);
        await AsyncStorage.multiSet([
            [princpalKey, JSON.stringify(response.data.principal)],
            [authTokenKey, response.data.token]
        ]);
    }
}

module.exports = new AuthService();