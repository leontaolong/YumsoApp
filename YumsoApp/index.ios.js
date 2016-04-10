var ChefListPage = require('./chefListPage');
var DishListPage = require('./dishListPage');

var LoginPage = require('./loginPage');
var styles = require('./style');

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
                    style={{ flex:1 }}
                    initialRoute={{ name: 'ChefListPage' }}
                    renderScene={ this.renderScene } />     
        );
    }
    
    renderScene(route, navigator) {
        if(route.name === 'ChefListPage') {
            return <ChefListPage navigator={navigator} />
        }else if(route.name==='DishListPage'){
            return <DishListPage navigator={navigator} />
        }
    }  
    
    onLogin(){
        console.log("Loggedin!");
    }
}

AppRegistry.registerComponent('YumsoApp', () => YumsoApp);
