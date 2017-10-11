'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var rating = require('./rating');
var dollarSign = require('./commonModules/dollarIconRender');
var dateRender = require('./commonModules/dateRender');
var AuthService = require('./authService');
var shareIcon = require('./icons/icon-share.png');
var backIcon = require('./icons/icon-back.png');
var plusIcon = require('./icons/icon-plus.png');
var minusIcon = require('./icons/icon-minus.png');
var forwardIcon = require('./icons/icon-forward.png');
var upIconWhite = require('./icons/icon-up-white.png');
var downIconWhite = require('./icons/icon-down-white.png');
var mapIcon = require('./icons/icon-map.png');
var chefPageIcon = require('./icons/icon-chefpage.png');
var reviewIcon = require('./icons/icon-reviews.png');
var labelIcon = require('./icons/icon-label-grey.png');
var heartLineIcon = require('./icons/icon-heart-line.png');
var heartFillsIcon = require('./icons/icon-heart-fills.png');
var dollarSign = require('./commonModules/dollarIconRender');
var defaultDishPic = require('./icons/defaultAvatar.jpg');
var ActivityView = require('react-native-activity-view');
var Swiper = require('react-native-swiper');
var commonAlert = require('./commonModules/commonAlert');
var commonWidget = require('./commonModules/commonWidget');
var NetworkUnavailableScreen = require('./networkUnavailableScreen');
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen')
// import * as WeChat from 'react-native-wechat';
// var result = await  WeChat.shareToTimeline({type: 'text', description: 'I\'m Wechat, :)'});

import Dimensions from 'Dimensions';
import ModalPicker from 'react-native-modal-picker'
import ParallaxScrollView from 'react-native-parallax-scroll-view';

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  ListView,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicatorIOS,
  AsyncStorage,
  Alert,
  Picker,
  Modal,
  Linking,
} from 'react-native';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

class ShopPage extends Component {
     constructor(props){
        super(props);      
        var ds = new ListView.DataSource({
           rowHasChanged: (r1, r2) => r1!=r2 
        });
        var routeStack = this.props.navigator.state.routeStack;
        let chef = routeStack[routeStack.length-1].passProps.chef;      
        this.defaultDeliveryAddress = routeStack[routeStack.length-1].passProps.defaultDeliveryAddress==undefined?{}:routeStack[routeStack.length-1].passProps.defaultDeliveryAddress;
        let currentLocation = routeStack[routeStack.length-1].passProps.currentLocation;
        this.callback = routeStack[routeStack.length-1].passProps.callback;      
        let eater = routeStack[routeStack.length-1].passProps.eater;    
        let showUpdateAppBanner = routeStack[routeStack.length-1].passProps.showUpdateAppBanner
        this.state = {
            dataSource: ds.cloneWithRows([]),
            showProgress:false,
            chefId: chef.chefId,
            chef:chef,
            timeData:[],
            shoppingCart:{}, 
            currentLocation:currentLocation, 
            selectedTime:'All Dishes',
            selectedTimeRendered:'All Dishes',
            totalPrice:0,
            eater:eater,
            showUpdateAppBanner:showUpdateAppBanner,
            showScheduleSelection:true,
            renderedSchedules:null,
        };            
    }
    
     async componentDidMount() {
         this.setState({ showProgress: true });
         this.client = new HttpsClient(config.baseUrl, true);
         await this.fetchDishesAndSchedules();
         if (this.state.eater) {
             this.setState({ like: this.state.eater.favoriteChefs.indexOf(this.state.chefId) !== -1 });
         }
         this.setState({ showProgress: false });
     }

    async fetchDishesAndSchedules() {
        let chefId = this.state.chefId;
        const start = 'start='+new Date().getTime();
        const end = 'end='+new Date().setDate(new Date().getDate()+8);
        
        try{
          this.setState({ showProgress: true });
          var responseDish = await this.client.getWithoutAuth(config.chefDishesEndpoint+chefId);
          this.setState({showProgress:false,showNetworkUnavailableScreen:false})
        }catch(err){
          this.setState({showProgress: false,showNetworkUnavailableScreen:true});
          commonAlert.networkError(err);
          return;
        }

        try{
          this.setState({ showProgress: true });
          var responseSchedule = await this.client.getWithoutAuth(config.chefSchedulesEndpoint+chefId+'?'+start+'&'+end);
          this.setState({showProgress:false,showNetworkUnavailableScreen:false})
        }catch(err){
          this.setState({showProgress: false,showNetworkUnavailableScreen:true});
          commonAlert.networkError(err);
          return;
        }

        //let dishes = responseDish.data.dishes;
        let dishes = this.moveHighlightedDishToTop(responseDish.data.dishes);
        let allSchedules = responseSchedule.data.schedules;
        let schedules = [];
        //filter all the schedules with earliest order time earlier than current time.
        var currentTime = new Date().getTime();
        //console.log(allSchedules);
        for(let oneSchedule of allSchedules){
            if(oneSchedule.earliestOrderTime<=currentTime){
               schedules.push(oneSchedule);
            }
        }
        let scheduleMapping = {};
        let timeData = [];
        let index = 0;
        if(schedules.length!=0){
           var allDishSet = {};
           for(var dish of dishes){
               allDishSet[dish.dishId] = -1;
           }
           scheduleMapping['All Dishes']= allDishSet;
           timeData.push({ key: index++, label: 'All Dishes' })
        }
        for(var schedule of schedules){
            var time = new Date(schedule.deliverTimestamp).toString();   
            if(!scheduleMapping[time]){
               scheduleMapping[time] = {
                   [schedule.dishId]: {
                       leftQuantity: schedule.leftQuantity,
                       leftQuantityImmutable: schedule.leftQuantity,
                       quantity: schedule.quantity,
                       latestOrderTime:schedule.latestOrderTime,
                   }
               };
               timeData.push({ key: index++, label: time });
            }else{
               scheduleMapping[time][schedule.dishId] = {
                       leftQuantity: schedule.leftQuantity,
                       leftQuantityImmutable: schedule.leftQuantity,
                       quantity: schedule.quantity,
                       latestOrderTime:schedule.latestOrderTime,
               };
            }
        }
        this.setState({
            dishes:dishes, 
            scheduleMapping:scheduleMapping, 
            timeData:timeData,
            dishesInDisplay:dishes,
        });
        if (!this.state.showScheduleSelection) {
            var currentDataSource = dishes;
        } else {
            var currentDataSource = this.getDeliverySchedules();
            this.setState({renderedSchedules:currentDataSource});
        }
        this.setState({dataSource:this.state.dataSource.cloneWithRows(currentDataSource)});
    }
    
