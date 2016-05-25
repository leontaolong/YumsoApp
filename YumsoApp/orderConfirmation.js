var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
import Dimensions from 'Dimensions';

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

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

class OrderConfirmation extends Component {
    constructor(props){
        super(props);
        let routeStack = props.navigator.state.routeStack;
        //let orderId = routeStack[routeStack.length-1].passProps.orderId;
    }
    
    render() {  
        //todo: in design there is back button, where that supposed to go?? why we even need it?    
        return (
            <View style={styleConfirmationPage.container}>
              <View style={styleConfirmationPage.buttonView}>
                <TouchableHighlight style={styleConfirmationPage.orderMoreMutton} underlayColor={'transparent'} onPress={()=>this.navigateBackToChefList()}>
                    <Text style={styleConfirmationPage.orderMoreMuttonText}>Order More</Text>
                </TouchableHighlight>
              </View>      
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

var styleConfirmationPage = StyleSheet.create({
    container:{
        paddingTop:15,
        flex:1,
        flexDirection:'column',
        backgroundColor:'#F5F5F5',
    },
    buttonView:{
        height:windowHeight*0.6,
        width:windowWidth,
        justifyContent:'center',
    },
    orderMoreMutton:{
        width:windowWidth*0.75,
        height:50,
        flexDirection:'row',
        justifyContent:'center',
        alignSelf:'center',
        backgroundColor:'#FFCC33',
    },
    orderMoreMuttonText:{
        fontSize:16,
        fontWeight:'600',
        color:'#fff',
        alignSelf:'center',
    }, 
});
    
module.exports = OrderConfirmation;

