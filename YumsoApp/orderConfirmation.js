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
        return (
            <View style={styles.greyContainer}>
                <View style={styles.headerBannerView}>    
                    <View style={styles.headerLeftView}>
                    </View>
                    <View style={styles.titleView}>
                       <Text style={styles.titleText}>Confirmation</Text>
                    </View>
                    <View style={styles.headerRightView}>
                    </View>
                </View>
                <View style={styleConfirmationPage.confirmTextView}>
                    <Text style={styleConfirmationPage.enjoyYourMealText}>Your order is confirmed.</Text>
                    <View style={styleConfirmationPage.orderConfirmedTextView}>
                        <Text style={styleConfirmationPage.orderConfirmedText}>Please pay attention to your cell phone, we may call you when your order arrives.</Text>
                    </View>   
                </View>
                <TouchableOpacity activeOpacity={0.7} style={styleConfirmationPage.orderMoreMutton} onPress={()=>this.navigateBackToChefList()}>
                    <Text style={styleConfirmationPage.orderMoreMuttonText}>Order More</Text>
                </TouchableOpacity>
                <View style={{flex:1}}></View>
                <TouchableOpacity activeOpacity={0.7} style={styles.footerView} onPress={()=>this.navigateToOrderList()}>
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
    confirmTextView:{
      height:windowHeight*0.38,
      justifyContent:'center',
      alignItems:'center',
      flexDirection:'column',
      backgroundColor:'transparent'
    },
    enjoyYourMealText:{
      fontSize:windowHeight/23.0,
      color:'#4A4A4A',
      fontWeight:'300',
      alignSelf:'center',
      marginBottom:windowHeight*0.05
    },
    orderConfirmedText:{
      fontSize:windowHeight/46.0,
      color:'#4A4A4A',
      fontWeight:'300',
      alignSelf:'center',
      textAlign:'center',
      flex: 1, 
      flexWrap: 'wrap',
    },
    orderConfirmedTextView:{
        width:0.9*windowWidth,
        justifyContent:'center',
        flexDirection:'row',
    },   
    orderMoreMutton:{
        width:windowWidth*0.62,
        height:windowHeight*0.075,
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
    pageBackgroundImage:{
        width:windowWidth,
        height:windowHeight,
        flex:1,
        flexDirection:'column',
    }, 
});
    
module.exports = OrderConfirmation;