    renderHeader(){
        var menuTitle = null;
        if (this.state.showScheduleSelection) {
            menuTitle = <View style={styleShopPage.menuTitleView1}>
                            <Text style={styleShopPage.menuTitleTextTitle}>Menu</Text>
                            <Text style={[styleShopPage.menuTitleTextPrompt, {alignSelf:'flex-start'}]}>Select a menu at your scheduled out-for-delivery time</Text>
                        </View>
        } else {
            menuTitle = <View style={styleShopPage.menuTitleView2}>
                            <View style={{flexDirection:'row'}}>
                                <Text style={styleShopPage.menuTitleTextTitle}>Menu · </Text>
                                <Text style={styleShopPage.menuTitleTextPrompt}>{this.state.selectedTimeRendered}</Text>
                            </View>
                            <Text style={[styleShopPage.menuTitleTextPrompt, {marginRight: windowWidth*0.065,textAlign:'left',color:'#7BCBBE'}]} onPress={()=>this.displaySchedule()}>Change</Text>
                        </View>           
        }
        return (
            <View>
                <View style={styles.greyBorderView}></View>
                {menuTitle}
            </View>
        );
    }

    renderFooter(){
        if (this.state.showScheduleSelection) {
            var noScheduleAvailableView =   <View style={[styles.greyBox, {marginHorizontal:windowWidth/20.7,marginBottom:windowHeight*0.02}]}>
                                                <Text style={styles.greyBoxText}>Currently no dishes are available to deliver</Text>
                                            </View>

            var fullMenuButtonView = <TouchableHighlight style={styleShopPage.fullMenuButton} underlayColor={'#eee'} onPress={()=>this.selectSchedule("All Dishes")}>
                                        <Text style={styleShopPage.fullMenuButtonText}>Explore Full Menu</Text> 
                                    </TouchableHighlight>
            if (this.state.renderedSchedules && this.state.renderedSchedules.length == 0) {
                return (<View>
                        {noScheduleAvailableView} 
                        {fullMenuButtonView}
                    </View>
                )
            } else {
                return (fullMenuButtonView);
            }
        }
        return null;
    }


    renderRow(data){
        if (this.state.showScheduleSelection) { // schedule selection listview
            return (<TouchableHighlight style={styleShopPage.scheduleBox} underlayColor={'#eee'} onPress={()=>this.selectSchedule(data)}>
                        <Text style={styleShopPage.scheduleBoxText}>{data.label}</Text>
                    </TouchableHighlight>);
        } else { // dishes listview
            let imageSrc = defaultDishPic;
            if(data.pictures && data.pictures!=null && data.pictures.length!=0){
               imageSrc={uri:data.pictures[0]};   
            }
            if(data.isHighlightDish){ // highlighted dishes
                // sold out
                if(this.state.selectedTime != 'All Dishes' && this.state.scheduleMapping[this.state.selectedTime][data.dishId] && this.state.scheduleMapping[this.state.selectedTime][data.dishId].leftQuantityImmutable == 0){
                    var shopPageDishImageView = <Image source={imageSrc} style={styleShopPage.oneDishPictureSoldOut}/>
                    var chooseQuantityView = <View style={styleShopPage.chooseQuantityView}>
                                                <View style={styleShopPage.leftQuantityAndPriceView}>
                                                    <Text style={styleShopPage.priceText}>${data.price}</Text>
                                                    <Text style={styleShopPage.orderStatusText}>
                                                        Sold Out
                                                    </Text> 
                                                </View>
                                                <View style={styleShopPage.quantitySelectionView}></View>                       
                                            </View>                                        
                // late order
                }else if(this.state.selectedTime != 'All Dishes' && this.state.scheduleMapping[this.state.selectedTime][data.dishId] && this.state.scheduleMapping[this.state.selectedTime][data.dishId].latestOrderTime < new Date().getTime()){
                    var shopPageDishImageView = <Image source={imageSrc} style={styleShopPage.oneDishPicture}/>
                    var chooseQuantityView = <View style={styleShopPage.chooseQuantityView}>
                                                    <View style={styleShopPage.leftQuantityAndPriceView}>
                                                        <Text style={styleShopPage.priceText}>${data.price}</Text>
                                                        <Text style={styleShopPage.orderStatusText}>
                                                            {this.state.selectedTime === 'All Dishes' || this.state.scheduleMapping[this.state.selectedTime][data.dishId]==undefined ? '' : this.state.scheduleMapping[this.state.selectedTime][data.dishId].leftQuantity+' left'} 
                                                        </Text> 
                                                    </View> 

                                                    <View style={styleShopPage.lateNoteView}>
                                                        <Text style={styleShopPage.lateNoteText}>
                                                            Chef requires order {dateRender.renderTime1(new Date(this.state.selectedTime).getTime()-this.state.scheduleMapping[this.state.selectedTime][data.dishId].latestOrderTime)} ahead
                                                        </Text>
                                                    </View>                      
                                            </View>
                }else{
                    var shopPageDishImageView = <Image source={imageSrc} style={styleShopPage.oneDishPicture}/>
                    var chooseQuantityView = <View style={styleShopPage.chooseQuantityView}>
                                                    <View style={styleShopPage.leftQuantityAndPriceView}>
                                                        <Text style={styleShopPage.priceText}>${data.price}</Text>  
                                                        <Text style={styleShopPage.orderStatusText}>
                                                            {this.state.selectedTime === 'All Dishes' || this.state.scheduleMapping[this.state.selectedTime][data.dishId]==undefined ? '' : this.state.scheduleMapping[this.state.selectedTime][data.dishId].leftQuantity+' left'} 
                                                        </Text> 
                                                    </View>
                                                    <View style={styleShopPage.quantitySelectionView}>
                                                        {this.state.shoppingCart[this.state.selectedTime] && this.state.shoppingCart[this.state.selectedTime][data.dishId] && this.state.shoppingCart[this.state.selectedTime][data.dishId].quantity &&
                                                        // show minus button if quantity's greater than 0
                                                        <TouchableHighlight style={styleShopPage.plusMinusIconView} underlayColor={'#F5F5F5'} onPress={() => this.removeFromShoppingCart(data) }>
                                                            <Image source={minusIcon} style={styleShopPage.plusMinusIcon}/>
                                                        </TouchableHighlight>}
                                                        <View style={styleShopPage.quantityTextView}>
                                                            <Text style={styleShopPage.quantityText}>
                                                                {this.state.shoppingCart[this.state.selectedTime] && this.state.shoppingCart[this.state.selectedTime][data.dishId] ? this.state.shoppingCart[this.state.selectedTime][data.dishId].quantity: ' '}
                                                            </Text>
                                                        </View>
                                                        <TouchableHighlight style={styleShopPage.plusMinusIconView} underlayColor={'#F5F5F5'} onPress={() => this.addToShoppingCart(data) }>
                                                            <Image source={plusIcon} style={styleShopPage.plusMinusIcon}/>
                                                        </TouchableHighlight>
                                                    </View>                       
                                            </View>
                }

                return (<TouchableOpacity onPress={()=>this.navigateToDishPage(data)} activeOpacity={0.7} style={styleShopPage.oneDishInListView}>
                                <View style={styleShopPage.oneDishPicture}>
                                    {shopPageDishImageView}
                                </View>
                                <View style={styleShopPage.oneDishNameDiscriptionView}>
                                    <Text>
                                        <Text style={styleShopPage.oneDishNameText}>{data.dishName}</Text>
                                        <Text style={styleShopPage.oneDishSpecialTag}> / Chef's Special</Text>
                                    </Text>
                                </View>
                                <View>
                                    {chooseQuantityView}
                                </View>
                                <View style={styles.listViewBorder}></View>
                            </TouchableOpacity>);
                }else{ // un-highlighted dishes
                    
                    // sold out
                    if(this.state.selectedTime != 'All Dishes' && this.state.scheduleMapping[this.state.selectedTime][data.dishId] && this.state.scheduleMapping[this.state.selectedTime][data.dishId].leftQuantityImmutable == 0){
                        var shopPageDishImageView = <Image source={imageSrc} style={styleShoppingCartPage.oneDishPictureUnhighlightSoldOut}/>;
                        var chooseQuantityView = <View style={styleShoppingCartPage.chooseQuantityView}>
                        <View style={styleShopPage.leftQuantityAndPriceView}>
                            <Text style={styleShopPage.priceText}>${data.price}</Text>
                            <Text style={styleShopPage.orderStatusText}>
                                Sold Out
                            </Text> 
                        </View>
                        <View style={styleShopPage.quantitySelectionView}></View>                       
                    </View> 

                    // late order
                    }else if(this.state.selectedTime != 'All Dishes' && this.state.scheduleMapping[this.state.selectedTime][data.dishId] && this.state.scheduleMapping[this.state.selectedTime][data.dishId].latestOrderTime < new Date().getTime()){
                        var shopPageDishImageView = <Image source={imageSrc} style={styleShoppingCartPage.oneDishPictureUnhighlight}/>;              
                        var chooseQuantityView = <View style={styleShoppingCartPage.chooseQuantityView}>
                                            <View style={styleShopPage.leftQuantityAndPriceView}>
                                                <Text style={styleShopPage.priceText}>${data.price}</Text>
                                                <Text style={styleShopPage.orderStatusText}>
                                                    {this.state.selectedTime === 'All Dishes' || this.state.scheduleMapping[this.state.selectedTime][data.dishId]==undefined ? '' : this.state.scheduleMapping[this.state.selectedTime][data.dishId].leftQuantity+' left'} 
                                                </Text> 
                                            </View> 

                                            <View style={styleShoppingCartPage.lateNoteView}>
                                                <Text style={styleShopPage.lateNoteText}>
                                                    Chef requires order {dateRender.renderTime1(new Date(this.state.selectedTime).getTime()-this.state.scheduleMapping[this.state.selectedTime][data.dishId].latestOrderTime)} ahead
                                                </Text>
                                            </View>                      
                                    </View>
                    }else{
                        var shopPageDishImageView = <Image source={imageSrc} style={styleShoppingCartPage.oneDishPictureUnhighlight}/>;
                        var chooseQuantityView = <View style={styleShoppingCartPage.chooseQuantityView}>
                                        <View style={styleShopPage.leftQuantityAndPriceView}>
                                            <Text style={styleShopPage.priceText}>${data.price}</Text>  
                                            <Text style={styleShopPage.orderStatusText}>
                                                {this.state.selectedTime === 'All Dishes' || this.state.scheduleMapping[this.state.selectedTime][data.dishId]==undefined ? '' : this.state.scheduleMapping[this.state.selectedTime][data.dishId].leftQuantity+' left'} 
                                            </Text> 
                                        </View>
                                        <View style={styleShoppingCartPage.quantitySelectionView}>
                                            {this.state.shoppingCart[this.state.selectedTime] && this.state.shoppingCart[this.state.selectedTime][data.dishId] && this.state.shoppingCart[this.state.selectedTime][data.dishId].quantity &&
                                            // show minus button if quantity's greater than 0
                                            <TouchableHighlight style={styleShopPage.plusMinusIconView} underlayColor={'#F5F5F5'} onPress={() => this.removeFromShoppingCart(data) }>
                                                <Image source={minusIcon} style={styleShopPage.plusMinusIcon}/>
                                            </TouchableHighlight>}
                                            <View style={styleShopPage.quantityTextView}>
                                                <Text style={styleShopPage.quantityText}>
                                                    {this.state.shoppingCart[this.state.selectedTime] && this.state.shoppingCart[this.state.selectedTime][data.dishId] ? this.state.shoppingCart[this.state.selectedTime][data.dishId].quantity: ' '}
                                                </Text>
                                            </View>
                                            <TouchableHighlight style={styleShopPage.plusMinusIconView} underlayColor={'#F5F5F5'} onPress={() => this.addToShoppingCart(data) }>
                                                <Image source={plusIcon} style={styleShopPage.plusMinusIcon}/>
                                            </TouchableHighlight>
                                        </View>                       
                                </View>
                    }
                    return (<TouchableOpacity onPress={()=>this.navigateToDishPage(data)} activeOpacity={0.7}>
                                <View style={styleShoppingCartPage.oneListingView}>
                                    {shopPageDishImageView}
                                    <View style={styleShoppingCartPage.shoppingCartInfoView}>
                                        <View style={styleShoppingCartPage.dishNameView}>
                                            <Text style={styleShoppingCartPage.dishNameText}>{commonWidget.getTextLengthLimited(data.dishName,28)}</Text>
                                        </View>                                                            
                                        {chooseQuantityView}                  
                                    </View>
                                </View>
                                <View style={styles.listViewBorder}></View>
                            </TouchableOpacity>);
            }
        }
    }
         
