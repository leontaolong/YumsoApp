var HttpsClient = require('./httpsClient');
var styles = require('./style');
var ChefPage = require('./chefPage');
var config = require('./config');
var AuthService = require('./authService');
var SideMenu = require('react-native-side-menu');
var Swiper = require('react-native-swiper')
import Dimensions from 'Dimensions';

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
    constructor(props) {
        super(props);

        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 != r2
        });

        this.state = {
            dataSource: ds.cloneWithRows(['A', 'B']),
            showProgress: true,
            isMenuOpen: false,
            chefView: {},
            initialPosition: {},
            lastPosition: {},
            city:'unknown',
            state:'unknown',
            watchId: 0
        };
    }

    async componentDidMount() {
        await AuthService.loginWithEmail(config.email, config.password);
        console.log(this.state);
        let user = await AuthService.getPrincipalInfo();
        console.log(user);
        this.setState({ eater: user });
        this.getLocation();
        this.client = new HttpsClient(config.baseUrl, true);
        this.fetchChefDishes();
    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.state.watchID);
    }

    async fetchChefDishes() {
        let response = await this.client.getWithAuth(config.chefList);
        var chefs = response.data.chefs;
        var chefView = {};
        for (var chef of chefs) {
            chefView[chef.chefId] = chef.shopPictures;
        }
        this.setState({ dataSource: this.state.dataSource.cloneWithRows(chefs), showProgress: false, chefView: chefView });
    }
    
    getLocation(){
        var self = this;
        this.googleClient = new HttpsClient(config.googleGeoBaseUrl);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.setState({ initialPosition: position });
            },
            (error) => alert(error.message),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
        this.state.watchID = navigator.geolocation.watchPosition((position) => {
            this.setState({ lastPosition: position });
            console.log(position);
            return self.googleClient.getWithoutAuth(config.reverseGeoCoding + position.coords.latitude + ',' + position.coords.longitude)
            .then((res)=>{
                var city = 'unknown';
                var state = 'unknown';
                if(res.statusCode===200 && res.data.status==='OK' && res.data.results.length>0){
                    var results = res.data.results;
                    for(var component of results[0].address_components){
                        for(var type of component.types){
                            if(type==='locality'){
                                city = component.long_name;
                            }
                            if(type==='administrative_area_level_1'){
                                state = component.short_name;
                            }
                        }
                    }
                }
                self.setState({city:city, state:state});
                console.log(city);
            });
        });    
    }

    renderRow(chef) {
        return (
            <View style={styles.chefListView_chef}>
                <View style={styles.chefListView_Chef_shopPic}>
                    <Swiper showsButtons={false} height={Dimensions.get('window').height / 4} horizontal={true} autoplay={true}
                        dot={<View style={{ backgroundColor: 'rgba(0,0,0,.2)', width: 5, height: 5, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3, }} />}
                        activeDot={<View style={{ backgroundColor: '#FFF', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3, }} />} >
                        {this.state.chefView[chef.chefId].map((picture) => {
                            return (
                                <TouchableHighlight key={picture} onPress={() => this.goToDishList(chef.chefId) } underlayColor='#C0C0C0'>
                                    <Image source={{ uri: picture }} style={styles.chefListView_Chef_shopPic}
                                        onError={(e) => this.setState({ error: e.nativeEvent.error, loading: false }) }/>
                                </TouchableHighlight>
                            );
                        }) }
                    </Swiper>
                </View>
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
                            fontWeight: '600',
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
        const menu = <Menu navigator={this.props.navigator} eater={this.state.eater} caller = {this}/>;
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
            <SideMenu menu={menu} isOpen={this.state.isMenuOpen}>
                <View>
                    <View>
                        <Text>
                            <Text style={styles.title}>Initial position: </Text>
                            {this.state.initialPosition.coords.longitude + ',' + this.state.initialPosition.coords.latitude}
                        </Text>
                        <Text>
                            <Text style={styles.title}>Current position: </Text>
                            {this.state.lastPosition.coords.longitude + ',' + this.state.lastPosition.coords.latitude}
                        </Text>
                        <Text>
                            <Text style={styles.title}>Current position: </Text>
                            {this.state.city+','+this.state.state}
                        </Text>                  
                    </View>
                    <TouchableHighlight style={styles.button} onPress={() => this.setState({ isMenuOpen: true }) }>
                        <Text style={styles.buttonText}> Menu</Text>
                    </TouchableHighlight>
                    <ListView style={styles.chefListView}
                        dataSource = {this.state.dataSource}
                        renderRow={this.renderRow.bind(this) } />
                    <View style={styles.toolbar}>
                        <TouchableHighlight style={styles.toolbarTitle} onPress={() => this.goToOrderHistory() }>
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
            </SideMenu>
        );
    }

    goToDishList(chefId) {
        this.props.navigator.push({
            name: 'DishListPage',
            passProps: {
                chefId: chefId
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
    
    goToOrderHistory() {
        this.props.navigator.push({
            name: 'HistoryOrderPage',
        });
    }
}

var Menu = React.createClass({
    goToOrderHistory: function() {
        this.props.caller.setState({ isMenuOpen: false });
        this.props.navigator.push({
            name: 'HistoryOrderPage',
        });
    },

    goToEaterPage: function() {
        this.props.navigator.push({
            name: 'EaterPage',
        });
    },
    
    render: function() {
        return (
            <View style={sideMenuStyle.sidemenu}>
                <Text style={sideMenuStyle.paddingMenuItem}>{this.props.eater.firstname} {this.props.eater.lastname}</Text>
                <TouchableHighlight onPress={this.goToEaterPage}>
                  <Image source={require('./ok.jpeg') } />
                </TouchableHighlight>
                <Text onPress={this.goToOrderHistory} style={sideMenuStyle.paddingMenuItem}>History Order</Text>
            </View>
        );
    }
});

var sideMenuStyle = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    sidemenu: {
        paddingTop: 50,
    },
    paddingMenuItem: {
        padding: 10,
    },
});


module.exports = ChefListPage;