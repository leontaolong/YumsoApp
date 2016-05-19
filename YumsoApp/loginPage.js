'use strict'
var HttpsClient = require('./httpsClient');
var AuthService = require('./authService');
var styles = require('./style');
var FBLogin = require('react-native-facebook-login');
var backIcon = require('./icons/icon-back.png');
var logoIcon = require('./icons/Icon-Large.png');
var backgroundImage = require('./resourceImages/signInBackground.jpg');
import Dimensions from 'Dimensions';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;
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
                this.state.backCallback = passProps.backCallback;
            }
        }
    }
    
    render() {
        var _this = this;
        return (
            <View style={styles.container}>
              <View style={styleLoginPage.headerBannerView}>    
                 <View style={styles.headerLeftView}>
                    <TouchableHighlight underlayColor={'transparent'} style={styles.backButtonView} onPress={() => this.navigateBack()}>
                      <Image source={backIcon} style={styleLoginPage.backButtonIcon}/>
                    </TouchableHighlight>
                 </View>    
                 <View style={styles.titleView}>
                    <Text style={styles.titleText}>Sign In</Text>
                 </View>
                 <View style={styles.headerRightView}>
                 </View>
             </View>
             <Image style={styles.pageBackgroundImage} source={backgroundImage}>
                <View style={{height:windowHeight*0.184,width:windowWidth,}}>
                </View>
                <View style={styles.loginInputView}>
                  <TextInput placeholder="email" style={styles.loginInput} placeholderTextColor='#fff' autoCapitalize={'none'} clearButtonMode={'while-editing'} returnKeyType = {'done'} autoCorrect={false}
                       onChangeText = {(text) => this.setState({ email: text }) }/>
                </View>
                <View style={styles.loginInputView}>
                  <TextInput placeholder="password" style={styles.loginInput} placeholderTextColor='#fff' returnKeyType = {'go'} onSubmitEditing = {this.onLoginPressed.bind(this)}
                        onChangeText = {(text) => this.setState({ password: text }) } secureTextEntry={true}/>
                </View>
                
                <View style={styleLoginPage.forgotPasswordView}>
                      <Text style={styleLoginPage.forgotPasswordText}>Forgot password?</Text>
                </View>
               
                <TouchableHighlight underlayColor={'#C0C0C0'} onPress = {this.onLoginPressed.bind(this) } style={styleLoginPage.signInButtonView}>
                       <Text style={styleLoginPage.signInButtonText}>Sign in</Text>
                </TouchableHighlight>
                       
                <View style={styleLoginPage.askToSignUpView}>
                       <Text style={styleLoginPage.askToSignUpText}>Do not have an account? </Text>
                       <Text onPress={() => this.navigateToSignUp()} style={styleLoginPage.signUpText}>Sign up now!</Text>
                </View>
                
                <ActivityIndicatorIOS animating={this.state.showProgress} size="large" style={styles.loader} />
              </Image>
              <View style={styleLoginPage.fbSignInButtonView}>
                    <FBLogin style={styleLoginPage.fbSignInButton}
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
        let user = await AuthService.getEater();
        Alert.alert( '', 'Successfully logged in',[ { text: 'OK' }]);
        this.props.navigator.pop();  
        if(this.props.onLogin){
            this.props.onLogin();
        }
        if(this.state.callback){
            this.state.callback(user);
        }
    }
    
    async onGettingFbToken(credentials){
        let token  = credentials.token;
        this.setState({showProgress:true});
        let result = await AuthService.loginWithFbToken(token);
        if(!result){
            return;
        }
        this.setState({ success: true });
        this.setState({ showProgress: false });   
        let user = await AuthService.getEater();
        Alert.alert( '', 'Successfully logged in through Facebook',[ { text: 'OK' }]);
        this.props.navigator.pop();  
        if(this.props.onLogin){
            this.props.onLogin();
        }
        if(this.state.callback){
            this.state.callback(user);
        }
    }
    
    navigateToSignUp(){
        this.props.navigator.push({
            name: 'SignUpPage'
        });    
    }
    
    navigateBack() {
        if (this.state.backCallback) {
            this.state.backCallback();
        }
        this.props.navigator.pop();
    }
}

var styleLoginPage = StyleSheet.create({
    headerBannerView:{
      flexDirection:'row',
      borderBottomWidth:1,
      borderColor:'#D7D7D7',
      height:windowHeight/16.4,
    },
    backButtonView:{
      flex:0.1/3,
      width:windowWidth/3,
      paddingTop:6,
    },
    backButtonIcon:{
      width:30,
      height:30,
    },
    signInButtonView:{
      height:windowHeight*0.08,
      width:windowWidth*0.634,
      backgroundColor:'#FFCC33',
      justifyContent: 'center',
    }, 
    signInButtonText:{
      color:'#fff',
      fontSize:windowHeight/30.6,
      fontWeight:'bold',
      alignSelf:'center',
    },
    askToSignUpView:{
      height:windowHeight/13.38, 
      justifyContent: 'center',   
      flexDirection:'row',  
    },
    askToSignUpText:{
      fontSize:16,
      color:'#FFF',
      alignSelf:'center',
      backgroundColor:'transparent',
    },
    signUpText:{
      fontSize:16,
      color:'#FFCC33',
      alignSelf:'center',
      backgroundColor:'transparent',
    },
    forgotPasswordView:{
      height:windowHeight/25,
      flexDirection:'row',
      width:windowWidth*0.634,
      marginBottom:windowWidth/49.2,
      justifyContent:'flex-end',
      marginTop:6,
    },
    forgotPasswordText:{
      fontSize:16,
      color:'#FFF',
      backgroundColor:'transparent',
    },
    fbSignInButtonView:{
      justifyContent:'center',
      flexDirection:'row',
      height:windowHeight/13.38,
      backgroundColor:'#3b5998',
      position:'absolute',
      left: 0, 
      right: 0,
      top:windowHeight-windowHeight/13.38,
    },
    fbSignInButton:{
      alignSelf:'center',
    }
});

module.exports = LoginPage;