    render() {
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView =<LoadingSpinnerViewFullScreen/>;  
        }


        var chefNoticeView = null
        if(this.state.chef.chefNotice){
           if(this.state.chef.chefNotice.length<=25){
              chefNoticeView = <View style={styleShopPage.chefNoticeView}>
                                    <View style={styleShopPage.chefNoticeTextView}>
                                        <Text style={styleShopPage.chefNoticeText}>
                                            {this.state.chef.chefNotice}
                                        </Text>
                                    </View>
                                </View>
            }else{
               chefNoticeView = <View style={styleShopPage.chefNoticeView}>
                                        <View style={styleShopPage.chefNoticeTextView}>
                                            <Text style={styleShopPage.chefNoticeText}>
                                                Chef Notice: {commonWidget.getTextLengthLimited(this.state.chef.chefNotice,25)}
                                            </Text>
                                        </View>
                                        <TouchableOpacity style={styleShopPage.chefNoticeButtonView} onPress={()=>this.setState({isChefNoticeExtended:true})} activeOpacity={0.7}>
                                            <Image source={downIconWhite} style={styleShopPage.chefNoticeIcon}/>
                                        </TouchableOpacity>
                                    </View>;
               if(this.state.isChefNoticeExtended){
                  chefNoticeView = <View style={styleShopPage.chefNoticeExtendedView}>
                                            <View style={styleShopPage.chefNoticeTextView}>
                                                <Text style={styleShopPage.chefNoticeText}>
                                                    Chef Notice: {this.state.chef.chefNotice}
                                                </Text>
                                            </View>
                                            <TouchableOpacity style={styleShopPage.chefNoticeButtonView} onPress={()=>this.setState({isChefNoticeExtended:false})} activeOpacity={0.7}>
                                                <Image source={upIconWhite} style={styleShopPage.chefNoticeIcon}/>
                                            </TouchableOpacity>
                                  </View>;
               }
            }
        }
        
