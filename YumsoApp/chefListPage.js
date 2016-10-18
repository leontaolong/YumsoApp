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
var NetworkUnavailableScreen = require('./networkUnavailableScreen');
var profileImgNoSignIn = require('./icons/defaultAvatar.jpg');
var ballonIcon = require('./icons/icon-location-white.png');
var favoriteIcon = require('./icons/icon-liked-white.png');
var labelIcon = require('./icons/icon-label.png');
var menuIcon = require('./icons/icon-menu.webp');
var notlikedIcon = require('./icons/icon-unliked.png')
var likedIcon = require('./icons/icon-liked.png');
var backIcon = require('./icons/icon-back.png');
var dollarSign1_Grey = require('./icons/icon-dollar1-grey.webp');
var dollarSign2_Grey = require('./icons/icon-dollar2-grey.webp');
var dollarSign3_Grey = require('./icons/icon-dollar3-grey.webp');
var dollarSign1_Orange = require('./icons/icon-dollar1-orange.webp');
var dollarSign2_Orange = require('./icons/icon-dollar2-orange.webp');
var dollarSign3_Orange = require('./icons/icon-dollar3-orange.webp');
var sortCriteriaIconGrey = require('./icons/icon-rating-grey-empty.webp');
var sortCriteriaIconOrange = require('./icons/icon-rating-orange-empty.webp');
var RefreshableListView = require('react-native-refreshable-listview');

