'use strict'
var HttpsClient = require('./httpsClient');
var AuthService = require('./authService');
var styles = require('./style');
var FBLogin = require('react-native-facebook-login');
var backIcon = require('./icons/icon-back.png');
var logoIcon = require('./icons/icon-large-logo.png');
var backgroundImage = require('./resourceImages/signInBackground.jpg');
import Dimensions from 'Dimensions';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;
import React, {
  Component,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicatorIOS,
  AsyncStorage,
  Alert
} from 'react-native';

const facebookPermissions = ["public_profile"];

class LoginPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            showProgress: false,
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
      
      var loadingSpinnerView = null;
      if (this.state.showProgress) {
          loadingSpinnerView = <View style={styles.loaderView}>
                                    <ActivityIndicatorIOS animating={this.state.showProgress} size="large" style={styles.loader}/>
                               </View>;  
      }
      
      return (
            <View style={styles.container}>
              <Image style={styles.pageBackgroundImage} source={backgroundImage}>
                <View style={styles.headerBannerView}>    
                    <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBack()}>
                        <View style={styles.backButtonView}>
                           <Image source={backIcon} style={styles.backButtonIcon}/>
                        </View>
                    </TouchableHighlight>    
                    <View style={styles.titleView}>
                        <Text style={styles.titleText}>Sign In</Text>
                    </View>
                    <View style={styles.headerRightView}>
                    </View>
               </View>
                 <ScrollView scrollEnabled={false} contentContainerStyle={styleLoginPage.scrollView}>
                    <View style={styleLoginPage.blankView}>
                    </View>
                    <View style={styles.loginInputView}>
                    <TextInput placeholder="email" style={styles.loginInput} placeholderTextColor='#fff' autoCapitalize={'none'} clearButtonMode={'while-editing'} returnKeyType = {'done'} 
                       maxLength={40} autoCorrect={false} onChangeText = {(text) => this.setState({ email: text }) }/>
                    </View>
                    <View style={styles.loginInputView}>
                    <TextInput placeholder="password" style={styles.loginInput} placeholderTextColor='#fff' returnKeyType = {'go'} onSubmitEditing = {this.onLoginPressed.bind(this)}
                       maxLength={12} onChangeText = {(text) => this.setState({ password: text }) } secureTextEntry={true}/>
                    </View>
                    
                    <View style={styleLoginPage.forgotPasswordView}>
                        <Text style={styleLoginPage.forgotPasswordText} onPress={this.onPressForgotPassword.bind(this)}>Forgot password?</Text>
                    </View>
                
                    <TouchableOpacity activeOpacity={0.7} onPress = {this.onLoginPressed.bind(this) } style={styleLoginPage.signInButtonView}>
                        <Text style={styleLoginPage.signInButtonText}>Sign in</Text>
                    </TouchableOpacity>
                        
                    <View style={styleLoginPage.askToSignUpView}>
                        <Text style={styleLoginPage.askToSignUpText}>Do not have an account? </Text>
                        <Text onPress={() => this.navigateToSignUp()} style={styleLoginPage.signUpText}>Sign up now!</Text>
                    </View>
                 </ScrollView>
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
                {loadingSpinnerView}
            </View>
        );
    }
    
    async onLoginPressed(){
        if(!this.state.email || !this.state.email.trim()){
            Alert.alert( 'Warning', 'Please enter your email',[ { text: 'OK' }]);
            return;
        }
     
        if(!this.state.password){
            Alert.alert( 'Warning', 'Please enter your password',[ { text: 'OK' }]);
            return;
        }
        
        this.setState({showProgress:true});
        let eater = await AuthService.loginWithEmail(this.state.email.trim(), this.state.password);
        this.setState({ showProgress: false });        
        if(!eater){
            return;
        }
        this.props.navigator.pop();  
        if(this.props.onLogin){
            this.props.onLogin();
        }
        if(this.state.callback){
            this.state.callback(eater);
        }
    }
    async onPressForgotPassword(){ 
        if(!this.state.email || !this.state.email.trim()){
            Alert.alert( 'Warning', 'Please enter your email',[ { text: 'OK' }]);
            return;
        }           
        this.setState({showProgress:true});
        let result = await AuthService.forgotPasswordWithEmail(this.state.email.trim());
        if(result==false){
            return;
        }
        this.setState({ showProgress: false });
    }
    async onGettingFbToken(credentials){
        let token  = credentials.token;
        this.setState({showProgress:true});
        let eater = await AuthService.loginWithFbToken(token);
        this.setState({ showProgress: false });   
        if(!eater){
            return;
        }
        this.props.navigator.pop();  
        if(this.props.onLogin){
            this.props.onLogin();
        }
        if(this.state.callback){
            this.state.callback(eater);
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
    scrollView:{
      alignItems:'center',
    },
    blankView:{
      height:windowHeight*0.184,
      width:windowWidth,
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
      fontSize:14,
      color:'#FFCC33',
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