        var updateAppBannerView=null;
        if(this.state.showUpdateAppBanner){
           updateAppBannerView = <View style={styles.infoBannerView}>
                                   <Text style={styles.infoBannerText}>
                                      Yumso App has new version available.  
                                   </Text> 
                                   <TouchableHighlight style={styles.infoBannerLinkView} onPress={()=>this.linkToAppStore()} underlayColor={'#ECECEC'}>
                                        <Text style={styles.infoBannerLink}>
                                            Tap to update
                                        </Text>
                                   </TouchableHighlight>
                                 </View>
        }

        var networkUnavailableView = null;
        var dishListView = null;
        var parallaxScrollView = null;
        var footerView = null;

        if(this.state.like){
            var  likeIcon = heartFillsIcon;
         }else{
            var  likeIcon = heartLineIcon;
         }

         if(this.state.chef.chefProfilePicUrls && this.state.chef.chefProfilePicUrls.small){
            var chefProfilePic = this.state.chef.chefProfilePicUrls.small;
         }else{
            var chefProfilePic = this.state.chef.chefProfilePic;
         }

         if(this.state.chef.chefShopPicUrls){
            var shopPicturesMedium = [];
            for(var oneShopPhoto in this.state.chef.chefShopPicUrls){
                shopPicturesMedium.push(this.state.chef.chefShopPicUrls[oneShopPhoto].medium)
            }
         }
         
      // Temporarily deprecate this chunk because the image quality of medium pictures are not good 
      //    if(shopPicturesMedium && shopPicturesMedium.length>0){
      //       var shopPictures = shopPicturesMedium;
      //    }else{
      //       var shopPictures = this.state.chef.shopPictures;
      //    }

         var shopPictures = this.state.chef.shopPictures;
         var headerBanner = <View style={[styles.headerBannerView, {paddingTop:windowHeight * 0.035}]}>      
                                <View style={styles.headerLeftView}></View>
                                <View style={styles.titleView}>
                                    <Text style={styles.titleText}>{this.state.chef.shopname}</Text>
                                </View>
                                <TouchableHighlight style={styles.headerIconView} underlayColor={'#F5F5F5'} onPress={()=>this.share()}>
                                    <View style={styles.headerRightTextButtonView}>
                                        <Image source={shareIcon} style={styleShopPage.headerShareIcon}/>
                                    </View>
                                </TouchableHighlight> 

                                <TouchableHighlight style={styles.headerIconView} underlayColor={'#F5F5F5'} onPress={()=>this.addToFavorite()}>
                                    <View style={styles.headerRightTextButtonView}>
                                        <Image source={likeIcon} style={styleShopPage.headerLikeIcon}/>
                                    </View>
                                </TouchableHighlight> 
                            </View>

         var parallaxHeaderView = <View>
                    <View key={'shopPictureView'} style={styleShopPage.shopPictureView}>
                        <Swiper showsButtons={false} height={SHOP_PIC_HEIGHT} horizontal={true} autoplay={false}
                          dot={<View style={styles.dot} />} activeDot={<View style={styles.activeDot} />} >
                          {shopPictures.map((shopPicture) => {
                              return <Image key={'shopPicture'} source={{ uri: shopPicture }} style={styleShopPage.shopPicture}/>
                          })}
                        </Swiper>
                    </View>                       
                    <View key={'shopInfoView'} style={styleShopPage.shopInfoView}>
                        <TouchableHighlight style={[styles.iconCircle, styleShopPage.shareIconPositioning]} underlayColor={'#bbb'} onPress={()=>{this.share()}}>
                            <Image source={shareIcon} style={styles.shareIconCircled}></Image>
                        </TouchableHighlight>
                        
                        <TouchableHighlight style={[styles.iconCircle, styleShopPage.likeIconPositioning]} underlayColor={'#bbb'} onPress={()=>{this.addToFavorite()}}>
                            <Image source={likeIcon} style={styles.likeIconCircled}></Image>
                        </TouchableHighlight>
                      
                        <View style={styleShopPage.shopInfoSection}>
                            <View style={styleShopPage.shopInfoRow}>
                                <View style={styleShopPage.shopNameView}>
                                    <Text style={styleShopPage.oneShopNameText}>{this.state.chef.shopname}</Text>
                                </View>
                            </View>
                        
                            <View style={styleShopPage.shopInfoRow}>
                                <View style={styleShopPage.shopRatingView}>
                                    {rating.renderRating(this.state.chef.rating)}
                                </View>
                            <View style={styleShopPage.shopInfoRightColumnView}>
                                <Text style={styleShopPage.shopInfoRightColumnText}>{this.state.chef.pickupAddressDetail.city+", "+this.state.chef.pickupAddressDetail.state}</Text>
                            </View>
                        </View>
                        
                        <View style={styleShopPage.shopInfoRow}>
                                <View style={styleShopPage.labelView}>
                                    <Image style={styleShopPage.labelIcon} source={labelIcon}/><Text style={styleShopPage.labelText}>{this.state.chef.styleTag}, {this.state.chef.foodTag}</Text>
                                </View>
                                <View style={styleShopPage.shopInfoRightColumnView}>
                                    <Text style={styleShopPage.shopInfoRightColumnText}>{this.state.chef.distance!=undefined && this.state.chef.distance!=null?(this.state.chef.distance>20?'20':this.state.chef.distance)+' miles | ':''}{dollarSign.renderLevel(this.state.chef.priceLevel)}</Text>
                                </View> 
                        </View>                       
                    </View>
                </View>

                <View style={styleShopPage.chefDetailRowView}>
                {/* remove border on the left for the first item* */}
                    <TouchableHighlight key={'chefPageClickableView'} style={[styleShopPage.chefDetailView, {borderLeftWidth:0}]} underlayColor={'#F5F5F5'} onPress={() => this.navigateToChefPage()}>
                        <View style={styleShopPage.chefDetailTextView}>
                            <Text style={styleShopPage.pickupAddressText}>Chef Page</Text>
                            <Image source={{ uri:chefProfilePic}} style={styleShopPage.chefPhoto}/>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight key={'chefIntroClickable'} style={styleShopPage.chefDetailView} underlayColor={'#F5F5F5'} onPress={() => this.navigateToChefIntroPage()}>
                        <View style={styleShopPage.chefDetailTextView}>
                            <Text style={styleShopPage.pickupAddressText}>Introduction</Text>
                        </View>
                    </TouchableHighlight> 
                    <TouchableHighlight key={'chefReviewsClickable'} style={styleShopPage.chefDetailView} underlayColor={'#F5F5F5'} onPress={() => this.navigateToChefCommentsPage()}>
                        <View style={styleShopPage.chefDetailTextView}>
                            <Text style={styleShopPage.pickupAddressText}>Reviews ({this.state.chef.reviewCount})</Text>
                        </View>
                    </TouchableHighlight>
                </View>
            </View>;
        
        parallaxScrollView = <ParallaxScrollView
                                    dataSource={ this.state.dataSource }
                                    stickyHeaderHeight={ STICKY_HEADER_HEIGHT }
                                    parallaxHeaderHeight={ PARALLAX_HEADER_HEIGHT }
                                    backgroundColor={'#fff'}
                                    fadeOutForeground={true}

