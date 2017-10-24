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
var dateRender = require('./commonModules/dateRender');
var commonAlert = require('./commonModules/commonAlert');
var commonWidget = require('./commonModules/commonWidget');
var NetworkUnavailableScreen = require('./networkUnavailableScreen');
var profileImgNoSignIn = require('./icons/defaultAvatar.jpg');
var ballonIcon = require('./icons/icon-location-2.0.png');
var whiteLikeIcon = require('./icons/icon-liked-white.png');
var labelIcon = require('./icons/icon-label-grey.png');
var menuIcon = require('./icons/icon-menu.webp');
var filterIcon = require('./icons/icon-filter.png');
var notlikedIcon = require('./icons/icon-unliked.png')
var likedIcon = require('./icons/icon-liked-red.png');
var heartLineIcon = require('./icons/icon-heart-line.png');
var heartFillsIcon = require('./icons/icon-heart-fills.png');
var backIcon = require('./icons/icon-back.png');
var closeIcon = require('./icons/icon-close.png');
var sortCriteriaIconGrey = require('./icons/icon-rating-grey-empty.webp');
var sortCriteriaIconOrange = require('./icons/icon-rating-orange-empty.webp');
var RefreshableListView = require('react-native-refreshable-listview');
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen')

var meOff = require('./icons/me_off.png');
var meOn = require('./icons/me_on.png');

var ordersOff = require('./icons/orders_off.png');
var ordersOn = require('./icons/orders_on.png');

var shopsOff = require('./icons/shops_off.png');
var shopsOn = require('./icons/shops_on.png');


import Dimensions from 'Dimensions';
import Tabs from 'react-native-tabs';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

var windowHeightRatio = windowHeight / 677;
var windowWidthRatio = windowWidth / 375;

import React, {
    Component,
    StyleSheet,
    Text,
    View,
    Image,
    ListView,
    TouchableHighlight,
    TouchableOpacity,
    ActivityIndicatorIOS,
    PushNotificationIOS,
    Alert,
    AsyncStorage,
    AppState,
    Linking
} from 'react-native';

