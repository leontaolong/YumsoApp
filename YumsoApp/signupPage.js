'use strict'
var HttpsClient = require('./httpsClient');
var AuthService = require('./authService');
var styles = require('./style');
var backIcon = require('./icons/icon-back.png');
var logoIcon = require('./icons/icon-large-logo.png');
var backgroundImage = require('./resourceImages/background@3x.jpg');
var commonAlert = require('./commonModules/commonAlert');
var validator = require('validator');
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen')

import Dimensions from 'Dimensions';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;
var keyboardHeight = 280 //Todo: get keyboard size programmatically.

var windowHeightRatio = windowHeight/677;
var windowWidthRatio = windowWidth/375;

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

class SignUpPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            showProgress: false,
        };
    }

    render() {
            var loadingSpinnerView = null;
            if (this.state.showProgress) {
                loadingSpinnerView = <LoadingSpinnerViewFullScreen/>;
            }

            return (//TODO: i agree terms and conditions.
                <View style={styles.containerNew}>
                    <Image style={styles.pageBackgroundImage} source={backgroundImage}>
                        {/*}<View style={styles.headerBannerView}>*/}
                            {/*}<TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBack()}>
                              <View style={styles.backButtonViewNew}>
                                  <Image source={backIcon} style={styles.backButtonIcon}/>
                              </View>
                            </TouchableHighlight>
                            {/*}<View style={styles.titleView}>
                                <Text style={styles.titleTextNew}>Sign Up</Text>
                            </View>*/}
                            {/*}<View style={styles.headerRightView}>
                            </View>*/}
                        {/*}</View>*/}

                        <View style={styles.headerBannerViewNew}>
                            <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBack()}>
                              <View style={styles.backButtonViewsNew}>
                                  <Image source={backIcon} style={styles.backButtonIconsNew}/>
                              </View>
                            </TouchableHighlight>

                            <View style={styles.headerRightView}>
                            </View>
                        </View>

                        <ScrollView style={styleSignUpPage.scrollViewSignUpNew} keyboardShouldPersistTaps={true} ref="scrollView">
                            {/*}<View style={styleSignUpPage.logoView}>
                                <Image source={logoIcon} style={styleSignUpPage.logoIcon}/>
                            </View>*/}
                            <View style={styleSignUpPage.titleViewNew}>
                                <Text style={styles.titleTextNew}>Sign Up</Text>
                            </View>

                            <Text style={styles.textFieldTitle}>First Name </Text>

                            <View style={styles.loginInputViewNew}>
                                <TextInput placeholder="first name" style={styles.loginInputNew} autoCorrect={false} placeholderTextColor='#fff' returnKeyType = {'done'} maxLength={30}
                                onSubmitEditing={this.onKeyBoardDonePressed.bind(this)} onFocus={(()=>this._onFocus()).bind(this)} onChangeText = {(text)=>this.setState({firstname: text})}/>
                            </View>



                            <Text style={styles.textFieldTitle}>Last Name  </Text>
                            <View style={styles.loginInputViewNew}>
                                <TextInput placeholder="last name" style={styles.loginInputNew} autoCorrect={false} placeholderTextColor='#fff' returnKeyType = {'done'}  maxLength={30}
                                onSubmitEditing={this.onKeyBoardDonePressed.bind(this)} onFocus={(()=>this._onFocus()).bind(this)} onChangeText = {(text)=>this.setState({lastname: text})}/>
                            </View>


                            <Text style={styles.textFieldTitle}>Email  </Text>

                            <View style={styles.loginInputViewNew}>
                                <TextInput placeholder="email" style={styles.loginInputNew} autoCapitalize={'none'} placeholderTextColor='#fff' returnKeyType = {'done'} maxLength={40}
                                onSubmitEditing={this.onKeyBoardDonePressed.bind(this)} onFocus={(()=>this._onFocus()).bind(this)} clearButtonMode={'while-editing'} autoCorrect={false} onChangeText = {(text)=>this.setState({email: text})}/>
                            </View>


                            <Text style={styles.textFieldTitle}>Password  </Text>

                            <View style={styles.loginInputViewNew}>
                                <TextInput placeholder="password" style={styles.loginInputNew} placeholderTextColor='#fff' onFocus={(()=>this._onFocus()).bind(this)} maxLength={12}
                                onSubmitEditing={this.onKeyBoardDonePressed.bind(this)} returnKeyType = {'done'} onChangeText = {(text)=>this.setState({password: text})} secureTextEntry={true}/>
                            </View>



                            <Text style={styles.textFieldTitle}>Confirm Password  </Text>

                            <View style={styles.loginInputViewNew}>
                                <TextInput placeholder="confirm password" style={styles.loginInputNew} placeholderTextColor='#fff' onFocus={(()=>this._onFocus()).bind(this)} maxLength={12}
                                returnKeyType = {'done'} onSubmitEditing={this.onKeyBoardDonePressed.bind(this)} onChangeText = {(text)=>this.setState({password_re: text})} secureTextEntry={true}/>
                            </View>
                            <View style={{height:0}} onLayout={((event)=>this._onLayout(event)).bind(this)}></View>
                            <View style={styleSignUpPage.legalView}>
                                <Text style={styleSignUpPage.legalText}>By signing up, I agree with the </Text>
                                <Text style={styleSignUpPage.legalTextClickable} onPress = {()=>this.navigateToTermsPage()}>Terms & Conditions</Text>
                            </View>
                        </ScrollView>
                    </Image>
                    <TouchableOpacity activeOpacity={0.7} style={styles.footerView} onPress = {this.onSignUpPressed.bind(this)}>
                        <Text style={styles.bottomButtonView}>Next</Text>
                    </TouchableOpacity>
                    {loadingSpinnerView}
                </View>
            );
    }

    _onLayout(event) {
        this.y = event.nativeEvent.layout.y;
    }

    _onFocus() {
        // this.setState({showPasswordRequirment:true});
        let scrollViewLength = this.y;
        let scrollViewBottomToScreenBottom = windowHeight - (scrollViewLength + windowHeight*0.066 + 15);//headerbanner+windowMargin
        this.refs.scrollView.scrollTo({x:0, y:keyboardHeight - scrollViewBottomToScreenBottom, animated: true})
    }

    onKeyBoardDonePressed(){
        // this.setState({showPasswordRequirment:false});
        this.refs.scrollView.scrollTo({x:0, y:0, animated: true})
    }

        //password strength check
   isPasswordStrong () {
        if (this.state.password.length < 7) {
            return false;
        }

        var hasUpper = false;
        for (var i = 0; i < this.state.password.length; i++) {
             if (this.state.password[i] >= 'A' && this.state.password[i] <= 'Z') {
                 var hasUpper = true;
                 break;
             }
        }

        var hasLower = false;
        for (var i = 0; i < this.state.password.length; i++) {
             if (this.state.password[i] >= 'a' && this.state.password[i] <= 'z') {
                 var hasLower = true;
                 break;
             }
        }

        var hasNumber = false;
        for (var i = 0; i < this.state.password.length; i++) {
             if (this.state.password[i] >= '0' && this.state.password[i] <= '9') {
                 var hasNumber = true;
                 break;
             }
        }

        return hasUpper && hasLower && hasNumber;
    }

    async onSignUpPressed(){
        if(!this.state.firstname || !this.state.firstname.trim()){
            Alert.alert( 'Warning', 'Please enter your first name',[ { text: 'OK' }]);
            return;
        }

        if(!this.state.lastname || !this.state.lastname.trim()){
            Alert.alert( 'Warning', 'Please enter your last name',[ { text: 'OK' }]);
            return;
        }

        if(!this.state.email || !this.state.email.trim()){
            Alert.alert( 'Warning', 'Please enter your email',[ { text: 'OK' }]);
            return;
        }

        if(this.state.email && !validator.isEmail(this.state.email)){
            Alert.alert( 'Warning', 'Invalid email.',[ { text: 'OK' }]);
            return;
        }

        if(!this.state.password){
            Alert.alert( 'Warning', 'Please set your password',[ { text: 'OK' }]);
            return;
        }

        if(!this.state.password_re){
            Alert.alert( 'Warning', 'Please re-enter your password' ,[ { text: 'OK' }]);
            return;
        }

        if(!this.isPasswordStrong()){
            Alert.alert( 'Warning', 'Your password should contain 7-12 characters with at least one number,one lower case letter and one upper case letter' ,[ { text: 'OK' }]);
            return;
        }

        if(this.state.password_re !== this.state.password){
            Alert.alert( 'Warning', 'The two password entries do not match' ,[ { text: 'OK' }]);
            return;
        }
        this.setState({showProgress:true});

        try{
            var result = await AuthService.registerWithEmail(this.state.firstname.trim(), this.state.lastname.trim(),this.state.email.trim(), this.state.password, this.state.password_re);
            if(result==false){
               this.setState({ showProgress: false });
               return;
            }
            this.setState({ showProgress: false });
            this.props.navigator.push({
                name: 'VerificationPage',
                passProps: {
                    email: this.state.email
                }
            });
        }catch(err){
           this.setState({ showProgress: false });
           commonAlert.networkError(err);
        }
    }

    navigateBack() {
        this.props.navigator.pop();
    }

    navigateToTermsPage () {
        this.props.navigator.push({
            name: 'TermsPage',
        });
    }
}


