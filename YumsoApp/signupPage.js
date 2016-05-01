var HttpsClient = require('./httpsClient');
var AuthService = require('./authService');
var styles = require('./style');
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
                        <View style={styles.backButtonView}>
                        <TouchableHighlight onPress={() => this.navigateBack()}>
                            <Image source={backIcon} style={styles.backButtonIcon}/>
                        </TouchableHighlight>
                        </View>    
                        <View style={styles.titleView}>
                            <Text style={styles.titleText}>Sign Up</Text>
                        </View>
                        <View style={{flex:0.1/3,width:windowWidth/3}}>
                        </View>
                    </View>
                    
                    <View style={styleSignUpPage.logoView}>
                        <Image source={logoIcon} style={styleSignUpPage.logoIcon}/>
                    </View>
                    
                    <View style={styles.loginInputView}>
                        <TextInput placeholder="First Name" style={styles.loginInput}
                                onChangeText = {(text)=>this.setState({firstname: text})}/>
                    </View> 
                    <View style={styles.loginInputView}>
                        <TextInput placeholder="Last Name" style={styles.loginInput}
                                onChangeText = {(text)=>this.setState({lastname: text})}/> 
                    </View>
                    <View style={styles.loginInputView}>                      
                        <TextInput placeholder="Email" style={styles.loginInput}
                                onChangeText = {(text)=>this.setState({email: text})}/>
                    </View>
                    <View style={styles.loginInputView}>
                        <TextInput placeholder="Password" style={styles.loginInput}
                                onChangeText = {(text)=>this.setState({password: text})}
                                secureTextEntry={true}/>
                    </View>
                    <View style={styles.loginInputView}>
                        <TextInput placeholder="Confirm Password" style={styles.loginInput}
                                onChangeText = {(text)=>this.setState({password_re: text})}
                                secureTextEntry={true}/>
                    </View>
                    
                    <View style={styleSignUpPage.legalView}>
                         <Text style={styleSignUpPage.legalText}>By clicking Sign up, you agree with the terms and condictions</Text>
                    </View>
                    
                    <TouchableHighlight style={styleSignUpPage.signUpButtonView} onPress = {this.onSignUpPressed.bind(this)}>
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

var styleSignUpPage = StyleSheet.create({
    logoView:{
      alignItems:'center',
      paddingTop:windowHeight/18.4,
      paddingBottom:windowHeight/9.2,
      borderBottomWidth:0.8,
      borderColor: '#D7D7D7',
    },
    logoIcon:{
      width:windowWidth/4.14,
      height:windowWidth/4.14,
    },
    legalView:{
      flex:1,
      paddingHorizontal:windowHeight/49.0,
      justifyContent: 'center',
    },
    legalText:{
      fontSize:windowHeight/56.6,
      color:'#A9A9A9',
    },
    signUpButtonView:{
      position:'absolute',
      left: 0, 
      right: 0,
      top:windowHeight-windowHeight/13.38,
      height:windowHeight/13.38,
      backgroundColor:'#ff9933',
      justifyContent: 'center',
    },
    signUpButtonText:{
      color:'#fff',
      fontSize:windowHeight/30.6,
      fontWeight:'300',
      alignSelf:'center',
      marginBottom:3,
    },
});
module.exports = SignUpPage;