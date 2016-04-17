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
    TextInput,
    Text,
    View,
    Image,
    ListView,
    TouchableHighlight,
    ActivityIndicatorIOS,
    Alert
} from 'react-native';

class ChefListPage extends Component {
    constructor(props) {
        super(props);

        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 != r2
        });
        this.client = new HttpsClient(config.baseUrl, true);     
        this.googleClient = new HttpsClient(config.googleGeoBaseUrl);
        this.state = {
            dataSource: ds.cloneWithRows([]),
            searchAddressResultDataSoruce: ds.cloneWithRows([]),
            showProgress: true,
            showLocationSearch:false,
            showChefSearch:false,
            isMenuOpen: false,
            chefView: {},
            initialPosition: {},
            lastPosition: {},
            city:'unknown',
            state:'unknown',
        };
    }

    async componentDidMount() {
        this.getLocation();
        await AuthService.loginWithEmail(config.email, config.password);
        console.log(this.state);
        let user = await AuthService.getPrincipalInfo();
        console.log(user);
        this.setState({ eater: user });
        this.fetchChefDishes();
    }

    async fetchChefDishes() {
        let response = await this.client.getWithAuth(config.chefListEndpoint);
        var chefs = response.data.chefs;
        var chefView = {};
        for (var chef of chefs) {
            chefView[chef.chefId] = chef.shopPictures;
        }
        this.setState({ dataSource: this.state.dataSource.cloneWithRows(chefs), showProgress: false, chefView: chefView });
    }
    
    getLocation(){
        var self = this;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.state.position = position;
                return self.googleClient.getWithoutAuth(config.reverseGeoCoding + position.coords.latitude + ',' + position.coords.longitude)
                    .then((res) => {
                        var city = 'unknown';
                        var state = 'unknown';
                        if (res.statusCode === 200 && res.data.status === 'OK' && res.data.results.length > 0) {
                            var results = res.data.results;
                            var address = results[0].formatted_address;
                            for (var component of results[0].address_components) {
                                for (var type of component.types) {
                                    if (type === 'locality') {
                                        city = component.long_name;
                                    }
                                    if (type === 'administrative_area_level_1') {
                                        state = component.short_name;
                                    }
                                }
                            }
                        }
                        self.setState({ city: city, state: state, GPSproxAddress: address });
                    });       
            },
            (error) => alert(error.message),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );   
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
                        <Image source={{ uri: chef.chefProfilePic }} style={styles.chefListView_Chef_profilePic}/>
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

    renderSearchResult(address){
        return <View>
                    <Text>{address.formatted_address}</Text>
                </View>
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
        }else if(this.state.showLocationSearch){
            return(
                <View style={styles.container}>
                    <TouchableHighlight style={styles.button} onPress={() => this.setState({showLocationSearch:false, isMenuOpen:false}) }>
                        <Text style={styles.buttonText}> Cancel</Text>
                    </TouchableHighlight>   
                    <View style={{alignSelf:'stretch', alignItems:'center'}}>
                        <Text> {this.state.city+','+this.state.state} </Text>  
                        <TextInput placeholder="City/State/Zip Code" style={styles.loginInput}
                        onChangeText = {(text)=>this.setState({searchAddress: text})}/>  
                        <TouchableHighlight style={styles.button} onPress={() => this.searchAddress() }>
                            <Text style={styles.buttonText}> Search Location</Text>
                        </TouchableHighlight>   
                        <ListView style={{height:300}}
                            dataSource = {this.state.searchAddressResultDataSoruce}
                            renderRow={this.renderSearchResult.bind(this) } />
                        <Text style={styles.title} onPress={()=>this.getLocation()}>Click get Current Location </Text>
                        <Text> {this.state.GPSproxAddress}</Text>                 
                    </View>   
                </View>
                
            );
        }else if(this.state.showChefSearch){
            return <View style={styles.container}>
                <TouchableHighlight style={styles.button} onPress={() => this.setState({ showChefSearch: false, isMenuOpen: false }) }>
                    <Text style={styles.buttonText}> Cancel</Text>
                </TouchableHighlight>
                <View style={{ alignSelf: 'stretch', alignItems: 'center' }}>
                    <TextInput placeholder="eg. chef name, dish, etc." style={styles.loginInput}
                        onChangeText = {(text) => this.setState({ searchFilter: text }) }/>
                    <TouchableHighlight style={styles.button} onPress={() => this.searchChef() }>
                        <Text style={styles.buttonText}> Search</Text>
                    </TouchableHighlight>
                    <Text>Next delivery in ... hours $ $$ $$$</Text>
                  
                </View>
            </View>                    
        }
        return (
            <SideMenu menu={menu} isOpen={this.state.isMenuOpen}>
                <View>
                    <View>
                        <Text>
                            <Text style={styles.title}>position: </Text>
                            {this.state.position.coords.longitude + ',' + this.state.position.coords.latitude}
                        </Text>
                        <Text>
                            <Text style={styles.title}>Current position: </Text>
                            {this.state.city+','+this.state.state}
                        </Text>               
                    </View>
                    <View style={{flexDirection:'row', flex:1}}>
                        <TouchableHighlight style={styles.button} onPress={() => this.setState({ isMenuOpen: true }) }>
                            <Text style={styles.buttonText}> Menu</Text>
                        </TouchableHighlight>
                        <TouchableHighlight style={styles.button} onPress={() => this.setState({showLocationSearch:true}) }>
                            <Text style={styles.buttonText}> Location</Text>
                        </TouchableHighlight> 
                        <TouchableHighlight style={styles.button} onPress={() => this.setState({showChefSearch:true}) }>
                            <Text style={styles.buttonText}> Search</Text>
                        </TouchableHighlight>  
                    </View>                 
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

    searchChef(){
        var filter = this.state.searchFilter;
        this.setState({showProgress:true});
        this.client.getWithAuth(config.chefListEndpoint)
        .then((res)=>{
            if(res.statusCode===200){
                var chefs = res.data.chefs;
                this.setState({dataSource: this.state.dataSource.cloneWithRows(chefs)})
            }
            this.setState({showChefSearch:false, showProgress:false});
        });
    }
    
    searchAddress(){
        var address = this.state.searchAddress;
        if(!address){
            Alert.alert( 'Warning', 'Enter a address',[ { text: 'OK' }]);
            return;
        }
        address = address.replace(/\s/g, "%20");
        this.googleClient.getWithoutAuth(config.searchAddress+address+'&key='+config.googleApiKey)
           .then((res)=>{
                if(res.statusCode===200 && res.data.status==='OK'){
                    var addresses = [];
                    for(var possibleAddress of res.data.results){
                        var onePossibility = {
                            formatted_address: possibleAddress.formatted_address,
                            lat: possibleAddress.geometry.location.lat,
                            lng: possibleAddress.geometry.location.lng,
                        };
                        addresses.push(onePossibility);
                    }
                    this.setState({searchAddressResult: addresses, searchAddressResultDataSoruce: this.state.searchAddressResultDataSoruce.cloneWithRows(addresses)});
                }
           })
    
    }
    
    goToDishList(chefId) {
        this.state.isMenuOpen=false;
        this.props.navigator.push({
            name: 'DishListPage',
            passProps: {
                chefId: chefId
            }
        });
    }

    // goToOrderHistory() {
    //     this.state.isMenuOpen=false;   
    //     this.props.navigator.push({
    //         name: 'HistoryOrderPage',
    //     });
    // }
}

var Menu = React.createClass({
    goToOrderHistory: function() {
        this.props.caller.setState({ isMenuOpen: false });
        this.props.navigator.push({
            name: 'HistoryOrderPage',
        });
    },

    render: function() {
        return (
            <View style={sideMenuStyle.sidemenu}>
                <Text style={sideMenuStyle.paddingMenuItem}>{this.props.eater.firstname} {this.props.eater.lastname}</Text>
                <Image source={require('./ok.jpeg') } />
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