var HttpsClient = require('./httpsClient');
var styles = require('./style');

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ListView,
  TouchableHighlight,
  ActivityIndicatorIOS,
  AsyncStorage,
  Alert
} from 'react-native';

class PaymentPage extends Component {
    constructor(props){
        super(props);
        let routeStack = props.navigator.state.routeStack;
        let totalPrice = routeStack[routeStack.length-1].passProps.totalPrice;
        this.state = {
            showProgress:false,
            totalPrice:totalPrice
        };
    }
    
    render() {
        if(this.state.showProgress){
            return <ActivityIndicatorIOS
                animating={this.state.showProgress}
                size="large"
                style={styles.loader}/> 
        }         
        return (
            <View style={styles.container}>
                      <Text>Pay amount: ${this.totalPrice}</Text>   
                      
            </View>
        );
    }
        
    navigateBackToShoppingCartPage(){
        this.props.navigator.pop();
    }
}

module.exports = PaymentPage;

            // Alert.alert(
            //     'Alert Title',
            //     'My Alert Msg',
            //     [
            //         { text: 'Ask me later', onPress: () => console.log('Ask me later pressed') },
            //         { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
            //         { text: 'OK', onPress: () => console.log('OK Pressed') },
            //     ]
            // )