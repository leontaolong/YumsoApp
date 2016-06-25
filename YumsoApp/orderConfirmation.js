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
  TouchableOpacity,
  AsyncStorage,
  Alert
} from 'react-native';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

class OrderConfirmation extends Component {
    constructor(props){
        super(props);
        let routeStack = props.navigator.state.routeStack;
        this.eater = routeStack[routeStack.length-1].passProps.eater;        
    }
    
    render() {  
        //todo: in design there is back button, where that supposed to go?? why we even need it?    
        return (
            <View style={styleConfirmationPage.greyContainer}>
              <TouchableOpacity activeOpacity={0.7} style={styleConfirmationPage.orderMoreMutton} onPress={()=>this.navigateBackToChefList()}>
                    <Text style={styleConfirmationPage.orderMoreMuttonText}>Order More</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} style={styleConfirmationPage.GotoMyOrdersMutton} onPress={()=>this.navigateToOrderList()}>
                    <Text style={styleConfirmationPage.orderMoreMuttonText}>Go to My Orders</Text>
              </TouchableOpacity>                
            </View>
        );
    }
   
    
    navigateBackToChefList(){
        this.props.navigator.push({
            name: 'ChefListPage',
            passProps:{
                eater:this.eater
            }
        });
    }
    
    navigateToOrderList() {
        this.props.navigator.push({
            name: 'HistoryOrderPage',
            passProps:{
                eater:this.eater
            }
        });
    }
}

var styleConfirmationPage = StyleSheet.create({
    greyContainer:{
        flex:1,
        flexDirection:'column',
        backgroundColor:'#F5F5F5',
        justifyContent:'center',
    },
    orderMoreMutton:{
        width:windowWidth*0.75,
        height:windowHeight*0.088,
        flexDirection:'row',
        justifyContent:'center',
        alignSelf:'center',
        backgroundColor:'#FFCC33',
    },
    GotoMyOrdersMutton:{
        marginTop:windowHeight*0.176,
        width:windowWidth*0.75,
        height:windowHeight*0.088,
        flexDirection:'row',
        justifyContent:'center',
        alignSelf:'center',
        backgroundColor:'#7BCBBE',
    },
    orderMoreMuttonText:{
        fontSize:windowHeight/37.056,
        fontWeight:'600',
        color:'#fff',
        alignSelf:'center',
    }, 
});
    
module.exports = OrderConfirmation;

