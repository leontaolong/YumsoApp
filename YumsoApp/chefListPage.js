var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var SideMenu = require('react-native-side-menu');
var Swiper = require('react-native-swiper')
import Dimensions from 'Dimensions';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

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
        this.getLocation();//todo: render croods may be undefined if it's too slow
        if(config.autoLogin){//this is for debugging so to auto login
           await AuthService.loginWithEmail(config.email, config.password);
        }
        let status = await AuthService.getLoginStatus();
        let eater = undefined;
        let principal = undefined;
        if(status===true){
            eater = await AuthService.getEater();
            principal = await  AuthService.getPrincipalInfo();
        }
        //todo: when token expired, we shall clear garbage but we need also figure out a way to auto authenticate for long life token or fb token to acquire again.
        //todo: clear the token and cache.      
        this.setState({ principal: principal, eater:eater });
        this.fetchChefDishes();
    }

    async fetchChefDishes() {
        let response = await this.client.getWithoutAuth(config.chefListEndpoint);
        var chefs = response.data.chefs;
        var chefView = {};
        for (var chef of chefs) {
            chefView[chef.chefId] = chef.starDishPictures;
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
                                <TouchableHighlight key={picture} onPress={() => this.navigateToShopPage(chef.chefId) } underlayColor='#C0C0C0'>
                                    <Image source={{ uri: picture }} style={styles.chefListView_Chef_shopPic}
                                        onError={(e) => this.setState({ error: e.nativeEvent.error, loading: false }) }/>
                                </TouchableHighlight>
                            );
                        }) }
                    </Swiper>
                </View>
                <View style={styles.chefListView_chef_Info}>
                    <View style={styles.chefListView_chef_col1}>
                      <TouchableHighlight style={styles.button} onPress={() => this.navigateToShopPage(chef.chefId) }>
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

    renderSearchResult(address){
        return <View>
                    <Text>{address.formatted_address}</Text>
                </View>
    }
    
    render() {
        const menu = <Menu navigator={this.props.navigator} eater={this.state.eater} principal={this.state.principal} caller = {this}/>;
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
                    <View style={styleChefListPage.headerBannerView}>
                        <View style={styleChefListPage.menuButtonView}>
                        <TouchableHighlight style={styles.button} onPress={() => this.setState({ isMenuOpen: true }) }>
                            <Text style={styles.buttonText}> Menu</Text>
                        </TouchableHighlight>
                        </View>
                        <View style={styleChefListPage.locationView}>
                        <TouchableHighlight style={styles.button} onPress={() => this.setState({showLocationSearch:true}) }>
                            <Text style={styles.buttonText}> Location</Text>
                        </TouchableHighlight>
                        </View>
                        <View style={styleChefListPage.searchButtonView}>
                        <TouchableHighlight style={styles.button} onPress={() => this.setState({showChefSearch:true}) }>
                            <Text style={styles.buttonText}> Search</Text>
                        </TouchableHighlight>
                        </View>
                    </View> 
                    <View  style={{flex:0.1, flexDirection:'column',height:40,backgroundColor:'#fff',}}>
                        <Text>
                            <Text style={styles.title}>position: </Text>
                            {this.state.position.coords.longitude + ',' + this.state.position.coords.latitude}
                        </Text>
                        <Text>
                            <Text style={styles.title}>Current position: </Text>
                            {this.state.city+','+this.state.state}
                        </Text>               
                    </View>             
                    <ListView style={styles.chefListView}
                        dataSource = {this.state.dataSource}
                        renderRow={this.renderRow.bind(this) } />
                    <View style={styles.toolbar}>
                        <TouchableHighlight style={styles.toolbarTitle}>
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
        this.client.getWithoutAuth(config.chefListEndpoint)
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
 
    navigateToShopPage(chefId){
        this.setState({ isMenuOpen: false });
        this.props.navigator.push({
            name: 'ShopPage', 
            passProps:{
                chefId:chefId,
                callback: this.componentDidMount.bind(this) //todo: force rerender or just setState
            }
        });    
    }  
}

