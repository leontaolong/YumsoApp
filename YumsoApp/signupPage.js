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

class SignUpPage extends Component {
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
                            <Text style={styles.titleText}>Sign Up</Text>
                        </View>
                        <View style={styles.headerRightView}>
                        </View>
                    </View>
                    <Image style={styles.pageBackgroundImage} source={backgroundImage}>
                        <View style={styleSignUpPage.logoView}>
                            <Image source={logoIcon} style={styleSignUpPage.logoIcon}/>
                        </View>
                        
                        <View style={styles.loginInputView}>
                            <TextInput placeholder="first name" style={styles.loginInput} autoCorrect={false} placeholderTextColor='#fff'
                                    onChangeText = {(text)=>this.setState({firstname: text})}/>
                        </View> 
                        <View style={styles.loginInputView}>
                            <TextInput placeholder="last name" style={styles.loginInput} autoCorrect={false} placeholderTextColor='#fff'
                                    onChangeText = {(text)=>this.setState({lastname: text})}/> 
                        </View>
                        <View style={styles.loginInputView}>                      
                            <TextInput placeholder="email" style={styles.loginInput} autoCapitalize={'none'} placeholderTextColor='#fff'
                                    clearButtonMode={'while-editing'} autoCorrect={false} onChangeText = {(text)=>this.setState({email: text})}/>
                        </View>
                        <View style={styles.loginInputView}>
                            <TextInput placeholder="password" style={styles.loginInput} placeholderTextColor='#fff'
                                    onChangeText = {(text)=>this.setState({password: text})} secureTextEntry={true}/>
                        </View>
                        <View style={styles.loginInputView}>
                            <TextInput placeholder="confirm password" style={styles.loginInput} onSubmitEditing={this.onSignUpPressed.bind(this)} placeholderTextColor='#fff'
                                    returnKeyType = {'go'} onChangeText = {(text)=>this.setState({password_re: text})} secureTextEntry={true}/>
                        </View>
                        
                        <View style={styleSignUpPage.legalView}>
                            <Text style={styleSignUpPage.legalText}>By signing up, I agree with the </Text>
                            <Text style={styleSignUpPage.legalTextClickable}>Terms & Conditions</Text>
                        </View>
                    </Image> 
                    <TouchableHighlight underlayColor={'#C0C0C0'} style={styleSignUpPage.signUpButtonView} onPress = {this.onSignUpPressed.bind(this)}>
                        <Text style={styleSignUpPage.signUpButtonText}>Sign up</Text>
                    </TouchableHighlight>

                    <ActivityIndicatorIOS
                            animating={this.state.showProgress}
                            size="large"
                            style={styles.loader} />           
                </View>
            );
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
        
        if(this.state.password_re !== this.state.password){
            Alert.alert( 'Warning', 'Two Passwords entered are different' ,[ { text: 'OK' }]);
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
      fontWeight:'bold',
      alignSelf:'center',
    },
});
module.exports = SignUpPage;