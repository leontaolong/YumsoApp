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
        this.client = new HttpsClient('http://172.31.99.87:8080', false, 'xihe243@gmail.com', '123', "/api/v1/auth/authenticateByEmail/chef")  
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
                <Text>Pay amount: ${this.state.totalPrice}</Text>   
                <TouchableHighlight style={styles.button}
                    onPress={()=>this.confirm()}>
                    <Text style={styles.buttonText}>Place the order</Text>
                </TouchableHighlight>   
                <TouchableHighlight style={styles.button}
                    onPress={()=>this.navigateBackToShoppingCartPage()}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableHighlight>      
            </View>
        );
    }
      
    confirm(){
        Alert.alert(
            'Order placement',
            'Ready to place the order? Your total is $'+this.state.totalPrice,
            [
                { text: 'Pay', onPress: () => createAnOrder() },              
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' }             
            ]
        );    
    }  
    
    createAnOrder(){
        
    }
    
    navigateBackToShoppingCartPage(){
        this.props.navigator.pop();
    }
}

module.exports = PaymentPage;