                                    renderForeground={() => (
                                        <View key="parallax-header" style={styleShopPage.parallaxHeader }>
                                            {parallaxHeaderView}
                                        </View>
                                    )}

                                    renderStickyHeader={() => (
                                        <View key="sticky-header" style={styleShopPage.stickySection}>
                                            {headerBanner}
                                        </View>
                                    )}

                                    renderFixedHeader={() => (
                                        <View key="fixed-header" style={styleShopPage.fixedSection}>
                                            <TouchableHighlight style={styles.headerLeftView} underlayColor={'transparent'} onPress={() => this.navigateBackToChefList()}>
                                                <View style={styles.backButtonView}>
                                                    <Image source={backIcon} style={styles.backButtonIcon}/>
                                                </View>
                                            </TouchableHighlight>  
                                    </View>
                                    )}                      
                                />
            
        if(this.state.showNetworkUnavailableScreen){
           networkUnavailableView = <NetworkUnavailableScreen onReload = {this.fetchDishesAndSchedules.bind(this)} />
        }else{
           dishListView = <ListView style={styles.dishListView}
                            dataSource = {this.state.dataSource}
                            renderRow={this.renderRow.bind(this) } 
                            renderHeader={this.renderHeader.bind(this)}
                            renderFooter={this.renderFooter.bind(this)}
                            loadData={this.fetchDishesAndSchedules.bind(this)}
                            renderScrollComponent={props => (parallaxScrollView)}
                            />
            if (!this.state.showScheduleSelection) {
                footerView = <View style={styleShopPage.footerView}>
                    <View style={styleShopPage.shoppingCartTimeView}>
                        <Text style={styleShopPage.shoppingCartTimePriceText}>{this.state.selectedTime=='All Dishes'? '' : 'Subtotal: $'+Number(this.state.totalPrice.toFixed(2))}</Text>
                    </View>
                    <TouchableOpacity style={styleShopPage.checkoutButtonView} activeOpacity={0.7} onPress={() => this.navigateToShoppingCart()}> 
                    <View style={styleShopPage.checkoutButtonWrapper}>
                        <Text style={styleShopPage.checkoutButton}>Cart</Text>
                    </View>
                    </TouchableOpacity>
                </View>
            }
        }  
        
