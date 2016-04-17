var ChefListPage = require('./chefListPage');
var DishListPage = require('./dishListPage');
var ShoppingCartPage = require('./shoppingCartPage');
var PaymentPage = require('./paymentPage');
var ChefPage = require('./chefPage');
var HistoryOrderPage = require('./historyOrderPage');
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
                // <Login onLogin={this.onLogin}/>
        return (
                <Navigator
                    initialRoute={{ name: 'ChefListPage' }}
                    renderScene={ this.renderScene } />     
        );
    }
    
    renderScene(route, navigator) {
        if(route.name === 'ChefListPage') {
            return <ChefListPage navigator={navigator} />
        }else if(route.name==='DishListPage'){
            return <DishListPage navigator={navigator} />
        }else if(route.name==='ShoppingCartPage'){
            return <ShoppingCartPage navigator={navigator}/>
        }else if (route.name==='PaymentPage'){
            return <PaymentPage navigator={navigator}/>
        }else if(route.name==='ChefPage'){
            return <ChefPage navigator={navigator}/>
        }else if (route.name==='HistoryOrderPage'){
            return <HistoryOrderPage navigator={navigator}/>
        }else if (route.name==='ChefCommentsPage'){
            return <ChefCommentsPage navigator={navigator}/>
        }
    }  
    
    onLogin(){
        console.log("Loggedin!");
    }
}

AppRegistry.registerComponent('YumsoApp', () => YumsoApp);
