'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var MapView = require('react-native-maps');
var RCTUIManager = require('NativeModules').UIManager;
var searchIcon = require('./icons/icon-search.png');
var locatorIcon = require('./icons/icon-location.png');
var houseIcon = require('./icons/icon-grey-house.png');
var closeIcon = require('./icons/icon-close.png');
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen')

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
  TouchableOpacity,
  ActivityIndicatorIOS,
  AsyncStorage,
  Alert,
  Picker,
  ScrollView,
} from 'react-native';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

class MapPage extends Component {
    constructor(props){
        super(props);
        let routeStack;
        let eater;
        let city;
        if(this.props.navigator){
           routeStack = this.props.navigator.state.routeStack;
        }
        let mark = undefined;    
        if(this.props.initialLoc){
            mark = {
                id :'saved',
                latlng: { latitude: this.props.initialLoc.lat, longitude: this.props.initialLoc.lng },
                title: this.props.initialLoc.formatted_address,
            };       
            this.initialRegion = {
                latitude: this.props.initialLoc.lat,
                longitude: this.props.initialLoc.lng,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            };
        }else if(this.props.currentAddress && this.props.currentAddress!=null){
            this.initialRegion = {
                latitude: this.props.currentAddress.lat,
                longitude: this.props.currentAddress.lng,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            };
        }else{//Seattle,WA
            this.initialRegion = {
                latitude: 47.6062095,
                longitude: -122.3320708,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            };
        }
        if(routeStack && routeStack.length!=0){
            this.onSelectAddress = routeStack[routeStack.length-1].passProps.onSelectAddress;
            eater = routeStack[routeStack.length-1].passProps.eater;
            city = routeStack[routeStack.length-1].passProps.city;
        }
        if(this.props.eater && this.props.eater!=null){
            eater = this.props.eater;
            city = this.props.city;
        }
        if (this.props.specificAddressMode) {
            this.isSpecific = true;
        }

        if (this.props.showHouseIcon) {
            this.showHouseIcon = true;
        }else{
            this.showHouseIcon = false;
        }
        
        this.state = {
            showProgress:false,
            showMapView:true,
            showAddNewAddressInputView:false,
            markers:mark?[mark]:[],
            eater:eater,
            city:city,
            showApartmentNumber:false,
            usedSavedAddress:false,
            selectedAddress: this.props.initialLoc,
            aptNumberViewYposition:windowHeight-windowHeight*0.074*2,
        };
        this.client = new HttpsClient(config.baseUrl, true);
        this.googleClient = new HttpsClient(config.googleGeoBaseUrl);
    }
   
