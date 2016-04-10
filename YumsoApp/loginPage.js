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
  AsyncStorage
} from 'react-native';

class LoginPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            showProgress:false
        };
    }
    
    ComponentDidMount(){
    }
    
    render() {
        var errorCtrl = <View />;
        if(this.state.badRequest){
            errorCtrl = <Text style={styles.error}>
                Problem!
            </Text>;
        }
        if(this.state.success){
            errorCtrl = <Text style={styles.success}>
                Success!
            </Text>;
        }
            return (
                <View style={styles.container}>
                    <TextInput placeholder="Email" style={styles.loginInput}
                        onChangeText = {(text)=>this.setState({email: text})}/>
                    <TextInput placeholder="Password" style={styles.loginInput}
                        onChangeText = {(text)=>this.setState({password: text})}
                        secureTextEntry={true}
                    />
                    <TouchableHighlight style={styles.button}
                        onPress = {this.onLoginPressed.bind(this)}>
                        <Text style={styles.buttonText}>Log in</Text>
                    </TouchableHighlight>
                    {errorCtrl}
                    <ActivityIndicatorIOS
                        animating={this.state.showProgress}
                        size="large"
                        style={styles.loader}
                    />
                </View>
            );
    }
    
    async onLoginPressed(){
        console.log('clicked log in');
        this.setState({showProgress:true});
        await AuthService.loginWithEmail(this.state.email, this.state.password);
        this.setState({ success: true });
        this.setState({ showProgress: false });
        console.log(this.state);
        let user = await AuthService.getPrincipalInfo();
        console.log(user);
        if(props.onLogin){
            this.props.onLogin();
        }
    }
}

module.exports = LoginPage;