        return (
            <View style={[styles.container, {paddingTop:0}]}>
                {/*10/08/2017: temporarily hide chefNoticeView and updateAppBannerView*/}

                {/* {chefNoticeView}
                {updateAppBannerView} */}
                {networkUnavailableView}
                {dishListView}
                {footerView}
                {loadingSpinnerView}
            </View>);
    }

    getTotalPrice(){
        var total = 0;
        var deliverTime = this.state.selectedTime;
        for(var cartItemId in this.state.shoppingCart[deliverTime]){
            var cartItem = this.state.shoppingCart[deliverTime][cartItemId];
            total+=cartItem.dish.price * cartItem.quantity;
        }
        this.setState({shoppingCart:this.state.shoppingCart, totalPrice:total});
    }

    getDeliverySchedules() {
        let deliveryTimeRendered = [];
        for(var oneTimeString of this.state.timeData){
            if(oneTimeString.label !=='All Dishes'){
                let isAllSoldOut = true;
                for(var oneDishId in this.state.scheduleMapping[oneTimeString.label]){
                    if (this.state.scheduleMapping[oneTimeString.label][oneDishId].leftQuantityImmutable > 0){
                        isAllSoldOut = false
                        break;
                    }
                }
                if(isAllSoldOut){
                    deliveryTimeRendered.push({key:oneTimeString.label, label: dateRender.renderDate2(oneTimeString.label) + "(Sold Out)"}); 
                }else{
                    deliveryTimeRendered.push({key:oneTimeString.label, label: dateRender.renderDate2(oneTimeString.label)});
                }
            }
        }
        return deliveryTimeRendered;
    }

    moveHighlightedDishToTop(dishes){
        //Apply the order chef setDate
        var dishOrderConfig = this.state.chef.dishOrderConfig;
        if(dishOrderConfig){
           dishes.sort(function (dishA, dishB) {
                               if(dishOrderConfig[dishA.dishId]==undefined){
                                  dishOrderConfig[dishA.dishId] = 100000;
                               }
                               if(dishOrderConfig[dishB.dishId]==undefined){
                                  dishOrderConfig[dishB.dishId] = 100000;
                               }
                               if(dishOrderConfig[dishA.dishId]==dishOrderConfig[dishB.dishId]){
                                  return dishA.createdTime - dishB.createdTime;
                               }
                               return  parseInt(dishOrderConfig[dishA.dishId]) - parseInt(dishOrderConfig[dishB.dishId]) 
                      })
        }
        let highlightDishes = [];
        let unhighlightDishes = [];
        for(var oneDish of dishes){
            if(oneDish.isHighlightDish){
               highlightDishes.push(oneDish);
            }else{
               unhighlightDishes.push(oneDish);
            }
        }

        return highlightDishes.concat(unhighlightDishes);
    }
    
    displayDish(selectedTime){
        if(selectedTime==='All Dishes'){
            this.setState({dataSource:this.state.dataSource.cloneWithRows(this.state.dishes), showProgress:false, selectedTime:selectedTime});
            return;       
        }
        this.state.selectedTime = selectedTime;
        var displayDishes = [];
        var selectedTimeDishSchedules = this.state.scheduleMapping[selectedTime];
        for (var dish of this.state.dishes) {
            if (selectedTimeDishSchedules[dish.dishId]) {
                displayDishes.push(dish);
            }
        }
        let dishes = this.moveHighlightedDishToTop(JSON.parse(JSON.stringify(displayDishes)));
        this.getTotalPrice();
        this.setState({dataSource:this.state.dataSource.cloneWithRows(dishes), dishesInDisplay:dishes,showProgress:false, selectedTime:selectedTime});
    }

    displaySchedule(){
        this.setState({showScheduleSelection:true, dataSource:this.state.dataSource.cloneWithRows(this.state.renderedSchedules)});
    }

    selectSchedule(selectedTime){
        if (selectedTime==='All Dishes') {
            var timeLabel = 'All Dishes';
            var timeKey = 'All Dishes';
        } else {
            var timeLabel = selectedTime.label;
            var timeKey = selectedTime.key;          
        }
        this.setState({showScheduleSelection:false, selectedTimeRendered:timeLabel});
        this.displayDish(timeKey);
    }
   
    addToShoppingCart(dish){
        if(this.state.selectedTime==='All Dishes'){
            Alert.alert( 'Warning', 'Please select a delivery time',[ { text: 'OK' }]);
            return;  
        }
        if(this.state.scheduleMapping[this.state.selectedTime][dish.dishId].leftQuantity===0){
            Alert.alert( 'Warning', 'No more available',[ { text: 'OK' }]);
            return;          
        }
        this.state.scheduleMapping[this.state.selectedTime][dish.dishId].leftQuantity-=1;
        if(!this.state.shoppingCart[this.state.selectedTime]){
            this.state.shoppingCart[this.state.selectedTime] = {};
        }
        if(this.state.shoppingCart[this.state.selectedTime][dish.dishId]){
            this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity+=1;
        }else{
            this.state.shoppingCart[this.state.selectedTime][dish.dishId] = {dish:dish, quantity:1};
        }

        this.setState({dataSource: this.state.dataSource.cloneWithRows(JSON.parse(JSON.stringify(this.state.dishesInDisplay)))});
        this.getTotalPrice();
    }
    
    removeFromShoppingCart(dish){
        if(this.state.selectedTime==='All Dishes'){
            Alert.alert( 'Warning', 'Please select a delivery time',[ { text: 'OK' }]);
            return;  
        }
        if(!this.state.shoppingCart[this.state.selectedTime]){
            return;
        }   
        if(this.state.shoppingCart[this.state.selectedTime][dish.dishId] && this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity>0){
            this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity-=1;
           this.state.scheduleMapping[this.state.selectedTime][dish.dishId].leftQuantity+=1;
            if(this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity===0){
                delete this.state.shoppingCart[this.state.selectedTime][dish.dishId];
                if(Object.keys(this.state.shoppingCart[this.state.selectedTime])===0){
                    delete this.state.shoppingCart[this.state.selectedTime];
                }
            }
        } 
        this.getTotalPrice();
    }

    linkToAppStore(){
        Linking.openURL('itms://itunes.apple.com/us/app/apple-store/id1125810059?mt=8')
    }
    
    addToFavorite() {
        let _this = this;
        let eater = this.state.eater;
        if (eater) {
            this.setState({showProgress: true});
            let isAdd = eater.favoriteChefs.indexOf(_this.state.chefId) === -1
            _this.client.postWithAuth(isAdd ? config.addFavoriteEndpoint : config.removeFavoriteEndpoint, {
                info: { chefId: _this.state.chefId, eaterId: eater.eaterId }
            }).then((res) => {
                this.setState({showProgress: false});
                if(res.statusCode==400){
                    Alert.alert( 'Warning', res.data,[ { text: 'OK' }]);              
                }else if (res.statusCode === 200 || res.statusCode === 202) {
                    isAdd ? eater.favoriteChefs.push(_this.state.chefId) : eater.favoriteChefs.splice(eater.favoriteChefs.indexOf(_this.state.chefId), 1);
                    return AuthService.updateCacheEater(eater) //todo: perhaps return the eater oject everytime update it.
                        .then(() => {
                            _this.setState({ like: isAdd });
                            //Alert.alert('Success', isAdd ? 'Added to favorite list' : 'Removed from favorite list', [{ text: 'OK' }]);
                        });
                }else if (res.statusCode === 401) {
                    return AuthService.logOut()
                        .then(() => {
                            delete _this.state.eater;
                            _this.props.navigator.push({
                                name: 'LoginPage',
                                passProps: {
                                    callback: (eater) => {
                                        _this.setState({ like: eater.favoriteChefs.indexOf(_this.state.chefId) !== -1 });
                                    }
                                }
                            });
                        });
                } else {
                    Alert.alert( 'Failed adding to favorite', 'Network or server side error. Please try again later',[ { text: 'OK' }]);   
                }
            }).catch((err)=>{
               this.setState({showProgress: false});
               commonAlert.networkError(err);
            }); 
        } else {
            _this.props.navigator.push({
                name: 'LoginPage',
                passProps: {
                    callback: (eater) => {
                        _this.setState({ like: eater.favoriteChefs.indexOf(_this.state.chefId) !== -1 });
                    }
                }
            });
        }
    }

    share() {
        ActivityView.show({
            text: "Yumso, bring you home.  -- Chef shop "+this.state.chef.shopname+' welcome you to order' ,
            url: "https://www.yumso.com",
            imageUrl: this.state.chef.chefProfilePic,
            //imageBase64: "Raw base64 encoded image data",
            //image: 'signInBackground.jpg',
            //file: "Path to file you want to share",
            //exclude: ['postToFlickr'],
            //anchor: React.findNodeHandle(this.refs.share), // Where you want the share popup to point to on iPad
        });
    }
    
    navigateToShoppingCart(){
        if(this.state.selectedTime =='All Dishes'){
            Alert.alert( 'Warning', 'Please select a delivery time',[ { text: 'OK' }]);
            return;
        }     
        if(this.state.shoppingCart && Object.keys(this.state.shoppingCart).length===0 || Object.keys(this.state.shoppingCart[this.state.selectedTime]).length===0){
            Alert.alert( 'Warning', 'You do not have any item in shopping cart',[ { text: 'OK' }]);
            return;  
        }
        //console.log(this.state.shoppingCart);
        this.props.navigator.push({
            name: 'ShoppingCartPage', 
            passProps:{
                shoppingCart:this.state.shoppingCart,
                selectedTime:this.state.selectedTime,
                deliverTimestamp:Date.parse(this.state.selectedTime),
                currentLocation:this.state.currentLocation,
                defaultDeliveryAddress: this.defaultDeliveryAddress,
                notesToChef:this.state.notesToChef,
                promotionCode:this.state.promotionCode,
                chefId:this.state.chefId,
                eater:this.state.eater,
                shopName:this.state.chef.shopname,
                scheduleMapping: this.state.scheduleMapping,
                backCallback: function(totalPrice,notesToChef,promotionCode){
                    this.setState({totalPrice: totalPrice,notesToChef:notesToChef,promotionCode:promotionCode})
                }.bind(this)
            }
        });    
    }
    
    navigateToChefCommentsPage(){
        this.props.navigator.push({
            name: 'ChefCommentsPage', 
            passProps:{
                chefId:this.state.chefId,
                chefProfilePic:this.state.chef.chefProfilePic,
                shopName:this.state.chef.shopname,
                reviewCount:this.state.chef.reviewCount,
            }
        });       
    }
    
    navigateToDishPage(dish){
        this.props.navigator.push({
            name: 'DishPage', 
            passProps:{
                dish:dish,
                shoppingCart:this.state.shoppingCart,
                selectedTime:this.state.selectedTime,
                scheduleMapping:this.state.scheduleMapping,
                totalPrice: this.state.totalPrice,
                backCallback: function(totalPrice){
                    this.setState({totalPrice: totalPrice})
                }.bind(this)
            }
        });      
    }
    
    navigateBackToChefList(){
        if(Object.keys(this.state.shoppingCart).length!=0){
            Alert.alert( 'Warning', 'Your shopping cart of this chef will be cleared',[ 
                { text: 'OK', onPress: () => {this.props.navigator.pop(); this.state.shoppingCart={}}},
                {text:'Cancel'}]);
        }else{
            if(this.callback){
                this.callback();
            }
            this.props.navigator.pop();
        }
    }

    navigateToChefPage(){
        this.props.navigator.push({
            name: 'ChefPage', 
            passProps:{
                chef:this.state.chef,
            }
        });      
    }

    navigateToChefIntroPage(){
        this.props.navigator.push({
            name: 'ChefIntroPage', 
            passProps:{
                chef:this.state.chef,
            }
        });      
    }
}

// parameters for defining Parallax Scroll View
const SHOP_PIC_HEIGHT = windowHeight*0.215;
const PARALLAX_HEADER_HEIGHT = windowHeight*0.4;
const STICKY_HEADER_HEIGHT = windowHeight*0.08;

