var HttpsClient = require('./httpsClient');
var styles = require('./style');
var ChefPage = require('./chefPage');
var config = require('./config');
var AuthService = require('./authService');

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  ListView,
  TouchableHighlight,
  ActivityIndicatorIOS
} from 'react-native';

class ChefListPage extends Component {
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
    
    async componentDidMount(){
        await AuthService.loginWithEmail(config.email, config.password);
        console.log(this.state);
        let user = await AuthService.getPrincipalInfo();
        console.log(user);
        this.client = new HttpsClient(config.baseUrl, true)
        await this.fetchChefDishes(); 
    }
    
    async fetchChefDishes() {
        let response = await this.client.getWithAuth('/api/v1/eater/chefs');
        var chefs = response.data.chefs;
        console.log(chefs);
        this.setState({dataSource: this.state.dataSource.cloneWithRows(chefs), showProgress:false});    
    }
    
    renderRow(chef) {
        return (
            <View style={styles.chefListView_chef}>
                <TouchableHighlight onPress={()=>this.goToDishList(chef.chefId)} underlayColor='#C0C0C0'>
                    <Image source={{ uri: chef.shopPictures[0] }} style={styles.chefListView_Chef_shopPic}
                    onError={(e) => this.setState({error: e.nativeEvent.error, loading: false})}/>
                </TouchableHighlight>
                <View style={styles.chefListView_chef_Info}>
                    <View style={styles.chefListView_chef_col1}>
                      <TouchableHighlight style={styles.button}
                    onPress={() => this.navigateToChefPage(chef.chefId) }>
                        <Image source={{ uri: chef.chefProfilePic }} style={styles.chefListView_Chef_profilePic}/>
                      </TouchableHighlight>  
                        <Text>1.5 miles</Text>
                    </View>
                    <View style={styles.chefListView_chef_col2}>
                        <Text style={{
                            color: '#333',
                            fontWeight:'600',
                            backgroundColor: '#fff',
                            textAlign: 'left'
                        }}>
                            {chef.shopname} 
                        </Text>
                    </View>
                    <View style={styles.chefListView_chef_col3}>
                        <Text style={{
                            color: '#333',
                            backgroundColor: '#fff',
                            textAlign: 'right'
                        }}>
                            {chef.rateStar} 
                        </Text>
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
        }
        return (
            <View>
                <ListView style={styles.chefListView}
                    dataSource = {this.state.dataSource}
                    renderRow={this.renderRow.bind(this) } />
                <View style={styles.toolbar}>
                    <TouchableHighlight style={styles.toolbarTitle} onPress={()=>this.goToOrderHistory()}>
                        <Image source={require('./ok.jpeg') } style={styles.toolbarImage}/>
                    </TouchableHighlight>
                    <TouchableHighlight style={styles.toolbarTitle}>
                        <Image source={require('./ok.jpeg') } style={styles.toolbarImage}/>
                    </TouchableHighlight>
                    <TouchableHighlight style={styles.toolbarTitle}>
                        <Image source={require('./ok.jpeg') } style={styles.toolbarImage}/>
                    </TouchableHighlight>
                    <TouchableHighlight style={styles.toolbarTitle}>
                        <Image source={require('./ok.jpeg') } />
                    </TouchableHighlight>
                </View>
            </View>
        );
    } 
    
    goToDishList(chefId){
        this.props.navigator.push({
            name: 'DishListPage', 
            passProps:{
                chefId:chefId      
            }
        });
    }
    
    navigateToChefPage(chefId){
        this.props.navigator.push({
            name: 'ChefPage', 
            passProps:{
                chefId:chefId
            }
        });    
    }  
    
    goToOrderHistory(){
        this.props.navigator.push({
            name: 'HistoryOrderPage', 
        });    
    }
}

module.exports = ChefListPage;