'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var dateRender = require('./commonModules/dateRender');
var AuthService = require('./authService');
var backIcon = require('./icons/icon-back.png');
var ratingIconGrey = require('./icons/icon-rating-grey.png');
var ratingIconOrange = require('./icons/icon-rating-orange.png');
var deleteBannerIcon = require('./icons/icon-x.png');
var yumsoVerifiedIcon = require('./icons/icon-YumsoVerified.webp');
var chefQualificationIcon = require('./icons/icon-ChefQualification.webp');
var bestReviewedIcon = require('./icons/icon-BestReviewed.webp');
import Dimensions from 'Dimensions';


var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;
var badges=[
            {icon:yumsoVerifiedIcon, color:'#1077BF', label:'Yumso Verified'},
            {icon:chefQualificationIcon, color:'#8CC63F', label:'Chef Qualification'},
            {icon:bestReviewedIcon, color:'#FED13F', label:'Best Reviewed'},
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
        if(this.state.chef.chefQualificationdBadge){
            chefAllBadges.push(1);
        }
        if(this.state.chef.bestReviewBadge){
            chefAllBadges.push(2);
        }
        var oneBadgeViewLength = windowWidth/chefAllBadges.length;
        var chefAllBadgesViews=[];
        for(var onebadge of chefAllBadges){
           chefAllBadgesViews.push(<View key={badges[onebadge].label} style={{flexDirection:'column', width:oneBadgeViewLength,justifyContent:'center'}}>
                                      <Image source={badges[onebadge].icon} style={styleShoppingCartPage.badgeIcon}/>
                                      <View style={styleShoppingCartPage.badgeLabelView}>
                                        <Text style={{fontSize:windowHeight/43.69,color:badges[onebadge].color,alignSelf:'center',textAlign:'center',}}>{badges[onebadge].label}</Text>
                                      </View>
                                   </View>)  
        }    
               
        return (
            <View style={styles.container}>
               <View style={styles.headerBannerView}>    
                    <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBackToShopPage()}>
                       <View style={styles.backButtonView}>
                          <Image source={backIcon} style={styles.backButtonIcon}/>
                       </View>
                    </TouchableHighlight>    
                    <View style={styles.titleView}>
                       <Text style={styles.titleText}>About the Chef</Text>
                    </View>
                    <View style={styles.headerRightView}>            
                    </View>
               </View>
               <ScrollView>
                    <View style={styleShoppingCartPage.oneListingView}>
                          <Image source={{ uri: this.state.chef.chefProfilePic }} style={styleShoppingCartPage.chefPhoto}/>
                          <View style={styleShoppingCartPage.chefInfoView}>
                              <Text style={styleShoppingCartPage.chefNameText}>{this.state.chef.firstname+' '+this.state.chef.lastname}</Text>                                                                                                                      
                              <Text style={styleShoppingCartPage.chefLocationText}>{this.state.chef.pickupAddressDetail.city+", "+this.state.chef.pickupAddressDetail.state}</Text>                                        
                          </View>
                    </View>
                    <View style={styleShoppingCartPage.badgeView}>
                        {chefAllBadgesViews}
                    </View>
                    <View style={styleShoppingCartPage.chefStoryView}>
                        <Text style={styleShoppingCartPage.myStoryTitleText}>My Story</Text>
                        <Text style={styleShoppingCartPage.myStoryContentText}>{this.state.chef.storeDescription}</Text>
                    </View>
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
        height:windowWidth*0.344,
    },
    chefPhoto:{
        width:windowWidth*0.344,
        height:windowWidth*0.344,
    },
    chefInfoView:{
        flex:1,
        height:windowWidth*0.344,
        flexDirection:'column',
        paddingLeft:windowWidth/20.7,
        paddingRight:windowWidth/27.6,
        paddingVertical:windowHeight/73.6,
    },
    chefNameText:{
        fontSize:windowHeight/33.41,
        fontWeight:'bold',
        color:'#4A4A4A',
        marginTop:windowHeight*0.012,
        marginBottom:windowHeight*0.07,
    },
    chefLocationText:{
        fontSize:windowHeight/40.57,
        color:'#9B9B9B',
    },
    badgeView:{
        width:windowWidth,
        height:windowWidth*0.45,
        flexDirection:'row',
        borderTopWidth:5,
        borderColor:'#F5F5F5',
    },
    badgeIcon:{
        width:windowHeight*0.14,
        height:windowHeight*0.14,
        alignSelf:'center'
    },
    badgeLabelView:{
       alignSelf:'center',
       justifyContent:'center',
       height:windowHeight*0.07,
       width:windowWidth*0.28,
    },
    chefStoryView:{
        height:windowHeight*0.317,
        width:windowWidth,
        flexDirection:'column',
        paddingHorizontal:windowHeight*0.0264,
        borderTopWidth:5,
        borderColor:'#F5F5F5',
    },
    myStoryTitleText:{
        fontSize:windowHeight/35.5,
        fontWeight:'600',
        color:'#4A4A4A',
        textAlign:'center',
        marginVertical:windowHeight*0.0264,    
    },
    myStoryContentText:{
        fontSize:windowHeight/47.33,
        color:'#4A4A4A',
        textAlign:'justify',
    }
});

module.exports = ShoppingCartPage;

