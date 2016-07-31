'use strict'
var HttpsClient = require('./httpsClient');
var AuthService = require('./authService');
var styles = require('./style');
var backIcon = require('./icons/icon-back.png');
var logoIcon = require('./icons/icon-large-logo.png');
var backgroundImage = require('./resourceImages/signInBackground.jpg');
var commonAlert = require('./commonModules/commonAlert');
import Dimensions from 'Dimensions';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;
var keyboardHeight = 250 //Todo: get keyboard size programmatically.

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TextInput,
  TouchableHighlight,
  ActivityIndicatorIOS,
  AsyncStorage,
  Alert
} from 'react-native';

class resetPasswordPage extends Component {
    constructor(props){
        super(props);
        this.routeStack = this.props.navigator.state.routeStack;
        if(props.userEmail){
            this.userEmail = props.userEmail;
        }
        this.state = {
            showProgress: false,
            email:this.userEmail,
        };
    }
    
    render() {
            var loadingSpinnerView = null;
            if (this.state.showProgress) {
                loadingSpinnerView =<View style={styles.loaderView}>
                                        <ActivityIndicatorIOS animating={this.state.showProgress} size="large" style={styles.loader}/>
                                    </View>;  
            }
            
            var passwordRequirmentText = null;
            // if(this.state.showPasswordRequirment){
            //   passwordRequirmentText = <Text style={styles.passwordRequirementText}>
            //                                 Your password should contain 7-12 characters with at least one number,one lower case letter and one upper case letter
            //                                </Text>;
            // }
            
            
            return (//TODO: i agree terms and conditions.
                <View style={styles.container}>
                    <View style={styles.headerBannerView}>    
                        <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBack()}>
                          <View style={styles.backButtonView}>
                              <Image source={backIcon} style={styles.backButtonIcon}/>
                          </View>
                        </TouchableHighlight>    
                        <View style={styles.titleView}>
                            <Text style={styles.titleText}>Reset Password</Text>
                        </View>
                        <View style={styles.headerRightView}>
                        </View>
                    </View>
                    <Image style={styles.pageBackgroundImage} source={backgroundImage}>
                    <ScrollView contentContainerStyle={{alignItems:'center'}} keyboardShouldPersistTaps={true} ref="scrollView">
                        <View style={styleSignUpPage.logoView}>
                        </View>                        
                        <View style={styles.loginInputView}>                      
                            <TextInput defaultValue={this.userEmail} style={styles.loginInput} autoCapitalize={'none'} editable={false} onSubmitEditing={this.onKeyBoardDonePressed.bind(this)} onFocus={(()=>this._onFocus()).bind(this)} 
                            maxLength={40} placeholderTextColor='#fff' clearButtonMode={'while-editing'} autoCorrect={false}/>
                        </View>
                        <View style={styles.loginInputView}>
                            <TextInput placeholder="current password" style={styles.loginInput} onSubmitEditing={this.onKeyBoardDonePressed.bind(this)} onFocus={(()=>this._onFocus()).bind(this)} 
                            maxLength={12} placeholderTextColor='#fff' onChangeText = {(text)=>this.setState({oldPassword: text})} secureTextEntry={true}/>
                        </View>
                        <View style={styles.loginInputView}>
                            <TextInput placeholder="new password" style={styles.loginInput} onSubmitEditing={this.onKeyBoardDonePressed.bind(this)} onFocus={(()=>this._onFocus()).bind(this)} 
                            maxLength={12} placeholderTextColor='#fff' onChangeText = {(text)=>this.setState({newPassword: text})} secureTextEntry={true}/>
                        </View>
                        <View style={styles.loginInputView}>
                            <TextInput placeholder="confirm new password" style={styles.loginInput} onSubmitEditing={this.onKeyBoardDonePressed.bind(this)} onFocus={(()=>this._onFocus()).bind(this)} 
                            maxLength={12} placeholderTextColor='#fff' returnKeyType = {'done'} onChangeText = {(text)=>this.setState({newPassword_re: text})} secureTextEntry={true}/>
                        </View>               
                        <View style={styles.passwordRequirementView}>
                               {passwordRequirmentText}
                        </View>
                        <View style={{height:0}} onLayout={((event)=>this._onLayout(event)).bind(this)}></View>
                    </ScrollView>                       
                    </Image> 
                    <TouchableHighlight underlayColor={'#C0C0C0'} style={styleSignUpPage.signUpButtonView} onPress = {this.onUpdatePressed.bind(this)}>
                        <Text style={styleSignUpPage.signUpButtonText}>Update</Text>
                    </TouchableHighlight>
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
        // this.setState({showPasswordRequirment:true});
        this.refs.scrollView.scrollTo({x:0, y:0, animated: true})
    }
    
