var HttpsClient = require('./httpsClient');
var styles = require('./style');
import ModalPicker from 'react-native-modal-picker'
var config = require('./config');

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
  Picker
} from 'react-native';

class DishListPage extends Component {
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
            shoppingCart:{},
            timeData:[],
            chefId:this.chefId
        };
    }

    componentDidMount(){
        this.client = new HttpsClient(config.baseUrl, true)
        this.fetchDishesAndSchedules(this.state.chefId); 
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
        console.log(scheduleTime);
        var displayDishes = [];
        var selectedTime;
        if(scheduleTime.length>0){
            var selectedTime = scheduleTime[0];
            var selectedTimeDishSchedules = scheduleMapping[selectedTime];
            for(var dish of dishes){
                if(selectedTimeDishSchedules[dish.dishId]){
                    displayDishes.push(dish);
                }
            }
        }
        console.log(displayDishes);
        this.setState({
                dishes:dishes, 
                dataSource:this.state.dataSource.cloneWithRows(displayDishes), 
                showProgress:false, 
                schedules:schedules,
                scheduleMapping:scheduleMapping, 
                scheduleTime:scheduleTime, 
                timeData:timeData,
                selectedTime:selectedTime});
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
                                3 orders left
                            </Text> 
                        </View>  
                        <TouchableHighlight style={styles.button}
                            onPress={()=>this.addToShoppingCart(dish)}>
                            <Text style={styles.buttonText}>+</Text>
                        </TouchableHighlight>  
                        <Text>{this.state.shoppingCart[dish.dishId]?this.state.shoppingCart[dish.dishId].quantity:'  '}</Text>
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
        return (
            <View style={styles.container}>
                <View style={{flex:1, justifyContent:'space-around', padding:50}}>
                    <ModalPicker
                        data={this.state.timeData}
                        initValue={'Select a time'}
                        onChange={(option)=>{ this.displayDish(`${option.label}`)}} />
                </View>
               <ListView style={styles.dishListView}
                    dataSource = {this.state.dataSource}
                    renderRow={this.renderRow.bind(this) } />
                <TouchableHighlight style={styles.button}
                    onPress={() => this.navigateBackToChefList() }>
                    <Text style={styles.buttonText}>back to chef list</Text>
                </TouchableHighlight>            
                <TouchableHighlight style={styles.button}
                    onPress={() => this.navigateToShoppingCart() }>
                    <Text style={styles.buttonText}>Go to cart</Text>
                </TouchableHighlight>            
            </View>
        );
    }
   
   displayDish(selectedTime){
        let scheduleTime = this.state.scheduleTime;
        var displayDishes = [];
        var selectedTimeDishSchedules = this.state.scheduleMapping[selectedTime];
        for (var dish of this.state.dishes) {
            if (selectedTimeDishSchedules[dish.dishId]) {
                displayDishes.push(dish);
            }
        }
        let dishes = JSON.parse(JSON.stringify(displayDishes));
        this.setState({dataSource:this.state.dataSource.cloneWithRows(dishes), showProgress:false, selectedTime:selectedTime});
    }
   
    addToShoppingCart(dish){
        if(this.state.shoppingCart[dish.dishId]){
            this.state.shoppingCart[dish.dishId].quantity+=1;
        }else{
            this.state.shoppingCart[dish.dishId] = {dish:dish, quantity:1};
        }
        this.setState({shoppingCart:this.state.shoppingCart});
    }
    
    removeFromShoppingCart(dish){
        if(this.state.shoppingCart[dish.dishId] && this.state.shoppingCart[dish.dishId].quantity>0){
            this.state.shoppingCart[dish.dishId].quantity-=1;
            if(this.state.shoppingCart[dish.dishId].quantity===0){
                delete this.state.shoppingCart[dish.dishId];
            }
        } 
        this.setState({shoppingCart:this.state.shoppingCart});       
    }
    
    navigateToShoppingCart(){
        this.props.navigator.push({
            name: 'ShoppingCartPage', 
            passProps:{
                shoppingCart:this.state.shoppingCart,
                selectedTime:this.state.selectedTime,
                chefId:this.state.chefId
            }
        });    
    }
    
    navigateBackToChefList(){
        this.props.navigator.pop();
    }
}

module.exports = DishListPage;