var Menu = React.createClass({
    goToOrderHistory: function() {
        this.props.caller.setState({ isMenuOpen: false });
        if(!this.props.eater){
            this.props.navigator.push({
                name: 'LoginPage',
                passProps:{
                    callback: this.props.caller.componentDidMount.bind(this.props.caller)//todo: change to force re-render.
                }
            });  
            return;
        }
        this.props.navigator.push({
            name: 'HistoryOrderPage',
        });
    },

    logOut: function(){
        return AuthService.logOut()
        .then(()=>{
            Alert.alert( '', 'You have successfully logged out',[ { text: 'OK' }]); 
            this.props.caller.setState({ isMenuOpen: false });
            this.props.navigator.push({
                name: 'LoginPage',
                passProps:{
                    callback: this.props.caller.componentDidMount.bind(this.props.caller)
                }
            }); 
        });    
    },
    
    logIn: function(){
        this.props.caller.setState({ isMenuOpen: false });
        this.props.navigator.push({
            name: 'LoginPage',
            passProps: {
                callback: this.props.caller.componentDidMount.bind(this.props.caller)
            }            
        }); 
    },
    
    goToEaterPage: function() {
        this.props.caller.setState({ isMenuOpen: false });
        this.props.navigator.push({
            name: 'EaterPage',
            passProps:{
                eater:this.props.eater,
                principal:this.props.principal,
                callback: function(eater){
                    this.props.caller.setState({eater:eater});
                }.bind(this)
            }
        });
    },
    
    render: function() {
        let isAuthenticated = this.props.eater!=undefined;
        var displayName = isAuthenticated? (this.props.eater.firstname + ' '+ this.props.eater.lastname): '';
        var profileImg = require('./TestImages/Obama.jpg');
        if(this.props.eater && this.props.eater.eaterProfilePic){
            profileImg = {uri:this.props.eater.eaterProfilePic};
        }
        var profile;
        if(!isAuthenticated){
            profile = <Image source={profileImg} style={styles.chefListView_Chef_profilePic}/>;
        }else{
            profile = <TouchableHighlight style = {styles.chefProfilePic} onPress={()=>this.goToEaterPage()}>
                        <Image source={profileImg} style={sideMenuStyle.chefPhoto}/>
                     </TouchableHighlight>;
        }
        return (
            <View style={sideMenuStyle.sidemenu}>
                {profile}
                <View style={{height:windowHeight/5.0}}></View>
                <Text style={sideMenuStyle.paddingMenuItem}>My Favorites</Text>
                <Text onPress={this.goToOrderHistory} style={sideMenuStyle.paddingMenuItem}>History Orders</Text>
                <Text onPress={this.goToOrderHistory} style={sideMenuStyle.paddingMenuItem}>Settings</Text>
                <Text style={sideMenuStyle.paddingMenuItem}>Invite Friends</Text>
                <Text style={sideMenuStyle.paddingMenuItem}>Contact Us</Text>
                <Text onPress={isAuthenticated?this.logOut:this.logIn} style={sideMenuStyle.paddingMenuItem}>{isAuthenticated?'Log out':'Log in'}</Text>
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
        height:windowHeight,
        width:windowWidth*2/3.0,
        backgroundColor:'#ff9933',
        marginTop:20,
    },
    chefPhoto:{
        width:windowWidth*2/3.0,
        height:windowWidth*2/3.0,
    },
    paddingMenuItem: {
        paddingLeft:30,
        paddingVertical: 10,
        color:'#fff',
    },
});

var styleChefListPage = StyleSheet.create({
    headerBannerView:{
        flex:0.1,
        flexDirection:'row',
        height:50,
        backgroundColor:'#fff',
        marginTop:20,
    },
    menuButtonView:{
        flex:0.1/3,
        width:windowWidth/3,
        alignItems:'flex-start',
    },
    locationView:{
      flex:0.1/3, 
      width:windowWidth/3,
      alignItems:'center',     
    },
    searchButtonView:{
      flex:0.1/3, 
      width:windowWidth/3,
      alignItems:'flex-end',     
    },
});

module.exports = ChefListPage;