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

class OrderConfirmation extends Component {
    constructor(props){
        super(props);
        let routeStack = props.navigator.state.routeStack;
        //let orderId = routeStack[routeStack.length-1].passProps.orderId;
    }
    
    render() {  
        //todo: in design there is back button, where that supposed to go?? why we even need it?    
        return (
            <View style={styles.container}>
                <TouchableHighlight style={styles.button}  onPress={()=>this.navigateBackToChefList()}>
                    <Text style={styles.buttonText}>Order More</Text>
                </TouchableHighlight>      
            </View>
        );
    }
   
    
    navigateBackToChefList(){
        this.props.navigator.state.routeStack = [];
        this.props.navigator.push({
            name: 'ChefListPage',
        });
    }
}

module.exports = OrderConfirmation;

