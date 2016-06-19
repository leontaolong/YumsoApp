'use strict'
var HttpsClient = require('./httpsClient');
var AuthService = require('./authService');
var styles = require('./style');
var backIcon = require('./icons/icon-back.png');
var logoIcon = require('./icons/icon-large-logo.png');
var backgroundImage = require('./resourceImages/signInBackground.jpg');
import Dimensions from 'Dimensions';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;
var keyboardHeight = 280 //Todo: get keyboard size programmatically.

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
            showPasswordRequirment:false,
        };
    }
    
    render() {
            if(this.state.showPasswordRequirment){
              var passwordRequirmentText = <Text style={styleSignUpPage.passwordRequirementText}>
                                            Your password should contain 7-12 characters with at least one number,one lower case letter and one upper case letter
                                           </Text>;
            }
            
        
            return (//TODO: i agree terms and conditions.
                <View style={styles.container}>
                    <Image style={styles.pageBackgroundImage} source={backgroundImage}>
                        <View style={styles.headerBannerView}>    
                            <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBack()}>
                              <TouchableHighlight style={styles.backButtonView}>
                                  <Image source={backIcon} style={styles.backButtonIcon}/>
                              </TouchableHighlight>
                            </TouchableHighlight>    
                            <View style={styles.titleView}>
                                <Text style={styles.titleText}>Sign Up</Text>
                            </View>
                            <View style={styles.headerRightView}>
                            </View>
                        </View>
                        <ScrollView contentContainerStyle={{alignItems:'center'}} keyboardShouldPersistTaps={true} ref="scrollView">
                            <View style={styleSignUpPage.logoView}>
                                <Image source={logoIcon} style={styleSignUpPage.logoIcon}/>
                            </View>
                            
                            <View style={styles.loginInputView}>
                                <TextInput placeholder="first name" style={styles.loginInput} autoCorrect={false} placeholderTextColor='#fff' returnKeyType = {'done'} 
                                onSubmitEditing={this.onKeyBoardDonePressed.bind(this)} onFocus={(()=>this._onFocus()).bind(this)} onChangeText = {(text)=>this.setState({firstname: text})}/>
                            </View> 
                            <View style={styles.loginInputView}>
                                <TextInput placeholder="last name" style={styles.loginInput} autoCorrect={false} placeholderTextColor='#fff' returnKeyType = {'done'} 
                                onSubmitEditing={this.onKeyBoardDonePressed.bind(this)} onFocus={(()=>this._onFocus()).bind(this)} onChangeText = {(text)=>this.setState({lastname: text})}/> 
                            </View>
                            <View style={styles.loginInputView}>                      
                                <TextInput placeholder="email" style={styles.loginInput} autoCapitalize={'none'} placeholderTextColor='#fff' returnKeyType = {'done'}
                                        onSubmitEditing={this.onKeyBoardDonePressed.bind(this)} onFocus={(()=>this._onFocus()).bind(this)} clearButtonMode={'while-editing'} autoCorrect={false} onChangeText = {(text)=>this.setState({email: text})}/>
                            </View>
                            <View style={styles.loginInputView}>
                                <TextInput placeholder="password" style={styles.loginInput} placeholderTextColor='#fff' onFocus={(()=>this._onFocus()).bind(this)}
                                        onSubmitEditing={this.onKeyBoardDonePressed.bind(this)} returnKeyType = {'done'} onChangeText = {(text)=>this.setState({password: text})} secureTextEntry={true}/>
                            </View>
                            <View style={styles.loginInputView}>
                                <TextInput placeholder="confirm password" style={styles.loginInput} placeholderTextColor='#fff' onFocus={(()=>this._onFocus()).bind(this)} 
                                returnKeyType = {'done'} onSubmitEditing={this.onKeyBoardDonePressed.bind(this)} onChangeText = {(text)=>this.setState({password_re: text})} secureTextEntry={true}/>
                            </View>
                            <View style={{height:0}} onLayout={((event)=>this._onLayout(event)).bind(this)}></View>
                            <View style={styleSignUpPage.passwordRequirementView}>
                               {passwordRequirmentText}
                            </View>
                            <View style={styleSignUpPage.legalView}>
                                <Text style={styleSignUpPage.legalText}>By signing up, I agree with the </Text>
                                <Text style={styleSignUpPage.legalTextClickable}>Terms & Conditions</Text>
                            </View>
                        </ScrollView>
                    </Image> 
                    <TouchableOpacity activeOpacity={0.7} style={styleSignUpPage.signUpButtonView} onPress = {this.onSignUpPressed.bind(this)}>
                         <Text style={styleSignUpPage.signUpButtonText}>Sign up</Text>
                    </TouchableOpacity>
                    <ActivityIndicatorIOS
                            animating={this.state.showProgress}
                            size="large"
                            style={styles.loader} />           
                </View>
            );
    }

    _onLayout(event) {
        this.y = event.nativeEvent.layout.y;
    }
    
    _onFocus() {
        this.setState({showPasswordRequirment:true});
        let scrollViewLength = this.y;
        let scrollViewBottomToScreenBottom = windowHeight - (scrollViewLength + windowHeight*0.066 + 15);//headerbanner+windowMargin
        this.refs.scrollView.scrollTo({x:0, y:keyboardHeight - scrollViewBottomToScreenBottom, animated: true})
    }

    onKeyBoardDonePressed(){
        this.setState({showPasswordRequirment:false});
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
        if(!this.state.firstname || !this.state.lastname){
            Alert.alert( 'Warning', 'Missing first name or last name',[ { text: 'OK' }]);
            return;
        }
        
        if(!this.state.email || !this.state.password){
            Alert.alert( 'Warning', 'No email or password',[ { text: 'OK' }]);
            return;
        }
        
        if(!this.state.password_re){
            Alert.alert( 'Warning', 'Enter password again.' ,[ { text: 'OK' }]);
            return; 
        }
        
        if(!this.isPasswordStrong()){
            Alert.alert( 'Warning', 'Your password does not meet the complexity requirment' ,[ { text: 'OK' }]);
            return;  
        }
        
        if(this.state.password_re !== this.state.password){
            Alert.alert( 'Warning', 'Two password inputs do not match' ,[ { text: 'OK' }]);
            return;
        }
        this.setState({showProgress:true});
        let result = await AuthService.registerWithEmail(this.state.firstname, this.state.lastname,this.state.email, this.state.password, this.state.password_re);
        if(result==false){
            return;
        }
        this.setState({ showProgress: false });
        this.props.navigator.push({
            name: 'ChefListPage'
        });       
    }
    
    navigateBack() {
        this.props.navigator.pop();
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
    passwordRequirementView:{
      height:windowHeight*0.08,
      width:windowWidth*0.88,
      backgroundColor:'transparent',
    },
    passwordRequirementText:{
      fontSize:11,
      color:'#fff',
      textAlign:'justify',
    },
    legalView:{
      flex:1,
      flexDirection:'row',
      justifyContent: 'center',
      backgroundColor:'transparent',
    },
    legalText:{
      fontSize:windowHeight/47.64,
      color:'#fff',
    },
    legalTextClickable:{
      fontSize:windowHeight/47.64,
      color:'#FFCC33',
    },
    signUpButtonView:{
      position:'absolute',
      left: 0, 
      right: 0,
      top:windowHeight-windowHeight/13.38,
      height:windowHeight/13.38,
      backgroundColor:'#FFCC33',
      justifyContent: 'center',
    },
    signUpButtonText:{
      color:'#fff',
      fontSize:windowHeight/30.6,
      fontWeight:'bold',
      alignSelf:'center',
    },
});
module.exports = SignUpPage;