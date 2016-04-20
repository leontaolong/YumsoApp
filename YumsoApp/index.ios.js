var ChefListPage = require('./chefListPage');
var ShoppingCartPage = require('./shoppingCartPage');
var PaymentPage = require('./paymentPage');
var ShopPage = require('./shopPage');
var HistoryOrderPage = require('./historyOrderPage');
var EaterPage = require('./eaterPage');
var ChefCommentsPage = require('./chefCommentsPage');
var AuthService = require('./authService');
var LoginPage = require('./loginPage');
var styles = require('./style');
var AuthService = require('./authService');

import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  Navigator
} from 'react-native';

class YumsoApp extends Component {
    
    render() {
        return (
                <Navigator
                    initialRoute={{ name: 'ChefListPage' }}
                    renderScene={ this.renderScene } />     
        );
    }
    
    renderScene(route, navigator) {
        if(route.name === 'ChefListPage') {
            return <ChefListPage navigator={navigator} />
        }else if(route.name==='ShoppingCartPage'){
            return <ShoppingCartPage navigator={navigator}/>
        }else if (route.name==='PaymentPage'){
            return <PaymentPage navigator={navigator}/>
        }else if(route.name==='ShopPage'){
            return <ShopPage navigator={navigator}/>
        }else if (route.name==='HistoryOrderPage'){
            return <HistoryOrderPage navigator={navigator}/>
        }else if (route.name==='EaterPage'){
            return <EaterPage navigator={navigator}/>
        }else if (route.name==='ChefCommentsPage'){
            return <ChefCommentsPage navigator={navigator}/>
        }else if (route.name==='LoginPage'){
            return <LoginPage navigator={navigator} onLogin={this.onLogin}/>
        }
    } 
    
    onLogin(){
        this.props.navigator.pop();  
    } 
}

AppRegistry.registerComponent('YumsoApp', () => YumsoApp);