class ChefListPage extends Component {
    constructor(props) {
        super(props);
        var routeStack = this.props.navigator.state.routeStack;
        let eater = undefined;
        if(routeStack.length>0 && routeStack[routeStack.length-1].passProps){
            eater = routeStack[routeStack.length-1].passProps.eater;
        }
        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 != r2
        });
        this.client = new HttpsClient(config.baseUrl, true);
        this.googleClient = new HttpsClient(config.googleGeoBaseUrl);
        this.state = {
            eater: eater,
            dataSource: ds.cloneWithRows([]),
            showProgress: false,
            showChefSearch:false,
            showNetworkUnavailableScreen:false,
            showLocSearch:false,
            showFavoriteChefsOnly:false,
            chefView: {},
            chefsDictionary: {},
            foodTagArr: [],
            selectedFoodTag: null,
            city:'Seattle',
            state:'WA',
            zipcode:'98105',
            pickedAddress:undefined,
            priceRankFilter:{},
            sortCriteriaIcon:sortCriteriaIconGrey,
            deviceToken: null,
            currentTime: new Date().getTime(),
            showUpdateAppBanner:false,
            showPromoAppBanner:true,
            selectedSortKey: null,
            selectedShopType: null,
            selectedPriceLevels: [],
        };

        this.responseHandler = function (response, msg) {
            if(response.statusCode==400){
               Alert.alert( 'Warning', response.data,[ { text: 'OK' }]);
            }else if (response.statusCode === 401) {
               return AuthService.logOut()
                    .then(()=>{
                        delete this.state.eater;
                        this.props.navigator.push({
                            name: 'LoginPage',//todo: fb cached will signin and redirect back right away.
                            passProps: {
                                callback: function (eater) {
                                    this.setState({ eater: eater });
                                    this.componentDidMount();
                                }.bind(this)
                            }
                        });
                    });
            } else {
                 Alert.alert( 'Internal Error', 'Server under maintenance. Please try again later',[ { text: 'OK' }]);
            }
        };
    }

    async componentDidMount() {
        if(!this.state.pickedAddress){
           this.setState({showProgress:true});
           await this.getLocation().catch((err)=>{
                 this.setState({GPSproxAddress:undefined,showProgress:false,pickedAddress:{lat:47.6062095, lng:-122.3320708}});
                 //commonAlert.locationError(err);
           });//todo: really wait??
           this.setState({showProgress:false})
        }
        let eater = this.state.eater;
        if(!eater || !eater.chefFilterSettings){
            eater = await AuthService.getEater();
        }
        let principal = await AuthService.getPrincipalInfo();
        if(eater){
            var priceLevels = [];
            for (let i = 0; i <=2; i++) {
                if (eater.chefFilterSettings.priceRankFilter[i]) 
                    priceLevels.push(i + 1); // if true, add the price level to the priceLevels array  
            }
           this.setState({ 
                selectedPriceLevels: priceLevels,
                priceRankFilter:eater.chefFilterSettings.priceRankFilter, 
                withBestRatedSort:eater.chefFilterSettings.withBestRatedSort,             
                priceRankFilterOrigin:JSON.parse(JSON.stringify(eater.chefFilterSettings.priceRankFilter)), 
                withBestRatedSortOrigin:eater.chefFilterSettings.withBestRatedSort,
                sortCriteriaIcon:eater.chefFilterSettings.withBestRatedSort ? sortCriteriaIconOrange:sortCriteriaIconGrey});
        }
        this.setState({ principal: principal, eater: eater });
        this.fetchChefDishes();
    }

    async fetchChefDishes() {
        if(Object.values(this.state.chefsDictionary).length==0){
           this.setState({showProgress:true});
        }
        var query=''; //todo: should include seattle if no lat lng provided
        if(this.state.GPSproxAddress){
           query = '?lat=' + this.state.GPSproxAddress.lat + '&lng=' + this.state.GPSproxAddress.lng;
        }
        if(this.state.pickedAddress){
           query = '?lat=' + this.state.pickedAddress.lat + '&lng=' + this.state.pickedAddress.lng;
        }
        try{
            var response = await this.client.getWithoutAuth(config.chefListEndpoint + query);
        }catch(err){
            this.setState({showProgress: false,showNetworkUnavailableScreen:true});
            commonAlert.networkError(err);
            return;
        }

        if(response && (response.statusCode==200 || response.statusCode==202) && response.data){
           var chefs = response.data.chefs;
           var chefView = {};
           var chefsDictionary = {};
           var foodTags =['All']; // put foodTag 'All' at first
           var hasFoodTagOther = false;
           for (var chef of chefs) {
                if(chef){//Todo:undefined check for all
                    let starDishPictures=[];
                    if(chef.highLightDishIds){
                      for(var dishId in chef.highLightDishIds){
                          starDishPictures.push(chef.highLightDishIds[dishId]);
                      }
                    }
                    chefView[chef.chefId] = starDishPictures;
                    chefsDictionary[chef.chefId] = chef;

                    if (chef.foodTag == 'Other')
                        hasFoodTagOther = true;
                    else if (!foodTags.includes(chef.foodTag)) {
                        foodTags.push(chef.foodTag);
                    }
                }
            }
            // put foodTag 'Other' at last
            if (hasFoodTagOther)
                foodTags.push("Other");

            this.setState({ dataSource: this.state.dataSource.cloneWithRows(chefs), showProgress: false, showNetworkUnavailableScreen:false, chefView: chefView, chefsDictionary: chefsDictionary, currentTime: new Date().getTime(), foodTagArr:foodTags});
        }else{
            this.setState({showProgress: false,showNetworkUnavailableScreen:true});
            commonAlert.networkError(response);
        }
    }

    getLocation(){
        var self = this;
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.state.position = position;
                    return self.googleClient.getWithoutAuth(config.reverseGeoCoding + position.coords.latitude + ',' + position.coords.longitude)
                        .then((res) => {
                            var city = 'unknown';
                            var state = 'unknown';
                            var zipcode = 'unknown';
                            if ((res.statusCode === 200 || res.statusCode === 202) && res.data.status === 'OK' && res.data.results.length > 0) {
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
                                        if (type === 'postal_code') {
                                            zipcode = component.short_name;
                                        }
                                    }
                                }
                                self.setState({ GPSproxAddress: { formatted_address: address, lat: position.coords.latitude, lng: position.coords.longitude, state: state, city: city}, city: city, state: state, zipcode :zipcode});
                            }
                            resolve();
                        }).catch((err)=>{
                            reject(new Error('Cannot get city name'));
                        });
                },
                (err) => {
                    reject(new Error('Location can not be retrieved. Please enable network connection and location service'));
                },
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );
        });
    }

      renderRow(chef) {
        if(!chef){
           return null;
        }
        var like = false;
        if (this.state.eater && this.state.eater.favoriteChefs) {
            like = this.state.eater.favoriteChefs.indexOf(chef.chefId) !== -1;
        }
        var likedIcon = <View style={styles.iconCircle}><Image source={this.getCurrentLikeIcon(like)} style={styles.likeIconCircled}/></View>

        //console.log(chef);
        var nextDeliverTimeView = null;
        var oneWeekLater = new Date().setHours(0, 0, 0, 0) + 7 * 24 * 60 * 60 * 1000;
        if(chef.nextDeliverTime && chef.nextDeliverTime>this.state.currentTime && chef.nextDeliverTime<oneWeekLater){
           nextDeliverTimeView = <View style={styleChefListPage.nextDeliverTimeView}>
                                      <Text style={styleChefListPage.nextDeliverTimeText}>Next: {dateRender.renderDate4(chef.nextDeliverTime)}</Text>
                                 </View>;
        }else{
           nextDeliverTimeView = <View style={styleChefListPage.nextDeliverTimeView}>
                                      <Text style={styleChefListPage.nextDeliverTimeText}>Next: None in 7 days</Text>
                                 </View>;
        }

        var yumsoExclusiveTag = undefined;
        if(chef.yumsoExclusiveBadge)
           yumsoExclusiveTag = <Text style={[styleChefListPage.labelText, {color:"#7adfc3"}]}> Exclusive</Text>


        if(chef.chefProfilePicUrls && chef.chefProfilePicUrls.small){
           var chefProfilePic = chef.chefProfilePicUrls.small;
        }else{
           var chefProfilePic = chef.chefProfilePic;
        }

        return (
            <View style={styleChefListPage.oneShopListView}>
                <View style={styleChefListPage.oneShopPhotoView}>
                    <Swiper showsButtons={false} height={windowHeight*0.3} horizontal={true} autoplay={false}
                        dot={<View style={styles.dot} />} activeDot={<View style={styles.activeDot} />} >
                        {this.state.chefView[chef.chefId].map((picture) => {
                            return (
                                <TouchableHighlight key={picture} onPress={() => this.navigateToShopPage(chef)} underlayColor='#C0C0C0'>
                                    <Image source={{ uri: picture }} style={styleChefListPage.chefListViewChefShopPic}
                                        onError={(e) => this.setState({ error: e.nativeEvent.error, loading: false })}>

                                    </Image>
                                </TouchableHighlight>
                            );
                          })}
                    </Swiper>
                    {nextDeliverTimeView}
                </View>
                <TouchableHighlight underlayColor={'transparent'} onPress={() => this.navigateToShopPage(chef) }>
                <View style={styleChefListPage.shopInfoView}>
                    <View style={styleChefListPage.shopInfoSection}>
                       <View style={styleChefListPage.shopInfoRow1}>
                         <View style={styleChefListPage.shopNameView}>
                            <Text style={styleChefListPage.oneShopNameText}>{chef.shopname}</Text>
                         </View>
                       </View>

                       <View style={styleChefListPage.shopInfoRow2}>
                          <View style={styleChefListPage.shopRatingView}>
                             <View style={{flexDirection:'row',alignSelf:'center'}}>
                             {rating.renderRating(chef.rating)}
                             </View>
                             <Text style={styleChefListPage.reviewNumberText}>{chef.rating} ({chef.reviewCount})</Text>
                          </View>
                       </View>

                       <View style={styleChefListPage.shopInfoRow3}>
                          <View style={styleChefListPage.labelView}>
                            <Image style={styleChefListPage.labelIcon} source={labelIcon}/>
                            <Text style={styleChefListPage.labelText}>{chef.styleTag}, {chef.foodTag}{yumsoExclusiveTag != undefined ? ',':null}</Text>
                            {yumsoExclusiveTag}
                          </View>
                       </View>
                    </View>
                    <View style={styleChefListPage.shopInfoSection2}>
                        <View style={styleChefListPage.iconsView}>
                            <Image source={{ uri: chefProfilePic }} style={styleChefListPage.chefPhoto}/>
                            {likedIcon}
                        </View>
                        <View style={styleChefListPage.distanceDollarSignView}>
                             <Text style={styleChefListPage.distanceDollarSignText}>{chef.distance!=undefined && chef.distance!=null?(chef.distance>20?'20':chef.distance)+' miles | ':''}{dollarSign.renderLevel(chef.priceLevel)}</Text>
                        </View>
                    </View>
                </View>
                </TouchableHighlight>
                <View style={styleChefListPage.chefListBorderView}></View>
            </View>
        );
    }

    renderPromoBanner() {
        var promoBannerView = null;
        if (this.state.showPromoAppBanner) {
        // placeholder, in real practice, will only be rendered after the data gets fetched back
        promoBannerView = <View style={styles.promoBannerView}>
                                   <Text style={styles.infoBannerText}>
                                      Promotion Banner Goes Here 
                                   </Text>
                            </View>
        }
        return promoBannerView;
        
    }    
    render() {
        var menu = <Menu navigator={this.props.navigator} eater={this.state.eater} currentLocation={this.state.GPSproxAddress} principal={this.state.principal} caller = {this}/>;
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView = <LoadingSpinnerViewFullScreen/>;
        }

        var cheflistView = <RefreshableListView ref="listView"
                            dataSource = {this.state.dataSource}
                            renderRow={this.renderRow.bind(this)}
                            renderHeader={this.renderPromoBanner.bind(this)}
                            loadData={this.searchChef.bind(this)}
                            refreshDescription = "Pull to refresh "/>
        var networkUnavailableView = null;
        if(this.state.showNetworkUnavailableScreen){
           networkUnavailableView = <NetworkUnavailableScreen onReload = {this.componentDidMount.bind(this)} />
           cheflistView = null;
        }

        if(this.state.showLocSearch){
           return(<MapPage onSelectAddress={this.mapDone.bind(this)} onCancel={this.onCancelMap.bind(this)} eater={this.state.eater} city={this.state.city} currentAddress={this.state.GPSproxAddress} showHouseIcon={true}/>);
        }else if(this.state.showChefSearch){
           return <View style={styles.pageWrapper}>
                <View style={styles.headerBannerView}>
                    <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.setState({
                                                                showChefSearch: false,
                                                                isMenuOpen: false,
                                                                priceRankFilter: JSON.stringify(this.state.priceRankFilterOrigin)==undefined ? null : JSON.parse(JSON.stringify(this.state.priceRankFilterOrigin)),
                                                                withBestRatedSort: this.state.withBestRatedSortOrigin,
                                                             })}>
                        <View style={styles.backButtonView}>
                            <Image source={closeIcon} style={styles.closeButtonIcon} />
                        </View>
                    </TouchableHighlight>
                    <View style={styles.titleView}></View>
                    <View style={styles.headerRightView}></View>
                </View>
                <View style={[styles.pageTitleView, {paddingLeft:windowWidth/20.7, marginBottom:windowHeight*0.04}]}>
                        <Text style={styles.pageTitle}>Filter</Text>
                </View>
                    <Text style={styleFilterPage.pageSubTitle}>Price</Text>
                           <View style={styleFilterPage.dollarSignSelectionView}>
                              <TouchableHighlight underlayColor={'transparent'} style={styleFilterPage.dollarSignView} onPress={() => this.clickDollarSign(1)}>
                                    <Text style={this.getDollarSign(1)}>$</Text>
                              </TouchableHighlight>
                              <TouchableHighlight underlayColor={'transparent'} style={styleFilterPage.dollarSignView} onPress={() => this.clickDollarSign(2)}>
                                    <Text style={this.getDollarSign(2)}>$$</Text>
                              </TouchableHighlight>
                              <TouchableHighlight underlayColor={'transparent'} style={styleFilterPage.dollarSignView} onPress={() => this.clickDollarSign(3)}>
                                    <Text style={this.getDollarSign(3)}>$$$</Text>
                              </TouchableHighlight>
                           </View>

                    <Text style={styleFilterPage.pageSubTitle}>Shop Type</Text>
                    <View style={styleFilterPage.sortCriteriaView}>
                       <View style={styleFilterPage.sortCriteriaTitleView}>
                          <Text style={this.getShopTypeText('withAllShopType')} onPress={() => {this.clickShopType('withAllShopType')}}>All</Text>
                       </View>
                       <View style={styleFilterPage.sortCriteriaTitleView}>
                          <Text style={this.getShopTypeText('withRestaurantsShopType')} onPress={() => {this.clickShopType('withRestaurantsShopType')}}>Restaurants</Text>
                       </View>
                       <View style={styleFilterPage.sortCriteriaTitleView}>
                          <Text style={this.getShopTypeText('withHomeChefShopType')} onPress={() => {this.clickShopType('withHomeChefShopType')}}>Home Chefs</Text>
                       </View>
                    </View>


                    <Text style={styleFilterPage.pageSubTitle}>Sort by</Text>
                    <View style={styleFilterPage.sortCriteriaView}>
                       <View style={styleFilterPage.sortCriteriaTitleView}>
                          <Text style={this.getSortCriteriaTitleText('withBestRatedSort')} onPress={() => {this.clickSortSelection('withBestRatedSort')}}>Best Rated</Text>
                       </View>
                       <View style={styleFilterPage.sortCriteriaTitleView}>
                          <Text style={this.getSortCriteriaTitleText('withMostPopularSort')} onPress={() => {this.clickSortSelection('withMostPopularSort')}}>Most Popular</Text>
                       </View>
                       <View style={styleFilterPage.sortCriteriaTitleView}>
                          <Text style={this.getSortCriteriaTitleText('withSoonestDeliveryTimeSort')} onPress={() => {this.clickSortSelection('withSoonestDeliveryTimeSort')}}>Soonest Delivery Time</Text>
                       </View>
                       <View style={styleFilterPage.sortCriteriaTitleView}>
                          <Text style={this.getSortCriteriaTitleText('withShortestDistanceSort')} onPress={() => {this.clickSortSelection('withShortestDistanceSort')}}>Shortest Distance</Text>
                       </View>
                    </View>
                    {loadingSpinnerView}
                    <View style={{flex:1}}>
                    </View>
                    <TouchableOpacity activeOpacity={0.7} style={styles.footerView} onPress={() => this.onPressApplySearchButton()}>
                        <Text style={styleFilterPage.applySearchButtonText}>Apply</Text>
                    </TouchableOpacity>                
               </View>                    
        }

        var updateAppBannerView=null;
        if(this.state.showUpdateAppBanner){
           updateAppBannerView = <View style={styles.infoBannerView}>
                                   <Text style={styles.infoBannerText}>
                                      Yumso App has new version available.
                                   </Text>
                                   <TouchableHighlight style={styles.infoBannerLinkView} onPress={()=>this.linkToAppStore()} underlayColor={'#ECECEC'}>
                                        <Text style={styles.infoBannerLink}>
                                            Tap to update
                                        </Text>
                                    </TouchableHighlight>
                                 </View>
        }

        var foodTags = [];
        for (let foodTag of this.state.foodTagArr)
            foodTags.push(<Text name={foodTag} key={foodTag} style={styleChefListPage.foodTagTabText}>{foodTag}</Text>);

        var foodTagTabsView =   <View style={styleChefListPage.foodTagTabsContainer}>
                                    <Tabs selected={this.state.selectedFoodTag} style={styleChefListPage.foodTagTabsView}
                                        selectedStyle={styleChefListPage.foodTagSelectedStyle} onSelect={el=>this.showChefsWithSpecificFoodTag(el.props.name)}>
                                    {foodTags}
                                    </Tabs>
                                </View>

        return (
                <View style={styles.pageWrapper}>
                    <View style={[styles.headerBannerView, styleChefListPage.customizedHeaderBannerRules]}>
                        <TouchableHighlight style={styleChefListPage.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.setState({showLocSearch:true}) }>
                        <View style={styles.upperLeftBtnView}>
                            <Image source={ballonIcon} style={styles.ballonIcon}/>
                            <Text style={[styles.pageText, {fontWeight:'300', color:'#4A4A4A'}]}>{this.state.city?this.state.city:'unknown'} ({this.state.zipcode?this.state.zipcode:'unknown'})</Text>
                        </View>
                        </TouchableHighlight>
                        <View style={{ width: windowWidth - 220*windowWidthRatio-40*windowWidthRatio*2}}></View>
                        <TouchableHighlight style={styleChefListPage.headerIconView} underlayColor={'#F5F5F5'} onPress={() => this.showFavoriteChefs()}>
                            <Image source={this.getCurrentLikeIcon(this.state.showFavoriteChefsOnly)} style={styles.likeIcon}/>
                        </TouchableHighlight>
                        <TouchableHighlight style={styleChefListPage.headerIconView} underlayColor={'#F5F5F5'} onPress={() => this.setState({showChefSearch:true})}>
                            <Image source={filterIcon} style={styles.filterIcon}/>
                        </TouchableHighlight>
                    </View>
                    {updateAppBannerView}
                    {foodTagTabsView}
                    {networkUnavailableView}
                    {cheflistView}

                    <View style = {styles.tabBarNew}>
                        <View style={{flex: 1, flexDirection: 'row'}}>
                             <TouchableHighlight underlayColor={'#F5F5F5'}>
                                 <View style={styles.tabBarButtonNew}>
                                      <Image source={shopsOn}  style={styles.tabBarButtonImageShop}/>
                                      <View>
                                        <Text style={styles.tabBarButtonTextOnNew}>Shops</Text>
                                      </View>
                                 </View>
                             </TouchableHighlight>
                             <TouchableHighlight underlayColor={'#F5F5F5'}  onPress={() => this.onPressOrdersTabBtn()}>
                                 <View style={styles.tabBarButtonNew}>
                                      <Image source={ordersOff}  style={styles.tabBarButtonImageOrder}/>
                                      <View>
                                        <Text style={styles.tabBarButtonTextOffNew}>Orders</Text>
                                      </View>
                                 </View>
                             </TouchableHighlight>
                             <TouchableHighlight underlayColor={'#F5F5F5'}  onPress={() => this.onPressMeTabBtn()}>
                                 <View style={styles.tabBarButtonNew}>
                                      <Image source={meOff}  style={styles.tabBarButtonImageMe}/>
                                      <View>
                                        <Text style={styles.tabBarButtonTextOffNew}>Me</Text>
                                      </View>
                                 </View>
                             </TouchableHighlight>
                        </View>
                    </View>
                    {loadingSpinnerView}
                </View>
        );
    }

    onRefreshDone(){
        this.refs.listView.scrollTo({x:0, y:0, animated: true})
    }

    getCurrentLikeIcon(showFills) {
        if (showFills)
            return heartFillsIcon;
        else
            return heartLineIcon;
    }

    getSortCriteriaTitleText(sortByKey) {
        if (sortByKey == this.state.selectedSortKey)
            return styleFilterPage.selectedSortCriteriaTitleText;
        else 
            return styleFilterPage.sortCriteriaTitleText;
    }

    getShopTypeText(shopType) {
        if (shopType == this.state.selectedShopType)
            return styleFilterPage.selectedSortCriteriaTitleText;
        else 
            return styleFilterPage.sortCriteriaTitleText;
    }

    getDollarSign(priceLevel) {
        if (this.state.selectedPriceLevels.includes(priceLevel))
            return styleFilterPage.dollarSignGreen;
        else 
            return styleFilterPage.dollarSignGrey;
    }

    clickDollarSign(priceLevel){
        this.state.priceRankFilter[priceLevel] = !this.state.priceRankFilter[priceLevel];
        var currentPriceLevels = this.state.selectedPriceLevels;     
        // toggle price level selection for display
        if (currentPriceLevels.includes(priceLevel))
            currentPriceLevels = currentPriceLevels.filter((ele) => ele !== priceLevel);
        else
            currentPriceLevels.push(priceLevel);
        this.setState({priceRankFilter:this.state.priceRankFilter, selectedPriceLevels: currentPriceLevels});
    }

    clickSortSelection(sortByKey){
        this.setState({[sortByKey]:!this.state[sortByKey], selectedSortKey: sortByKey});
        this.setState({sortCriteriaIcon:this.state[sortByKey]? sortCriteriaIconOrange : sortCriteriaIconGrey})
    }

    clickShopType(shopType) { 
        //TODO Add more code in applySearchSettings to implement newly added 'search by shopType' feature
        this.setState({[shopType]:!this.state[shopType], selectedShopType: shopType});
    }

    showFavoriteChefs(){
        if(!this.state.eater){
            this.props.navigator.push({
                name: 'LoginPage',
                passProps: {
                    callback: function(eater){
                        this.setState({eater:eater})
                        this.showFavoriteChefs();
                    }.bind(this)
                }
            });
            return
        }
        this.state.showFavoriteChefsOnly = !this.state.showFavoriteChefsOnly;
        let displayChefs = [];
        if(this.state.showFavoriteChefsOnly==true){
            for(let likedChefId of this.state.eater.favoriteChefs){
                if(this.state.chefsDictionary[likedChefId]){
                    displayChefs.push(this.state.chefsDictionary[likedChefId]);
                }
            }
        }else{
            for(let chefId in this.state.chefsDictionary){
                displayChefs.push(this.state.chefsDictionary[chefId]);
            }
        }
        this.setState({ dataSource: this.state.dataSource.cloneWithRows(displayChefs), isMenuOpen:false});
    }

    showChefsWithSpecificFoodTag(foodTag){
        let self = this;
        this.setState({selectedFoodTag:foodTag});
        let displayChefs = [];
        Object.keys(this.state.chefsDictionary).forEach(function(chefId) {
            let chef = self.state.chefsDictionary[chefId];
            if (chef.foodTag == foodTag || foodTag== 'All') 
                displayChefs.push(chef);
        });
        this.setState({ dataSource: this.state.dataSource.cloneWithRows(displayChefs), isMenuOpen:false});
    }

    async openSideMenu(isOpen){
        if(isOpen===false){return;}
        this.setState({ isMenuOpen: true });
        if(this.state.eater){
            let res = await this.client.getWithAuth(config.eaterEndpoint);
            this.setState({eater:res.data.eater});
        }
    }

    mapDone(address){
         if(address){
            Alert.alert( '', 'Your search location is set to '+address.formatted_address,[ { text: 'OK' }]);
            //todo: get chef use location info;
         }
         this.setState({showLocSearch:false, pickedAddress:address, city:address.city, state:address.state, zipcode: address.postal, isMenuOpen: false, showProgress: true});
         this.componentDidMount(); //todo: we refresh it like this?
    }

    onCancelMap(){
         this.setState({showLocSearch:false, isMenuOpen: false});
    }

    onPressApplySearchButton(){
        this.searchChef(true);
    }


    onPressOrdersTabBtn(){
        if(!this.state.eater){
            this.props.navigator.push({
                  name: 'LoginPage',
                  passProps: {
                      callback: function(eater,principal){
                          this.setState({eater:eater,principal:principal})
                      }.bind(this)
                  }
           });
           return
        }

        this.props.navigator.push({
            name: 'OrderPage',
            passProps: {
                eater: this.state.eater,
                principal:this.state.principal,
            }
        });
    }
    onPressMeTabBtn(){
        if(!this.state.eater){
            this.props.navigator.push({
                  name: 'LoginPage',
                  passProps: {
                      callback: function(eater,principal){
                          this.setState({eater:eater,principal:principal})
                      }.bind(this)
                  }
           });
           return
        }

        this.props.navigator.push({
            name: 'EaterPage',
            passProps:{
                eater:this.state.eater,
                principal:this.state.principal,
                callback: function(eater){
                    this.props.caller.setState({eater:eater});
                }.bind(this)
            }
        });
    }

    linkToAppStore(){
        Linking.openURL('itms://itunes.apple.com/us/app/apple-store/id1125810059?mt=8')
    }

    searchChef(isApplySearchButtonPressed){
        if(isApplySearchButtonPressed==true){
           if(!this.state.eater){
              this.props.navigator.push({
                    name: 'LoginPage',
                    passProps: {
                        callback: function(eater,principal){
                            this.setState({eater:eater,principal:principal})
                        }.bind(this)
                    }
             });
             return
          }
           this.setState({showProgress:true});
        }
        return this.applySearchSettings()
            .then((settings) => {//todo: add these filter, make sure not logged in able to get as well.
                let url = config.chefListEndpoint+'?'
                let queryLoc='';
                if (this.state.GPSproxAddress) {
                    queryLoc = 'lat=' + this.state.GPSproxAddress.lat + '&lng=' + this.state.GPSproxAddress.lng;
                }
                if (this.state.pickedAddress) {
                    queryLoc = 'lat=' + this.state.pickedAddress.lat + '&lng=' + this.state.pickedAddress.lng;
                }
                url+=queryLoc+'&';
                if(settings){
                    url+='withBestRatedSort='+settings.withBestRatedSort+'&';
                    url+='priceRankFilter='
                    for(let level in settings.priceRankFilter){
                        if(settings.priceRankFilter[level]==true){
                            url+=level+',';
                        }
                    }
                    if(url.charAt(url.length-1)===','){
                        url = url.substr(0, url.length-1);
                    }
                }else{
                    if(url.charAt(url.length-1)==='&'){
                        url = url.substr(0, url.length-1);
                    }
                }
                return this.client.getWithoutAuth(url)
                    .then((res) => {
                        if (res.statusCode === 200 || res.statusCode === 202) {
                            var chefs = res.data.chefs;
                            for (var chef of chefs) {
                                if(chef && !(this.state.chefView[chef.chefId] && this.state.chefsDictionary[chef.chefId])){
                                   let starDishPictures=[];
                                   if(chef.highLightDishIds){
                                      for(var dishId in chef.highLightDishIds){
                                          starDishPictures.push(chef.highLightDishIds[dishId]);
                                      }
                                   }
                                   this.state.chefView[chef.chefId] = starDishPictures;
                                   this.state.chefsDictionary[chef.chefId] = chef;
                                }
                            }
                            this.setState({currentTime:new Date().getTime(), dataSource: this.state.dataSource.cloneWithRows(chefs) })

                            if(res.statusCode === 202){
                               this.setState({showUpdateAppBanner:true});
                            }
                            // this.onRefreshDone();
                        } else {
                            // this.onRefreshDone();
                            //todo: handle failure.
                            return self.responseHandler(res);
                        }
                        this.setState({ showChefSearch: false, showProgress: false, isMenuOpen: false });
                    }).catch((err)=>{
                        commonAlert.networkError(err);
                    });
            });
    }

    applySearchSettings(){
        let self = this;
        if(this.state.eater){
            if(!this.state.eater.chefFilterSettings){//todo: remove this since the object should be exist when creating
                this.state.eater.chefFilterSettings = {};
            }
            this.state.eater.chefFilterSettings['priceRankFilter'] = this.state.priceRankFilter;
            this.state.eater.chefFilterSettings['withBestRatedSort'] = this.state.withBestRatedSort;
            return this.client.postWithAuth(config.eaterUpdateEndpoint, {eater:{eaterId: this.state.eater.eaterId, chefFilterSettings: this.state.eater.chefFilterSettings}})
                .then((res) => {
                    if (res.statusCode != 200 && res.statusCode!=202) {
                        this.setState({showProgress:false});
                        return self.responseHandler(res);
                    }
                    return AuthService.updateCacheEater(self.state.eater)
                        .then(() => {
                            self.state.priceRankFilterOrigin = JSON.parse(JSON.stringify(self.state.priceRankFilter));
                            self.state.withBestRatedSortOrigin = self.state.withBestRatedSort;
                            return self.state.eater.chefFilterSettings;
                        });
                }).catch((err)=>{
                    this.setState({showProgress: false});
                    commonAlert.networkError(err);
                });
        }
        // if(!this.state.principal){
        //    let principal = await AuthService.getPrincipalInfo();
        //    this.setState({ principal: principal});
        // }
        this.state.priceRankFilterOrigin = JSON.parse(JSON.stringify(this.state.priceRankFilter));
        this.state.withBestRatedSortOrigin = this.state.withBestRatedSort;
        return Promise.resolve({
            priceRankFilter: this.state.priceRankFilter,
            withBestRatedSort: this.state.withBestRatedSort
        });
    }

    navigateToShopPage(chef){
        this.setState({ isMenuOpen: false });
        this.props.navigator.push({
            name: 'ShopPage',
            passProps:{
                chef:chef,
                eater:this.state.eater,
                currentLocation:this.state.GPSproxAddress,
                showUpdateAppBanner:this.state.showUpdateAppBanner,
                defaultDeliveryAddress: this.state.pickedAddress,//todo: this is not really the pickaddress
                callback: this.componentDidMount.bind(this) //todo: force rerender or just setState
            }
        });
    }

}

