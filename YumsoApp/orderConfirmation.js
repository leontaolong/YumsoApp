var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var backgroundImage = require('./resourceImages/confirmationBackground.png');
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
            <View style={styles.container}>
                <View style={styles.headerBannerView}>    
                    <View style={styles.headerLeftView}>
                    </View>
                    <View style={styles.titleView}>
                       <Text style={styles.titleText}>Confirmation</Text>
                    </View>
                    <View style={styles.headerRightView}>
                    </View>
                </View>
                <Image style={styleConfirmationPage.pageBackgroundImage} source={backgroundImage}>
                    <View style={styleConfirmationPage.confirmTextView}>
                       <Text style={styleConfirmationPage.enjoyYourMealText}>Enjoy Your Meal!</Text>
                       <Text style={styleConfirmationPage.orderConfirmedText}>Your order is confirmed.</Text>   
                    </View>
                    <TouchableOpacity activeOpacity={0.7} style={styleConfirmationPage.orderMoreMutton} onPress={()=>this.navigateBackToChefList()}>
                       <Text style={styleConfirmationPage.orderMoreMuttonText}>Order More</Text>
                    </TouchableOpacity>
                </Image>           
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
      flexDirection:'column',
      backgroundColor:'transparent'
    },
    enjoyYourMealText:{
      fontSize:windowHeight/18.4,
      color:'#fff',
      fontWeight:'300',
      alignSelf:'center',
      marginBottom:windowHeight*0.05
    },
    orderConfirmedText:{
      fontSize:windowHeight/46.0,
      color:'#fff',
      fontWeight:'200',
      alignSelf:'center',
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

