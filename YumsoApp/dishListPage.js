var HttpsClient = require('./httpsClient');
var styles = require('./style');

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
  Alert
} from 'react-native';

class DishListPage extends Component {
    constructor(props){
        super(props);
        var ds = new ListView.DataSource({
           rowHasChanged: (r1, r2) => r1!=r2 
        }); 
        this.state = {
            dataSource: ds.cloneWithRows([]),
            showProgress:true,
            shoppingCart:{}
        };
        console.log(props.navigator.state.routeStack); 
    }

    componentDidMount(){
        var routeStack = this.props.navigator.state.routeStack;
        this.chefId = routeStack[routeStack.length-1].passProps.chefId;
        this.client = new HttpsClient('http://172.31.99.87:8080', false, 'xihe243@gmail.com', '123', "/api/v1/auth/authenticateByEmail/chef")
        this.fetchDishesAndSchedules(this.chefId); 
    }
    
    async fetchDishesAndSchedules(chefId) {
        const start = 'start=0';
        const end = 'end=999999999999'
        let getDishesTask = this.client.getWithAuth('/api/v1/chef/getDishes/'+chefId);
        let getScheduleTask = this.client.getWithAuth('/api/v1/chef/getSchedules/'+chefId+'?'+start+'&'+end);
        let responseDish = await getDishesTask;
        let responseSchedule = await getScheduleTask;
        let dishes = responseDish.data.dishes;
        let schedules = responseSchedule.data.schedules;
        console.log('schedules'+schedules);
        this.setState({dishes:dishes, dataSource:this.state.dataSource.cloneWithRows(dishes), showProgress:false});
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
               <ListView style={styles.dishListView}
                    dataSource = {this.state.dataSource}
                    renderRow={this.renderRow.bind(this) } />
                <TouchableHighlight style={styles.button}
                    onPress={() => this.navigateToShoppingCart() }>
                    <Text style={styles.buttonText}>Go to cart</Text>
                </TouchableHighlight>            
            </View>
        );
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
                shoppingCart:this.state.shoppingCart      
            }
        });    
    }
    
    navigateBackToChefList(){
        this.props.navigator.pop();
    }
}

module.exports = DishListPage;

            // Alert.alert(
            //     'Alert Title',
            //     'My Alert Msg',
            //     [
            //         { text: 'Ask me later', onPress: () => console.log('Ask me later pressed') },
            //         { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
            //         { text: 'OK', onPress: () => console.log('OK Pressed') },
            //     ]
            // )