    render() {  
            var loadingSpinnerView = null;
            if (this.state.showProgress) {
                loadingSpinnerView = <LoadingSpinnerViewFullScreen/>;  
            }
            let aptView = <View></View>;
            if(this.state.showApartmentNumber){
               aptView = (<View key={'aptView'} style={{backgroundColor:'#fff', position:'absolute', flexDirection:'row', justifyContent:'center', 
                                top: this.state.aptNumberViewYposition, left:0, right:0, height:windowHeight*0.074,}}>
                              <Text style={styleMapPage.aptNumberViewTitle}>Apt/Suite# </Text>
                              <TextInput style={styleMapPage.aptNumberViewInput} onFocus = {()=>this.slideUpAptNumberView()} clearButtonMode={'while-editing'} returnKeyType = {'done'} autoCorrect={false}
                               maxLength={20} value={this.state.apartmentNumber} keyboardType={'numbers-and-punctuation'} onSubmitEditing = {()=>this.slideDownAptNumberView()} onChangeText = {(text) => this.setState({ apartmentNumber: text })}/>
                          </View>);
            }   
            
            this.state.savedAddressesView = this.renderSavedAddresses(); //todo: also include home and work addresses for selection.
            let addressSelectionView=[];
            var addressBookClickableView = null;
            if(this.showHouseIcon){
               addressBookClickableView = [(<Text key={'separator'} style={{fontSize:windowHeight/30.66,alignSelf:'center',color:'#D7D7D7'}}>|</Text>),
                                           (<TouchableHighlight key={'addressBookButton'}  onPress={() => this.onPressHouseIcon()} style={styleMapPage.addressBookClickableView} underlayColor={'#F5F5F5'}>
                                              <Text style={styleMapPage.currentLocationClickableText}>Address Book</Text>
                                            </TouchableHighlight>)];
            }
            if(!this.state.showMapView){
                addressSelectionView.push(<View key={'addressSelectionView'} style={styleMapPage.addressSelectionView}>
                                            <View key={'addressSelectionTab'} style={{flexDirection:'row',justifyContent:'center'}}>
                                                <TouchableHighlight onPress={()=>this.locateToCurrentAddress()} style={styleMapPage.currentLocationClickableView} underlayColor={'#F5F5F5'}> 
                                                    <Text style={styleMapPage.currentLocationClickableText}>Current Location</Text>
                                                </TouchableHighlight>
                                                {addressBookClickableView}
                                            </View>
                                          {this.state.savedAddressesView}               
                                         </View>);  
            }                       

            var searchAddressResultViewWrapper=null;
            if(this.state.searchAddressResultView && this.state.searchAddressResultView.length>0){
               searchAddressResultViewWrapper=(<View key={'searchAddressResultView'} style={{backgroundColor:'#fff', position:'absolute', top: this.state.mapViewYposition,left:0,right:0, height:windowHeight-this.state.mapViewYposition,opacity:0.9}}> 
                                                 {this.state.searchAddressResultView}
                                               </View>);  
            }
                                                
            return (
                 <View style={styles.container}>
                    <View style={styles.headerBannerView}>    
                        <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBack()}>
                            <View style={styles.backButtonView}>
                                <Image source={closeIcon} style={styles.closeButtonIcon}/>
                            </View>
                        </TouchableHighlight>
                        <View style={styles.titleView}></View>  
                        <View style={styles.headerRightView}></View>   
                    </View>
                    <View style={[styles.pageTitleView, {marginBottom:0, paddingLeft:windowWidth/20.7}]}>
                        <Text style={styles.pageTitle}>Delivery Address</Text>
                    </View>
                    
                    <View style={{alignSelf:'stretch', alignItems:'center'}}>
                       <View  style={styleMapPage.locationSearchInputCancelView}>
                            <View style={styleMapPage.locationSearchInputView}>
                                <TouchableHighlight style={styleMapPage.locationSearchIconView} underlayColor={'transparent'} onPress={() => this.searchAddress() }>
                                    <Image source={searchIcon} style={styleMapPage.searchIcon}/>
                                </TouchableHighlight>  
                                <TextInput placeholder="City/State/Zip Code" style={styleMapPage.locationSearchInput}  onSubmitEditing = {()=> this.searchAddress()} returnKeyType = {'search'} clearButtonMode={'while-editing'} maxLength={60}
                                autoCorrect={false} onChangeText = {(text)=>this.setState({searchAddress: text,selectedAddress:''})} value={this.state.selectedAddress?this.state.selectedAddress.formatted_address:this.state.searchAddress}/>
                            </View>
                       </View>
                       <View style={{flexDirection:'row',justifyContent:'center'}}>
                            <TouchableHighlight onPress={()=>this.locateToCurrentAddress()} style={styleMapPage.currentLocationClickableView} underlayColor={'#F5F5F5'}> 
                                 <Text style={styleMapPage.currentLocationClickableText}>Current Location</Text>
                            </TouchableHighlight>
                            {addressBookClickableView}
                       </View>                     
                    </View>
                    <MapView ref='MapView' style={styleMapPage.mapView}
                        initialRegion={this.initialRegion}
                        region={this.state.region}
                        onRegionChange={this.onRegionChange.bind(this) }>
                        {this.state.markers.map(marker => (
                            <MapView.Marker key={marker} ref={marker.id} draggable
                                coordinate={marker.latlng}
                                title={marker.title}
                                description={marker.description}
                                onDragEnd={(e) => this.onDragEnd(e.nativeEvent.coordinate)}
                                />
                        ))}
                    </MapView>   
                  
                    <TouchableOpacity activeOpacity={0.7} style={styles.footerView} onPress={() => this.doneSelectAddress()}>
                        <Text style={styles.bottomButtonView}>{this.isSpecific && !this.state.showApartmentNumber ? 'Next': 'Use this Address'}</Text>
                    </TouchableOpacity>
                    {searchAddressResultViewWrapper}
                    {addressSelectionView}
                    {aptView}
                    {loadingSpinnerView}   
                </View>
            );                      
    }

    renderSavedAddresses(){
        if(!this.state.eater){
            return undefined;
        }
        let workAddress = this.state.eater.workAddress;
        let homeAddress = this.state.eater.homeAddress;
        let otherAddresses = this.state.eater.addressList;
        var addressesView = []
        let i=1;
        if(homeAddress){
            addressesView.push(
                <TouchableHighlight key={'homeAddress'} underlayColor={'#F5F5F5'} onPress={()=>this.useSavedAddress(homeAddress)}>
                <View style={styleMapPage.oneAddressView}>
                    <View style={styleMapPage.oneAddressIconTitleView}>
                        <Text style={styleMapPage.oneAddressTitleText}>Home</Text>
                    </View>
                    <View style={styleMapPage.oneAddressTextView}>
                        <Text style={styleMapPage.oneAddressText}>
                            {homeAddress.formatted_address} {homeAddress.apartmentNumber? 'Apt/Suite# '+homeAddress.apartmentNumber:''}
                        </Text>
                    </View>
                </View>
                </TouchableHighlight>
            );
        }
        if(workAddress){
            addressesView.push(
                <TouchableHighlight key={'workAddress'} underlayColor={'#F5F5F5'} onPress={()=>this.useSavedAddress(workAddress)}>
                <View style={styleMapPage.oneAddressView}>
                    <View style={styleMapPage.oneAddressIconTitleView}>
                        <Text style={styleMapPage.oneAddressTitleText}>Work</Text>
                    </View>
                    <View style={styleMapPage.oneAddressTextView}>
                        <Text style={styleMapPage.oneAddressText}>
                            {workAddress.formatted_address} {workAddress.apartmentNumber? 'Apt/Suite# '+workAddress.apartmentNumber:''}
                        </Text>
                    </View>
                </View>
                </TouchableHighlight>
            );
        }
        for(let address of otherAddresses){
            addressesView.push(
                <TouchableHighlight key={'otherAddresses'+i} underlayColor={'#F5F5F5'} onPress={()=>this.useSavedAddress(address)}>
                <View style={styleMapPage.oneAddressView}>
                    <View style={styleMapPage.oneAddressIconTitleView}>
                        <Text style={styleMapPage.oneAddressTitleText}>Other</Text>
                    </View>
                    <View style={styleMapPage.oneAddressTextView}>
                        <Text style={styleMapPage.oneAddressText}>
                            {address.formatted_address} {address.apartmentNumber? 'Apt/Suite# '+address.apartmentNumber:''}
                        </Text>
                    </View>
                </View>
                </TouchableHighlight>
            );
            i++;
        }
        return addressesView;
    }
    //todo: this two should be the same thing?
    renderSearchResult(addressList){
        var addressesView = []
        for(let address of addressList){
            addressesView.push(<View key={address.formatted_address} style={styleMapPage.possibleAddressView}>
                                  <Text style={styleMapPage.possibleAddressText} onPress={()=>{this.usedSavedAddress=false; this.useAddress(address)}}>  {address.formatted_address}</Text>
                               </View>);
        }
        return addressesView;
    }
    
    onRegionChange(region){ //todo: Will this be used?
        this.setState({ region });
    }
    
    //Get current location
    getLocation(callback){
        var self = this;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.state.position = position;
                return self.googleClient.getWithoutAuth(config.reverseGeoCoding + position.coords.latitude + ',' + position.coords.longitude)
                    .then((res) => {
                        let streetNumber = 'unknown';
                        let streetName = 'unknown';
                        let city = 'unknown';
                        let state = 'unknown';
                        let postal = 'unknown';
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
                                    if (type === 'postal_code') {
                                        postal = component.short_name;
                                    }
                                    if (type === 'street_number') {
                                        streetNumber = component.short_name;
                                    }
                                    if (type === 'route') {
                                        streetName = component.short_name;
                                    }
                                } 
                            }
                            if((streetName==='unknown' || streetNumber==='unknown' || city=='unknown' || state=='unknown' || postal=='unknown') && this.isSpecific){
                                this.setState({selectedAddress:undefined,showProgress:false});
                                Alert.alert( 'Warning', 'Cannot find enough information about this location',[ { text: 'OK' }]); 
                                return;         
                            }                         
                            self.setState({GPSproxAddress: {
                                                            formatted_address: address, 
                                                            lat: position.coords.latitude, 
                                                            lng:position.coords.longitude, 
                                                            streetNumber:streetNumber,
                                                            streetName:streetName,
                                                            city:city,
                                                            state:state,
                                                            postal:postal,                                                          
                                                           }
                                         });
                            callback(self.state.GPSproxAddress);
                        }else{
                            callback();
                        }
                        self.setState({ city: city, state: state });
                    }).catch((err)=>{      
                       self.setState({selectedAddress:undefined,showProgress:false});
                       Alert.alert( 'Location Unavailable', 'Cannot get your street number. Please enable network connection.',[ { text: 'OK' }]);
                       return;
                    });       
            },
            (error) => {
                self.setState({selectedAddress:undefined,showProgress:false}); 
                Alert.alert( 'Location Unavailable', 'Location can not be retrieved. Please enable network connection and location service.',[ { text: 'OK' }])
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );   
    }
    
    onDragEnd(cords){
        let address = {
            lat:cords.latitude,
            lng : cords.longitude
        }
        return this.googleClient.getWithoutAuth(config.reverseGeoCoding + address.lat + ',' + address.lng)
            .then((res) => {
                let streetNumber = 'unknown';
                let streetName = 'unknown';
                let city = 'unknown';
                let state = 'unknown';
                let postal = 'unknown';
                if (res.statusCode === 200 && res.data.status === 'OK' && res.data.results.length > 0) {
                    let results = res.data.results;
                    let formatAddress = results[0].formatted_address;
                    for (var component of results[0].address_components) {
                        for (var type of component.types) {
                            if (type === 'locality') {
                                city = component.long_name;
                            }
                            if (type === 'administrative_area_level_1') {
                                state = component.short_name;
                            }
                            if (type === 'postal_code') {
                                postal = component.short_name;
                            }
                            if (type === 'street_number') {
                                streetNumber = component.short_name;
                            }
                            if (type === 'route') {
                                streetName = component.short_name;
                            }
                        }
                    }
                    if((streetName==='unknown' || streetNumber==='unknown' || city=='unknown' || state=='unknown' || postal=='unknown') && this.isSpecific){
                        this.setState({ selectedAddress: undefined });                      
                        Alert.alert( 'Warning', 'Cannot find enough information about this location',[ { text: 'OK' }]); 
                        return;         
                    }
                    address.formatted_address = formatAddress;
                    address.city = city;
                    address.state = state;
                    address.postal = postal;
                    address.streetNumber = streetNumber;
                    address.streetName = streetName;
                    this.usedSavedAddress = false;
                    this.useAddress(address);
               }
            }).then(()=>{
                this.setState({ showApartmentNumber: false });
            }).catch((err)=>{      
                Alert.alert( 'Location Unavailable', 'Please check network connection.',[ { text: 'OK' }]);
            }); 
    } 

    doneSelectAddress() {
        if (this.isSpecific) {
            if(!this.state.selectedAddress){
                Alert.alert( 'Warning', 'Please specify an address with street name and number',[ { text: 'OK' }]);
                return;
            }
            if(!this.state.selectedAddress.streetNumber){ //todo: more validation on this.
                Alert.alert( 'Warning', 'This address is not specific. Please specify an address with street name and number',[ { text: 'OK' }]); 
                return;   
            }
            if(this.state.showApartmentNumber && (!this.state.apartmentNumber || !this.state.apartmentNumber.trim())){
                Alert.alert( 'Warning', 
                             'Wouldn\'t you specify your Apt./Suite number ?',
                             [ { text: 'Not Applicable', onPress:()=>{
                                        this.state.selectedAddress.apartmentNumber = null;
                                        if (this.state.selectedAddress) {
                                            if (this.state.eater) {
                                                if (this.onSelectAddress) {
                                                    this.onSelectAddress(this.state.selectedAddress);
                                                }
                                                if (this.props.onSelectAddress) {
                                                    this.props.onSelectAddress(this.state.selectedAddress);
                                                }
                                                this.state.selectedAddress = undefined;
                                            } else {
                                                if (this.onSelectAddress) {
                                                    this.onSelectAddress(this.state.selectedAddress);
                                                }
                                                if (this.props.onSelectAddress) {
                                                    this.props.onSelectAddress(this.state.selectedAddress);
                                                }
                                                this.state.selectedAddress = undefined;
                                            }
                                       }
                                   }
                               },
                               { text: 'Set Apt./Suite Number'} ,
                              ]
                           );
                return;
            }
            if (this.state.apartmentNumber === undefined && !this.usedSavedAddress) {     
                this.setState({showApartmentNumber: true, apartmentNumber: this.props.initialLoc? this.props.initialLoc.apartmentNumber:undefined});
                return;
            }
            if(!this.usedSavedAddress) this.state.selectedAddress.apartmentNumber = this.state.apartmentNumber.trim(); //todo: state management will add the apt and save next time in edit profile.
        }
        
        if (this.state.selectedAddress) {
            if (this.state.eater) {
                if (this.onSelectAddress) {
                    this.onSelectAddress(this.state.selectedAddress);
                }
                if (this.props.onSelectAddress) {
                    this.props.onSelectAddress(this.state.selectedAddress);
                }
                this.state.selectedAddress = undefined;
            } else {
                if (this.onSelectAddress) {
                    this.onSelectAddress(this.state.selectedAddress);
                }
                if (this.props.onSelectAddress) {
                    this.props.onSelectAddress(this.state.selectedAddress);
                }
                this.state.selectedAddress = undefined;
            }
        }else{
            Alert.alert( 'Warning', 'Please specify an address',[ { text: 'OK' }]); 
            return; 
        }
    }
    
    onPressHouseIcon() {
        this.setState({selectedAddress:'',searchAddressResultView:'',searchAddress:''});
        this.setState({showMapView: this.state.showMapView? false:true});
    }
    
    //Locate the map view to current user location
    useAddress(address){
        let lat = address.lat;
        let lng = address.lng;
        let addressName = address.formatted_address;
        let region = {
            latitude: lat, 
            longitude: lng,
            latitudeDelta: 0,
            longitudeDelta: 0
        }
        let markers = [{
            id :'m1',
            latlng: { latitude: lat, longitude: lng },
            title: addressName,
           // description: 'testDescription'
        }]; 
        this.setState({markers: markers, region: region, selectedAddress: address, showMapView: true,searchAddressResultView:''}); 
        this.refs.m1.showCallout();
    }
    
    useSavedAddress(address){
        this.usedSavedAddress = true;
        this.setState({showApartmentNumber:false});
        this.useAddress(address);
    }
    
    locateToCurrentAddress(){
        this.usedSavedAddress = false;
        if(this.state.GPSproxAddress){
           this.useAddress(this.state.GPSproxAddress);
        }else{
           this.setState({showProgress:true});
               this.getLocation(function(address){
                    this.setState({showProgress:false});
                    if(address){
                        this.useAddress(address);
                    }else{
                        Alert.alert('Warning','Current location not available',[{text:'OK'}]);
                        return;
                    }
               }.bind(this));
        }
    }
    
    searchAddress(){
        var address = this.state.searchAddress;
        if(!address || !address.trim()){
            Alert.alert( 'Warning', 'Please enter an address',[ { text: 'OK' }]);
            return;
        }
        address = address.trim();
        address = address.replace(/\s/g, "%20");
        this.setState({showProgress:true});
        this.googleClient.getWithoutAuth(config.searchAddress+address+'&key='+config.googleApiKey)
           .then((res)=>{
                this.setState({showProgress:false});
                if(res.statusCode===200 && res.data.status==='OK'){
                    var addresses = [];
                    let showWarningForSpecific = false;
                    for(var possibleAddress of res.data.results){
                        let city; let state; let postal; let streetNumber; let streetName; 
                        for (var component of possibleAddress.address_components) {
                            for (var type of component.types) {
                                if (type === 'locality') {
                                    city = component.long_name;
                                }
                                if (type === 'administrative_area_level_1') {
                                    state = component.short_name;
                                }
                                if (type === 'postal_code') {
                                    postal = component.short_name;
                                }
                                if (type === 'street_number') {
                                    streetNumber = component.short_name;
                                }
                                if (type === 'route') {
                                    streetName = component.short_name;
                                }                
                            }
                        }
                        if((streetNumber==undefined || streetName==undefined || city==undefined || state==undefined || postal==undefined) && this.isSpecific){
                            showWarningForSpecific = true;
                            continue; //todo: we don't need the result that does not have street number.
                        }
                        var onePossibility = {
                            formatted_address: possibleAddress.formatted_address,
                            lat: possibleAddress.geometry.location.lat,
                            lng: possibleAddress.geometry.location.lng,
                            city: city,
                            state: state,
                            postal: postal,
                            streetNumber: streetNumber,
                            streetName: streetName,
                        };
                        addresses.push(onePossibility);
                    }
                    // if(addresses.length==0 && showWarningForSpecific){
                    //     Alert.alert( 'Warning', 'Please be more specific',[ { text: 'OK' }]);
                    // }
                    let view = this.renderSearchResult(addresses);
                    //If only one possible address returned, locate it on the map
                    if(addresses.length==1){
                       this.useAddress(addresses[0]);
                    }else{
                       this.setState({searchAddressResultView: view,showMapView:true}); 
                    }
                }else if(res.data.status==='ZERO_RESULTS'){
                    Alert.alert( 'Warning', 'No possible address found',[ { text: 'OK' }]);            
                }
           }).catch((err)=>{      
              this.setState({showProgress:false});
              Alert.alert( 'Search Failed', 'Please check network connection.',[ { text: 'OK' }]);
           });
           
           //Get the position of the MapView in order to make the dropdown panel perfectly floating on the Map
           var view = this.refs['MapView'];
           var handle = React.findNodeHandle(view); 
           RCTUIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
               this.setState({mapViewYposition: y});
           })
    }
    
    navigateBack() {
        if(!this.props.navigator){
             if(this.props.onCancel){
                 this.props.onCancel();
             }   
             return;      
        }
        this.props.navigator.pop();
    }
    
    slideUpAptNumberView(){
        var view = this.refs['MapView'];
        var handle = React.findNodeHandle(view); 
        RCTUIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
               this.setState({mapViewYposition: y});
               this.setState({aptNumberViewYposition: y});
        })
        
    }
    
    slideDownAptNumberView(){
        this.setState({aptNumberViewYposition: windowHeight-windowHeight*0.074*2});
    }
}

