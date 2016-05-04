var HttpsClient = require('./httpsClient');
var AuthService = require('./authService');
var styles = require('./style');
var FBLogin = require('react-native-facebook-login');
var backIcon = require('./icons/ic_keyboard_arrow_left_48pt_3x.png');
var logoIcon = require('./icons/Icon-Large.png');
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
                   <View style={styleLoginPage.backButtonView}>
                       <TouchableHighlight onPress={() => this.navigateBack()}>
                            <Image source={backIcon} style={styleLoginPage.backButtonIcon}/>
                       </TouchableHighlight>
                   </View>    
                   <View style={styleLoginPage.titleView}>
                       <Text style={styleLoginPage.titleText}>Sign In</Text>
                   </View>
                   <View style={{flex:0.1/3,width:windowWidth/3}}>
                   </View>
                </View>
                
                <View style={styleLoginPage.logoView}>
                    <Image source={logoIcon} style={styleLoginPage.logoIcon}/>
                </View>
                
                <TextInput placeholder="Email" style={styleLoginPage.loginInput}
                       onChangeText = {(text) => this.setState({ email: text }) }/>

                
                <TextInput placeholder="Password" style={styleLoginPage.loginInput}
                        onChangeText = {(text) => this.setState({ password: text }) } secureTextEntry={true}/>
                
                <View style={styleLoginPage.forgotPasswordView}>
                      <Text style={styleLoginPage.forgotPasswordText}>Forgot password? </Text>
                </View>
               
                <TouchableHighlight onPress = {this.onLoginPressed.bind(this) } style={styleLoginPage.signInButtonView}>
                       <Text style={styleLoginPage.signInButtonText}>Log in</Text>
                </TouchableHighlight>
                       
                <View style={styleLoginPage.askToSignUpView}>
                    <Text style={styleLoginPage.askToSignUpText}>No Yumso account?</Text>
                </View>
                
                <TouchableHighlight onPress={() => this.navigateToSignUp()} style={styleLoginPage.signUpButtonView}>
                    <Text style={styleLoginPage.signUpButtonText}>Sign up</Text>  
                </TouchableHighlight> 

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
                <ActivityIndicatorIOS animating={this.state.showProgress} size="large" style={styles.loader} />
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
    logoView:{
      alignItems:'center',
      paddingTop:windowHeight/15.4,
      paddingBottom:windowHeight/20,
    },
    logoIcon:{
      width:windowWidth/4.14,
      height:windowWidth/4.14,
    },
    titleView:{
      flex:0.1/3, 
      width:windowWidth/3,
      alignItems:'center',     
    },
    titleText:{
      marginTop:12,
      fontSize:14,
      fontWeight:'600',  
    },
    loginInput:{
      height:windowHeight/12.6,
      fontSize:windowHeight/33.4,
      color: '#696969',
      justifyContent:'center',
      borderWidth:1,
      borderColor: '#D7D7D7',
      paddingVertical:5,
      paddingHorizontal:windowHeight/49.0,
      marginHorizontal:windowWidth/24.6,
      marginTop:windowWidth/49.2,
      marginBottom:windowWidth/49.2,
      textAlign:'center',
    },
    signInButtonView:{
      height:windowHeight/13.38,
      backgroundColor:'#ff9933',
      justifyContent: 'center',
      marginHorizontal:windowWidth/24.6,
    }, 
    signInButtonText:{
      color:'#fff',
      fontSize:windowHeight/30.6,
      fontWeight:'300',
      alignSelf:'center',
    },
    askToSignUpView:{
      height:windowHeight/13.38, 
      justifyContent: 'center',     
    },
    askToSignUpText:{
      fontSize:12,
      color:'#696969',
      alignSelf:'center',
    },
    signUpButtonView:{
      height:windowHeight/13.38,
      backgroundColor:'#ffcc33',
      justifyContent: 'center',
      marginHorizontal:windowWidth/24.6,
    }, 
    signUpButtonText:{
      color:'#fff',
      fontSize:windowHeight/30.6,
      fontWeight:'300',
      alignSelf:'center',
      marginBottom:3,
    },
    forgotPasswordView:{
      height:windowHeight/25,
      marginHorizontal:windowWidth/24.6,
      justifyContent: 'flex-end',
      flexDirection:'row',
      marginBottom:windowWidth/49.2,
    },
    forgotPasswordText:{
      fontSize:12,
      color:'#A9A9A9',
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
});

module.exports = LoginPage;