var styleShopPage = StyleSheet.create({  
    /* Defining Parallax Scroll View */
    stickySection: {
        height: STICKY_HEADER_HEIGHT,
        backgroundColor:'#fff',
        width: windowWidth,
        borderBottomWidth:1,
        borderColor:'#EAEAEA',
    },
    fixedSection: {
        position: 'absolute',
        bottom: 10,
        left: windowWidth/500,
    },
    parallaxHeader: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        backgroundColor:'#fff',
    },
    /* Defining Parallax Scroll View */

    shopPictureView:{
        height: SHOP_PIC_HEIGHT,
    },
    oneDishNameView:{
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        flexWrap:'wrap',
    },
    chefRecommendLabelView:{
        marginTop:-SHOP_PIC_HEIGHT,
        paddingHorizontal:7,
        paddingVertical:3,
        flexDirection: 'column',
        alignItems:'center',
        justifyContent:'center',
        alignSelf:'flex-start',
        backgroundColor:'#ff5000',
    },
    chefRecommendLabelText:{
        color:'#fff',
        fontSize:12*windowHeight/667,
        fontWeight:'500',
    },  
    shopPicture:{
        width: windowWidth,
        height: windowHeight*0.315,
    },
    shopInfoView:{
        width: windowWidth,
        flexDirection:'row',
        height:windowHeight*0.14,
        backgroundColor:'#FFFFFF',
        paddingTop:windowHeight*0.0225,
        paddingBottom:windowHeight*0.02698,
        paddingLeft:windowWidth/20.7, 
    },
    chefPhoto:{
        marginLeft:windowWidth*0.02,
        height:windowWidth*0.05,
        width:windowWidth*0.05,
        borderRadius: 10, 
        borderWidth: 0, 
        overflow: 'hidden',
    },
    shopInfoSection:{
        flex:1,
        flexDirection:'column',
        justifyContent:'space-between',
        height:windowWidth*0.165,      
    },
    shopNameView:{
       flex:0.85,
       flexDirection:'row',
       alignItems:'flex-start', 
    }, 
    oneShopNameText:{
       fontSize:windowHeight/37.06,
       fontWeight:'500',
       color:'#4A4A4A',
    },
    headerShareIcon: {
        marginRight:10*windowHeight/667,
        width:12*windowHeight/667,
        height:20*windowHeight/667,        
    },
    headerLikeIcon: {
        marginTop:2.7*windowHeight/667,      
        marginRight:10*windowHeight/667,
        width:18*windowHeight/667,
        height:15*windowHeight/667,        
    },
    likeIconView:{
       height:windowWidth*0.06,
       flex:0.15,
       flexDirection:'row',
       alignItems:'flex-end', 
       justifyContent:'center'
    }, 
    likeIcon:{
        width:windowWidth*0.05,
        height:windowWidth*0.05,
        alignSelf:'center',
    },
    shareIconPositioning:{
        position:'absolute',
        top: -20,
        right: windowWidth*0.20,
        backgroundColor: '#fff',
    },    
    likeIconPositioning:{
        position:'absolute',
        top: -20,
        right: windowWidth*0.08,
        backgroundColor: '#fff',
    },
    shopInfoRow:{
        flex:1,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        marginRight:windowWidth/27.6,  
    },
    shopRatingView:{
        flexDirection:'row',
    },
    shopInfoRightColumnView:{
        flexDirection:'row',
        marginRight: windowWidth*0.02, 
    },
    shopInfoRightColumnText:{
        fontSize:windowHeight/51.636,
        color:'#9B9B9B',
        textAlign:'left',
    },
    labelView:{
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        marginRight:windowWidth*0.04,
    },   
    labelIcon:{
        width:1.5*windowHeight/71.0, 
        height:windowHeight/71.0,
        alignSelf:'center',
    },
    labelText:{
        fontSize:windowHeight/51.636,
        color:'#4A4A4A',
        marginLeft:windowWidth/82.8,
        alignSelf:'center',
    },  
    chefDetailRowView: {
        width: windowWidth,
        paddingVertical: windowHeight*0.01,
        flexDirection: 'row',
        justifyContent:'center',
        borderColor: '#eee',
        borderTopWidth: 1,
        borderBottomWidth:1,
    },  
    chefDetailView:{
        flex:1/3,
        alignItems:'center',
        alignSelf:'center',
        backgroundColor: '#fff',
        borderColor: '#eee',
        borderLeftWidth:1,       
    },
    chefDetailTextView:{
        flexDirection:'row',
        justifyContent:'center', 
        height:windowHeight*0.03,
    },
    pickupAddressText:{ 
        fontSize: windowHeight/47.33, 
        fontWeight:'400',
        color: '#979797'
    },
    timeSelectorView:{
        flexDirection:'row',
        justifyContent:'center', 
        height:windowHeight*0.08,
    },
    openHourTitle:{
        alignSelf:'center',
        fontSize:windowHeight/46.0,
        color:'#4A4A4A',
        fontWeight:'600',
        marginRight:windowWidth*0.015625,
    },
    modalPicker:{
        alignSelf:'center',
    },
    modalPickerSelectText:{
        fontSize:windowHeight/46.0,
        color:'#7BCBBE',
        fontWeight:'600',
    },
    modalPickerSelect:{
        borderColor:'#7BCBBE',
        borderWidth:1.5,
    },
    footerView:{ 
        flexDirection:'row', 
        height:windowHeight*0.075, 
        backgroundColor:'#FFCC33',
    },
    checkoutButtonView:{
        width:windowWidth*0.4,
        flexDirection:'row',
        justifyContent:'flex-end',
        paddingRight: windowWidth/27.6,
    },
    checkoutButtonWrapper:{ 
        height: windowHeight*0.044, 
        width: windowWidth*0.25, 
        flexDirection:'row',
        alignSelf:'center',
        backgroundColor:'#fff',
        justifyContent:'center',
    },
    checkoutButton:{
        color:'#FFCC33',
        fontSize:windowHeight/50,
        fontWeight:'600',
        alignSelf:'center',
    },
    shoppingCartTimeView:{
        width:windowWidth*0.6,
        alignItems:'flex-start',
        flexDirection:'row',
        alignSelf:'center',
        paddingLeft: windowWidth/27.6,
    },
    shoppingCartTimePriceText:{
        color:'#fff',
        fontSize:windowHeight/37.8,
        fontWeight:'600',
        justifyContent:'center',
    },
    oneDishInListView:{
        marginBottom:0,
        marginTop:windowHeight*0.03,
    },
    oneDishPicture:{
        alignSelf:'center',
        width: windowWidth - 2 *windowWidth/20.7,
        height: windowHeight*0.32,
    },
    oneDishPictureSoldOut:{
        alignSelf:'center',
        width: windowWidth - 2 *windowWidth/20.7,
        height: windowHeight*0.32,
        opacity:0.3,
    },
    oneDishNameDiscriptionView:{
        backgroundColor:'#FFFFFF',
        paddingHorizontal: windowWidth/20.7,
        paddingTop: windowHeight*0.03,
        paddingBottom:windowHeight*0.005,
    },
    oneDishNameText:{
        fontSize:windowHeight/35.5,
        fontWeight:'bold',
        color:'#4A4A4A',
    },
    oneDishSpecialTag:{
        fontSize:windowHeight/55,
        color:'#9B9B9B',
    },
    chooseQuantityView:{
        flex: 1,
        marginHorizontal:windowWidth/20.7,
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems:'center',
        backgroundColor: '#fff',
        marginTop:windowHeight*0.01,
        marginBottom:windowHeight*0.02,
    },
    lateNoteView:{
        flex:0.6,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
    },
    lateNoteText:{
        fontSize:12,
        color:'#7BCBBE',
        fontWeight:'500',
        flexWrap: 'wrap',
        flex:1,
        alignSelf:'center',
    },
    quantitySelectionView:{
        flex:0.3,
        flexDirection:'row',
        marginRight:windowWidth*0.015,
    },
    plusMinusIcon:{
        width: windowHeight/27.6, 
        height: windowHeight/27.6,
        alignSelf:'center',
    },
    plusMinusIconView:{
        flex:0.07,
        justifyContent:"center",
        alignItems:"center",
        flexDirection:'column',
    },
    quantityTextView:{
        flex:0.2,
        justifyContent:"center",
        alignItems:"center",
        flexDirection:'column',
    },
    quantityText:{
        fontSize:windowHeight/33.41,
        color:'#9B9B9B',
    },
    priceText:{
        fontSize:windowHeight/42,
        fontWeight:'bold',
        color:'#4A4A4A',
        marginBottom: windowHeight*0.005,
    },
    leftQuantityAndPriceView:{
        flex:1,
        flexDirection:'column',
        justifyContent:'flex-start',
        alignItems:'flex-start',
    },
    orderStatusText:{
        fontSize:windowHeight/60,
        color:'#9B9B9B',
    },
    chefNoticeView:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        height:windowHeight*0.05,
        backgroundColor:'#7BCBBE',
    },
    chefNoticeTextView:{
        width:windowWidth*0.9,
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        paddingLeft:10,
    },
    chefNoticeText:{
        color:'#FFFFFF',
        fontSize:16,
        fontWeight:'500',
        flex:1,
        flexWrap:'wrap',
    },
    chefNoticeButtonView:{
        width:windowWidth*0.1,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
    },
    chefNoticeIcon:{
        width:35,
        height:35,
    },
    chefNoticeExtendedView:{
        flexDirection:'row',
        backgroundColor:'#7BCBBE',
        padding:10,
        justifyContent:'center',
        alignItems:'center',
    },
    chefNoticeExtendedButtonView:{
        height:windowHeight*0.05,
        flexDirection:'row',
        justifyContent:'flex-end',
        alignItems:'center',
    },
    menuTitleView1: {
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'flex-start',
        paddingVertical:windowHeight*0.025,
        paddingLeft: windowWidth/20.7,
    },
    menuTitleView2: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        paddingTop:windowHeight*0.025,
        paddingLeft: windowWidth/20.7,
    },
    menuTitleTextTitle: {
        fontSize:windowHeight/37.06,
        fontWeight:'600',
        color:'#4A4A4A',
    },
    menuTitleTextPrompt: {
        alignSelf:'center',
        textAlign:'left',
        fontSize:windowHeight/51.636,
        color:'#9B9B9B',
        paddingLeft:0,
        marginLeft:0,
    },
    scheduleBox: {
        flex:1,
        flexDirection:'column',
        backgroundColor:'#7BCBBE',
        paddingVertical:windowHeight*0.025,
        marginHorizontal:windowWidth/20.7,
        marginVertical:windowHeight*0.005,
    },
    scheduleBoxText: {
        fontSize:15*windowHeight/677,
        color:'#fff',
        fontWeight:'700',
        textAlign:'center', 
    },
    fullMenuButton: {
        flex:1,
        flexDirection:'column',
        paddingVertical:windowHeight*0.025,
        marginHorizontal:windowWidth/20.7,
        marginVertical:windowHeight*0.005,
        borderColor:'#7BCBBE',
        borderWidth:1,
    },
    fullMenuButtonText: {
        fontSize:15*windowHeight/677,
        color:'#7BCBBE',
        fontWeight:'700',
        textAlign:'center', 
    }
});

