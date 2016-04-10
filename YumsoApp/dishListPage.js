var HttpsClient = require('./httpsClient');
var styles = require('./style');

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight,
  ActivityIndicatorIOS,
  AsyncStorage
} from 'react-native';

class DishListPage extends Component {
    constructor(props){
        super(props);
    }

    componentDidMount(){
        this.client = new HttpsClient('http://192.168.1.134:8080', false, 'xihe243@gmail.com', '123', "/api/v1/auth/authenticateByEmail/chef")
        this.fetchDishes(); 
    }
    
    async fetchDishes() {
        var chefId = this.props.navigator.passProps.chefId;
        let response = await this.client.getWithAuth('/api/v1/chef/getDishes/'+chefId);
        var chefs = response.data.chefs;
        console.log(chefs);
        this.setState({dataSource: this.state.dataSource.cloneWithRows(chefs), showProgress:false});    
    }
        
    render() {
        return (
            <View style={styles.container}>
                
            </View>
        );
    }
}

module.exports = DishListPage;