var Menu = React.createClass({

    render: function() {
        let isAuthenticated = this.props.eater!=undefined;
        var profileImg = profileImgNoSignIn;
        var orderNumbersView = null;
        if(isAuthenticated && this.props.eater.eaterProfilePic){
            profileImg = {uri:this.props.eater.eaterProfilePic};
            var eater = this.props.eater;
            orderNumbersView = <View style={sideMenuStyle.orderNumbersView}>
                                    <View style={sideMenuStyle.oneOrderStatView}>
                                            <Text style={sideMenuStyle.oneOrderStatNumberText}>{eater ? eater.orderOngoing : 0}</Text>
                                            <View>
                                                <Text style={sideMenuStyle.oneOrderStatNumberTitle}>Order</Text>
                                                <Text style={sideMenuStyle.oneOrderStatNumberTitle}>Pending</Text>
                                            </View>
                                    </View>
                                    <View style={sideMenuStyle.oneOrderStatView}>
                                            <Text style={sideMenuStyle.oneOrderStatNumberText}>{eater ? eater.orderCount : 0}</Text>
                                            <View>
                                                <Text style={sideMenuStyle.oneOrderStatNumberTitle}>Order</Text>
                                                <Text style={sideMenuStyle.oneOrderStatNumberTitle}>Placed</Text>
                                            </View>
                                    </View>
                                    <View style={sideMenuStyle.oneOrderStatView}>
                                            <Text style={sideMenuStyle.oneOrderStatNumberText}>{eater ? eater.orderNeedComments : 0}</Text>
                                            <View>
                                                <Text style={sideMenuStyle.oneOrderStatNumberTitle}>Need</Text>
                                                <Text style={sideMenuStyle.oneOrderStatNumberTitle}>Review</Text>
                                            </View>
                                    </View>
                               </View>
        }else{
            orderNumbersView = <View style={sideMenuStyle.orderNumbersView}></View>
        }

        var eaterProfilePic;
        if(!isAuthenticated){
           eaterProfilePic = <Image source={profileImg} style={sideMenuStyle.eaterPhoto}/>;
        }else{
           eaterProfilePic = <Image source={profileImg} style={sideMenuStyle.eaterPhoto}/>
        }
        return (
            <View style={sideMenuStyle.sidemenu}>
                   <TouchableHighlight style = {sideMenuStyle.eaterPhotoView} onPress={()=>this.goToEaterPage()} underlayColor={'transparent'}>
                       {eaterProfilePic}
                   </TouchableHighlight>
                   {orderNumbersView}
                    <TouchableOpacity activeOpacity={0.7} style={sideMenuStyle.paddingMenuItemView}>
                       <Text style={sideMenuStyle.paddingMenuItem}></Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} style={sideMenuStyle.paddingMenuItemView} onPress={this.goToOrderHistory}>
                       <Text style={sideMenuStyle.paddingMenuItem}>My Orders</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} style={sideMenuStyle.paddingMenuItemView} onPress={this.goToPaymentOptionPage}>
                       <Text style={sideMenuStyle.paddingMenuItem}>Payment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} style={sideMenuStyle.paddingMenuItemView} onPress={this.goToAddressBookPage} >
                       <Text style={sideMenuStyle.paddingMenuItem}>Address</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} style={sideMenuStyle.paddingMenuItemView} onPress={this.goToEaterPage} >
                       <Text style={sideMenuStyle.paddingMenuItem}>My Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} style={sideMenuStyle.paddingMenuItemView} onPress={this.navigateToContactUsPage}>
                       <Text style={sideMenuStyle.paddingMenuItem}>Contact Us</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} style={sideMenuStyle.paddingMenuItemView} onPress={this.navigateToInvitePage}>
                       <Text style={sideMenuStyle.paddingMenuItem}>Invite Friends</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} style={sideMenuStyle.paddingMenuItemView}>
                       <Text style={sideMenuStyle.paddingMenuItem}></Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} style={sideMenuStyle.paddingMenuItemView} onPress={isAuthenticated?this.logOut:this.logIn}>
                       <Text style={sideMenuStyle.paddingMenuItem}>{isAuthenticated?'Log out':'Log in'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} style={sideMenuStyle.paddingMenuItemAboutView} onPress={this.navigateToAboutPage}>
                       <Text style={sideMenuStyle.paddingMenuItemAbout}>About</Text>
                    </TouchableOpacity>
            </View>
        );
    },

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
            passProps: {
               eater: this.props.eater
            }
        });
    },

    goToEaterPage: function() {
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
            name: 'EaterPage',
            passProps:{
                eater:this.props.eater,
                currentLocation:this.props.currentLocation,
                principal:this.props.principal,
                callback: function(eater){
                    this.props.caller.setState({eater:eater});
                }.bind(this)
            }
        });
    },

    goToAddressBookPage:function() {
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
            name: 'AddressBookPage',
            passProps:{
                eater:this.props.eater,
                currentLocation:this.props.currentLocation,
                principal:this.props.principal,
                callback: function(eater){
                    this.props.caller.setState({eater:eater});
                }.bind(this)
            }
        });
    },

    goToPaymentOptionPage:function() {
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
            name: 'PaymentOptionPage',//todo: fb cached will signin and redirect back right away.
            passProps:{
                eater:this.props.eater
            }
        });
    },

    navigateToAboutPage: function () {
        this.props.caller.setState({ isMenuOpen: false });
        this.props.navigator.push({
            name: 'AboutPage',
        });
    },

    navigateToContactUsPage: function () {
        this.props.caller.setState({ isMenuOpen: false });
        this.props.navigator.push({
            name: 'ContactUsPage',
        });
    },

    navigateToInvitePage: function() {
        this.props.navigator.push({
            name: 'InvitePage',
        });
    },
    
    logOut: function(){
        return AuthService.logOut()
        .then(()=>{
            this.props.caller.setState({eater:undefined});
            //Alert.alert( '', 'You have successfully logged out',[ { text: 'OK' }]);
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
                callback: this.props.caller.componentDidMount.bind(this.props.caller),
            }
        });
    },
});

