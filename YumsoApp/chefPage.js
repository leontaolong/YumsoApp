'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var dateRender = require('./commonModules/dateRender');
var AuthService = require('./authService');
var backIcon = require('./icons/icon-back.png');
var yumsoVerifiedIcon = require('./icons/icon-YumsoVerified.png');
var yumsoExclusiveIcon = require('./icons/icon-YumsoExclusive.png');
var bestReviewedIcon = require('./icons/icon-BestReviewed.png');
import Dimensions from 'Dimensions';


var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;
var badges=[
            {icon:yumsoVerifiedIcon, label:'Yumso Verified'},
            {icon:yumsoExclusiveIcon, label:'Yumso Exclusive'},
            {icon:bestReviewedIcon, label:'Award Verified'},
           ];


import React, {
  Component,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  ListView,
  TouchableHighlight,
  AsyncStorage,
  Alert
} from 'react-native';


class ShoppingCartPage extends Component {
    constructor(props){
        super(props);
        var ds = new ListView.DataSource({
           rowHasChanged: (r1, r2) => r1!=r2
        }); 
        var routeStack = this.props.navigator.state.routeStack;
        let chef = routeStack[routeStack.length-1].passProps.chef;        
        
        this.state = {
            chef:chef,
        };
        this.client = new HttpsClient(config.baseUrl, true);
    }
      
    render() {         
        var chefAllBadges=[];
        if(this.state.chef.yumsoVerifiedBadge){
            chefAllBadges.push(0);
        }
        if(this.state.chef.yumsoExclusiveBadge){
            chefAllBadges.push(1);
        }
        if(this.state.chef.bestReviewBadge){
            chefAllBadges.push(2);
        }
        var oneBadgeViewLength = (windowWidth - 2 * windowWidth/20.7)/chefAllBadges.length; //subtract padding from windowWidth
        var chefAllBadgesViews=[];
        for(var onebadge of chefAllBadges){
           chefAllBadgesViews.push(<View key={badges[onebadge].label} style={{flexDirection:'column', width:oneBadgeViewLength,justifyContent:'center'}}>
                                      <Image source={badges[onebadge].icon} style={styleShoppingCartPage.badgeIcon}/>
                                      <View style={styleShoppingCartPage.badgeLabelView}>
                                        <Text style={{fontSize:12*windowHeight/677,color:'#979797', fontWeight:'400', alignSelf:'center',textAlign:'center',}}>{badges[onebadge].label}</Text>
                                      </View>
                                   </View>)  
        }

        var chefStoryView=null;
        if(this.state.chef.storeDescription){
           chefStoryView = <View style={styleShoppingCartPage.chefStoryView}>
                                <Text style={styles.pageSubTitle}>My Story</Text>
                                <Text style={styles.pageText}>{this.state.chef.storeDescription}</Text>
                           </View>
        }    
               
        return (
            <View style={styles.container}>
               <View style={styles.headerBannerView}> 
                    <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBackToShopPage()}>
                       <View style={styles.backButtonView}>
                          <Image source={backIcon} style={styles.backButtonIcon}/>
                       </View>
                    </TouchableHighlight>  
                    <View style={styles.titleView}></View>  
                    <View style={styles.headerRightView}></View>     
               </View>
               <ScrollView style={styles.scrollViewContainer}>
                    <View style={styleShoppingCartPage.oneListingView}>
                          <View style={styleShoppingCartPage.chefInfoView}>
                              <Text style={styles.pageTitle}>{this.state.chef.firstname+' '+this.state.chef.lastname}</Text>                                                                                                                      
                              <Text style={styleShoppingCartPage.chefLocationText}>{this.state.chef.pickupAddressDetail.city+", "+this.state.chef.pickupAddressDetail.state}</Text>                                        
                          </View>
                          <Image source={{ uri: this.state.chef.chefProfilePic }} style={styleShoppingCartPage.chefPhoto}/>
                    </View>
                    <View style={styleShoppingCartPage.verificationView}>
                        <Text style={styles.pageSubTitle}>Verification</Text>
                        <View style={styleShoppingCartPage.badgeView}>
                            {chefAllBadgesViews}
                        </View>
                    </View>
                    {chefStoryView}
               </ScrollView>
           </View>     
        );
    }
    
    navigateBackToShopPage(){
        this.props.navigator.pop();
    }
    
}

var styleShoppingCartPage = StyleSheet.create({
    oneListingView:{
        backgroundColor:'#FFFFFF',  
        flexDirection:'row',
        height:windowWidth*0.330,
    },
    chefPhoto:{
        borderRadius: windowWidth*0.22/2,
        marginRight: windowWidth/20.7, 
        width:windowWidth*0.22,
        height:windowWidth*0.22,
    },
    chefInfoView:{
        flex:1,
        height:windowWidth*0.344,
        flexDirection:'column',
        paddingRight:windowWidth/27.6,
        paddingBottom:windowHeight/73.6,
    },
    chefLocationText:{
        fontSize:14*windowHeight/677,
        color:'#979797',
    },
    verificationView: {
        borderTopWidth:1,
        borderColor:'#EAEAEA',
        height:windowWidth*0.380,
    },
    badgeView:{
        height:windowWidth*0.25,
        flexDirection:'row',
    },
    badgeIcon:{
        width:windowHeight*0.07,
        height:windowHeight*0.07,
        alignSelf:'center'
    },
    badgeLabelView:{
       alignSelf:'center',
       justifyContent:'center',
       height:windowHeight*0.04,
       width:windowWidth*0.28,
    },
    chefStoryView:{
        height:windowHeight*0.317,
        flexDirection:'column',
        borderTopWidth:1,
        borderColor:'#EAEAEA',
    },
});

module.exports = ShoppingCartPage;