    //password strength check
    isPasswordStrong () {
        if (this.state.newPassword.length < 7) {
            return false;
        }

        var hasUpper = false;
        for (var i = 0; i < this.state.newPassword.length; i++) {
             if (this.state.newPassword[i] >= 'A' && this.state.newPassword[i] <= 'Z') {
                 var hasUpper = true;
                 break;
             }
        }

        var hasLower = false;
        for (var i = 0; i < this.state.newPassword.length; i++) {
             if (this.state.newPassword[i] >= 'a' && this.state.newPassword[i] <= 'z') {
                 var hasLower = true;
                 break;
             }
        }

        var hasNumber = false;
        for (var i = 0; i < this.state.newPassword.length; i++) {
             if (this.state.newPassword[i] >= '0' && this.state.newPassword[i] <= '9') {
                 var hasNumber = true;
                 break;
             }
        }

        return hasUpper && hasLower && hasNumber;
    }
    
    async onUpdatePressed(){        
        if(!this.state.email || !this.state.email.trim()){
            Alert.alert( 'Warning', 'Please enter your login email',[ { text: 'OK' }]);
            return;
        }

        if(!this.state.oldPassword){
            Alert.alert( 'Warning', 'Please enter your current password',[ { text: 'OK' }]);
            return;
        }
        
        if(!this.state.newPassword){
            Alert.alert( 'Warning', 'Please create your new password' ,[ { text: 'OK' }]);
            return; 
        }

        if(!this.state.newPassword_re){
            Alert.alert( 'Warning', 'Please enter your new password again.' ,[ { text: 'OK' }]);
            return; 
        }
        
        if(this.state.newPassword_re !== this.state.newPassword){
            Alert.alert( 'Warning', 'The two password entries do not match' ,[ { text: 'OK' }]);
            return;
        }   
        
        if(!this.isPasswordStrong()){
            Alert.alert( 'Warning', 'Your password should contain 7-12 characters with at least one number,one lower case letter and one upper case letter.' ,[ { text: 'OK' }]);
            return;
        }
           
        this.setState({showProgress:true});
        try{
          let result = await AuthService.resetPassword(this.state.email.trim(), this.state.oldPassword, this.state.newPassword) 
          if(result==false){
             this.setState({ showProgress: false });
             return;
          }
          this.setState({ showProgress: false });
          this.routeStack = [];                        
          this.props.navigator.push({
            name: 'ChefListPage',
          });
        }catch(err){
          this.setState({ showProgress: false });
          commonAlert.networkError(err);
        }
           
    }
    
    navigateBack() {
        if(!this.props.navigator){
             if(this.props.onCancel){
                 this.props.onCancel();
             }   
             return;      
        }
        this.props.navigator.pop();
    }
}   


var styleSignUpPage = StyleSheet.create({
    logoView:{
      height:windowHeight*0.19,
      alignItems:'center',
      paddingTop:windowHeight*0.109,
    },
    logoIcon:{
      width:windowWidth*0.208,
      height:windowWidth*0.208,
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
      fontWeight:'400',
      alignSelf:'center',
    },
});
module.exports = resetPasswordPage;