var styleShoppingCartPage = StyleSheet.create({
    oneListingView:{
        backgroundColor:'#FFFFFF',  
        flexDirection:'row',
        flex:1,
    },
    oneDishPictureUnhighlight:{
        marginLeft:windowWidth/20.7,
        marginTop:windowWidth/20.7,
        width:windowWidth/2.76,
        height:windowWidth/4,
        backgroundColor:'#FFFFFF',
    },
    oneDishPictureUnhighlightSoldOut:{
        marginLeft:windowWidth/20.7,
        marginTop:windowWidth/20.7,
        width:windowWidth/2.76,
        height:windowWidth/4,
        opacity:0.3
    },
    shoppingCartInfoView:{
        flex:1,
        height:windowWidth/2.76,
        flexDirection:'column',
        backgroundColor:'#FFFFFF',
        paddingLeft:windowWidth/20.7,
        paddingRight:windowWidth/27.6,
        paddingTop:windowHeight/73.6,
    },
    dishNamePriceView:{
        flex:1,
        flexDirection:'row', 
    },
    dishNameView:{
        flex:1,  
        justifyContent:'flex-start', 
        alignItems:'flex-start', 
        flexDirection:'row',
        marginTop:windowHeight*0.015, 
    },
    dishNameText:{
        fontSize:windowHeight/40.89,
        fontWeight:'500',
        color:'#4A4A4A',
        flex: 1, 
        flexWrap: 'wrap',
    },
    chooseQuantityView:{
        flex: 1,
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems:'center',
        backgroundColor: '#fff',
        marginTop:windowHeight*0.01,
        marginBottom:windowHeight*0.02,
    },
    lateNoteView:{
        flex:1,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
    },
    dishPriceView:{
        flex:0.3,
        alignItems:'flex-end',
    },
    dishPriceText:{
        fontSize:windowHeight/40.89,
        fontWeight:'600',
        color:'#FFCC33',
    },
    dishIngredientText:{
        fontSize:windowHeight/47.33,
        color:'#9B9B9B',
    },
    quantityTotalPriceView:{
        flex:1,
        flexDirection:'row',
    },
    quantityView:{
        flex:0.6,
        flexDirection:'row',
    },
    leftQuantityView:{
        flex:0.4,
        flexDirection:'column',
        alignItems:'flex-end',
        justifyContent:'center',
    },
    plusMinusIconView:{
        flex:0.4,
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
    },
    plusMinusIcon:{
        width: windowHeight/27.6, 
        height: windowHeight/27.6,
    },
    quantityTextView:{
        flex:0.2,
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'column',
    },
    quantityText:{     
        fontSize:windowHeight/33.41,
        fontWeight:'bold',
        color:'#FFCC33',
    },
    orderStatusText:{
        fontSize:windowHeight/40.57,
        color:'#9B9B9B',
        marginTop:windowHeight*0.0035,
    },
    quantitySelectionView:{
        flex:0.6,
        flexDirection:'row',
        marginRight:windowWidth*0.04,
    },
});

module.exports = ShopPage;