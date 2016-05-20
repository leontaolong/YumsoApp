'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var rating = require('./rating');
var dateRender = require('./commonModules/dateRender');
var AuthService = require('./authService');
var shareIcon = require('./icons/icon-share.png');
var backIcon = require('./icons/icon-back.png');
var notlikedIcon = require('./icons/icon-unliked-onheader.png')
var likedIcon = require('./icons/icon-liked-onheader.png');
var bowlIcon = require('./icons/icon_bowl.png');
var plusIcon = require('./icons/icon-plus.png');
var minusIcon = require('./icons/icon-minus.png');
var forwardIcon = require('./icons/ic_keyboard_arrow_right_48pt_3x.png');
var radioIcon = require('./icons/ic_radio_48pt_3x.png');
var mapIcon = require('./icons/ic_map_48pt_3x-2.png');
var shoppingCartIcon = require('./icons/ic_shopping_cart_36pt_3x.png');
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
        const end = 'end='+new Date().setDate(new Date().getDate()+6);
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

               return [(<View key={'shopPictureView'} style={styleShopPage.shopPictureView}>
                            <Image source={{ uri: this.state.chef.shopPictures[0] }} style={styleShopPage.shopPicture}
                                onError={(e) => this.setState({ error: e.nativeEvent.error, loading: false }) }>
                            </Image>
                        </View>),
                       (<View key={'chefNameRow'} style={styleShopPage.chefNameRow}>
                            <View style={styleShopPage.chefProfilePicView}>
                                <Image source={{ uri: this.state.chef.chefProfilePic }} style={styleShopPage.chefProfilePic}
                                    onError={(e) => this.setState({ error: e.nativeEvent.error, loading: false }) }/>
                            </View>
                            <View style={styleShopPage.shopChefNameRatingView}>
                                <Text style={styleShopPage.shopNameText}>{this.state.chef.shopname}</Text>
                                <View style={styleShopPage.shopRatingDollarSignView}>
                                    <View style={styleShopPage.ratingView}>{rating.renderRating(this.state.chef.rating)}</View>
                                    <View style={styleShopPage.dollarSignView}><Text style={{ color: '#A9A9A9' }}>{this.state.chef.reviewCount} reviews | {dollarSign.renderLevel(this.state.chef.priceLevel)}</Text></View>
                                </View>
                                <Text style={styleShopPage.chefNameAreaText}>{this.state.chef.firstname} {this.state.chef.lastname}, {this.state.chef.pickupAddressDetail.state}</Text>
                            </View>
                        </View>),
                       (<View key={'chefDiscriptionView'} style={styleShopPage.chefDiscriptionView}>
                            <Text style={styleShopPage.myStoryTitleText}>My Story</Text>
                            <Text style={styleShopPage.chefDiscriptionText}>{this.state.chef.storeDescription}{this.state.chef.storeDescription}</Text>
                        </View>),
                       (<View key={'shopRadioView'} style={styleShopPage.shopRadioView}>
                            <Image source={radioIcon} style={styleShopPage.radioIcon}/>
                            <View style={styleShopPage.shopDiscriptionTextView}>
                                <Text style={styleShopPage.shopRadioText}>{this.state.chef.storeDescription}</Text>
                            </View>
                            <View style={styleShopPage.forwardIconView}>
                                <TouchableHighlight>
                                  <Image source={forwardIcon} style={styleShopPage.forwardIcon}/>
                                </TouchableHighlight>
                            </View>
                        </View>),
                       (<View key={'pickupAddressView'} style={styleShopPage.pickupAddressView}>
                            <Image source={mapIcon} style={styleShopPage.pickupAddressIcon}/>
                            <View style={styleShopPage.pickupAddressTextView}>
                                <Text style={styleShopPage.pickupAddressText}>{this.state.chef.pickupAddress}</Text>
                            </View>
                        </View>),
                       (<TouchableHighlight key={'gotochefcommentsbutton'} style={styles.button}
                                onPress={() => this.navigateToChefCommentsPage() }>
                                <Text style={styles.buttonText}>Go to chef comments</Text>
                        </TouchableHighlight>),                     
                       (<View key={'timeSelectorView'} style={styleShopPage.timeSelectorView}>
                                <ModalPicker
                                 data={deliveryTimeRendered}
                                 initValue={'Select a delivery time'}
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
                  <Image source={bowlIcon} style={styleShopPage.bowlIcon}/>
                  <View style={styleShopPage.oneDishNameDiscriptionTextView}>
                    <Text style={styleShopPage.oneDishNameText}>{dish.dishName}</Text>
                    <Text style={styleShopPage.oneDishDiscriptionText}>{dish.description}</Text>
                  </View>
                  <TouchableHighlight onPress={()=>this.navigateToDishPage(dish)} underlayColor={'transparent'} style={styleShopPage.forwardIconView}>
                       <Image source={forwardIcon} style={styleShopPage.forwardIcon}/>
                  </TouchableHighlight>
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
            
            if(this.state.like){
              var  likeIcon = likedIcon;
            }else{
              var  likeIcon = notlikedIcon;
            }
            
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
                                  <TouchableHighlight underlayColor={'transparent'} onPress={()=>{this.addToFavorite()}}>
                                     <Image source={likeIcon} style={styles.likeButtonIcon}/>
                                  </TouchableHighlight>
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
                               <Text style={styleShopPage.shoppingCartTimePriceText}> {this.state.selectedTime=='All Schedules'?'Select a delivery time':'$'+this.state.totalPrice+' for '+dateRender.renderDate2(this.state.selectedTime)}</Text>
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
    shopPageTopButtonsView:{ 
        flex: 1, 
        flexDirection: 'row', 
    },
    backButtonView:{ 
        position:'absolute', 
        top: 10, 
        left:0,
    },
    likeButtonIcon:{ 
        width: 30, 
        height: 30,
    },
    shareButtonView:{
        position:'absolute', 
        top: 10, 
        right:10,
    },
    shareButtonIcon:{
        width:  30, 
        height: 30,
    },
    chefNameRow:{
        flexDirection: 'row',
        padding: windowHeight/49,
        alignItems: 'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#f5f5f5',
    },
    chefProfilePicView:{
        borderRadius: 12, 
        borderWidth: 0, 
        overflow: 'hidden', 
    },
    chefProfilePic:{
        width:windowHeight/10.8,
        height:windowHeight/10.8,
    },
    shopChefNameRatingView:{ 
        paddingLeft: windowWidth/20.7, 
    },
    shopNameText:{ 
        fontSize: windowHeight/36.8, 
        marginBottom: windowHeight/61.3, 
    },
    chefDiscriptionView:{
        paddingHorizontal: windowWidth/27.6,
        paddingVertical: windowHeight/73.6,
        justifyContent:'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#fff'
    },
    chefDiscriptionText:{ 
        fontSize: windowHeight/52.6,
    },
    shopRatingDollarSignView:{ 
        flex: 1, 
        flexDirection: 'row', 
        marginBottom: windowHeight/245.3,
    },
    ratingView:{ 
        flex: 0.5, 
        flexDirection: 'row',
    },
    dollarSignView:{ 
        flex: 0.5, 
        flexDirection: 'row', 
        marginLeft: windowWidth/27.6
    },
    chefNameAreaText:{ 
        fontSize: 16, 
        color: '#696969', 
    },
    shopRadioView:{
        flexDirection: 'row',
        paddingHorizontal: windowWidth/27.6,
        paddingVertical: windowHeight/73.6,
        alignItems:'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#fff'
    },
    radioIcon:{ 
        width: windowHeight/36.8, 
        height: windowHeight/36.8,
    },
    myStoryTitleText:{ 
        fontSize: windowHeight/46.0, 
        paddingBottom: windowHeight/73.6, 
    },
    shopDiscriptionTextView:{
        flex: 1,
        paddingLeft:windowWidth/27.6,
        justifyContent:'center',
    },
    shopRadioText:{ 
        fontSize: windowHeight/52.6, 
        color: '#A9A9A9',
    },
    pickupAddressView:{
        flexDirection: 'row',
        paddingHorizontal: windowWidth/27.6,
        paddingVertical: windowHeight/73.6,
        alignItems:'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#fff'
    },
    pickupAddressTextView:{
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
    timeSelectorView:{
        flex:1, 
        justifyContent:'space-around', 
        padding:50,
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
        fontSize:windowHeight/30.6,
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
    bowlIcon:{
        width: windowHeight/36.8, 
        height: windowHeight/36.8,
    },
    oneDishNameDiscriptionTextView:{
        flex: 1,
        paddingLeft:windowWidth/27.6,
        justifyContent:'center',
    },
    forwardIconView:{
        paddingLeft:0,
        paddingVertical:15,
    },
    forwardIcon:{
        width: 20,
        height: 20,
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