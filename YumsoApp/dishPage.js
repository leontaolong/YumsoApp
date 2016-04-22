var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var Swiper = require('react-native-swiper')
import Dimensions from 'Dimensions';

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

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

class DishPage extends Component {
    constructor(props){
        super(props);
        var routeStack = this.props.navigator.state.routeStack;
        var dish = routeStack[routeStack.length-1].passProps.dish;
        this.state = {
            showProgress:true,
            dish: dish
        };
    }

    componentDidMount(){
        this.client = new HttpsClient(config.baseUrl, true);
        //todo: in the future get comments using client
    }

    
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.chefListView_Chef_shopPic}>
                    <Swiper showsButtons={false} height={Dimensions.get('window').height / 4} horizontal={true} autoplay={true}
                        dot={<View style={{ backgroundColor: 'rgba(0,0,0,.2)', width: 5, height: 5, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3, }} />}
                        activeDot={<View style={{ backgroundColor: '#FFF', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3, }} />} >
                        {this.state.dish.pictures.map((picture) => {
                            return (
                                    <Image key={picture} source={{ uri: picture }} style={styles.chefListView_Chef_shopPic}/>
                            );
                        }) }
                    </Swiper>
                </View>
               <Text>{this.state.dish.dishName}}</Text>
               <Text>${this.state.dish.price}}</Text>
               <Text>${this.state.dish.description}}</Text>
                <TouchableHighlight style={styles.button}
                    onPress={() => this.navigateBackToShop() }>
                    <Text style={styles.buttonText}>back to shop</Text>
                </TouchableHighlight>                      
            </View>
        );
    }
    
    navigateBackToShop() {
        this.props.navigator.pop();
    }
}

module.exports = DishPage;