var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');

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
        let orderDetail = routeStack[routeStack.length-1].passProps.orderDetail;
        this.state = {
            showProgress:false,
            totalPrice:totalPrice,
            orderDetail:orderDetail
        };
        console.log(orderDetail);
        this.client = new HttpsClient(config.baseUrl, true);
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
                { text: 'Pay', onPress: () => this.createAnOrder() },              
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' }             
            ]
        );    
    }  
    
    async createAnOrder(){
        let response = await this.client.postWithAuth(config.createOrderEndpoint, {orderDetail:this.state.orderDetail});
        console.log(response.statusCode);
    }
    
    navigateBackToShoppingCartPage(){
        this.props.navigator.pop();
    }
}

module.exports = PaymentPage;

