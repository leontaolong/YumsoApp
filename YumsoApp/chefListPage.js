'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var SideMenu = require('react-native-side-menu');
var Swiper = require('react-native-swiper');
var MapPage = require('./mapPage');
var rating = require('./rating');
var dollarSign = require('./commonModules/dollarIconRender');
var profileImg = require('./icons/defaultAvatar.jpg');
var ballonIcon = require('./icons/icon-location-white.png');
var favoriteIcon = require('./icons/icon-liked-white.png');
var labelIcon = require('./icons/icon-label.png');
var searchIcon = require('./icons/ic_search_48pt_3x.png');
var menuIcon = require('./icons/icon-menu.png');
var notlikedIcon = require('./icons/icon-unliked.png')
var likedIcon = require('./icons/icon-liked.png');
var likeIcon = likedIcon;
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
                    <Swiper showsButtons={false} height={windowHeight*0.388} horizontal={true} autoplay={true}
                        dot={<View style={{ backgroundColor: 'rgba(0,0,0,.2)', width: 5, height: 5, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3, }} />}
                        activeDot={<View style={{ backgroundColor: '#FFF', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3, }} />} >
                        {this.state.chefView[chef.chefId].map((picture) => {
                            return (
                                <TouchableHighlight key={picture} onPress={() => this.navigateToShopPage(chef.chefId)} underlayColor='#C0C0C0'>
                                    <Image source={{ uri: picture }} style={styleChefListPage.chefListViewChefShopPic}
                                        onError={(e) => this.setState({ error: e.nativeEvent.error, loading: false })}/>
                                </TouchableHighlight>
                            );
                        }) }
                    </Swiper>
                </View>
                <View style={styleChefListPage.shopInfoView}>
                    <TouchableHighlight style={styleChefListPage.chefPhotoView} underlayColor={'transparent'} onPress={() => this.navigateToShopPage(chef.chefId) }>
                       <Image source={{ uri: chef.chefProfilePic }} style={styleChefListPage.chefPhoto}/>
                    </TouchableHighlight>
                    
                    <View style={styleChefListPage.shopInfoSection}>
                       <View style={styleChefListPage.shopInfoRow1}>
                         <View style={styleChefListPage.shopNameView}>
                            <Text style={styleChefListPage.oneShopNameText}>{chef.shopname}</Text>
                         </View>
                         <View style={styleChefListPage.likeIconView}>
                            <Image source={likeIcon} style={styleChefListPage.likeIcon}></Image>
                         </View>
                       </View>
                       
                       <View style={styleChefListPage.shopInfoRow2}>
                          <View style={styleChefListPage.shopRatingView}>
                             <View style={{flexDirection:'row',alignSelf:'center'}}>
                             {rating.renderRating(chef.rating)}
                             </View>
                             <Text style={styleChefListPage.reviewNumberText}>10 Reviews</Text>
                          </View>
                          <View style={styleChefListPage.distanceDollarSignView}>
                             <Text style={styleChefListPage.distanceDollarSignText}>1.5 miles | {dollarSign.renderLevel(3)}</Text>
                          </View>   
                       </View>
                       
                       <View style={styleChefListPage.shopInfoRow3}>
                          <View style={styleChefListPage.labelView}>
                            <Image style={styleChefListPage.labelIcon} source={labelIcon}/><Text style={styleChefListPage.labelText}>spicy</Text>
                          </View>
                          <View style={styleChefListPage.labelView}>
                            <Image style={styleChefListPage.labelIcon} source={labelIcon}/><Text style={styleChefListPage.labelText}>Japanese</Text>
                          </View>
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
                        <View style={styles.headerLeftView}>
                          <TouchableHighlight style={styles.menuButtonView} underlayColor={'transparent'}  onPress={() => this.setState({ isMenuOpen: true }) }>
                            <Image source={menuIcon} style={styles.menuIcon}/>
                          </TouchableHighlight>
                        </View>
                        <TouchableHighlight underlayColor={'transparent'} onPress={() => this.setState({showLocSearch:true}) }>
                        <View style={styles.titleView}>
                            <Text style={styles.titleText}>{this.state.city}</Text>
                        </View>
                        </TouchableHighlight>
                        <View style={styles.headerRightView}>
                          <TouchableHighlight style={styles.headerRightTextButtonView} underlayColor={'transparent'} onPress={() => this.setState({showChefSearch:true}) }>
                              <Text style={styles.headerRightTextButtonText}>Filter</Text>
                          </TouchableHighlight>
                        </View>
                    </View>
                    <View style={styleChefListPage.orangeTopBannerView}>
                        <View style={styleChefListPage.orangeTopBannerButtonView}>
                          <TouchableHighlight style={{flexDirection:'row',justifyContent:'center'}} underlayColor={'transparent'}  onPress={() => this.setState({showLocSearch:true}) }>
                             <Image style={styleChefListPage.orangeTopBannerButtonIcon} source={ballonIcon}/>
                          </TouchableHighlight>
                        </View>
                        <View style={styleChefListPage.orangeTopBannerButtonView}>
                           <TouchableHighlight style={{flexDirection:'row',justifyContent:'center'}} underlayColor={'transparent'}  onPress={() => this.setState({showLocSearch:true}) }>
                             <Image style={styleChefListPage.orangeTopBannerButtonIcon} source={favoriteIcon}/>
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
         this.setState({showLocSearch:false, pickedAddress:address, city:address.city, state:address.state, isMenuOpen: false});
    }
    
    onCancelMap(){
         this.setState({showLocSearch:false, isMenuOpen: false});
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
                eater:this.state.eater,
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
                <View style={{height:windowHeight*0.09}}></View>
                <Text style={sideMenuStyle.paddingMenuItem}>Notification</Text>
                <Text onPress={this.goToOrderHistory} style={sideMenuStyle.paddingMenuItem}>Orders History</Text>
                <Text onPress={()=>this.goToEaterPage()} style={sideMenuStyle.paddingMenuItem}>My Profile</Text>
                <Text style={sideMenuStyle.paddingMenuItem}>Invite Friends</Text>
                <Text style={sideMenuStyle.paddingMenuItem}>Promotion</Text>
                <Text style={sideMenuStyle.paddingMenuItem}>Contact Us</Text>
                <Text onPress={isAuthenticated?this.logOut:this.logIn} style={sideMenuStyle.paddingMenuItem}>{isAuthenticated?'Log out':'Log in'}</Text>
                <View style={{height:windowHeight*0.035}}></View>
                <View style={sideMenuStyle.paddingMenuItemAboutView}>
                   <Text style={sideMenuStyle.paddingMenuItemAbout}>About</Text>
                </View>
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
        backgroundColor:'#7BCBBE',
        marginTop:20,
    },
    chefPhoto:{
        width:windowWidth*2/3.0,
        height:windowWidth*2/3.0,
    },
    paddingMenuItem: {
        paddingLeft:windowWidth*0.064,
        paddingVertical:windowWidth*0.0227,
        color:'#fff',
    },
    paddingMenuItemAbout: {
        paddingVertical: windowWidth*0.02,
        color:'#fff',
        borderTopWidth:1,
        borderColor:'#fff',
    },
    paddingMenuItemAboutView:{
        borderTopWidth:1,
        borderColor:'#fff',
        width:windowWidth*0.226,
        marginLeft:windowWidth*0.064,
    },
});

