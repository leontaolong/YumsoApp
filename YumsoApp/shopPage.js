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
var mapIcon = require('./icons/icon-map.png');
var chefPageIcon = require('./icons/icon-chefpage.png');
var reviewIcon = require('./icons/icon-reviews.png');
var labelIcon = require('./icons/icon-label.png');
var notlikedIcon = require('./icons/icon-unliked.png')
var likedIcon = require('./icons/icon-liked.png');
var dollarSign = require('./commonModules/dollarIconRender');
var defaultDishPic = require('./icons/defaultAvatar.jpg');
var ActivityView = require('react-native-activity-view');
var Swiper = require('react-native-swiper');
var commonAlert = require('./commonModules/commonAlert');
var commonWidget = require('./commonModules/commonWidget');
var NetworkUnavailableScreen = require('./networkUnavailableScreen');
// import * as WeChat from 'react-native-wechat';
// var result = await  WeChat.shareToTimeline({type: 'text', description: 'I\'m Wechat, :)'});

import Dimensions from 'Dimensions';
import ModalPicker from 'react-native-modal-picker'

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
            totalPrice:0,
            eater:eater,
            showUpdateAppBanner:showUpdateAppBanner
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
        const end = 'end='+new Date().setDate(new Date().getDate()+6);
        
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
        let schedules = responseSchedule.data.schedules;
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
        console.log('schedules: '+JSON.stringify(schedules));
        for(var schedule of schedules){
            var time = new Date(schedule.deliverTimestamp).toString();   
            if(!scheduleMapping[time]){
               scheduleMapping[time] = {
                   [schedule.dishId]: {
                       leftQuantity: schedule.leftQuantity,
                       quantity: schedule.quantity
                   }
               };
               timeData.push({ key: index++, label: time });
            }else{
               scheduleMapping[time][schedule.dishId] = {
                       leftQuantity: schedule.leftQuantity,
                       quantity: schedule.quantity
               };
            }
        }
        console.log('timeData '+JSON.stringify(timeData));
        this.setState({
            dishes:dishes, 
            dataSource:this.state.dataSource.cloneWithRows(dishes), 
            scheduleMapping:scheduleMapping, 
            timeData:timeData,
            dishesInDisplay:dishes,
        });
    }
    
    renderHeader(){               
               if(this.state.like){
                  var  likeIcon = likedIcon;
               }else{
                  var  likeIcon = notlikedIcon;
               }
            
               return [(<View key={'shopPictureView'} style={styleShopPage.shopPictureView}>
                            <Swiper showsButtons={false} height={windowHeight*0.4419} horizontal={true} autoplay={false}
                                dot={<View style={styles.dot} />} activeDot={<View style={styles.activeDot} />} >
                                {this.state.chef.shopPictures.map((shopPicture) => {
                                    return <Image key={'shopPicture'} source={{ uri: shopPicture }} style={styleShopPage.shopPicture}/>
                                }) }
                            </Swiper>
                        </View>),                        
                       (<View key={'shopInfoView'} style={styleShopPage.shopInfoView}>
                          <TouchableHighlight style={styleShopPage.chefPhotoView} underlayColor={'transparent'}>
                            <Image source={{ uri: this.state.chef.chefProfilePic }} style={styleShopPage.chefPhoto}/>
                          </TouchableHighlight>
                            
                          <View style={styleShopPage.shopInfoSection}>
                            <View style={styleShopPage.shopInfoRow1}>
                                <View style={styleShopPage.shopNameView}>
                                    <Text style={styleShopPage.oneShopNameText}>{this.state.chef.shopname}</Text>
                                </View>
                                <TouchableHighlight style={styleShopPage.likeIconView} underlayColor={'transparent'} onPress={()=>{this.addToFavorite()}}>
                                    <Image source={likeIcon} style={styleShopPage.likeIcon}></Image>
                                </TouchableHighlight>
                            </View>
                            
                            <View style={styleShopPage.shopInfoRow2}>
                                <View style={styleShopPage.shopRatingView}>
                                    <View style={{flexDirection:'row',alignSelf:'center'}}>
                                    {rating.renderRating(this.state.chef.rating)}
                                    </View>
                                    <Text style={styleShopPage.reviewNumberText}>{dollarSign.renderLevel(this.state.chef.priceLevel)}</Text>
                                </View>
                            </View>
                            
                            <View style={styleShopPage.shopInfoRow3}>
                                <View style={styleShopPage.labelView}>
                                    <Image style={styleShopPage.labelIcon} source={labelIcon}/><Text style={styleShopPage.labelText}>{this.state.chef.styleTag}</Text>
                                </View>
                                <View style={styleShopPage.labelView}>
                                    <Image style={styleShopPage.labelIcon} source={labelIcon}/><Text style={styleShopPage.labelText}>{this.state.chef.foodTag}</Text>
                                </View>
                            </View>                       
                          </View>
                        </View>),
                       (<View key={'chefLivingAreaView'}>
                         <View style={styleShopPage.chefDetailView}>
                            <Image source={mapIcon} style={styleShopPage.pickupAddressIcon}/>
                            <View style={styleShopPage.chefDetailTextView}>
                                <Text style={styleShopPage.pickupAddressText}>{this.state.chef.pickupAddressDetail.city+", "+this.state.chef.pickupAddressDetail.state}</Text>
                            </View>
                          </View>
                        </View>), 
                       (<TouchableHighlight key={'chefPageClickableView'}  underlayColor={'#F5F5F5'} onPress={() => this.navigateToChefPage()}>
                            <View style={styleShopPage.chefDetailView}>
                                <Image source={chefPageIcon} style={styleShopPage.pickupAddressIcon}/>
                                <View style={styleShopPage.chefDetailTextView}>
                                   <Text style={styleShopPage.pickupAddressText}>Chef page</Text>
                                </View>
                                <Image source={forwardIcon} style={styleShopPage.forwardIcon}/>
                            </View>
                        </TouchableHighlight>), 
                       (<TouchableHighlight key={'chefReviewsClickable'} underlayColor={'#F5F5F5'} onPress={() => this.navigateToChefCommentsPage()}>
                            <View style={styleShopPage.chefDetailView}>
                                <Image source={reviewIcon} style={styleShopPage.pickupAddressIcon}/>
                                <View style={styleShopPage.chefDetailTextView}>
                                    <Text style={styleShopPage.pickupAddressText}>{this.state.chef.reviewCount} reviews</Text>
                                </View>
                                <Image source={forwardIcon} style={styleShopPage.forwardIcon}/>
                            </View>
                        </TouchableHighlight>)                                
                       ];
    }

    renderRow(dish){
        let imageSrc = defaultDishPic;
        if(dish.pictures && dish.pictures!=null && dish.pictures.length!=0){
            imageSrc={uri:dish.pictures[0]};   
        }
        
        if(dish.isHighlightDish){
           return (<View style={styleShopPage.oneDishInListView}>
                        <TouchableHighlight onPress={()=>this.navigateToDishPage(dish)}>
                                <Image source={imageSrc} style={styleShopPage.oneDishPicture}/>
                        </TouchableHighlight>
                        <View style={styleShopPage.oneDishNameDiscriptionView}>                  
                                <Text style={styleShopPage.oneDishNameText}>{dish.dishName}</Text>
                                <Text style={styleShopPage.oneDishIngredientText}>{dish.ingredients}</Text>
                        </View>
                        <View style={styleShopPage.priceView}>
                                <View style={styleShopPage.priceTextView}>
                                    <Text style={styleShopPage.priceText}>${dish.price}</Text>
                                </View>
                                <View style={styleShopPage.chooseQuantityView}>
                                    <View style={styleShopPage.quantitySelectionView}>
                                        <TouchableHighlight style={styleShopPage.plusMinusIconView} underlayColor={'#F5F5F5'} onPress={() => this.removeFromShoppingCart(dish) }>
                                            <Image source={minusIcon} style={styleShopPage.plusMinusIcon}/>
                                        </TouchableHighlight>
                                        <View style={styleShopPage.quantityTextView}>
                                            <Text style={styleShopPage.quantityText}>
                                            {this.state.shoppingCart[this.state.selectedTime] && this.state.shoppingCart[this.state.selectedTime][dish.dishId] ? this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity: ' '}
                                            </Text>
                                        </View>
                                        <TouchableHighlight style={styleShopPage.plusMinusIconView} underlayColor={'#F5F5F5'} onPress={() => this.addToShoppingCart(dish) }>
                                            <Image source={plusIcon} style={styleShopPage.plusMinusIcon}/>
                                        </TouchableHighlight>
                                    </View>
                                    <View style={styleShopPage.leftQuantityView}>
                                        <Text style={styleShopPage.orderStatusText}>
                                            {this.state.selectedTime === 'All Dishes' || this.state.scheduleMapping[this.state.selectedTime][dish.dishId]==undefined ? '' : this.state.scheduleMapping[this.state.selectedTime][dish.dishId].leftQuantity+' left'} 
                                        </Text> 
                                    </View>                       
                                </View>
                          </View>
                    </View>);
        }else{
           return (<View style={styleShoppingCartPage.oneListingView}>
                    <TouchableHighlight onPress={()=>this.navigateToDishPage(dish)}>
                       <Image source={imageSrc} style={{ width:windowWidth/2.76,height:windowWidth/2.76}}/>
                    </TouchableHighlight>
                    <View style={styleShoppingCartPage.shoppingCartInfoView}>
                        <View style={styleShoppingCartPage.dishNamePriceView}>
                            <View style={styleShoppingCartPage.dishNameView}>
                                <Text style={styleShoppingCartPage.dishNameText}>{dish.dishName}</Text>
                            </View>
                            <View style={styleShoppingCartPage.dishPriceView}>
                                <Text style={styleShoppingCartPage.dishPriceText}>${dish.price}</Text>   
                            </View>
                        </View> 
                        
                        <View style={styleShoppingCartPage.dishIngredientView}>
                            <Text style={styleShoppingCartPage.dishIngredientText}>{commonWidget.getTextLengthLimited(dish.ingredients,28)}</Text>
                        </View>                                     
                        <View style={styleShoppingCartPage.quantityTotalPriceView}>
                            <View style={styleShoppingCartPage.quantityView}>
                                <TouchableHighlight style={styleShoppingCartPage.plusMinusIconView} underlayColor={'#F5F5F5'}
                                    onPress={()=>this.removeFromShoppingCart(dish)}>                
                                    <Image source={minusIcon} style={styleShoppingCartPage.plusMinusIcon}/>
                                </TouchableHighlight>
                                <View style={styleShoppingCartPage.quantityTextView}>
                                    <Text style={styleShoppingCartPage.quantityText}>
                                        {this.state.shoppingCart[this.state.selectedTime] && this.state.shoppingCart[this.state.selectedTime][dish.dishId] ? this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity: '   '}
                                    </Text>
                                </View>  
                                <TouchableHighlight style={styleShoppingCartPage.plusMinusIconView} underlayColor={'#F5F5F5'}
                                    onPress={()=>this.addToShoppingCart(dish)}>
                                    <Image source={plusIcon} style={styleShoppingCartPage.plusMinusIcon}/>
                                </TouchableHighlight>
                            </View>
                            <View style={styleShoppingCartPage.leftQuantityView}>
                                <Text style={styleShoppingCartPage.orderStatusText}>
                                    {this.state.selectedTime === 'All Dishes' || this.state.scheduleMapping[this.state.selectedTime][dish.dishId]==undefined ? '' : this.state.scheduleMapping[this.state.selectedTime][dish.dishId].leftQuantity+' left'} 
                                </Text>
                            </View>                              
                        </View>                        
                    </View>
                </View>);
        }
    }
         
    render() {
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView =<View style={styles.loaderView}>
                                    <ActivityIndicatorIOS animating={this.state.showProgress} size="large" style={styles.loader}/>
                                </View>;  
        }

        let scheduleSelectionView='';
        if(this.state.timeData.length > 0){
           let deliveryTimeRendered = [];
           for(var oneTimeString of this.state.timeData){
               if(oneTimeString.label=='All Dishes'){
                  deliveryTimeRendered.push({key:oneTimeString.label, label: 'All Dishes'});
               }else{
                  deliveryTimeRendered.push({key:oneTimeString.label, label: dateRender.renderDate2(oneTimeString.label)});
               }
           }
           scheduleSelectionView = (<View key={'timeSelectorView'} style={styleShopPage.timeSelectorView}>
                                            <Text style={styleShopPage.openHourTitle}>Out for Delivery at</Text>
                                            <ModalPicker
                                            style={styleShopPage.modalPicker}
                                            data={deliveryTimeRendered}
                                            initValue={'Select Time'}
                                            onChange={(option)=>{ this.displayDish(`${option.key}`)}} />
                                    </View>);
        }else{
           scheduleSelectionView = (<View key={'timeSelectorView'} style={styleShopPage.timeSelectorView}>
                                            <Text style={styleShopPage.openHourTitle}>Currently no dish avaliable to order</Text>
                                    </View>);
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
        var footerView = null;
        if(this.state.showNetworkUnavailableScreen){
           networkUnavailableView = <NetworkUnavailableScreen onReload = {this.fetchDishesAndSchedules.bind(this)} />
        }else{
           dishListView = <ListView style={styles.dishListView}
                           dataSource = {this.state.dataSource}
                           renderRow={this.renderRow.bind(this) } 
                           renderHeader={this.renderHeader.bind(this)}
                           loadData={this.fetchDishesAndSchedules.bind(this)}/>
           footerView = <View style={styleShopPage.footerView}>
                          <View style={styleShopPage.shoppingCartTimeView}>
                               <Text style={styleShopPage.shoppingCartTimePriceText}>{this.state.selectedTime=='All Dishes'? '' : 'Subtotal: $'+Number(this.state.totalPrice.toFixed(2))}</Text>
                          </View>
                          <TouchableOpacity style={styleShopPage.checkoutButtonView} activeOpacity={0.7} onPress={() => this.navigateToShoppingCart()}> 
                             <View style={styleShopPage.checkoutButtonWrapper}>
                                <Text style={styleShopPage.checkoutButton}>SHOPPING CART</Text>
                             </View>
                          </TouchableOpacity>
                       </View>
        }
            
        return (<View style={styles.container}>
                        <View style={styles.headerBannerView}>    
                            <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBackToChefList()}>
                                <View style={styles.backButtonView}>
                                    <Image source={backIcon} style={styles.backButtonIcon}/>
                                </View>
                            </TouchableHighlight>    
                            <View style={styles.titleView}>
                                <Text style={styles.titleText}>{this.state.chef.shopname}</Text>
                            </View>
                            <TouchableHighlight style={styles.headerRightView} underlayColor={'#F5F5F5'} onPress={()=>this.share()}>
                                <View style={styles.likeShareButtonView}>
                                   <View>
                                      <Image source={shareIcon} style={styles.shareButtonIcon}/>
                                   </View>
                                </View>
                            </TouchableHighlight>
                        </View>
                        {scheduleSelectionView}
                        {updateAppBannerView}
                        {networkUnavailableView}
                        {dishListView}
                        {loadingSpinnerView}
                        {footerView}
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

    moveHighlightedDishToTop(dishes){
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
                            Alert.alert('Success', isAdd ? 'Added to favorite list' : 'Removed from favorite list', [{ text: 'OK' }]);
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
}

var styleShopPage = StyleSheet.create({
    shopPictureView:{
        height: windowHeight*0.4419,
    },
    shopPicture:{
        width: windowWidth,
        height: windowHeight*0.4419,
    },
    shopInfoView:{
        flexDirection:'row',
        height:windowHeight*0.14,
        paddingTop:windowHeight*0.0225,
        paddingBottom:windowHeight*0.02698,
        paddingLeft:windowWidth*0.032,
    },
    chefPhotoView:{
        marginRight:windowWidth*0.04, 
    },
    chefPhoto:{
        height:windowWidth*0.16,
        width:windowWidth*0.16,
        borderRadius: 12, 
        borderWidth: 0, 
        overflow: 'hidden',
    },
    shopInfoSection:{
        flex:1,
        flexDirection:'column',
        justifyContent:'space-between',
        height:windowWidth*0.165,        
    },
    shopInfoRow1:{
        flexDirection:'row',
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
    shopInfoRow2:{
        flexDirection:'row',
    },
    shopRatingView:{
        flex:0.72,
        flexDirection:'row',
        alignItems:'flex-start',
    },
    reviewNumberText:{
        fontSize:windowHeight/51.636,
        color:'#4A4A4A',
        marginLeft:windowWidth*0.0187,
        alignSelf:'center',
    },
    shopInfoRow3:{
        flexDirection:'row',
    },
    labelView:{
        flexDirection:'row',
        justifyContent:'flex-start',
        marginRight:windowWidth*0.04,
    },   
    labelIcon:{
        width:windowHeight*0.0264, 
        height:windowHeight*0.0264,
        alignSelf:'center',
    },
    labelText:{
        fontSize:windowHeight/47.33,
        color:'#FFCC33',
        marginLeft:windowWidth/82.8,
        alignSelf:'center',
    },    
    chefDetailView:{
        flexDirection: 'row',
        height:windowHeight*0.065,
        paddingLeft: windowWidth/27.6,
        alignItems:'center',
        borderColor: '#F5F5F5',
        borderTopWidth: 1,
        backgroundColor: '#fff'        
    },
    chefDetailTextView:{
        flex: 1,
        paddingLeft:windowWidth/27.6,
        justifyContent:'center',
    },
    pickupAddressText:{ 
        fontSize: windowHeight/47.33, 
        color: '#A9A9A9'
    },
    pickupAddressIcon:{ 
        width: windowHeight/36.8, 
        height: windowHeight/36.8,
    },
    forwardIcon:{
        width: windowHeight*0.06, 
        height: windowHeight*0.06,
    },
    timeSelectorView:{
        flexDirection:'row',
        justifyContent:'center', 
        borderColor:'#F5F5F5',
        borderBottomWidth:1,
        height:windowHeight*0.10,
    },
    openHourTitle:{
        alignSelf:'center',
        fontSize:windowHeight/40.57,
        color:'#4A4A4A',
        marginRight:windowWidth*0.015625,
    },
    modalPicker:{
        alignSelf:'center',
    },
    openHoursText:{

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
        width: windowWidth*0.35, 
        flexDirection:'row',
        alignSelf:'center',
        borderRadius:6,
        borderWidth:1.5,
        borderColor:'#fff',
        justifyContent:'center',
    },
    checkoutButton:{
        color:'#fff',
        fontSize:windowHeight/47.33,
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
        borderColor: '#F5F5F5',
        borderBottomWidth: 5,
    },
    oneDishPicture:{
        width: windowWidth,
        height: windowHeight*0.4419,
    },
    oneDishNameDiscriptionView:{
        flex: 1,
        flexDirection: 'column',
        paddingHorizontal: windowWidth/27.6,
        paddingTop: windowHeight*0.03,
        paddingBottom:windowHeight*0.005,
    },
    oneDishNameDiscriptionTextView:{
        flex: 1,
        paddingLeft:windowWidth/27.6,
        justifyContent:'center',
    },
    oneDishNameText:{
        fontSize:windowHeight/35.5,
        fontWeight:'bold',
        color:'#4A4A4A',
    },
    oneDishIngredientText:{
        fontSize:windowHeight/40.57,
        color:'#9B9B9B',
        marginTop:windowHeight*0.0088,
        textAlign:'justify',
    },
    priceView:{
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fff',
        height:50,
    },
    priceTextView:{
        width: windowWidth/2.76,
        flexDirection: 'row',
        justifyContent:'flex-start',
        alignItems:'center',
        paddingLeft:windowWidth/27.6,
    },
    chooseQuantityView:{
        flex: 1,
        flexDirection: 'row',
        marginLeft:windowWidth/20.7,       
        marginRight:windowWidth/27.6,
    },
    quantitySelectionView:{
        flex:0.6,
        flexDirection:'row',
    },
    plusMinusIcon:{
        width: windowHeight/27.6, 
        height: windowHeight/27.6,
        alignSelf:'center',
    },
    plusMinusIconView:{
        flex:0.4,
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
        fontWeight:'bold',
        color:'#FFCC33',
    },
    priceText:{
        fontSize:windowHeight/31.55,
        fontWeight:'bold',
        color:'#F8C84E',
        marginBottom:8,
    },
    leftQuantityView:{
        flex:0.4,
        flexDirection:'row',
        justifyContent:'flex-end',
        alignItems:'center',
    },
    orderStatusText:{
        fontSize:windowHeight/40.57,
        color:'#9B9B9B',
        marginTop:windowHeight*0.0035,
    },
});

var styleShoppingCartPage = StyleSheet.create({
    oneListingView:{
        backgroundColor:'#FFFFFF',  
        flexDirection:'row',
        flex:1,
        borderColor: '#F5F5F5',
        borderBottomWidth: 5,
    },
    dishPhoto:{
        width:windowWidth/2.76,
        height:windowWidth/2.76,
    },
    shoppingCartInfoView:{
        flex:1,
        height:windowWidth/2.76,
        flexDirection:'column',
        paddingLeft:windowWidth/20.7,
        paddingRight:windowWidth/27.6,
        paddingTop:windowHeight/73.6,
    },
    dishNamePriceView:{
        flex:1,
        flexDirection:'row', 
    },
    dishNameView:{
        flex:0.7,   
        alignItems:'flex-start', 
        flexDirection:'row', 
    },
    dishNameText:{
        fontSize:windowHeight/40.89,
        fontWeight:'500',
        color:'#4A4A4A',
        flex: 1, 
        flexWrap: 'wrap',
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
});

module.exports = ShopPage;