var sideMenuStyle = StyleSheet.create({
    sidemenu: {
        flexDirection:'column',
        height:windowHeight,
        width:windowWidth*2/3.0,
        backgroundColor:'#F5F5F5',
        marginTop:20,
        alignItems:'center',
    },
    eaterPhoto:{
        width:windowWidth/3.0,
        height:windowWidth/3.0,
        borderRadius:0.5*windowWidth/3.0,
        borderWidth: 0,
        overflow: 'hidden',
    },
    eaterPhotoView:{
        width:windowWidth/3.0,
        height:windowWidth/3.0,
        marginTop:windowWidth/7.0,
    },
    orderNumbersView:{
        flexDirection:'row',
        width:windowWidth*0.6,
        height:windowHeight/92.0 + windowWidth/5.0,
        borderColor:'#4A4A4A',
        borderBottomWidth:1.5,
        marginTop:windowWidth/30.0,
        paddingBottom:windowHeight/92.0,
    },
    oneOrderStatView:{
        flex:1/3.0,
        flexDirection:'column',
        height:windowWidth/5.0,
        alignItems:'center',
        justifyContent:'space-around',
    },
    oneOrderStatNumberText:{
        fontSize:windowHeight/37.055,
        fontWeight:'500',
        color:'#4A4A4A',
    },
    oneOrderStatNumberTitle:{
        flexDirection:'row',
        justifyContent:'center',
        width:windowWidth*0.2,
        fontSize:windowHeight/52.57,
        fontWeight:'400',
        color:'#4A4A4A',
        textAlign:'center',
        alignSelf:'center',
        flexWrap:'wrap',
    },
    paddingMenuItemView:{
        width:windowWidth*2/3.0,
        paddingVertical:windowWidth*0.0227,
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        paddingLeft:windowWidth/8.28,
    },
    paddingMenuItem: {
        fontSize:windowHeight/37.055,
        fontWeight:'500',
        color:'#4A4A4A'
    },
    paddingMenuItemAbout: {
        fontSize:windowHeight/41.69,
        color:'#4A4A4A'
    },
    paddingMenuItemAboutView:{
        borderTopWidth:1,
        borderColor:'#4A4A4A',
        width:windowWidth*0.226,
        paddingVertical:windowWidth*0.0227,
        flexDirection:'row',
        alignSelf:'flex-start',
        marginLeft:windowWidth/8.28,
    },
});

