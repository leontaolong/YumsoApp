'use strict'
var HttpsClient = require('./httpsClient');
var AuthService = require('./authService');
var styles = require('./style');
var {FBLogin} = require('react-native-facebook-login');
var backIcon = require('./icons/icon-back.png');
var logoIcon = require('./icons/icon-large-logo.png');
var backgroundImage = require('./resourceImages/background@3x.jpg');
var commonAlert = require('./commonModules/commonAlert');
var validator = require('validator');
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen')
import Dimensions from 'Dimensions';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

var windowHeightRatio = windowHeight/677;
var windowWidthRatio = windowWidth/375;

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicatorIOS,
  PushNotificationIOS,
  AsyncStorage,
  ScrollView,
  Alert,
} from 'react-native';

const facebookPermissions = ["public_profile"];

class WelcomePage extends Component {
    constructor(props){
        super(props);
        this.state = {
            showProgress: false,
        };

        PushNotificationIOS.requestPermissions();
        PushNotificationIOS.checkPermissions((permissions) => {
            console.log(permissions);
        });
    }

    render() {
      var _this = this;

      var loadingSpinnerView = null;
      if (this.state.showProgress) {
          loadingSpinnerView =<LoadingSpinnerViewFullScreen/>;
      }

      console.log('LoginPage deviceToken '+this.state.deviceToken);

      return (
            <View style={styles.containerNew}>
              <Image style={styles.pageBackgroundImage} source={backgroundImage}>
                  <View style={styles.headerBannerViewNew}>
                      <View style={styles.headerLeftView}>
                      </View>
                      <View style={styles.headerRightView}>
                      </View>
                  </View>
                  <View style={styles.titleViewNew}>
                      <Text style={styles.titleTextNew}>Welcome to Yumso</Text>
                      <Text style={styleWelcomePage.pageSubTitle}>Choose one way to sign in</Text>
                  </View>
                  <View style={{height:windowHeightRatio*50}}>
                  </View>
                  <TouchableOpacity activeOpacity={0.7} style={styles.secondaryButtonView} onPress={()=>this.goToLoginPage()}>
                      <Text style={styles.secondaryButtonText}>Sign in with Email</Text>
                  </TouchableOpacity>
                  <View style={{height:windowHeightRatio*15}}>
                  </View> 
                  <View style={styleWelcomePage.fbSignInButtonView}>
                    <FBLogin style={styleWelcomePage.fbSignInButton}
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
                  <View style={{flex:1}}>
                  </View>
                  <View style={{marginHorizontal: 20*windowWidthRatio}}>
                     <Text style={styleWelcomePage.pageSubTitle}>Don't have an account?</Text>
                  </View>
                  <View style={{height:windowHeightRatio*14}}>
                  </View>
                  <TouchableOpacity activeOpacity={0.7} style={styles.secondaryWhiteButtonView} onPress={()=>this.navigateToSignUp()}>
                      <Text style={styles.secondaryWhiteButtonText}>Sign up Now !</Text>
                  </TouchableOpacity>
                  <View style={{height:windowHeightRatio*40}}>
                  </View>
              </Image>
              {loadingSpinnerView}
            </View>
        );
    }

    async onLoginPressed(){
        if(!this.state.email || !this.state.email.trim()){
            Alert.alert( 'Warning', 'Please enter your email',[ { text: 'OK' }]);
            return;
        }

        if(this.state.email && !validator.isEmail(this.state.email)){
            Alert.alert( 'Warning', 'Invalid email.',[ { text: 'OK' }]);
            return;
        }

        if(!this.state.password){
            Alert.alert( 'Warning', 'Please enter your password',[ { text: 'OK' }]);
            return;
        }

        this.setState({showProgress:true});
        let deviceToken = await AuthService.getDeviceTokenFromCache();
        try{
           let eater = await AuthService.loginWithEmail(this.state.email.trim(), this.state.password, deviceToken);
           this.setState({ showProgress: false });
           if(!eater){
              return;
           }
           let principal = await AuthService.getPrincipalInfo();
           if(!eater.phoneNumber || !eater.phoneNumber.trim()|| !eater.email || !eater.email.trim() || !eater.eaterAlias || !eater.eaterAlias.trim()){
              this.navigateToEaterPage(eater,principal);
              return;
           }

           var currentRoutes = this.props.navigator.getCurrentRoutes();
           if(currentRoutes && currentRoutes.length==1 && currentRoutes[0].name == "LoginPage"){
              this.jumpToChefList();
           }else{
              this.props.navigator.pop();
           }
           if(this.props.onLogin){
              this.props.onLogin();
           }
           if(this.state.callback){
              this.state.callback(eater,principal);
           }
        }catch(err){
           this.setState({ showProgress: false });
           commonAlert.networkError(err);
        }
    }
    async onPressForgotPassword(){
        if(!this.state.email || !this.state.email.trim()){
            Alert.alert( 'Warning', 'Please enter your email',[ { text: 'OK' }]);
            return;
        }

        if(this.state.email && !validator.isEmail(this.state.email)){
            Alert.alert( 'Warning', 'Invalid email.',[ { text: 'OK' }]);
            return;
        }

        this.setState({showProgress:true});
        try{
           let result = await AuthService.forgotPasswordWithEmail(this.state.email.trim());
           if(result==false){
              this.setState({ showProgress: false });
              return;
           }
           this.setState({ showProgress: false });
        }catch(err){
           this.setState({ showProgress: false });
           commonAlert.networkError(err);
        }
    }
    async onGettingFbToken(credentials){
        let token  = credentials.token;
        this.setState({showProgress:true});
        let deviceToken = await AuthService.getDeviceTokenFromCache();
        try{
           let eater = await AuthService.loginWithFbToken(token,deviceToken);
           this.setState({ showProgress: false });
           if(!eater){
              return;
           }
           let principal = await AuthService.getPrincipalInfo();
           if(!eater.phoneNumber || !eater.phoneNumber.trim()|| !eater.email || !eater.email.trim() || !eater.eaterAlias || !eater.eaterAlias.trim()){
              this.navigateToEaterPage(eater,principal);
              return;
           }
           //If not logged in, direct to login page,if logged in direct to cheflist page
           console.log("current routes(before): "+JSON.stringify(this.props.navigator.getCurrentRoutes()));
           var currentRoutes = this.props.navigator.getCurrentRoutes();
           if(currentRoutes && currentRoutes.length==1 && currentRoutes[0].name == "WelcomePage"){
              this.jumpToChefList();
           }else{
              this.props.navigator.pop();
           }
           console.log("current routes(after): "+JSON.stringify(this.props.navigator.getCurrentRoutes()));

           if(this.props.onLogin){
              this.props.onLogin();
           }
           if(this.state.callback){
              this.state.callback(eater,principal);
           }
        }catch(err){//todo:login failed but still shows "log out" icon
           this.setState({ showProgress: false });
           commonAlert.networkError(err);
        }
    }

