var HttpsClient = require('./httpsClient');
var princpalKey = 'principal';
var authTokenKey = 'token';
var AsyncStorage = require('react-native').AsyncStorage;
class AuthService {
   
    constructor(props){
        this.client = new HttpsClient('http://192.168.1.134:8080');
    }
    
    async getPrincipalInfo(){
        let user = await AsyncStorage.getItem('principal');
        return user;
    }
    
    async loginWithEmail(email, password){
        var response = await this.client.postWithoutAuth("/api/v1/auth/authenticateByEmail/chef", {
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