import Dimensions from 'Dimensions';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;
console.log(windowHeight+" "+windowWidth);

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
    AppState
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
            city:'Seattle',
            state:'WA',
            pickedAddress:undefined,
            dollarSign1: dollarSign1_Grey,
            dollarSign2: dollarSign2_Grey,
            dollarSign3: dollarSign3_Grey,
            priceRankFilter:{},
            sortCriteriaIcon:sortCriteriaIconGrey,
            deviceToken: null,
            currentTime: new Date().getTime(),
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
                 Alert.alert( 'Server Error', 'Failed. Please try again later',[ { text: 'OK' }]);   
            }
        };
    }

    async componentDidMount() {
        if(!this.state.pickedAddress){
           this.setState({showProgress:true});
           await this.getLocation().catch((err)=>{
                 this.setState({GPSproxAddress:undefined,showProgress:false,pickedAddress:{lat:47.6062095, lng:-122.3320708}}); 
                 commonAlert.locationError(err);
           });//todo: really wait??
           console.log("commonAlert.locationError");
           this.setState({showProgress:false})
        }
        let eater = this.state.eater;
        if(!eater || !eater.chefFilterSettings){
            eater = await AuthService.getEater();
        }
        let principal = await AuthService.getPrincipalInfo();
        if(eater){
           this.setState({ 
                dollarSign1: eater.chefFilterSettings.priceRankFilter[1]==true? dollarSign1_Orange:dollarSign1_Grey,
                dollarSign2: eater.chefFilterSettings.priceRankFilter[2]==true? dollarSign2_Orange:dollarSign2_Grey,
                dollarSign3: eater.chefFilterSettings.priceRankFilter[3]==true? dollarSign3_Orange:dollarSign3_Grey,
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

        if(response && response.data){
           var chefs = response.data.chefs;
           var chefView = {};
           var chefsDictionary = {};
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
                }
           }
           this.setState({ dataSource: this.state.dataSource.cloneWithRows(chefs), showProgress: false, showNetworkUnavailableScreen:false, chefView: chefView, chefsDictionary: chefsDictionary, currentTime: new Date().getTime()});
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
                                self.setState({ GPSproxAddress: { formatted_address: address, lat: position.coords.latitude, lng: position.coords.longitude, state: state, city: city }, city: city, state: state });
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
        if (like==true) {
            var likeIcon = likedIcon;
        } else {
            var likeIcon = notlikedIcon;
        }
        console.log(chef);
        var nextDeliverTimeView = null;
        var EOD = new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000;
        if(chef.nextDeliverTime && chef.nextDeliverTime>this.state.currentTime && chef.nextDeliverTime<EOD){
           nextDeliverTimeView = <View style={styleChefListPage.nextDeliverTimeView}>
                                      <Text style={styleChefListPage.nextDeliverTimeText}>Today's Next: {dateRender.formatTime2StringShort(chef.nextDeliverTime)}</Text>
                                 </View>;
        }else{
           nextDeliverTimeView = <View style={styleChefListPage.nextDeliverTimeView}>
                                      <Text style={styleChefListPage.nextDeliverTimeText}>Today's Next: None</Text>
                                 </View>;
        }

        // var swiperView = null
        // if(this.state.chefView[chef.chefId]){
        //    swiperView = this.state.chefView[chef.chefId].map((picture) => {
        //                     return (
        //                         <TouchableHighlight key={picture} onPress={() => this.navigateToShopPage(chef)} underlayColor='#C0C0C0'>
        //                             <Image source={{ uri: picture }} style={styleChefListPage.chefListViewChefShopPic}
        //                                 onError={(e) => this.setState({ error: e.nativeEvent.error, loading: false })}>
        //                                 {nextDeliverTimeView}
        //                             </Image>
        //                         </TouchableHighlight>
        //                     );
        //                   });
        // }

        return (
            <View style={styleChefListPage.oneShopListView}>
                <View style={styleChefListPage.oneShopPhotoView}>
                    <Swiper showsButtons={false} height={windowHeight*0.388} horizontal={true} autoplay={false}
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
                <View style={styleChefListPage.shopInfoView}>
                    <TouchableHighlight style={styleChefListPage.chefPhotoView} underlayColor={'transparent'} onPress={() => this.navigateToShopPage(chef) }>
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
                             <Text style={styleChefListPage.reviewNumberText}>{chef.reviewCount} reviews</Text>
                          </View>
                          <View style={styleChefListPage.distanceDollarSignView}>
                             <Text style={styleChefListPage.distanceDollarSignText}>{chef.distance!=undefined && chef.distance!=null?(chef.distance>20?'>20':chef.distance)+' miles | ':''}{dollarSign.renderLevel(chef.priceLevel)}</Text>
                          </View>   
                       </View>
                       
                       <View style={styleChefListPage.shopInfoRow3}>
                          <View style={styleChefListPage.labelView}>
                            <Image style={styleChefListPage.labelIcon} source={labelIcon}/><Text style={styleChefListPage.labelText}>{chef.styleTag}</Text>
                          </View>
                          <View style={styleChefListPage.labelView}>
                            <Image style={styleChefListPage.labelIcon} source={labelIcon}/><Text style={styleChefListPage.labelText}>{chef.foodTag}</Text>
                          </View>
                       </View>                       
                    </View>
                </View>
            </View>
        );
    }
    
    render() {
        const menu = <Menu navigator={this.props.navigator} eater={this.state.eater} currentLocation={this.state.GPSproxAddress} principal={this.state.principal} caller = {this}/>;
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView =<View style={styles.listLoadingView}>
                                    <ActivityIndicatorIOS animating={this.state.showProgress} size="large" style={styles.loader}/>
                                </View>;  
        }
        
        var cheflistView = <RefreshableListView ref="listView"
                            dataSource = {this.state.dataSource}
                            renderRow={this.renderRow.bind(this)}
                            loadData={this.searchChef.bind(this)}
                            refreshDescription = " "/>
        var networkUnavailableView = null;
        if(this.state.showNetworkUnavailableScreen){
           networkUnavailableView = <NetworkUnavailableScreen onReload = {this.componentDidMount.bind(this)} />
           cheflistView = null;
        }

        if(this.state.showLocSearch){
            return(<MapPage onSelectAddress={this.mapDone.bind(this)} onCancel={this.onCancelMap.bind(this)} eater={this.state.eater} city={this.state.city} currentAddress={this.state.GPSproxAddress} showHouseIcon={true}/>);   
        }else if(this.state.showChefSearch){
            return <View style={styles.greyContainer}>
                       <View style={styles.headerBannerView}>    
                            <TouchableHighlight style={styles.headerLeftView} onPress={() => this.setState({
                                                                showChefSearch: false,
                                                                isMenuOpen: false,
                                                                priceRankFilter: JSON.stringify(this.state.priceRankFilterOrigin)==undefined ? null : JSON.parse(JSON.stringify(this.state.priceRankFilterOrigin)),
                                                                withBestRatedSort: this.state.withBestRatedSortOrigin,
                                                             })} underlayColor={'#F5F5F5'}>
                                <View style={styles.backButtonView}>
                                    <Image source={backIcon} style={styles.backButtonIcon}/>
                                </View>
                            </TouchableHighlight>    
                            <View style={styles.titleView}>
                                <Text style={styles.titleText}>Filter</Text>
                            </View>
                            <View style={styles.headerRightView}>
                            </View>
                        </View>     
                        <View style={styleFilterPage.dollarSignSelectionView}>
                           <View style={styleFilterPage.dollarSignSelectionView}>
                              <TouchableHighlight underlayColor={'transparent'} style={styleFilterPage.dollarSignView} onPress={() => this.clickDollarSign(1)}>
                                  <Image source={this.state.dollarSign1} style={styleFilterPage.dollarSign}/>
                              </TouchableHighlight>
                              <TouchableHighlight underlayColor={'transparent'} style={styleFilterPage.dollarSignView} onPress={() => this.clickDollarSign(2)}>
                                  <Image source={this.state.dollarSign2} style={styleFilterPage.dollarSign}/>
                              </TouchableHighlight>
                              <TouchableHighlight underlayColor={'transparent'} style={styleFilterPage.dollarSignView} onPress={() => this.clickDollarSign(3)}>
                                  <Image source={this.state.dollarSign3} style={styleFilterPage.dollarSign}/>
                              </TouchableHighlight>
                           </View>
                        </View> 
                    <View style={styleFilterPage.sortCriteriaSectionTitleView}>          
                       <Text style={styleFilterPage.sortCriteriaSectionTitleText}>Sort by</Text>
                    </View>
                    <View style={styleFilterPage.sortCriteriaView}>
                       <View style={styleFilterPage.sortCriteriaTitleView}>
                          <Text style={styleFilterPage.sortCriteriaTitleText}>Best Rated</Text>
                       </View>
                       <View style={styleFilterPage.sortCriteriaIconView}>
                          <TouchableHighlight style={styleFilterPage.sortCriteriaIconWrapper} underlayColor={'transparent'} 
                               onPress={() => this.clickSortSelection('withBestRatedSort')}>
                              <Image source={this.state.sortCriteriaIcon} style={styleFilterPage.sortCriteriaIcon}/>
                          </TouchableHighlight>
                       </View>
                    </View>
                    {loadingSpinnerView}
                    <View style={{flex:1}}>
                    </View>
                    <TouchableOpacity activeOpacity={0.7} style={styles.footerView} onPress={() => this.onPressApplySearchButton()}>
                        <Text style={styleFilterPage.applySearchButtonText}>Apply and Search</Text>
                    </TouchableOpacity>                
               </View>                    
        }
        
        return (
            <SideMenu menu={menu} isOpen={this.state.isMenuOpen}>
                <View style={styles.container}>                    
                    <View style={styleChefListPage.headerBannerView}>
                        <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.setState({ isMenuOpen: true }) }>
                          <View style={styles.menuButtonView}>
                            <Image source={menuIcon} style={styles.menuIcon}/>
                          </View>
                        </TouchableHighlight>
                        <TouchableHighlight underlayColor={'#F5F5F5'} onPress={() => this.setState({showLocSearch:true}) }>
                        <View style={styles.titleView}>
                            <Text style={styles.titleText}>{this.state.city?this.state.city:'unknow'}</Text>
                        </View>
                        </TouchableHighlight>
                        <TouchableHighlight style={styles.headerRightView} underlayColor={'#F5F5F5'} onPress={() => this.setState({showChefSearch:true})}>
                          <View style={styles.headerRightTextButtonView}>
                              <Text style={styles.headerRightTextButtonText}>Filter</Text>
                          </View>
                        </TouchableHighlight>
                    </View>
                    <View style={styleChefListPage.orangeTopBannerView}>
                        <View style={styleChefListPage.orangeTopBannerButtonView}>
                          <TouchableHighlight style={styleChefListPage.orangeTopBannerButtonWrapper} underlayColor={'transparent'}  onPress={() => this.setState({showLocSearch:true}) }>
                             <Image style={styleChefListPage.orangeTopBannerButtonIcon} source={ballonIcon}/>
                          </TouchableHighlight>
                        </View>
                        <View style={styleChefListPage.orangeTopBannerButtonView}>
                           <TouchableHighlight style={styleChefListPage.orangeTopBannerButtonWrapper} underlayColor={'transparent'}  onPress={() => this.showFavoriteChefs() }>
                             <Image style={styleChefListPage.orangeTopBannerButtonIcon} source={this.state.showFavoriteChefsOnly===true?likedIcon:favoriteIcon}/>
                           </TouchableHighlight>
                        </View>
                    </View> 
                    {networkUnavailableView}
                    {cheflistView}
                    {loadingSpinnerView}
                </View>
            </SideMenu>
        );
    }
    
    onRefreshDone(){
        this.refs.listView.scrollTo({x:0, y:0, animated: true})
    }

    clickDollarSign(priceLevel){
        this.state.priceRankFilter[priceLevel] = !this.state.priceRankFilter[priceLevel];
        switch(priceLevel){
            case 1:
               this.setState({dollarSign1: this.state.priceRankFilter[priceLevel]==true? dollarSign1_Orange:dollarSign1_Grey}); 
               break;
            case 2:
               this.setState({dollarSign2: this.state.priceRankFilter[priceLevel]==true? dollarSign2_Orange:dollarSign2_Grey}); 
               break;
            case 3:
               this.setState({dollarSign3: this.state.priceRankFilter[priceLevel]==true? dollarSign3_Orange:dollarSign3_Grey}); 
               break;
        }
          
        this.setState({priceRankFilter:this.state.priceRankFilter});
    }
    
    clickSortSelection(sortByKey){
        this.setState({[sortByKey]:!this.state[sortByKey]});
        this.setState({sortCriteriaIcon:this.state[sortByKey]? sortCriteriaIconOrange : sortCriteriaIconGrey})
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
    
    mapDone(address){
         if(address){
             Alert.alert( '', 'Your search location is set to '+address.formatted_address,[ { text: 'OK' }]); 
             //todo: get chef use location info;                 
         }
         this.setState({showLocSearch:false, pickedAddress:address, city:address.city, state:address.state, isMenuOpen: false, showProgress: true});
         this.componentDidMount(); //todo: we refresh it like this?
    }
    
    onCancelMap(){
         this.setState({showLocSearch:false, isMenuOpen: false});
    }
    
    onPressApplySearchButton(){
        this.searchChef(true);
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
                        if (res.statusCode === 200) {
                            var chefs = res.data.chefs;
                            this.setState({currentTime:new Date().getTime(), dataSource: this.state.dataSource.cloneWithRows(chefs) })
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
                    if (res.statusCode != 200) {
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
        console.log('GPSproxAddress: '+this.state.GPSproxAddress)
        this.props.navigator.push({
            name: 'ShopPage', 
            passProps:{
                chef:chef,
                eater:this.state.eater,
                currentLocation:this.state.GPSproxAddress,
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
        if(isAuthenticated && this.props.eater.eaterProfilePic){
            profileImg = {uri:this.props.eater.eaterProfilePic};
        }else{
            
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
                <View style={{height:windowHeight*0.07}}></View>
                <TouchableOpacity activeOpacity={0.7} style={sideMenuStyle.paddingMenuItemView} onPress={this.goToOrderHistory}>
                   <Text style={sideMenuStyle.paddingMenuItem}>My Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} style={sideMenuStyle.paddingMenuItemView} onPress={this.goToEaterPage} >
                   <Text style={sideMenuStyle.paddingMenuItem}>My Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} style={sideMenuStyle.paddingMenuItemView} onPress={this.goToPaymentOptionPage}>
                   <Text style={sideMenuStyle.paddingMenuItem}>Payment</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} style={sideMenuStyle.paddingMenuItemView}>
                   <Text style={sideMenuStyle.paddingMenuItem}></Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} style={sideMenuStyle.paddingMenuItemView}>
                   <Text style={sideMenuStyle.paddingMenuItem}></Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} style={sideMenuStyle.paddingMenuItemView}>
                   <Text style={sideMenuStyle.paddingMenuItem}></Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} style={sideMenuStyle.paddingMenuItemView} onPress={isAuthenticated?this.logOut:this.logIn}>
                   <Text style={sideMenuStyle.paddingMenuItem}>{isAuthenticated?'Log out':'Log in'}</Text>
                </TouchableOpacity>
                <View style={{height:windowHeight*0.02}}></View>
                <TouchableOpacity activeOpacity={0.7} style={sideMenuStyle.paddingMenuItemContactUsView} onPress={this.navigateToContactUsPage}>
                   <Text style={sideMenuStyle.paddingMenuItemAbout}>Contact Us</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} style={sideMenuStyle.paddingMenuItemAboutView} onPress={this.navigateToAboutPage}>
                   <Text style={sideMenuStyle.paddingMenuItemAbout}>About</Text>
                </TouchableOpacity>
            </View>
        );
    },

    // _handleAppStateChange: function(appState) {
    //     var LastAppState = ; 
    // },

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

    logOut: function(){
        return AuthService.logOut()
        .then(()=>{
            this.props.caller.setState({eater:undefined});
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
                callback: this.props.caller.componentDidMount.bind(this.props.caller),
            }            
        }); 
    },
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
    paddingMenuItemView:{
        paddingVertical:windowWidth*0.0227,
    },
    paddingMenuItem: {
        paddingLeft:windowWidth*0.064,        
        color:'#fff',
        fontSize:windowHeight/37.055,
    },
    paddingMenuItemAbout: {
        paddingVertical: windowWidth*0.015,
        color:'#fff',
        borderTopWidth:1,
        borderColor:'#fff',
        fontSize:windowHeight/41.69,
    },
    paddingMenuItemContactUsView:{
        borderTopWidth:1,
        borderColor:'#fff',
        width:windowWidth*0.226,
        marginLeft:windowWidth*0.064,
    },
    paddingMenuItemAboutView:{
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
       alignSelf:'stretch',
       backgroundColor:'#FFFFFF',
       borderColor:'#F5F5F5',
       borderTopWidth:5,
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
       fontSize:windowHeight/37.06,
       fontWeight:'500',
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
       flex:0.6,
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
        flex:0.25,
        flexDirection:'row',
        justifyContent:'flex-end',
    },
    distanceDollarSignText:{
        fontSize:11,
        color:'#4A4A4A',
        textAlign:'left',
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
    nextDeliverTimeView:{
        marginTop:-windowHeight*0.388+7,
        paddingHorizontal:7,
        paddingVertical:3,
        flexDirection: 'column',
        alignItems:'center',
        justifyContent:'center',
        alignSelf:'flex-end',
        borderRadius: 8, 
        borderWidth: 0, 
        overflow: 'hidden',
        opacity:0.75,
        backgroundColor:'#FFFFFF',
        marginRight:7,
    },
    nextDeliverTimeText:{
        color:'#4A4A4A',
        fontSize:12
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
    dollarSign:{
        width:windowHeight*0.07,
        height:windowHeight*0.07,
        alignSelf:'center',
    },
    applySearchButtonText:{
        color:'#fff',
        fontSize:windowHeight/30.6,
        fontWeight:'400',
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
        height:windowHeight*0.088,
        flexDirection:'row', 
        borderColor:'#F5F5F5',
        borderBottomWidth:1,    
        backgroundColor:'#FFFFFF',
    },
    sortCriteriaTitleView:{
        width:windowWidth*0.85,
        height:windowHeight*0.088,
        flexDirection:'row',
        alignItems:'flex-start',        
    },
    sortCriteriaTitleText:{
        alignSelf:'center',
        color:'#4A4A4A',
        fontSize:windowHeight/40.572,
        marginLeft:windowWidth*0.0406,
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
});
module.exports = ChefListPage;