var styleSignUpPage = StyleSheet.create({
    logoView:{
      height:windowHeight*0.288,
      alignItems:'center',
      paddingTop:windowHeight*0.109,
    },
    logoIcon:{
      width:windowWidth*0.208,
      height:windowWidth*0.208,
    },
    legalView:{
      flex:1,
      flexDirection:'row',
      justifyContent: 'center',
      backgroundColor:'transparent',
      paddingTop:15,
      paddingBottom: 40,
    },
    // legalText:{
    //   fontSize:windowHeight/47.64,
    //   fontWeight:'400',
    //   color:'#979797',
    // },
    // legalTextClickable:{
    //   fontSize:windowHeight/47.64,
    //   fontWeight:'400',
    //   textDecorationLine: "underline",
    //   color:'#979797',
    // },
    signUpButtonText:{
      color:'#fff',
      fontSize: windowHeight/35.5,
      fontWeight:'bold',
      alignSelf:'center',

    },

    scrollViewStyle:{
      justifyContent: 'center',

    },

    blankViewStyle:{
      height : 72 * windowHeightRatio,
    },

    textFieldTitle: {
      fontSize: 15 * windowHeightRatio,
      color: '#979797',
      marginLeft: 0,
      textAlign: "left",
      width: windowWidth-40 * windowWidthRatio,
      marginTop: 12 * windowHeightRatio,
    },

    legalText:{
      fontSize: 13*windowHeight/677,
      fontWeight:'400',
      color:'#979797',
    },
    legalTextClickable:{
      fontSize: 13*windowHeight/677,
      fontWeight:'400',
      textDecorationLine: "underline",
      color:'#979797',
    },

    scrollViewSignUpNew:{

    marginTop: 0,
    paddingTop: 0,
    marginLeft: 20 * windowWidthRatio,
    width: windowWidth - 40 * windowWidthRatio,
    flexDirection:'column',
    },

    titleViewNew:{
      width:windowWidth,
      height: 78 * windowHeightRatio,
      marginTop: 0,
      marginLeft: 0,

//backgroundColor: "#0000aa",
    },



});
module.exports = SignUpPage;
