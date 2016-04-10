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
  AsyncStorage
} from 'react-native';

class DishListPage extends Component {
    constructor(props){
        super(props);
        var ds = new ListView.DataSource({
           rowHasChanged: (r1, r2) => r1!=r2 
        }); 
        this.state = {
            dataSource: ds.cloneWithRows(['Loading...']),
            showProgress:true
        };
    }

    componentDidMount(){
        var routeStack = this.props.navigator.state.routeStack;
        this.chefId = routeStack[routeStack.length-1].passProps.chefId;
        this.client = new HttpsClient('http://192.168.1.134:8080', false, 'xihe243@gmail.com', '123', "/api/v1/auth/authenticateByEmail/chef")
        this.fetchDishesAndSchedules(this.chefId); 
    }
    
    async fetchDishesAndSchedules(chefId) {
        const query = '?start=0&end=999999999999';
        let getDishesTask = this.client.getWithAuth('/api/v1/chef/getDishes/'+chefId);
        let getScheduleTask = this.client.getWithAuth('/api/v1/chef/getSchedules/'+chefId+query);
        let responseDish = await getDishesTask;
        let responseSchedule = await getScheduleTask;
        let dishes = responseDish.data.dishes;
        let schedules = responseSchedule.data.schedules;
        console.log(responseSchedule.statusCode);
        this.setState({dishes:dishes, dataSource:this.state.dataSource.cloneWithRows(dishes)});
        console.log(dishes);
    }
 
    renderRow(dish){
        let imageSrc =require('./ok.jpeg') ;
        if(dish.pictures && dish.pictures!=null && dish.pictures.length!=0){
            imageSrc={uri:dish.pictures[0]};   
        }
        return (
            <View style={styles.dishListView_dish}>
                <Image source={imageSrc} style={styles.dishListView_dish_pic}
                onError={(e) => this.setState({error: e.nativeEvent.error, loading: false})}/>
                <View >
                    <View>
                        <Text>
                            {dish.dishName}
                        </Text>
                        <Text>
                            {dish.description}
                        </Text>   
                    </View>  
                    <View style={{flexDirection:'row'}}>
                        <View>
                            <Text>
                                ${dish.price}
                            </Text>
                            <Text>
                                3 orders left
                            </Text> 
                        </View>  
                        <TouchableHighlight style={styles.button}>
                            <Text style={styles.buttonText}>Add Remove</Text>
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
            </View>
        );
    }
}

module.exports = DishListPage;