    navigateToSignUp(){
        this.props.navigator.push({
            name: 'SignUpPage'
        });
    }

    goToLoginPage(){
        this.props.navigator.push({
            name: 'LoginPage'
        });
    }

    navigateToEaterPage(eater,principal){
        this.props.navigator.push({
            name: 'EaterPage',
            passProps:{
                eater: eater,
                principal:principal,
                backcallback:this.state.callback,
                callback: function(eater){
                    this.props.caller.setState({eater:eater, edit:true});
                }.bind(this)
            }
        });
    }

    jumpToChefList(){
       this.props.navigator.resetTo({name:'ChefListPage'});
    }

    navigateToChefList(){
        this.props.navigator.push({
            name: 'ChefListPage'
        });
    }

    navigateBack() {
        if (this.state.backCallback) {
            this.state.backCallback();
        }
        this.props.navigator.pop();
    }
}

var styleWelcomePage = StyleSheet.create({
    scrollView:{
      alignItems:'center',
      marginTop: 0,
      paddingTop: 64* windowHeightRatio,
      marginLeft: 20  * windowWidthRatio,
      width: windowWidth - 40  * windowWidthRatio,
    },
    blankView:{
      height:windowHeight*0.225,
      width:windowWidth,
      justifyContent:'flex-end',
      alignItems:'center',
      paddingBottom:10*windowHeight/667,
    },
    loginMethodPartitionText:{
      fontSize:18*windowHeight/667,
      fontWeight:'600',
      fontStyle: 'italic',
      backgroundColor:'transparent',
      color:'#fff',
    },
    signInButtonView:{
      height: 50 * windowHeightRatio,
      bottom: 0,
      width:windowWidth,
      backgroundColor:'#FFCC33',
      justifyContent: 'center',
      marginTop: 60 * windowHeightRatio,

    },
    signInButtonText:{
      color:'#fff',
      fontSize: windowHeight/35.5,
      fontWeight:'bold',
      alignSelf:'center',
    },
    askToSignUpView:{
      height:35*windowHeight/667,
      justifyContent: 'center',
      alignItems:'flex-end',
      flexDirection:'row',
    },
    askToSignUpText:{
      fontSize:16*windowHeight/667,
      fontWeight:'500',
      color:'#FFF',
      backgroundColor:'transparent',
    },
    signUpText:{
      fontSize:16*windowHeight/667,
      fontWeight:'500',
      color:'#FFCC33',
      backgroundColor:'transparent',
    },
    forgotPasswordView:{
      height:windowHeight/25,
      flexDirection:'row',
      width:windowWidth*0.8,
      marginBottom:windowWidth/49.2,
      justifyContent:'flex-end',
      marginTop:6 * windowHeightRatio,
    },
    forgotPasswordViewNew:{
      height:30 * windowHeightRatio,
      flexDirection:'row',
      width:windowWidth - 40  * windowWidthRatio,
      marginTop:10 * windowHeightRatio,
    },
    forgotPasswordText:{
      fontSize:15*windowHeight/677,
      color:'#979797',
      backgroundColor:'transparent',
    },
    fbSignInButtonView:{
      flexDirection:'row',
      height:windowHeight*0.075,
      width:windowWidth*0.8,
      justifyContent:'center',
      backgroundColor:'#415DAE',
    },
    fbSignInButton:{
      alignSelf:'center',
    },
    textFieldTitle: {
      fontSize: 15 * windowHeightRatio,
      color: '#979797',
      marginLeft: 0,
      textAlign: "left",
      width: windowWidth - 40  * windowWidthRatio,
      marginTop: 12 * windowHeightRatio,
    },
    pageSubTitle: {
        fontSize:windowHeight/35.5,
        fontWeight:'600',
        color:'#4A4A4A',
    },
    fbSignInButtonView:{
        flexDirection:'column', 
        height:windowHeight*0.075, 
        justifyContent:'center',
        backgroundColor:'#415DAE',
        marginHorizontal:windowWidth/20.7,
        marginVertical:windowHeight*0.005,
    },

    fbSignInButton:{
        alignSelf:'center',
    }
});

module.exports = WelcomePage;
