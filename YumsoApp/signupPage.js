var HttpsClient = require('./httpsClient');
var AuthService = require('./authService');
var styles = require('./style');

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
                    <TouchableHighlight style={styles.button}
                        onPress={() => this.navigateBack() }>
                        <Text style={styles.buttonText}>back</Text>
                    </TouchableHighlight>  
                    <TextInput placeholder="First Name" style={styles.loginInput}
                            onChangeText = {(text)=>this.setState({firstname: text})}/>
                    <TextInput placeholder="Last Name" style={styles.loginInput}
                            onChangeText = {(text)=>this.setState({lastname: text})}/>                       
                    <TextInput placeholder="Email" style={styles.loginInput}
                            onChangeText = {(text)=>this.setState({email: text})}/>
                    <TextInput placeholder="Password" style={styles.loginInput}
                            onChangeText = {(text)=>this.setState({password: text})}
                            secureTextEntry={true}/>
                    <TextInput placeholder="Confirm Password" style={styles.loginInput}
                            onChangeText = {(text)=>this.setState({password_re: text})}
                            secureTextEntry={true}/>
                    <TouchableHighlight style={styles.button}
                            onPress = {this.onSignUpPressed.bind(this)}>
                        <Text style={styles.buttonText}>Sign up</Text>
                    </TouchableHighlight>
                    <Text style={styles.buttonText}>By Click sign up, you agree with the terms and condictions</Text>
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

module.exports = SignUpPage;