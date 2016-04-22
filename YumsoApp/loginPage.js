var HttpsClient = require('./httpsClient');
var AuthService = require('./authService');
var styles = require('./style');
var FBLogin = require('react-native-facebook-login');

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight,
  ActivityIndicatorIOS,
  AsyncStorage,
  Alert
} from 'react-native';

const facebookPermissions = ["public_profile"];

class LoginPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            showProgress: false
        };
        var routeStack = this.props.navigator.state.routeStack;
        if(routeStack && routeStack.length>0){
            var passProps = routeStack[routeStack.length-1].passProps;
            if(passProps){
                this.state.callback = passProps.callback;
            }
        }
    }
    
    render() {
        var _this = this;
        return (
            <View style={styles.container}>
                <TextInput placeholder="Email" style={styles.loginInput}
                    onChangeText = {(text) => this.setState({ email: text }) }/>
                <TextInput placeholder="Password" style={styles.loginInput}
                    onChangeText = {(text) => this.setState({ password: text }) }
                    secureTextEntry={true}/>
                <TouchableHighlight style={styles.button}
                    onPress = {this.onLoginPressed.bind(this) }>
                    <Text style={styles.buttonText}>Log in</Text>
                </TouchableHighlight>
                <ActivityIndicatorIOS
                    animating={this.state.showProgress}
                    size="large"
                    style={styles.loader} />
                <TouchableHighlight style={styles.button}
                    onPress={() => this.navigateToSignUp() }>
                    <Text style={styles.buttonText}>Don't have an account? Sign up using email</Text>  
                </TouchableHighlight> 
                <Text>or</Text>
                <View style={styleLogin.loginContainer}>
                    <FBLogin style={{ marginBottom: 10, }}
                        permissions={facebookPermissions}
                        onLogin={function(data) {
                            _this.onGettingFbToken(data.credentials);
                            _this.setState({ user: data.credentials });
                        } }
                        onLogout={function() {
                            console.log("Logged out.");
                            _this.setState({ user: null });
                        } }
                        onLoginFound={function(data) {
                            console.log("Existing login found.");
                            _this.onGettingFbToken(data.credentials);
                            _this.setState({ user: data.credentials });
                        } }
                        onLoginNotFound={function() {
                            console.log("No user logged in.");
                            _this.setState({ user: null });
                        } }
                        onError={function(data) {
                            console.log("ERROR");
                            console.log(data);
                        } }
                        onCancel={function() {
                            console.log("User cancelled.");
                        } }
                        onPermissionsMissing={function(data) {
                            console.log("Check permissions!");
                            console.log(data);
                        } }/>
                </View>                 
                <TouchableHighlight style={styles.button}
                    onPress={() => this.navigateBack() }>
                    <Text style={styles.buttonText}>back</Text>
                </TouchableHighlight>
            </View>
        );
    }
    
    async onLoginPressed(){
        if(!this.state.email || !this.state.password){
            Alert.alert( 'Warning', 'No email or password',[ { text: 'OK' }]);
            return;
        }
        this.setState({showProgress:true});
        let result = await AuthService.loginWithEmail(this.state.email, this.state.password);
        if(!result){
            return;
        }
        this.setState({ success: true });
        this.setState({ showProgress: false });
        let user = await AuthService.getPrincipalInfo();
        console.log(user);
        Alert.alert( '', 'Successfully logged in',[ { text: 'OK' }]);
        this.props.navigator.pop();  
        if(this.props.onLogin){
            this.props.onLogin();
        }
        if(this.state.callback){
            this.state.callback();
        }
    }
    
    async onGettingFbToken(credentials){
        let token  = credentials.token;
        //let fbId = credentials.userId;
        this.setState({showProgress:true});
        let result = await AuthService.loginWithFbToken(token);
        if(!result){
            return;
        }
        this.setState({ success: true });
        this.setState({ showProgress: false });   
        let user = await AuthService.getPrincipalInfo();
        console.log(user);  
        Alert.alert( '', 'Successfully logged in',[ { text: 'OK' }]);
        this.props.navigator.pop();  
        if(this.props.onLogin){
            this.props.onLogin();
        }
        if(this.state.callback){
            this.state.callback();
        }
    }
    
    navigateToSignUp(){
        this.props.navigator.push({
            name: 'SignUpPage'
        });    
    }
    
    navigateBack() {
        if (this.state.callback) {
            this.state.callback();
        }
        this.props.navigator.pop();
    }
}

var styleLogin = StyleSheet.create({
  loginContainer: {
    marginTop: 150,

    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBump: {
    marginBottom: 15,
  },
});

module.exports = LoginPage;