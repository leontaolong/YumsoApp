var HttpsClient = require('./httpsClient');
var styles = require('./style');

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  ListView,
  TouchableHighlight,
  ActivityIndicatorIOS,
  Navigator
} from 'react-native';

class ChefPage extends Component {
     constructor(props){
        super(props);      

        var ds = new ListView.DataSource({
           rowHasChanged: (r1, r2) => r1!=r2 
        });
        
        this.state = {
            dataSource: ds.cloneWithRows(['A','B']),
            showProgress:true
        };
    }
    
    componentDidMount(){
        this.client = new HttpsClient('http://192.168.1.134:8080', false, 'xihe243@gmail.com', '123', "/api/v1/auth/authenticateByEmail/chef")
        this.fetchChefDishes(); 
    }
    
    async fetchChefDishes() {
        let response = await this.client.getWithAuth('/api/v1/eater/chefs');
        var chefs = response.data.chefs;
        console.log(chefs);
        this.setState({dataSource: this.state.dataSource.cloneWithRows(chefs), showProgress:false});    
    }

    render() {
        return (
            <View>
            </View>
        );
    }

}

module.exports = ChefPage;