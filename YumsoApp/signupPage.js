var HttpsClient = require('./httpsClient');
var AuthService = require('./authService');
var styles = require('./style');
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
                    <View style={styleSignUpPage.headerBannerView}>    
                        <View style={styleSignUpPage.backButtonView}>
                        <TouchableHighlight onPress={() => this.navigateBack()}>
                            <Image source={require('./icons/ic_keyboard_arrow_left_48pt_3x.png')} style={styleSignUpPage.backButtonIcon}/>
                        </TouchableHighlight>
                        </View>    
                        <View style={styleSignUpPage.titleView}>
                            <Text style={styleSignUpPage.titleText}>Sign Up</Text>
                        </View>
                        <View style={{flex:0.1/3,width:windowWidth/3}}>
                        </View>
                    </View>
                    <View style={styleSignUpPage.logoView}>
                        <Image source={require('./icons/Icon-Large.png')} style={styleSignUpPage.logoIcon}/>
                    </View>
                    
                    <View style={styleSignUpPage.loginInputView}>
                        <TextInput placeholder="First Name" style={styleSignUpPage.loginInput}
                                onChangeText = {(text)=>this.setState({firstname: text})}/>
                    </View> 
                    <View style={styleSignUpPage.loginInputView}>
                        <TextInput placeholder="Last Name" style={styleSignUpPage.loginInput}
                                onChangeText = {(text)=>this.setState({lastname: text})}/> 
                    </View>
                    <View style={styleSignUpPage.loginInputView}>                      
                        <TextInput placeholder="Email" style={styleSignUpPage.loginInput}
                                onChangeText = {(text)=>this.setState({email: text})}/>
                    </View>
                    <View style={styleSignUpPage.loginInputView}>
                        <TextInput placeholder="Password" style={styleSignUpPage.loginInput}
                                onChangeText = {(text)=>this.setState({password: text})}
                                secureTextEntry={true}/>
                    </View>
                    <View style={styleSignUpPage.loginInputView}>
                        <TextInput placeholder="Confirm Password" style={styleSignUpPage.loginInput}
                                onChangeText = {(text)=>this.setState({password_re: text})}
                                secureTextEntry={true}/>
                    </View>
                    
                    <View style={styleSignUpPage.legalView}>
                         <Text style={styleSignUpPage.legalText}>By clicking Sign up, you agree with the terms and condictions</Text>
                    </View>
                    
                    <TouchableHighlight onPress = {this.onSignUpPressed.bind(this)}>
                    <View style={styleSignUpPage.signUpButtonView}>
                        <Text style={styleSignUpPage.signUpButtonText}>Sign up</Text>
                    </View>
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
    headerBannerView:{
      flexDirection:'row',
      borderBottomWidth:1,
      borderColor:'#D7D7D7',
      height:45,
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
    logoView:{
      alignItems:'center',
      paddingTop:40,
      paddingBottom:80,
      borderBottomWidth:0.8,
      borderColor: '#D7D7D7',
    },
    logoIcon:{
      width:100,
      height:100,
    },
    loginInput:{
      height:50,
      fontSize:20,
      color: '#A9A9A9',
    },
    loginInputView:{
      borderBottomWidth:0.8,
      borderColor: '#D7D7D7',
      justifyContent: 'center',
      paddingVertical:5,
      paddingHorizontal:15,
    },
    legalView:{
      flex:1,
      paddingHorizontal:15,
      justifyContent: 'center',
    },
    legalText:{
      fontSize:13,
      color:'#A9A9A9',
    },
    signUpButtonView:{
      position:'absolute',
      left: 0, 
      right: 0,
      top:1,
      height:55,
      backgroundColor:'#ff9933',
      justifyContent: 'center',
     },
     signUpButtonText:{
      color:'#fff',
      fontSize:24,
      fontWeight:'300',
      alignSelf:'center',
      marginBottom:3,
    },
});
module.exports = SignUpPage;