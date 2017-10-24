var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var backgroundImage = require('./resourceImages/background@3x.jpg');
var closeIcon = require('./icons/icon-close.png');
var mealIcon = require('./icons/icon-meal.png');

import Dimensions from 'Dimensions';

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
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
                <Image style={styles.pageBackgroundImage} source={backgroundImage}>
                    <View style={styles.transparentHeaderBannerView}>
                        <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBackToChefList()}>
                            <View style={styles.backButtonView}>
                                <Image source={closeIcon} style={styles.backButtonIcon} />
                            </View>
                        </TouchableHighlight>
                    </View>
                    <View style={styleConfirmationPage.contentTextView}>
                        <Text style={styleConfirmationPage.contentTitle}>Enjoy your meal!</Text>
                        <Image source={mealIcon} style={styleConfirmationPage.mealIconView}/>
                        <Text style={styleConfirmationPage.contentText}>Order#</Text>
                        <Text style={styleConfirmationPage.contentText}>We have confirm your order. Your food will be ready and out for delivery by the time you selected. Enjoy!</Text>
                        <TouchableOpacity activeOpacity={0.7} style={styleConfirmationPage.viewOrderButtonContainer} onPress={()=>this.navigateToOrderPage()}>
                            <View style={styleConfirmationPage.viewOrderButton}>
                              <Text style={styleConfirmationPage.viewOrderText}>View Your Order</Text>
                            </View>
                        </TouchableOpacity>   
                    </View>
                    
                    <View style={{flex:1}}></View>
                </Image>
                <TouchableOpacity activeOpacity={0.7} style={styles.footerView} onPress={()=>this.navigateBackToChefList()}>
                    <Text style={styles.bottomButtonView}>Confirm</Text>
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
    
    navigateToOrderPage() {
        this.props.navigator.push({
            name: 'OrderPage',
            passProps:{
                eater:this.eater
            }
        });
    }
}

var styleConfirmationPage = StyleSheet.create({
    contentTextView:{
        paddingHorizontal:windowWidth/20.7,
    },
    contentTitle:{
        backgroundColor: 'rgba(0,0,0,0)',        
        fontSize:28*windowHeight/677,
        fontWeight:'bold',
    },
    contentText:{
        backgroundColor: 'rgba(0,0,0,0)',
        fontSize:windowHeight/35.5,
        fontWeight:'600',
        marginBottom:windowHeight*0.02,        
    },
    mealIconView: {
        height: 101,
        width: 81,
        marginVertical:windowHeight*0.0560,
    },
    viewOrderButtonContainer:{
        borderWidth: 2,        
        borderColor:'#7BCBBE',
        marginTop:windowHeight*0.1,  
    },
    viewOrderButton:{
        height:windowHeight*0.075,
        flexDirection:'row',
        justifyContent:'center',
        alignSelf:'center',
        backgroundColor: 'rgba(0,0,0,0)', 
    },
    viewOrderText:{
        fontSize:windowHeight/37.056,
        fontWeight:'600',
        color:'#7BCBBE',
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

