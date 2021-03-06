'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
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
var closeIcon = require('./icons/icon-close.png');
var RefreshableListView = require('react-native-refreshable-listview');
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen');
var backgroundImage = require('./resourceImages/background@3x.jpg');

var meOff = require('./icons/me_off.png');
var meOn = require('./icons/me_on.png');

var ordersOff = require('./icons/orders_off.png');
var ordersOn = require('./icons/orders_on.png');

var shopsOff = require('./icons/shops_off.png');
var shopsOn = require('./icons/shops_on.png');


import Dimensions from 'Dimensions';

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
    ScrollView,
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
            selectedFoodTag: "All",
            city:'Seattle',
            state:'WA',
            zipcode:'98105',
            pickedAddress:undefined,
            deviceToken: null,
            currentTime: new Date().getTime(),
            showUpdateAppBanner:false,
            selectedPriceLevels: { 1: false, 2: false, 3: false },
            selectedSortKey: null,
            selectedShopType: null,
            priceRankFilter: { 1: false, 2: false, 3: false },
            sortKeyFilter: null,
            shopTypeFilter: null,
        };

        this.responseHandler = function (response, msg) {
            if(response.statusCode==400){
               Alert.alert( 'Warning', response.data,[ { text: 'OK' }]);
            }else if (response.statusCode === 401) {
               return AuthService.logOut()
                    .then(()=>{
                        delete this.state.eater;
                        this.props.navigator.push({
                            name: 'WelcomePage',//todo: fb cached will signin and redirect back right away.
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
        
        if (this.state.eater && this.state.eater.promoBannerImage) {
            promoBannerView = <Image style={{ width: windowWidth, height: windowWidth * 340 / 1600.0 }} source={{uri:this.state.eater.promoBannerImage}}/>
        }
        return promoBannerView;
    }  
    
    renderFoodTagTabs() {
        var foodTags = [];
        for (let foodTag of this.state.foodTagArr) 
             foodTags.push(<Text name={foodTag} key={foodTag} style={this.getFoodTagTabStyle(foodTag)} onPress={() => this.foodTagSelected(foodTag)}>{foodTag}</Text>);
        
        return <ScrollView horizontal={true} style={styleChefListPage.foodTagTabsView} showsHorizontalScrollIndicator={false}>{foodTags}</ScrollView>
    }

    render() {
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
           console.log('closeIcon ' + closeIcon);
           var ret = 
            (<View style={styles.containerNew}>
                <Image style={styles.pageBackgroundImage} source={backgroundImage}>
                    <View style={styles.headerBannerViewNew}>
                        <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.onDismissFilter()}>
                            <View style={styles.backButtonViewsNew}>
                                <Image source={closeIcon} style={styles.closeButtonIcon} />
                            </View>
                        </TouchableHighlight>
                        <View style={styles.headerRightView}>
                        </View>
                    </View>
                    <View style={[styles.pageTitleView, {paddingLeft:windowWidth/20.7, backgroundColor:'transparent', marginBottom:windowHeight*0.04}]}>
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
                          <Text style={this.getShopTypeText('withYumsoExclusiveShopType')} onPress={() => {this.clickShopType('withYumsoExclusiveShopType')}}>Yumso Exclusive</Text>
                       </View>
                       <View style={styleFilterPage.sortCriteriaTitleView}>
                          <Text style={this.getShopTypeText('withSpecialOfferShopType')} onPress={() => { this.clickShopType('withSpecialOfferShopType') }}>Special Offer</Text>
                       </View>
                    </View>

                    <Text style={styleFilterPage.pageSubTitle}>Sort by</Text>
                    <View style={styleFilterPage.sortCriteriaView}>
                       <View style={styleFilterPage.sortCriteriaTitleView}>
                          <Text style={this.getSortCriteriaTitleText('withBestRatedSort')} onPress={() => {this.clickSortSelection('withBestRatedSort')}}>Best Rated</Text>
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
                </Image>               
            </View>);
            return ret;                    
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

        var foodTagTabsView = this.renderFoodTagTabs();

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
                        <Image source={this.getCurrentLikeIcon(this.state.showFavoriteChefsOnly)} style={{width: windowWidth * 0.06, height: windowWidth * 0.06 * 80/95,}}/>
                        </TouchableHighlight>
                        <TouchableHighlight style={styleChefListPage.headerIconView} underlayColor={'#F5F5F5'} onPress={() => this.onOpenFilter()}>
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
        if (this.state.selectedPriceLevels[priceLevel])
            return styleFilterPage.dollarSignGreen;
        else 
            return styleFilterPage.dollarSignGrey;
    }

    getFoodTagTabStyle(selectedFoodTag) {
        if (this.state.selectedFoodTag == selectedFoodTag)
            return  [styleChefListPage.foodTagTabText, styleChefListPage.foodTagSelectedStyle];
        else
            return  styleChefListPage.foodTagTabText;
    }

    clickDollarSign(priceLevel){
        this.state.selectedPriceLevels[priceLevel] = !this.state.selectedPriceLevels[priceLevel];
        let selectedPriceLevels = JSON.parse(JSON.stringify(this.state.selectedPriceLevels));
        this.setState({ selectedPriceLevels: selectedPriceLevels})
    }

    clickSortSelection(sortByKey){
        if (this.state.selectedSortKey == sortByKey){
            this.setState({ selectedSortKey: null });
        }else{
            this.setState({ selectedSortKey: sortByKey });
        }
    }

    clickShopType(shopType) { 
        //TODO Add more code in applySearchSettings to implement newly added 'search by shopType' feature
        if (this.state.selectedShopType == shopType) {
            this.setState({ selectedShopType: null });
        } else {
            this.setState({ selectedShopType: shopType });
        }
    }

    showFavoriteChefs(){
        if(!this.state.eater){
            this.props.navigator.push({
                name: 'WelcomePage',
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
        this.setState({ dataSource: this.state.dataSource.cloneWithRows(displayChefs)});
    }

    foodTagSelected(foodTag){
        let self = this;
        this.setState({selectedFoodTag:foodTag});
        let displayChefs = [];
        Object.keys(this.state.chefsDictionary).forEach(function(chefId) {
            let chef = self.state.chefsDictionary[chefId];
            if (chef.foodTag == foodTag || foodTag== 'All') 
                displayChefs.push(chef);
        });
        this.setState({ dataSource: this.state.dataSource.cloneWithRows(displayChefs)});
    }

    mapDone(address){
         if(address){
            Alert.alert( '', 'Your search location is set to '+address.formatted_address,[ { text: 'OK' }]);
            //todo: get chef use location info;
         }
         this.setState({showLocSearch:false, pickedAddress:address, city:address.city, state:address.state, zipcode: address.postal, showProgress: true});
         this.componentDidMount(); //todo: we refresh it like this?
    }

    onCancelMap(){
         this.setState({showLocSearch:false});
    }

    onPressApplySearchButton(){
        this.searchChef(true);
    }

    onPressOrdersTabBtn(){
        if(!this.state.eater){
            this.props.navigator.resetTo({
                name: 'WelcomePage',
                  passProps: {
                      callback: function(eater,principal){
                          this.setState({eater:eater,principal:principal})
                      }.bind(this)
                  }
           });
           return
        }

        this.props.navigator.resetTo({
            name: 'OrderPage',
            passProps: {
                eater: this.state.eater,
                principal:this.state.principal,
            }
        });
    }

    onPressMeTabBtn(){
        if(!this.state.eater){
            this.props.navigator.resetTo({
                  name: 'WelcomePage',
                  passProps: {
                      callback: function(eater,principal){
                          this.setState({eater:eater,principal:principal})
                      }.bind(this)
                  }
           });
           return
        }

        this.props.navigator.resetTo({
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

    onOpenFilter(){
        this.setState({
            showChefSearch : true,
            selectedPriceLevels : JSON.parse(JSON.stringify(this.state.priceRankFilter)),
            selectedSortKey : this.state.sortKeyFilter,
            selectedShopType : this.state.shopTypeFilter,
        });
    }

    onDismissFilter(){
        this.setState({
            showChefSearch : false,//When dismissing filter, should we restore to default filer or just close the filter page (like Yelp)
            selectedPriceLevels : null,
            selectedSortKey : null,
            selectedShopType : null,
        })
    }

    searchChef(isApplySearchButtonPressed){
        if(isApplySearchButtonPressed==true){
           if(!this.state.eater){
              this.props.navigator.push({
                    name: 'WelcomePage',
                    passProps: {
                        callback: function(eater,principal){
                            this.setState({eater:eater,principal:principal})
                        }.bind(this)
                    }
             });
             return;
          }
          this.setState({showProgress:true});
        }

        let url = config.chefListEndpoint + '?'
        let queryLoc = '';
        if (this.state.GPSproxAddress) {
            queryLoc = 'lat=' + this.state.GPSproxAddress.lat + '&lng=' + this.state.GPSproxAddress.lng;
        }
        if (this.state.pickedAddress) {
            queryLoc = 'lat=' + this.state.pickedAddress.lat + '&lng=' + this.state.pickedAddress.lng;
        }
        url += queryLoc;

        if (this.state.selectedPriceLevels != {}){
            url += '&priceRankFilter='
            for (let level in this.state.selectedPriceLevels) {
                if (this.state.selectedPriceLevels[level] == true) {
                    url += level + ',';
                }
            }
        }

        if (url.charAt(url.length - 1) === ',') {
            url = url.substr(0, url.length - 1);
        }

        if (this.state.selectedShopType) {
            switch (this.state.selectedShopType) {
                case 'withAllShopType':
                    url += '&withAllShopType=true';
                    break;
                case 'withRestaurantsShopType':
                    url += '&withRestaurantsShopType=true';
                    break;
                case 'withYumsoExclusiveShopType':
                    url += '&withYumsoExclusiveShopType=true';
                    break;
                case 'withSpecialOfferShopType':
                    url += '&withSpecialOfferShopType=true';
                    break;
                default:
                    url += '&withAllShopType=true';
                    break;
            }
        }

        if (this.state.selectedSortKey) {
            switch (this.state.selectedSortKey) {
                case 'withBestRatedSort':
                    url += '&withBestRatedSort=true';
                    break;
                case 'withMostPopularSort':
                    url += '&withMostPopularSort=true';
                    break;
                case 'withSoonestDeliveryTimeSort':
                    url += '&withSoonestDeliveryTimeSort=true';
                    break;
                case 'withShortestDistanceSort':
                    url += '&withShortestDistanceSort=true';
                    break;
                default:
                    url += '&withBestRatedSort=true';
                    break;
            }
        }

        return this.client.getWithoutAuth(url)
            .then((res) => {
                if (res.statusCode === 200 || res.statusCode === 202) {
                    var chefs = res.data.chefs;
                    for (var chef of chefs) {
                        if (chef && !(this.state.chefView[chef.chefId] && this.state.chefsDictionary[chef.chefId])) {
                            let starDishPictures = [];
                            if (chef.highLightDishIds) {
                                for (var dishId in chef.highLightDishIds) {
                                    starDishPictures.push(chef.highLightDishIds[dishId]);
                                }
                            }
                            this.state.chefView[chef.chefId] = starDishPictures;
                            this.state.chefsDictionary[chef.chefId] = chef;
                        }
                    }
                    this.setState({ currentTime: new Date().getTime(), dataSource: this.state.dataSource.cloneWithRows(chefs) })

                    if (res.statusCode === 202) {
                        this.setState({ showUpdateAppBanner: true });
                    }
                    // this.onRefreshDone();
                } else {
                    // this.onRefreshDone();
                    //todo: handle failure.
                    return self.responseHandler(res);
                }
                this.setState({ showChefSearch: false, showProgress: false });

                this.setState({
                    showChefSearch: false,
                    showProgress: false,
                    priceRankFilter : JSON.parse(JSON.stringify(this.state.selectedPriceLevels)),
                    sortKeyFilter : this.state.selectedSortKey,
                    shopTypeFilter : this.state.selectedShopType,
                });
            }).catch((err) => {
                commonAlert.networkError(err);
            });
    }

    navigateToShopPage(chef){
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

var styleChefListPage = StyleSheet.create({
    customizedHeaderBannerRules:{
        borderColor:'#F5F5F5',
        borderBottomWidth:1,
    },
    headerIconView:{
        width:40*windowWidthRatio,
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row',
    },
    foodTagTabsView:{
        flex:0.07,
        height:windowHeight*0.065,
        borderColor:'#F5F5F5',
        borderBottomWidth:1,
        paddingHorizontal:windowWidth/20.7,
    },
    foodTagTabText:{
        flexDirection:'row',
        alignItems:'center',
        alignSelf:'center',
        justifyContent:'center',
        fontWeight:'300', 
        color:'#4A4A4A',
        fontSize:15*windowHeight/677,
        paddingTop:windowHeight*0.012,
        paddingBottom:windowHeight*0.002,
        marginRight:windowWidth*0.05,
    },
    foodTagSelectedStyle:{
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
        backgroundColor:'transparent',
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
        backgroundColor:'transparent',
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
        backgroundColor: 'transparent'
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
