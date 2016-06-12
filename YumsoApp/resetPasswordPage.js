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

class resetPasswordPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            showProgress: false
        };
    }
    
    render() {
            return (//TODO: i agree terms and conditions.
                <View style={styles.container}>
                    <View style={styles.headerBannerView}>    
                        <View style={styles.headerLeftView}>
                          <TouchableHighlight underlayColor={'transparent'} style={styles.backButtonView} onPress={() => this.navigateBack()}>
                              <Image source={backIcon} style={styles.backButtonIcon}/>
                          </TouchableHighlight>
                        </View>    
                        <View style={styles.titleView}>
                            <Text style={styles.titleText}>Reset Password</Text>
                        </View>
                        <View style={styles.headerRightView}>
                        </View>
                    </View>
                    <Image style={styles.pageBackgroundImage} source={backgroundImage}>
                        <View style={styleSignUpPage.logoView}>
                        </View>                        
                        <View style={styles.loginInputView}>                      
                            <TextInput placeholder="email" style={styles.loginInput} autoCapitalize={'none'} placeholderTextColor='#fff'
                                    clearButtonMode={'while-editing'} autoCorrect={false} onChangeText = {(text)=>this.setState({email: text})}/>
                        </View>
                        <View style={styles.loginInputView}>
                            <TextInput placeholder="current password" style={styles.loginInput} placeholderTextColor='#fff'
                                    onChangeText = {(text)=>this.setState({oldPassword: text})} secureTextEntry={true}/>
                        </View>
                        <View style={styles.loginInputView}>
                            <TextInput placeholder="new password" style={styles.loginInput} placeholderTextColor='#fff'
                                    onChangeText = {(text)=>this.setState({newPassword: text})} secureTextEntry={true}/>
                        </View>
                        <View style={styles.loginInputView}>
                            <TextInput placeholder="confirm new password" style={styles.loginInput} onSubmitEditing={this.onUpdatePressed.bind(this)} placeholderTextColor='#fff'
                                    returnKeyType = {'go'} onChangeText = {(text)=>this.setState({newPassword_re: text})} secureTextEntry={true}/>
                        </View>                        
                    </Image> 
                    <TouchableHighlight underlayColor={'#C0C0C0'} style={styleSignUpPage.signUpButtonView} onPress = {this.onUpdatePressed.bind(this)}>
                        <Text style={styleSignUpPage.signUpButtonText}>Update</Text>
                    </TouchableHighlight>

                    <ActivityIndicatorIOS
                            animating={this.state.showProgress}
                            size="large"
                            style={styles.loader} />           
                </View>
            );
    }
    
    async onUpdatePressed(){        
        if(!this.state.email || !this.state.oldPassword){
            Alert.alert( 'Warning', 'No email or password',[ { text: 'OK' }]);
            return;
        }
        
        if(!this.state.newPassword_re){
            Alert.alert( 'Warning', 'Enter password again.' ,[ { text: 'OK' }]);
            return; 
        }
        
        if(this.state.newPassword_re !== this.state.newPassword){
            Alert.alert( 'Warning', 'Two Passwords entered are different' ,[ { text: 'OK' }]);
            return;
        }      
        this.setState({showProgress:true});
        let result = await AuthService.resetPassword(this.state.email, this.state.oldPassword, this.state.newPassword);
        // if(result==false){
        //     return;
        // }else{
        //    this.setState({ showProgress: false});
        //    return AuthService.logOut()
        //             .then(() => {
        //                 delete this.state.eater;
        //                 this.props.navigator.push({
        //                     name: 'LoginPage', 
        //                 });
        //             });
        // }
        if(result==false){
            return;
        }
        // this.setState({ showProgress: false });
        // this.props.navigator.push({
        //     name: 'LoginPage'
        // });
         
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
    legalView:{
      flex:1,
      flexDirection:'row',
      justifyContent: 'center',
      backgroundColor:'transparent',
      paddingTop:windowHeight*0.08,
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
      fontWeight:'300',
      alignSelf:'center',
    },
});
module.exports = resetPasswordPage;