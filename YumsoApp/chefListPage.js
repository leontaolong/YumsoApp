var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var SideMenu = require('react-native-side-menu');
var Swiper = require('react-native-swiper');
var MapPage = require('./mapPage');
var rating = require('./rating');
var dollarSign = require('./commonModules/dollarIconRender');
var profileImg = require('./TestImages/Obama.jpg');
var ballonIcon = require('./icons/ic_location_on_48pt_3x.png');
var labelIcon = require('./icons/2000px-Tag_font_awesome.svg.png');
var searchIcon = require('./icons/ic_search_48pt_3x.png');
var menuIcon = require('./icons/icon-menu.png');
import Dimensions from 'Dimensions';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;
console.log(windowHeight+" "+windowWidth);

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
            showProgress: true,
            showChefSearch:false,
            showLocSearch:false,
            chefView: {},
            city:'Seattle',
            state:'WA',
        };
    }

    async componentDidMount() {
        //this.getLocation();//todo: render croods may be undefined if it's too slow
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
                            self.setState({GPSproxAddress: {formatted_address: address, lat: position.coords.latitude, lng:position.coords.longitude}});
                        }
                        self.setState({ city: city, state: state });
                    });       
            },
            (error) => alert(error.message),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );   
    }

    renderRow(chef) {
        return (
            <View style={styleChefListPage.oneShopListView}>
                <View style={styleChefListPage.oneShopPhotoView}>
                    <Swiper showsButtons={false} height={windowHeight/3.0} horizontal={true} autoplay={true}
                        dot={<View style={{ backgroundColor: 'rgba(0,0,0,.2)', width: 5, height: 5, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3, }} />}
                        activeDot={<View style={{ backgroundColor: '#FFF', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3, }} />} >
                        {this.state.chefView[chef.chefId].map((picture) => {
                            return (
                                <TouchableHighlight key={picture} onPress={() => this.navigateToShopPage(chef.chefId)} underlayColor='#C0C0C0'>
                                    <Image source={{ uri: picture }} style={styles.chefListView_Chef_shopPic}
                                        onError={(e) => this.setState({ error: e.nativeEvent.error, loading: false })}/>
                                </TouchableHighlight>
                            );
                        }) }
                    </Swiper>
                </View>
                <View style={{flexDirection:'row',marginBottom:25}}>
                    <View style={styleChefListPage.chefListView_chef_col1}>
                      <View style={styleChefListPage.oneShopChefPhotoDistanceView}>
                      <TouchableHighlight style={styleChefListPage.oneShopChefPhotoView} onPress={() => this.navigateToShopPage(chef.chefId) }>
                          <Image source={{ uri: chef.chefProfilePic }} style={styleChefListPage.chefPhoto}/>
                      </TouchableHighlight>
                      
                      </View>
                    </View>
                    <View style={styleChefListPage.chefListView_chef_col2}>
                          <View style={{position:'absolute',right:windowWidth/28,top:windowHeight/65.53,width:windowWidth*0.69}}>
                          <Text style={styleChefListPage.oneShopNameText}>{chef.shopname}</Text>
                          </View>
                          
                          <View style={styleChefListPage.labelView}>
                                <View style={{flexDirection:'row',width:windowWidth/3.6,alignItems:'flex-start'}}>
                                    <View style={styleChefListPage.labelIconView}>
                                    <Image style={styleChefListPage.labelIcon} source={labelIcon}/>
                                    </View>
                                    <Text style={styleChefListPage.labelText}>Spicy</Text>
                                </View>
                                <View style={styleChefListPage.ratingView}>
                                        {rating.renderRating(3)}
                                </View>
                                <Text style={styleChefListPage.reviewNumberText}>10 Reviews</Text>
                          </View>
                          <View style={styleChefListPage.labelDollarView}>
                             <View style={styleChefListPage.distanceView}>
                                <View style={styleChefListPage.labelIconView}>
                                   <Image style={styleChefListPage.ballonIcon} source={ballonIcon}/>
                                </View>
                                <Text style={styleChefListPage.distanceText}>1.5 miles</Text>
                            </View>
                             <View style={{flexDirection:'row',width:windowWidth/3.6,alignItems:'flex-start'}}>
                                <View style={styleChefListPage.labelIconView}>
                                   <Image style={styleChefListPage.labelIcon} source={labelIcon}/>
                                </View>
                                <Text style={styleChefListPage.labelText}>Japanese</Text>
                             </View>
                             <View style={styleChefListPage.ratingView}>
                                    {dollarSign.renderLevel(3)}
                             </View>
                             <Text style={styleChefListPage.reviewNumberText2}>10 Reviews</Text>
                          </View>
                    </View>
                </View>
            </View>
        );
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
        }else if(this.state.showLocSearch){
            return(<MapPage onSelectAddress={this.mapDone.bind(this)} onCancel={this.onCancelMap.bind(this)} eater={this.state.eater}/>);   
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
                <View style={styles.container}>                    
                    <View style={styleChefListPage.headerBannerView}>
                        <View style={styleChefListPage.menuButtonView}>
                          <TouchableHighlight onPress={() => this.setState({ isMenuOpen: true }) }>
                            <Image source={menuIcon} style={styleChefListPage.menuIcon}/>
                          </TouchableHighlight>
                        </View>
                        <TouchableHighlight onPress={() => this.setState({showLocSearch:true}) }>
                        <View style={styleChefListPage.locationView}>
                            <View style={{marginTop:3,marginLeft:2,}}><Image source={ballonIcon} style={styleChefListPage.locationIcon}/></View>
                            <Text style={styleChefListPage.locationText}>{this.state.city}</Text>
                        </View>
                        </TouchableHighlight>
                        <View style={styleChefListPage.searchButtonView}>
                          <TouchableHighlight onPress={() => this.setState({showChefSearch:true}) }>
                            <Image source={searchIcon} style={styleChefListPage.searchIcon}/>
                          </TouchableHighlight>
                        </View>
                    </View> 
          
                    <ListView style={styles.dishListView}
                        dataSource = {this.state.dataSource}
                        renderRow={this.renderRow.bind(this) } />
                </View>
            </SideMenu>
        );
    }
    
    mapDone(address){
         if(address){
             Alert.alert( '', 'Your delivery location is set to '+address.formatted_address,[ { text: 'OK' }]); 
             //todo: get chef use location info;                 
         }
         this.setState({showLocSearch:false, pickedAddress:address, city:address.city, state:address.state});
    }
    
    onCancelMap(){
         this.setState({showLocSearch:false});
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
 
    navigateToShopPage(chefId){
        this.setState({ isMenuOpen: false });
        this.props.navigator.push({
            name: 'ShopPage', 
            passProps:{
                chefId:chefId,
                defaultDeliveryAddress: this.state.pickedAddress,
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
                    callback: this.props.caller.componentDidMount.bind(this.props.caller),//todo: change to force re-render.
                    backCallback: this.props.caller.componentDidMount.bind(this.props.caller)
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
                    callback: this.props.caller.componentDidMount.bind(this.props.caller),
                    backCallback: this.props.caller.componentDidMount.bind(this.props.caller)
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
        
        if(this.props.eater && this.props.eater.eaterProfilePic){
            profileImg = {uri:this.props.eater.eaterProfilePic};
        }
        var profile;
        if(!isAuthenticated){
            profile = <Image source={profileImg} style={sideMenuStyle.chefPhoto}/>;
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
        flexDirection:'row',
        height:windowHeight/16.4,
        backgroundColor:'#fff',
    },
    menuButtonView:{
        flex:0.1/3,
        width:windowWidth/3,
        alignItems:'flex-start',
        paddingLeft:windowWidth/27.6,
        paddingTop:windowHeight/73.6,
    },
    menuIcon:{
        width:windowHeight/29.4,
        height:windowHeight/29.4,
    },
    searchIcon:{
        width:windowHeight/24.5,
        height:windowHeight/24.5,
    },
    locationView:{
        flex:0.1/3, 
        flexDirection:'row',
        width:windowWidth/3,
        justifyContent:'center',
        paddingTop:windowHeight/52.6,   
    },
    locationIcon:{
        width:windowHeight/49,
        height:windowHeight/49,
    },
    locationText:{
        fontSize:windowHeight/43.3,
        color:'#696969',
    },
    searchButtonView:{
        flex:0.1/3, 
        width:windowWidth/3,
        alignItems:'flex-end',
        paddingRight:windowWidth/41.4,
        paddingTop:windowHeight/105.14,     
    },
    oneShopListView:{
        alignSelf:'stretch',
        backgroundColor:'#FFFFFF',  
    },
    oneShopPhotoView:{
        height:windowHeight/3,
        alignSelf:'stretch',
    },
    chefListView_chef_col1:{
        flex:1/4,
        flexDirection:'row', 
        justifyContent:'flex-end',
    },
    chefListView_chef_col2:{
        flex:3/4,
        flexDirection:'column',
        paddingTop:windowHeight/73.6,
        paddingLeft:windowWidth/41.4,
        alignItems:'flex-start',
    },
    oneShopChefPhotoDistanceView:{
        flexDirection:'column',
    },
    oneShopChefPhotoView:{
        top:-windowWidth/6/2.5,
        position: 'relative',
    },
    chefPhoto:{
        height:windowWidth/5,
        width:windowWidth/5,
        borderRadius: 12, 
        borderWidth: 0, 
        overflow: 'hidden',
    },
    distanceView:{
        marginRight:10,
        flexDirection:'row',
    },
    ballonIcon:{
        width:windowHeight/52.6,
        height:windowHeight/52.6,
    },
    distanceText:{
        fontSize:12,
        color:'#696969',
        marginLeft:2,
    },
    oneShopNameText:{
        fontSize:15,
        fontWeight:'600',
        alignSelf:'flex-start',
    },
    labelIcon:{
        width:windowHeight/56.7, 
        height:windowHeight/56.7,
    },
    labelView:{
        marginTop:windowHeight/105.14,
        flexDirection:'row',
        flex:0.8,
        position:'absolute',
        right:windowWidth/28,
        top:windowHeight/22.53,
    },
    labelDollarView:{
        marginTop:windowHeight/105.14,
        flexDirection:'row',
        flex:1,
        position:'absolute',
        right:windowWidth/28,
        top:windowHeight/12.72,
    },
    labelIconView:{
        marginTop:1,
    },
    labelText:{
        fontSize:12,
        color:'#696969',
        marginLeft:windowWidth/82.8,
    },
    ratingView:{
        flexDirection:'row',
    },
    reviewNumberText:{
        fontSize:12,
        color:'#A9A9A9',
        marginLeft:windowWidth/138,
    },
    reviewNumberText2:{
        fontSize:12,
        color:'#fff',
        marginLeft:windowWidth/138,
    }

});

module.exports = ChefListPage;