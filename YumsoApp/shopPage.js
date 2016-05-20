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
var shoppingCartIcon = require('./icons/ic_shopping_cart_36pt_3x.png');
var notlikedIcon = require('./icons/icon-unliked.png')
var likedIcon = require('./icons/icon-liked.png');
var dollarSign = require('./commonModules/dollarIconRender');


import Dimensions from 'Dimensions';
import ModalPicker from 'react-native-modal-picker'

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
  Alert,
  Picker,
  Modal
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
        let chefId = routeStack[routeStack.length-1].passProps.chefId;      
        this.defaultDeliveryAddress = routeStack[routeStack.length-1].passProps.defaultDeliveryAddress;      
        this.callback = routeStack[routeStack.length-1].passProps.callback;      
        let eater = routeStack[routeStack.length-1].passProps.eater;      
        this.state = {
            dataSource: ds.cloneWithRows([]),
            showProgress:true,
            chefId: chefId,
            timeData:[],
            shoppingCart:{},  
            selectedTime:'All Schedules',
            totalPrice:0,
            eater:eater
        };            
    }
    
    componentDidMount(){   
        this.client = new HttpsClient(config.baseUrl, true);
        let task1 = this.fetchChefProfile(); 
        let task2 = this.fetchDishesAndSchedules(this.state.chefId);   
        let task3 = AuthService.getEater().then((eater)=>{
            if(eater){
                if (!eater.favoriteChefs) eater.favoriteChefs = []; //todo: remove this.
                this.setState({like:eater.favoriteChefs.indexOf(this.state.chefId) !== -1});
            }
        })
        Promise.all([task1, task2, task3])
            .then(() => {
                this.setState({ showProgress: false });
            }); 
    }
    
    fetchChefProfile(){
        var self = this;
        var chefId = this.state.chefId;
        return this.client.getWithoutAuth(config.getOneChefEndpoint+chefId).then(function(res){
            if(res.statusCode===200){
               var chef=res.data.chef;
               self.setState({chef:chef});
            }
        });
    }

    async fetchDishesAndSchedules(chefId) {
        const start = 'start='+new Date().getTime();
        const end = 'end='+new Date().setDate(new Date().getDate()+2);
        let getDishesTask = this.client.getWithoutAuth(config.chefDishesEndpoint+chefId);
        let getScheduleTask = this.client.getWithoutAuth(config.chefSchedulesEndpoint+chefId+'?'+start+'&'+end);
        let responseDish = await getDishesTask;
        let responseSchedule = await getScheduleTask;
        let dishes = responseDish.data.dishes;
        let schedules = responseSchedule.data.schedules;
        let scheduleMapping = {};
        let timeData = [];
        let index = 0;
        if(schedules.length!=0){
            var allDishSet = {};
            for(var dish of dishes){
                allDishSet[dish.dishId] = -1;
            }
            scheduleMapping['All Schedules']= allDishSet;
            timeData.push({ key: index++, label: 'All Schedules' })
        }   
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
        
        this.setState({
                dishes:dishes, 
                dataSource:this.state.dataSource.cloneWithRows(dishes), 
                scheduleMapping:scheduleMapping, 
                timeData:timeData
                });
    }
    
    renderHeader(){
            
               let deliveryTimeRendered = [];
               for(var oneTimeString of this.state.timeData){
                   if(oneTimeString.label=='All Schedules'){
                     deliveryTimeRendered.push({key:oneTimeString.label, label: 'All Schedules'});
                   }else{
                     deliveryTimeRendered.push({key:oneTimeString.label, label: dateRender.renderDate2(oneTimeString.label)});
                   }
               }
                                          
               if(this.state.like){
                  var  likeIcon = likedIcon;
               }else{
                  var  likeIcon = notlikedIcon;
               }
            
               return [(<View key={'shopPictureView'} style={styleShopPage.shopPictureView}>
                            <Image source={{ uri: this.state.chef.shopPictures[0] }} style={styleShopPage.shopPicture}
                                onError={(e) => this.setState({ error: e.nativeEvent.error, loading: false }) }>
                            </Image>
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
                                    <Text style={styleShopPage.reviewNumberText}>{dollarSign.renderLevel(3)}</Text>
                                </View>
                            </View>
                            
                            <View style={styleShopPage.shopInfoRow3}>
                                <View style={styleShopPage.labelView}>
                                    <Image style={styleShopPage.labelIcon} source={labelIcon}/><Text style={styleShopPage.labelText}>spicy</Text>
                                </View>
                                <View style={styleShopPage.labelView}>
                                    <Image style={styleShopPage.labelIcon} source={labelIcon}/><Text style={styleShopPage.labelText}>Japanese</Text>
                                </View>
                            </View>                       
                          </View>
                        </View>),
                       (<View key={'chefLivingAreaView'} style={styleShopPage.chefDetailView}>
                            <Image source={mapIcon} style={styleShopPage.pickupAddressIcon}/>
                            <View style={styleShopPage.chefDetailTextView}>
                                <Text style={styleShopPage.pickupAddressText}>{this.state.chef.pickupAddress.city+", "+this.state.chef.pickupAddress.state}</Text>
                            </View>
                            <TouchableHighlight underlayColor={'#ECECEC'} onPress={() => this.navigateToChefCommentsPage()}>
                               <Image source={forwardIcon} style={styleShopPage.forwardIcon}/>
                            </TouchableHighlight>
                        </View>), 
                        (<View key={'chefPageClickableView'} style={styleShopPage.chefDetailView}>
                            <Image source={chefPageIcon} style={styleShopPage.pickupAddressIcon}/>
                            <View style={styleShopPage.chefDetailTextView}>
                                <Text style={styleShopPage.pickupAddressText}>Chef page</Text>
                            </View>
                            <TouchableHighlight underlayColor={'#ECECEC'} onPress={() => this.navigateToChefCommentsPage()}>
                                <Image source={forwardIcon} style={styleShopPage.forwardIcon}/>
                            </TouchableHighlight>
                         </View>), 
                        (<View key={'chefReviewsClickable'} style={styleShopPage.chefDetailView}>
                            <Image source={reviewIcon} style={styleShopPage.pickupAddressIcon}/>
                            <View style={styleShopPage.chefDetailTextView}>
                                <Text style={styleShopPage.pickupAddressText}>10 reviews</Text>
                            </View>
                            <TouchableHighlight underlayColor={'#ECECEC'} onPress={() => this.navigateToChefCommentsPage()}>
                                <Image source={forwardIcon} style={styleShopPage.forwardIcon}/>
                            </TouchableHighlight>
                        </View>),                                      
                       (<View key={'timeSelectorView'} style={styleShopPage.timeSelectorView}>
                                <ModalPicker
                                 data={deliveryTimeRendered}
                                 initValue={'Open Hours'}
                                 onChange={(option)=>{ this.displayDish(`${option.key}`)}} />
                        </View>)];
    }

    renderRow(dish){
        let imageSrc =require('./ok.jpeg') ;
        if(dish.pictures && dish.pictures!=null && dish.pictures.length!=0){
            imageSrc={uri:dish.pictures[0]};   
        }
        if(this.state.showProgress){
           return <ActivityIndicatorIOS
                animating={this.state.showProgress}
                size="large"
                style={styles.loader}/> 
        }   
        return (
            <View style={styleShopPage.oneDishInListView}>
               <TouchableHighlight onPress={()=>this.navigateToDishPage(dish)}>
                  <Image source={imageSrc} style={styleShopPage.oneDishPicture}/>
               </TouchableHighlight>
               
               <View style={styleShopPage.oneDishNameDiscriptionView}>                  
                  <View style={styleShopPage.oneDishNameDiscriptionTextView}>
                    <Text style={styleShopPage.oneDishNameText}>{dish.dishName}</Text>
                    <Text style={styleShopPage.oneDishDiscriptionText}>Ingredient 1, Ingredient 2, Ingredient 3, Ingredient 4, Ingredient 5 </Text>
                  </View>
               </View>
               
               <View style={styleShopPage.priceView}>
                    <View style={styleShopPage.priceTextView}>
                        <Text style={styleShopPage.priceText}>${dish.price}</Text>
                        <Text style={styleShopPage.orderStatusText}>{this.state.selectedTime === 'All Schedules' || this.state.scheduleMapping[this.state.selectedTime][dish.dishId]==undefined? '' : this.state.scheduleMapping[this.state.selectedTime][dish.dishId].leftQuantity+' orders left'} 
                        {this.state.shoppingCart[this.state.selectedTime] && this.state.shoppingCart[this.state.selectedTime][dish.dishId] ? ' | ' + this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity + ' ordered ' : ''} 
                        </Text>
                    </View>
                    <View style={styleShopPage.chooseQuantityView}>
                        <View style={styleShopPage.plusIconView}>
                            <TouchableHighlight underlayColor={'transparent'} onPress={() => this.addToShoppingCart(dish) }>
                                <Image source={plusIcon} style={styleShopPage.plusMinusIcon}/>
                            </TouchableHighlight>
                        </View>                     
                        <View style={styleShopPage.minusIconView}>
                            <TouchableHighlight underlayColor={'transparent'} onPress={() => this.removeFromShoppingCart(dish) }>
                                <Image source={minusIcon} style={styleShopPage.plusMinusIcon}/>
                            </TouchableHighlight>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
         
    render() {
        if (this.state.showProgress) {
            return (
                <View>
                    <ActivityIndicatorIOS
                        animating={this.state.showProgress}
                        size="large"
                        style={styles.loader}/>
                </View>);
        } else {

            return (
                <View style={styles.container}>
                        <View style={styles.headerBannerView}>    
                            <View style={styles.headerLeftView}>
                                <TouchableHighlight style={styles.backButtonView} underlayColor={'transparent'} onPress={() => this.navigateBackToChefList()}>
                                    <Image source={backIcon} style={styles.backButtonIcon}/>
                                </TouchableHighlight>
                            </View>    
                            <View style={styles.titleView}>
                                <Text style={styles.titleText}></Text>
                            </View>
                            <View style={styles.headerRightView}>
                                <View style={styles.likeShareButtonView}>
                                   <TouchableHighlight underlayColor={'transparent'} onPress={()=>{}}>
                                      <Image source={shareIcon} style={styles.shareButtonIcon}/>
                                   </TouchableHighlight>
                                </View>
                            </View>
                        </View>
                        
                        <ListView style={styles.dishListView}
                                dataSource = {this.state.dataSource}
                                renderRow={this.renderRow.bind(this) } 
                                renderHeader={this.renderHeader.bind(this)}/>           

                        <View style={styleShopPage.footerView}>          
                          <TouchableHighlight style={styleShopPage.shoppingCartIconView} onPress={() => this.navigateToShoppingCart() }>
                               <Image source={shoppingCartIcon} style={styleShopPage.shoppingCartIcon}/>    
                          </TouchableHighlight>
                          <View style={styleShopPage.shoppingCartTimeView}>
                               <Text style={styleShopPage.shoppingCartTimePriceText}> {this.state.selectedTime=='All Schedules'?'Open Hours':'$'+this.state.totalPrice+' for '+dateRender.renderDate2(this.state.selectedTime)}</Text>
                          </View>
                       </View>
                </View>      
            );
        }
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
    
    displayDish(selectedTime){
        if(selectedTime==='All Schedules'){
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
        let dishes = JSON.parse(JSON.stringify(displayDishes));
        this.getTotalPrice();
        this.setState({dataSource:this.state.dataSource.cloneWithRows(dishes), showProgress:false, selectedTime:selectedTime});
    }
   
    addToShoppingCart(dish){
        if(this.state.selectedTime==='All Schedules'){
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
        this.getTotalPrice();
    }
    
    removeFromShoppingCart(dish){
        if(this.state.selectedTime==='All Schedules'){
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
    
    addToFavorite(){
        var _this = this;
        return AuthService.getEater()
        .then((eater)=>{
            if(eater){
                if (!eater.favoriteChefs) eater.favoriteChefs = []; //todo: remove this.
                let isAdd = eater.favoriteChefs.indexOf(_this.state.chefId) === -1
                console.log(isAdd);
                _this.client.postWithAuth(isAdd?config.addFavoriteEndpoint:config.removeFavoriteEndpoint, {
                    info:{ chefId: _this.state.chefId, eaterId: eater.eaterId}
                }).then((res)=>{
                    if(res.statusCode===200){
                        isAdd?eater.favoriteChefs.push(_this.state.chefId):eater.favoriteChefs.splice(eater.favoriteChefs.indexOf(_this.state.chefId), 1);
                        return AuthService.updateCacheEater(eater)
                            .then(()=>{ 
                                _this.setState({like:isAdd});
                                Alert.alert('Success', isAdd?'Added to favorite list':'Removed from favorite list', [{ text: 'OK' }]);                          
                            });
                    }else if(res.statusCode===401){
                        _this.props.navigator.push({
                            name: 'LoginPage',
                            passProps:{
                                callback:(eater)=>{
                                _this.setState({like:eater.favoriteChefs.indexOf(_this.state.chefId) !== -1});                  
                                }  
                            }                
                        });
                    }else{
                        Alert.alert( 'Failed', 'Failed. Please try again later',[ { text: 'OK' }]);   
                    }
                });         
            }else{
                _this.props.navigator.push({
                    name: 'LoginPage',
                    passProps:{
                        callback:(eater)=>{
                           _this.setState({like:eater.favoriteChefs.indexOf(_this.state.chefId) !== -1});                  
                        }
                    }
                });
            }
        });
    }
    
    navigateToShoppingCart(){
        if(this.state.selectedTime =='All Schedules'){
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
                defaultDeliveryAddress: this.defaultDeliveryAddress,
                chefId:this.state.chefId,
                eater:this.state.eater,
                shopName:this.state.chef.shopname,
                scheduleMapping: this.state.scheduleMapping,
            }
        });    
    }
    
    navigateToChefCommentsPage(){
        this.props.navigator.push({
            name: 'ChefCommentsPage', 
            passProps:{
                chefId:this.state.chefId
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
                totalPrice: this.state.totalPrice
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
}

var styleShopPage = StyleSheet.create({
    shopPictureView:{
        height: windowHeight/2.63,
    },
    shopPicture:{
        width: windowWidth,
        height: windowHeight/2.63,
    },
    shopInfoView:{
        flexDirection:'row',
        height:windowHeight*0.14,
        paddingTop:windowHeight*0.0225,
        paddingBottom:windowHeight*0.02698,
        paddingHorizontal:windowWidth*0.032,
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
       flex:0.93,
       flexDirection:'row',
       alignItems:'flex-start', 
    }, 
    oneShopNameText:{
       fontSize:windowHeight/37.06,
       fontWeight:'bold',
       color:'#4A4A4A',
    },
    likeIconView:{
       flex:0.07,
       flexDirection:'row',
       alignItems:'flex-end', 
    }, 
    likeIcon:{
        width:windowWidth*0.05,
        height:windowWidth*0.05,
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
        fontSize:11,
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
        width:15, 
        height:15,
        alignSelf:'center',
    },
    labelText:{
        fontSize:12,
        color:'#FFCC33',
        marginLeft:windowWidth/82.8,
        alignSelf:'center',
    },    
    chefDetailView:{
        flexDirection: 'row',
        height:windowHeight*0.065,
        paddingLeft: windowWidth/27.6,
        alignItems:'center',
        borderColor: '#D7D7D7',
        borderTopWidth: 1,
        backgroundColor: '#fff'        
    },
    chefDetailTextView:{
        flex: 1,
        paddingLeft:windowWidth/27.6,
        justifyContent:'center',
    },
    pickupAddressText:{ 
        fontSize: windowHeight/52.6, 
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
        flex:1, 
        flexDirection:'row',
        justifyContent:'center', 
        borderColor:'#D7D7D7',
        borderTopWidth:4,
        height:windowHeight*0.10,
        paddingVertical:windowHeight*0.015,
    },
    openHoursText:{

    },
    footerView:{ 
        flexDirection:'row', 
        height:windowHeight/13.38, 
        backgroundColor:'#ff9933',
        paddingTop:windowHeight/245.30,
    },
    shoppingCartIconView:{ 
        height: windowHeight/19.37, 
        width: windowWidth/8.28, 
        paddingLeft: windowWidth/20.7, 
        paddingTop: windowHeight/92.0, 
        marginVertical: windowHeight/147.2, 
        backgroundColor: '#fff', 
        flexDirection:'row',
    },
    shoppingCartIcon:{ 
        width: windowHeight/29.44, 
        height: windowHeight/29.44,
    },
    shoppingCartTimeView:{
        alignItems:'flex-start',
        marginLeft:20,
    },
    shoppingCartTimePriceText:{
        color:'#fff',
        fontSize:windowHeight/37.8,
        marginTop:windowHeight/80,
        fontWeight:'300',
    },
    oneDishInListView:{
        marginBottom:0,
    },
    oneDishPicture:{
        width: windowWidth,
        height: windowHeight/2.63,
    },
    oneDishNameDiscriptionView:{
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: windowWidth/27.6,
        paddingTop: windowHeight/73.6,
        paddingBottom:windowHeight/105.1,
        alignItems:'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#fff'
    },
    oneDishNameDiscriptionTextView:{
        flex: 1,
        paddingLeft:windowWidth/27.6,
        justifyContent:'center',
    },
    oneDishNameText:{
        fontSize:14,
        fontWeight:'600',
    },
    oneDishDiscriptionText:{
        fontSize:12,
        color:'#A9A9A9',
        marginTop:5,
    },
    priceView:{
        flex: 1,
        flexDirection: 'row',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 50,
        paddingVertical:20,
    },
    priceTextView:{
        flex: 0.66,
        flexDirection: 'column',
    },
    chooseQuantityView:{
        flex: 0.34,
        flexDirection: 'row',
        justifyContent:'flex-end',
    },
    plusMinusIcon:{
        width: windowHeight/27.6, 
        height: windowHeight/27.6,
    },
    plusIconView:{
        marginRight:15,
    },
    minusIconView:{
        marginLeft:15,
    },
    priceText:{
        fontSize:17,
        fontWeight:'bold',
        color:'#ff9933',
    },
    orderStatusText:{
        fontSize:12,
        color:'#A9A9A9',
        marginTop:15,
    },
});

module.exports = ShopPage;