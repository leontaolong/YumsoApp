var ChefListPage = require('./chefListPage');
var ShoppingCartPage = require('./shoppingCartPage');
var PaymentPage = require('./paymentPage');
var ShopPage = require('./shopPage');
var HistoryOrderPage = require('./historyOrderPage');
var EaterPage = require('./eaterPage');
var ChefCommentsPage = require('./chefCommentsPage');
var OrderConfirmation = require('./orderConfirmation');
var DishPage = require('./dishPage');
var AuthService = require('./authService');
var LoginPage = require('./loginPage');
var SignUpPage = require('./signupPage');
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

console.disableYellowBox = true; 

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
        }else if (route.name==='OrderConfirmation'){
            return <OrderConfirmation navigator={navigator}/>
        }else if (route.name==='LoginPage'){
            return <LoginPage navigator={navigator}/>
        }else if (route.name==='SignUpPage'){
            return <SignUpPage navigator={navigator}/>
        }else if (route.name==='DishPage'){
            return <DishPage navigator={navigator}/>
        }
    } 

}

AppRegistry.registerComponent('YumsoApp', () => YumsoApp);
