var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
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
  ScrollView
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
        this.chefId = routeStack[routeStack.length-1].passProps.chefId;      
        this.state = {
            dataSource: ds.cloneWithRows([]),
            showProgress:true,
            chefId:this.chefId,
            timeData:[],
            shoppingCart:{},  
            selectedTime:'All Schedules',
            totalPrice:0
        };
    }
    
    componentDidMount(){
        this.client = new HttpsClient(config.baseUrl, true);
        this.fetchChefProfile(); 
        this.fetchDishesAndSchedules(this.state.chefId);      
    }
    
    fetchChefProfile(){
        var self = this;
        var chefId = this.state.chefId;
        return this.client.getWithAuth(config.getOneChefEndpoint+chefId).then(function(res){
            if(res.statusCode===200){
               var chef=res.data.chef;
               self.setState({chef:chef});
            }
        });
    }

    async fetchDishesAndSchedules(chefId) {
        const start = 'start='+new Date().getTime();
        const end = 'end='+new Date().setDate(new Date().getDate()+2);
        let getDishesTask = this.client.getWithAuth('/api/v1/chef/getDishes/'+chefId);
        let getScheduleTask = this.client.getWithAuth('/api/v1/chef/getSchedules/'+chefId+'?'+start+'&'+end);
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
                scheduleMapping[time]= {[schedule.dishId]:schedule.quantity};
                timeData.push({ key: index++, label: time });
            }else{
                scheduleMapping[time][schedule.dishId] = schedule.quantity;
            }
        }
        
        let scheduleTime = Object.keys(scheduleMapping);
        this.setState({
                dishes:dishes, 
                dataSource:this.state.dataSource.cloneWithRows(dishes), 
                showProgress:false, 
                schedules:schedules,
                scheduleMapping:scheduleMapping, 
                scheduleTime:scheduleTime, 
                timeData:timeData
                });
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
            <View style={styles.dishListView_dish}>
                <Image source={imageSrc} style={styles.dishListView_dish_pic}/>
                <View >
                    <View>
                        <Text>
                            {dish.dishName}
                        </Text>
                        <Text>
                            {dish.description}
                        </Text>   
                    </View>  
                    <View style={{flexDirection:'row', flex:1}}>
                        <View>
                            <Text>
                                ${dish.price}
                            </Text>
                            <Text>
                                {this.state.selectedTime==='All Schedules'?'':'3 orders left'}
                            </Text> 
                        </View>  
                        <TouchableHighlight style={styles.button}
                            onPress={()=>this.addToShoppingCart(dish)}>
                            <Text style={styles.buttonText}>+</Text>
                        </TouchableHighlight>  
                        <Text>{this.state.shoppingCart[this.state.selectedTime]&& this.state.shoppingCart[this.state.selectedTime][dish.dishId]?this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity:'  '}</Text>
                        <TouchableHighlight style={styles.button}
                            onPress={()=>this.removeFromShoppingCart(dish)}>                
                            <Text style={styles.buttonText}>-</Text>
                        </TouchableHighlight>                                   
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
            var ratingIcons = [];
            //var starNumber = this.state.chef.rateStar;
            var rating = 3;
            var maxRating = 5;
            for (let i = 0; i < maxRating; i++) {
                if (i < rating) {
                    ratingIcons.push(
                        <View key={i} style={{ marginRight: windowWidth / 83.0 }}>
                            <Image source={require('./icons/Icon-Small.png') } style={{ width: windowWidth / 32, height: windowWidth / 32 }}/>
                        </View>
                    );
                } else {
                    ratingIcons.push(
                        <View key={i} style={{ marginRight: windowWidth / 83.0 }}>
                            <Image source={require('./icons/forkhand2.png') } style={{ width: windowWidth / 32, height: windowWidth / 32 }}/>
                        </View>
                    );
                }
            }

            return (
                <View style={{height:windowHeight-40}}>
                    <ScrollView >
                        <Image source={{ uri: this.state.chef.shopPictures[0] }} style={styleChefPage.shopPicture}
                            onError={(e) => this.setState({ error: e.nativeEvent.error, loading: false }) }>
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                <View style={{ flex: 0.1, flexDirection: 'row', paddingTop: 10, height: 40, backgroundColor: 'transparent' }}>
                                    <TouchableHighlight onPress={() => this.navigateBackToChefList() }>
                                        <Image source={require('./icons/ic_keyboard_arrow_left_48pt_3x.png') } style={{ width: 40, height: 40 }}/>
                                    </TouchableHighlight>
                                </View>
                                <View style={{ flex: 0.8, flexDirection: 'row', paddingTop: 10 }}>
                                </View>
                                <View style={{ flex: 0.1, flexDirection: 'row', paddingTop: 10 }}>
                                    <Image source={require('./icons/ic_favorite_border_48pt_3x.png') } style={{ width: 30, height: 30 }}/>
                                </View>
                                <View style={{ flex: 0.1, flexDirection: 'row', paddingTop: 10 }}>
                                    <Image source={require('./icons/ic_share_48pt_3x.png') } style={{ width: 30, height: 30 }}/>
                                </View>
                            </View>
                        </Image>
                        <View style={styleChefPage.chefNameRow}>
                            <View style={{ borderRadius: 12, borderWidth: 0, overflow: 'hidden' }}>
                                <Image source={{ uri: this.state.chef.chefProfilePic }} style={styleChefPage.chefProfilePic}
                                    onError={(e) => this.setState({ error: e.nativeEvent.error, loading: false }) }/>
                            </View>
                            <View style={{ paddingLeft: windowWidth / 20.7 }}>
                                <Text style={{ fontSize: windowHeight / 36.8, marginBottom: windowHeight / 61.3 }}>{this.state.chef.shopname}</Text>
                                <View style={{ flex: 1, flexDirection: 'row', marginBottom: windowHeight / 245.3 }}>
                                    <View style={{ flex: 0.5, flexDirection: 'row' }}>{ratingIcons}</View>
                                    <View style={{ flex: 0.5, flexDirection: 'row', marginLeft: windowWidth / 27.6 }}><Text style={{ color: '#A9A9A9' }}>10 reviews | $$</Text></View>
                                </View>
                                <Text style={{ fontSize: 16, color: '#696969' }}>{this.state.chef.firstname} {this.state.chef.lastname}, Kirkland</Text>
                            </View>
                        </View>
                        <View style={styleChefPage.chefDiscriptionView}>
                            <Text style={{ fontSize: windowHeight / 46.0, paddingBottom: windowHeight / 73.6 }}>My Story</Text>
                            <Text style={{ fontSize: windowHeight / 52.6 }}>{this.state.chef.storeDescription}{this.state.chef.storeDescription}</Text>
                        </View>
                        <View style={styleChefPage.shopDiscriptionView}>
                            <Image source={require('./icons/ic_radio_48pt_3x.png') } style={{ width: windowHeight / 36.8, height: windowHeight / 36.8 }}/>
                            <View style={styleChefPage.shopDiscriptionTextView}>
                                <Text style={{ fontSize: windowHeight / 52.6, color: '#A9A9A9' }}>{this.state.chef.storeDescription}</Text>
                            </View>
                        </View>
                        <View style={styleChefPage.pickupAddressView}>
                            <Image source={require('./icons/ic_map_48pt_3x-2.png') } style={{ width: windowHeight / 36.8, height: windowHeight / 36.8 }}/>
                            <View style={styleChefPage.pickupAddressTextView}>
                                <Text style={{ fontSize: windowHeight / 52.6, color: '#A9A9A9' }}>{this.state.chef.pickupAddress}</Text>
                            </View>
                        </View>
                        <View style={styles.container}>
                            <TouchableHighlight style={styles.button}
                                onPress={() => this.navigateToChefCommentsPage() }>
                                <Text style={styles.buttonText}>Go to chef comments</Text>
                            </TouchableHighlight>                     
                            <View style={{flex:1, justifyContent:'space-around', padding:50}}>
                                <ModalPicker
                                    data={this.state.timeData}
                                    initValue={'Select a delivery time'}
                                    onChange={(option)=>{ this.displayDish(`${option.label}`)}} />
                            </View>
                        <ListView style={styles.dishListView}
                                dataSource = {this.state.dataSource}
                                renderRow={this.renderRow.bind(this) } />           
                            <TouchableHighlight style={styles.button}
                                onPress={() => this.navigateToShoppingCart() }>
                                <Text style={styles.buttonText}>Go to cart</Text>
                            </TouchableHighlight>            
                        </View>    
                    </ScrollView>
                    <View style={{ position: 'absolute', top: windowHeight - 40, left: 0, right: 0, flex: 1, height: 40, backgroundColor: '#ff9933' }}>
                        <View style={{ height: 30, width: 50, paddingLeft: 20, paddingTop: 3, paddingBottom: 2, marginVertical: 5, backgroundColor: '#fff', flexDirection:'row' }}>
                            <Image source={require('./icons/ic_shopping_cart_36pt_3x.png') } style={{ width: 25, height: 25 }}/>
                            <Text> {this.state.selectedTime=='All Schedules'?'Select a delivery time':'$'+this.state.totalPrice+' at '+this.state.selectedTime}</Text>
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
        let scheduleTime = this.state.scheduleTime;
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
            if(this.state.shoppingCart[this.state.selectedTime][dish.dishId].quantity===0){
                delete this.state.shoppingCart[this.state.selectedTime][dish.dishId];
                if(Object.keys(this.state.shoppingCart[this.state.selectedTime])===0){
                    delete this.state.shoppingCart[this.state.selectedTime];
                }
            }
        } 
        this.getTotalPrice();
    }
    
    navigateToShoppingCart(){
        if(this.state.selectedTime =='All Schedules'){
            Alert.alert( 'Warning', 'Please select a delivery time',[ { text: 'OK' }]);
            return;
        }
        this.props.navigator.push({
            name: 'ShoppingCartPage', 
            passProps:{
                shoppingCart:this.state.shoppingCart[this.state.selectedTime],
                selectedTime:this.state.selectedTime,
                chefId:this.state.chefId
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
    
    navigateBackToChefList(){
        if(Object.keys(this.state.shoppingCart).length!=0){
            Alert.alert( 'Warning', 'Your shopping cart of this chef will be cleared',[ 
                { text: 'OK', onPress: () => {this.props.navigator.pop(); this.state.shoppingCart={}}},
                {text:'Cancel'}]);
        }else{
            this.props.navigator.pop();
        }
    }
}

var styleChefPage = StyleSheet.create({
    shopPicture:{
        width: windowWidth,
        height: windowHeight/2.63,
        marginTop:18,
    },
    chefNameRow:{
        flex: 1,
        flexDirection: 'row',
        padding: windowHeight/49,
        alignItems: 'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#f5f5f5'
    },
    chefProfilePic:{
        width:windowHeight/10.8,
        height:windowHeight/10.8,
    },
    chefDiscriptionView:{
        flex: 1,
        paddingHorizontal: windowWidth/27.6,
        paddingVertical: windowHeight/73.6,
        justifyContent:'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#fff'
    },
    shopDiscriptionView:{
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: windowWidth/27.6,
        paddingVertical: windowHeight/73.6,
        alignItems:'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#fff'
    },
    shopDiscriptionTextView:{
        flex: 1,
        paddingLeft:windowWidth/27.6,
        justifyContent:'center',
    },
    pickupAddressView:{
        flex: 1,
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
    }
    
});

module.exports = ShopPage;