var styleMapPage = StyleSheet.create({
    locationSearchInputCancelView:{
        flex:1,
        flexDirection:'row',
    },
    locationSearchInputView:{
        flexDirection:'row',
        alignItems:'flex-end',
        width:windowWidth*0.93,
        height:windowWidth*0.7/8,
        marginTop:windowHeight/36.8,
        marginBottom:windowHeight/147.2,
        borderRadius:8,
        backgroundColor:'#F5F5F5'
    },
    locationSearchIconView:{
        alignSelf:'center',
        margin:windowWidth*0.02,
    },
    searchIcon:{
        width:windowWidth*0.04,
        height:windowWidth*0.04,
    },
    locationSearchInput:{
        flex:0.9,
        fontSize:windowHeight/52.57,
        color:'#4A4A4A',
        fontWeight:'400',
        textAlign:'left',
    },
    currentLocationClickableView:{
        flex:0.5,
        flexDirection:'row',
        width:windowWidth*0.5,
        height:windowWidth*0.1,
        justifyContent:'flex-end',
        alignItems:'center',
        paddingRight:windowWidth/10.35,
    },
    addressBookClickableView:{
        flex:0.5,
        flexDirection:'row',
        width:windowWidth*0.5,
        height:windowWidth*0.1,
        justifyContent:'flex-start',
        alignItems:'center',
        paddingLeft:windowWidth/10.35,
    },
    currentLocationClickableText:{
        fontSize:windowHeight/46.0,
        color:'#7BCBBE',
        fontWeight:'500',
    },
    possibleAddressText:{
        fontSize:windowHeight/36.8,
        color:'#696969',
        alignSelf:'center', 
        textAlign:'center',
    },
    possibleAddressView:{
        height:50,
        justifyContent:'center',
        paddingHorizontal:10,
    },
    dismissButtonView:{
        height:40,
        justifyContent:'center',
    },
    mapView:{
        flex:1, 
        width: windowWidth, 
        height:windowHeight/5
    },
    selectedAddressView:{
        flexDirection:'column',        
        justifyContent: 'center',
        height:windowHeight/8.6,
    },
    selectedAddressText:{
        fontSize:windowHeight/33.45,
        fontWeight:'300',
        color:'#696969',
        alignSelf:'center',
    },
    confirmAddressButtonText:{
        fontSize:windowHeight/35,
        fontWeight:'600',
        color:'#fff',
        alignSelf:'center', 
    },
    addressSelectionView:{
        flexDirection:'column',
        backgroundColor:'#fff', 
        position:'absolute',
        top:windowHeight/16.4+windowHeight/36.8+windowWidth*0.7/8+windowHeight/147.2+windowWidth*0.5/5+21.5,
        left:0,
        right:0,
        height:windowHeight-(windowHeight/16.4+windowHeight/36.8+windowWidth*0.7/8+windowHeight/147.2+windowWidth*0.5/5+15),
        opacity:0.9,
    },
    addNewAddressClickableView:{
        flexDirection:'row',
        justifyContent:'center',    
    },
    addNewAddressClickableText:{
        alignSelf:'center',
        fontSize:windowHeight/36.8,
        color:'#FFCC33',
        fontWeight:'400',
        marginTop:windowHeight/105.14,
    },
    oneAddressView:{
        flex:1,
        flexDirection:'column', 
        marginLeft: windowWidth/20.7,
        marginRight: windowWidth/20.7,
        paddingBottom: windowHeight*0.018,
        borderBottomWidth:2,
        borderBottomColor: '#eee',
    },
    oneAddressIconTitleView:{
        justifyContent:'flex-start',
        alignItems:'flex-start',        
    },
    oneAddressTitleText:{
        marginTop:windowHeight/55.583,
        fontSize:windowHeight/35,
        fontWeight:'600',
    },
    oneAddressTextView:{
        paddingTop:windowHeight/90,
    },
    oneAddressText:{
        fontSize:windowHeight/45,
        flexWrap:'wrap',
        flex:1,
        fontWeight:'400',
        color:'#777',
    },
    aptNumberView:{
        backgroundColor:'#fff', 
        position:'absolute', 
        flexDirection:'row',
        justifyContent:'center',
        top: windowHeight-windowHeight*0.074*2,
        left:0,
        right:0, 
        height:windowHeight*0.074,
    },
    aptNumberViewTitle:{
        alignSelf:'center',
        fontSize:windowHeight/41.69,
        color:'#4A4A4A',
        fontWeight:'400',
    },
    aptNumberViewInput:{
        width:windowWidth*0.27,
        height:windowHeight*0.044,
        alignSelf:'center',
        paddingHorizontal:7,
        fontSize:windowHeight/47.64,
        color:'#4A4A4A',
        fontWeight:'400',
        backgroundColor:'#F5F5F5',
        borderRadius:6,
    },
})    

module.exports = MapPage;