var styleChefListPage = StyleSheet.create({
    customizedHeaderBannerRules:{
        borderColor:'#F5F5F5',
        borderBottomWidth:2,
    },
    headerIconView:{
        width:40*windowWidthRatio,
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row',
    },
    foodTagTabsContainer:{
        height:windowHeight*0.065,
        backgroundColor:'#fff',
        alignItems:'flex-start',
        justifyContent:'center',
        borderBottomWidth:1,
        borderColor:'#ddd',
    },
    foodTagTabsView:{
        flexDirection: 'row',
        alignItems:'stretch',
        justifyContent:'space-around',
        alignSelf:'center',
    },
    foodTagTabText:{
        flexDirection:'row',
        alignItems:'center',
        alignSelf:'center',
        justifyContent:'center',
        marginHorizontal:windowWidth*0.02,
        color:'#979797'
    },
    foodTagSelectedStyle:{
        color:'#4A4A4A',
        fontWeight: 'bold',
        // 08/09/2017:
        // As I set the below rules on tab selected to display the yellow underline, it just doesn't work.
        // According to the discussion on GitHub, it seems to be a RN old version problem.
        // Since we're not updating to the latest RN, I just simply bolden the text for now.
        // https://github.com/facebook/react-native/issues/29

        // borderBottomColor:'#FFCC33',
        // borderBottomWidth:3,
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
    orangeTopBannerButtonWrapper:{
       flexDirection:'row',
       justifyContent:'center',
       width:windowWidth*0.25,
    },
    orangeTopBannerButtonIcon:{
       width:windowWidth*0.08,
       height:windowWidth*0.08,
       alignSelf:'center',
    },
    oneShopListView:{
       marginTop:windowHeight*0.03,
       alignSelf:'stretch',
       backgroundColor:'#FFFFFF',
       paddingLeft:windowWidth/20.7,
    },
    oneShopPhotoView:{
       height:windowHeight*0.3,
       alignSelf:'stretch',
    },
    chefListViewChefShopPic:{
       height:windowHeight*0.3,
       width:windowWidth - 0.5 * windowWidth/20.7,
       alignSelf:'stretch',
       marginLeft: - 1.5 * windowWidth/20.7,
    },
    shopInfoView:{
       flexDirection:'row',
       height:windowHeight*0.14,
       paddingTop:windowHeight*0.0225,
       paddingBottom:windowHeight*0.02698,
       paddingRight:1 * windowWidth/20.7,
    },
    chefPhoto:{
       marginLeft:windowWidth*0.015,
       height:windowWidth*0.1,
       width:windowWidth*0.1,
       borderRadius: windowWidth*0.1 / 2,
       alignItems:"center",
       justifyContent:"center",
    },
    shopInfoSection:{
       flex:1,
       flexDirection:'column',
       justifyContent:'space-between',
       height:windowWidth*0.165,
    },
    shopInfoSection2:{
       flex:1,
       flexDirection:'column',
       justifyContent:'space-between',
       height:windowWidth*0.165,
       alignItems:'flex-end',
    },
    shopInfoRow1:{
       flexDirection:'row',
    },
    shopNameView:{
       flex:0.93,
       height:windowHeight*0.04,
       flexDirection:'row',
       alignItems:'flex-start',
    },
    oneShopNameText:{
       fontSize:windowHeight/34.9,
       fontWeight:'500',
       color:'#4A4A4A',
    },
    likeIcon:{
       width:windowWidth*0.06,
       height:windowWidth*0.06,
    },
    shopInfoRow2:{
       flexDirection:'row',
    },
    shopRatingView:{
       flex:0.6,
       flexDirection:'row',
       alignItems:'flex-start',
    },
    reviewNumberText:{
       fontSize:windowHeight/47.33,
       color:'#4A4A4A',
       marginLeft:windowWidth*0.0187,
       alignSelf:'center',
    },
    distanceDollarSignView:{
        flexDirection:'row',
        justifyContent:'flex-end',
        paddingTop:windowHeight*0.0075,
    },
    distanceDollarSignText:{
        fontSize:windowHeight/47.33,
        color:'#4A4A4A',
        textAlign:'left',
    },
    iconsView: {
        flexDirection:"row",
        paddingRight:0,
        marginBottom:windowHeight/90,
    },
    likedIconView:{
        height:windowHeight*0.02,
        width:windowWidth*0.04,
    },
    iconCircle:{
        //TODO: make the shadow, it's just a circle for now
        marginLeft:windowWidth*0.015,
        height:windowWidth*0.1,
        width:windowWidth*0.1,
        borderWidth:windowWidth*0.001,
        borderRadius: windowWidth*0.1 / 2,
        alignItems:"center",
        justifyContent:"center",
        borderColor:"#bbb",
    },
    shopInfoRow3:{
        flexDirection:'row',
        paddingTop:windowHeight*0.0095,
    },
    labelView:{
        flexDirection:'row',
        justifyContent:'flex-start',
        marginRight:windowWidth*0.04,
    },
    labelIcon:{
        width:1.5*windowHeight/71.0,
        height:windowHeight/71.0,
        alignSelf:'center',
        marginRight: windowWidth / 82.8,
    },
    labelText:{
        fontSize:windowHeight/47.33,
        color:'#4A4A4A',
        alignSelf:'center',
    },
    nextDeliverTimeView:{
        marginTop:-windowHeight*0.3,
        paddingHorizontal:18,
        paddingVertical:windowHeight*0.01,
        flexDirection: 'column',
        alignItems:'center',
        justifyContent:'center',
        alignSelf:'flex-end',
        overflow: 'hidden',
        opacity:0.65,
        backgroundColor:'#202020',
        marginRight:windowWidth*0.05,
    },
    nextDeliverTimeText:{
        color:'#FFFFFF',
        fontSize:12
    },
    chefListBorderView:{
        height:windowHeight/180,
        width:windowWidth - 2 * windowWidth/20.7,
        backgroundColor:'#FFFFFF',
        borderBottomWidth:1.5,
        borderBottomColor:'#FFFFFF',
    },
    headerRightTextButtonView:{
        justifyContent: 'center',
        flexDirection: 'row',
    },
    headerLeftView:{
        width: 220*windowWidthRatio,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingLeft: 20 * windowWidthRatio
    }
});

var styleFilterPage = StyleSheet.create({
    dollarSignSelectionView:{
        flexDirection:'row',
        height:windowHeight*0.0792,
        borderColor:'#F5F5F5',
        borderBottomWidth:1,
        alignItems:'center',
        backgroundColor:'#FFFFFF',
    },
    dollarSignView:{
        flexDirection:'row',
        width:windowWidth/3.0,
        justifyContent:'center',
    },
    applySearchButtonText:{
        color:'#fff',
        fontSize:windowHeight/35,
        fontWeight:'600',
        alignSelf:'center',
    },
    sortCriteriaSectionTitleView:{
        height:windowHeight*0.0528,
        width:windowWidth,
        marginTop:windowHeight*0.0616,
        backgroundColor:'#F5F5F5',
        flexDirection:'row',
        justifyContent:'flex-start',
        paddingLeft:windowWidth*0.0406,
    },
    sortCriteriaSectionTitleText:{
        alignSelf:'center',
        fontSize:windowHeight/40.572,
        color:'#4A4A4A',
    },
    sortCriteriaView:{
        width:windowWidth,
        flexDirection:'column', 
        borderColor:'#F5F5F5',
        borderBottomWidth:1,
        backgroundColor:'#FFFFFF',
    },
    sortCriteriaTitleView:{
        width:windowWidth*0.85,
        height:windowHeight*0.054,
        flexDirection:'row',
        alignItems:'flex-start',
    },
    sortCriteriaTitleText:{
        alignSelf:'center',
        color:'#4A4A4A',
        fontWeight:'300',
        fontSize:windowHeight/35,
        marginLeft:windowWidth/20.7, 
    },
    selectedSortCriteriaTitleText:{
        alignSelf:'center',
        color:'#7adfc3',
        fontWeight:'300',
        fontSize:windowHeight/35,
        marginLeft:windowWidth/20.7,       
    },
    sortCriteriaIconView:{
        width:windowWidth*0.15,
        height:windowHeight*0.088,
        flexDirection:'row',
        alignItems:'flex-end',
    },
    sortCriteriaIconWrapper:{
        alignSelf:'center',
    },
    sortCriteriaIcon:{
        width:windowHeight*0.050,
        height:windowHeight*0.050,
    },
    pageSubTitle:{
        fontSize:windowHeight/35.5,
        fontWeight:'600',
        color:'#4A4A4A',
        marginVertical:windowHeight*0.0200,
        paddingLeft:windowWidth/20.7,
    },
    dollarSignGrey:{
        fontSize:windowHeight/35.5,
        fontWeight:'400',
        color:'#979797',
    },
    dollarSignGreen:{
        fontSize:windowHeight/35.5,
        fontWeight:'400',
        color:'#7adfc3',
    },
    
});
module.exports = ChefListPage;