var styleChefListPage = StyleSheet.create({
    headerBannerView:{
        flexDirection:'row',
        height:windowHeight*0.066,
        backgroundColor:'#fff',
    },
    orangeTopBannerView:{
        backgroundColor:'#FFCC33',
        height:windowHeight*0.081,
        width:windowWidth,
        flexDirection:'row',
    },
    orangeTopBannerButtonView:{
        width:windowWidth*0.5,
        flexDirection:'row',
        justifyContent:'center',
    },
    orangeTopBannerButtonIcon:{
        width:windowWidth*0.08,
        height:windowWidth*0.08,
        alignSelf:'center',
    },
    oneShopListView:{
        alignSelf:'stretch',
        backgroundColor:'#FFFFFF',  
    },
    oneShopPhotoView:{
        height:windowHeight*0.388,
        alignSelf:'stretch',
    },
    chefListViewChefShopPic:{
        height:windowHeight*0.388,
        width:windowWidth,
        alignSelf:'stretch',
    },
    shopInfoView:{
        flexDirection:'row',
        height:windowHeight*0.14,
        paddingTop:windowHeight*0.0225,
        paddingBottom:windowHeight*0.02698,
        paddingHorizontal:windowWidth*0.032,
    },
    chefPhotoView:{
        marginRight:windowWidth*0.04, 
    },
    chefPhoto:{
        height:windowWidth*0.16,
        width:windowWidth*0.16,
        borderRadius: 12, 
        borderWidth: 0, 
        overflow: 'hidden',
    },
    shopInfoSection:{
        flex:1,
        flexDirection:'column',
        justifyContent:'space-between',
        height:windowWidth*0.165,        
    },
    shopInfoRow1:{
        flexDirection:'row',
    },
    shopNameView:{
       flex:0.93,
       flexDirection:'row',
       alignItems:'flex-start', 
    }, 
    oneShopNameText:{
       fontSize:18,
       fontWeight:'bold',
       color:'#4A4A4A',
    },
    likeIconView:{
       flex:0.07,
       flexDirection:'row',
       alignItems:'flex-end', 
    }, 
    likeIcon:{
        width:windowWidth*0.05,
        height:windowWidth*0.05,
    },
    shopInfoRow2:{
        flexDirection:'row',
    },
    shopRatingView:{
        flex:0.72,
        flexDirection:'row',
        alignItems:'flex-start',
    },
    reviewNumberText:{
        fontSize:11,
        color:'#4A4A4A',
        marginLeft:windowWidth*0.0187,
        alignSelf:'center',
    },
    distanceDollarSignView:{
        flex:0.28,
        flexDirection:'row',
        alignItems:'flex-end',
    },
    distanceDollarSignText:{
        fontSize:11,
        color:'#4A4A4A',
        alignSelf:'center',
    },
    shopInfoRow3:{
        flexDirection:'row',
    },
    labelView:{
        flexDirection:'row',
        justifyContent:'flex-start',
        marginRight:windowWidth*0.04,
    },   
    labelIcon:{
        width:15, 
        height:15,
        alignSelf:'center',
    },
    labelText:{
        fontSize:12,
        color:'#FFCC33',
        marginLeft:windowWidth/82.8,
        alignSelf:'center',
    },    
});

module.exports = ChefListPage;