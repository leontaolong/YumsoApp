'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var MapView = require('react-native-maps');
var RCTUIManager = require('NativeModules').UIManager;
var ballonIcon = null;
var searchIcon = require('./icons/icon-search.png');
var houseIconOrange = require('./icons/icon-home-orange.png');
var backIcon = require('./icons/icon-back.png');
var locatorIcon = require('./icons/icon-location.png');
var houseIcon = require('./icons/icon-grey-house.png');

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
            showProgress:true,
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
            let aptView = <View></View>;
            if(this.state.showApartmentNumber){
               aptView = (<View key={'aptView'} style={{backgroundColor:'#fff', position:'absolute', flexDirection:'row', justifyContent:'center', 
                                top: this.state.aptNumberViewYposition, left:0, right:0, height:windowHeight*0.074,}}>
                              <Text style={styleMapPage.aptNumberViewTitle}>Apt/Suite# </Text>
                              <TextInput style={styleMapPage.aptNumberViewInput} onFocus = {()=>this.slideUpAptNumberView()} clearButtonMode={'while-editing'} returnKeyType = {'done'} autoCorrect={false}
                                   value={this.state.apartmentNumber} keyboardType={'numbers-and-punctuation'} onSubmitEditing = {()=>this.slideDownAptNumberView()} onChangeText = {(text) => this.setState({ apartmentNumber: text })}/>
                          </View>);
            }   
            
            this.state.savedAddressesView = this.renderSavedAddresses(); //todo: also include home and work addresses for selection.
            let addressSelectionView=[];
            if(!this.state.showMapView){
               addressSelectionView.push(<View key={'addressSelectionView'} style={styleMapPage.addressSelectionView}>
                                          {this.state.savedAddressesView}               
                                         </View>);  
            }                       

            var searchAddressResultViewWrapper=null;
            if(this.state.searchAddressResultView){
               searchAddressResultViewWrapper=(<View key={'searchAddressResultView'} style={{backgroundColor:'#fff', position:'absolute', top: this.state.mapViewYposition,left:0,right:0, height:windowHeight-this.state.mapViewYposition,opacity:0.8}}> 
                                                 {this.state.searchAddressResultView}
                                               </View>);  
            }

            var houseIconView = null;
            if(this.showHouseIcon){
               houseIconView = <TouchableHighlight underlayColor={'#F5F5F5'} onPress={() => this.onPressHouseIcon()}>
                                 <Image source={houseIconOrange} style={styleMapPage.houseIconOrange}/>
                               </TouchableHighlight>
            }
                                                
            return (
                 <View style={styles.container}>
                     <View style={styles.headerBannerView}>
                         <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBack()}>
                             <View style={styles.backButtonView}>
                                 <Image source={backIcon} style={styles.backButtonIcon}/>
                             </View>
                         </TouchableHighlight>
                         <View style={styles.titleView}>
                             <Text style={styles.titleText}>{this.state.city}</Text>
                         </View>
                         <View style={styles.headerRightView}>
                             {houseIconView}
                         </View>
                    </View>
                    
                    <View style={{alignSelf:'stretch', alignItems:'center'}}>
                       <View  style={styleMapPage.locationSearchInputCancelView}>
                            <View style={styleMapPage.locationSearchInputView}>
                                <TouchableHighlight style={styleMapPage.locationSearchIconView} underlayColor={'transparent'} onPress={() => this.searchAddress() }>
                                    <Image source={searchIcon} style={styleMapPage.searchIcon}/>
                                </TouchableHighlight>  
                                <TextInput placeholder="City/State/Zip Code" style={styleMapPage.locationSearchInput}  onSubmitEditing = {()=> this.searchAddress()} returnKeyType = {'search'} clearButtonMode={'while-editing'}
                                autoCorrect={false} onChangeText = {(text)=>this.setState({searchAddress: text,selectedAddress:''})} value={this.state.selectedAddress?this.state.selectedAddress.formatted_address:this.state.searchAddress}/>
                            </View>
                       </View>
                       <TouchableHighlight onPress={()=>this.locateToCurrentAddress()} style={styleMapPage.currentLocationClickableView} underlayColor={'#F5F5F5'}>
                            <View style={styleMapPage.currentLocationClickableView}>
                                <Image source={locatorIcon} style={styleMapPage.currentLocationClickableIcon}/>
                                <Text style={styleMapPage.currentLocationClickableText}>Current Location</Text>
                            </View>
                       </TouchableHighlight>                     
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
                  
                    <TouchableOpacity activeOpacity={0.7} style={styleMapPage.confirmAddressButtonView} onPress={() => this.doneSelectAddress()}>
                        <Text style={styleMapPage.confirmAddressButtonText}>{this.isSpecific && !this.state.showApartmentNumber ? 'Next': 'Use this Address'}</Text>
                    </TouchableOpacity>
                    {searchAddressResultViewWrapper}
                    {addressSelectionView}
                    {aptView}   
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
                        <Image source={houseIcon} style={styleMapPage.oneAddressIcon}/>
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
                        <Image source={houseIcon} style={styleMapPage.oneAddressIcon}/>
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
                        <Image source={houseIcon} style={styleMapPage.oneAddressIcon}/>
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
            addressesView.push(<View style={styleMapPage.possibleAddressView}><Text style={styleMapPage.possibleAddressText} key={address.formatted_address} onPress={()=>{this.usedSavedAddress=false; this.useAddress(address)}}>  {address.formatted_address}</Text></View>);
        }
        return addressesView;
    }
    
    onRegionChange(region){ //todo: Will this be used?
        this.setState({ region });
    }
    
    //Get current location
    getLocation(){
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
                                this.setState({selectedAddress:undefined});
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
                        }
                        self.setState({ city: city, state: state });
                    });       
            },
            (error) => Alert.alert( 'Warning', error.message,[ { text: 'OK' }]),
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
            }); 
    } 

    doneSelectAddress() {
        if (this.isSpecific) {
            if(!this.state.selectedAddress){
                Alert.alert( 'Warning', 'Please specify an address',[ { text: 'OK' }]);
                return;
            }
            if(!this.state.selectedAddress.streetNumber){ //todo: more validation on this.
                Alert.alert( 'Warning', 'the street is not valid since it is not specific',[ { text: 'OK' }]); 
                return;   
            }
            if(this.state.showApartmentNumber && (!this.state.apartmentNumber || !this.state.apartmentNumber.trim())){
                Alert.alert( 'Warning', 
                             'Wouldn\'t you specify your Apt./Suite# ?',
                             [ { text: 'OK'} ,
                               { text: 'Not Applicable', onPress:()=>{
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
                               }
                              ]
                           );
                return;
            }
            if (this.state.apartmentNumber === undefined && !this.usedSavedAddress) {     
                this.setState({showApartmentNumber: true, apartmentNumber: this.props.initialLoc? this.props.initialLoc.apartmentNumber:undefined});
                return;
            }
            if(!this.usedSavedAddress) this.state.selectedAddress.apartmentNumber = this.state.apartmentNumber; //todo: state management will add the apt and save next time in edit profile.
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
        }else{//is this correct? need to asynchronize?
           this.getLocation();
           if(this.state.GPSproxAddress){
              this.useAddress(this.state.GPSproxAddress);
           }    
        }
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
                    if(addresses.length==0 && showWarningForSpecific){
                        Alert.alert( 'Warning', 'Please be more specific',[ { text: 'OK' }]);
                    }
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
           })
           
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
        borderWidth:1,
        borderRadius:8,
        borderColor:'#D9D9D9',
    },
    locationSearchIconView:{
        alignSelf:'center',
    },
    searchIcon:{
        width:30,
        height:30,
    },
    locationSearchInput:{
        flex:0.9,
        fontSize:windowHeight/43.2,
        color:'#696969',
        textAlign:'left',
    },
    currentLocationClickableView:{
        flex:0.5,
        flexDirection:'row',
        width:windowWidth*0.5,
        height:windowWidth*0.1,
        overflow: 'hidden', 
        alignSelf:'center',
    },
    currentLocationClickableIcon:{
        width:windowWidth*0.1,
        height:windowWidth*0.1,
    },
    currentLocationClickableText:{
        fontSize:windowHeight/36.8,
        color:'#FFCC33',
        fontWeight:'400',
        marginTop:windowHeight/105.14,
        marginLeft:windowWidth/207.0,
    },
    possibleAddressText:{
        fontSize:windowHeight/36.8,
        color:'#696969',
        alignSelf:'center', 
    },
    possibleAddressView:{
        height:40,
        justifyContent:'center',
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
    confirmAddressButtonView:{
        height:windowHeight*0.074,
        flexDirection:'row',        
        justifyContent: 'center',
        backgroundColor:'#FFCC33',
        position:'absolute',
        left: 0, 
        right: 0,
        top:windowHeight-windowHeight*0.074,
    }, 
    confirmAddressButtonText:{
        fontSize:windowHeight/30.6,
        fontWeight:'300',
        color:'#fff',
        alignSelf:'center', 
    },
    addressSelectionView:{
        flexDirection:'column',
        backgroundColor:'#fff', 
        position:'absolute',
        top:windowHeight/16.4+windowHeight/36.8+windowWidth*0.7/8+windowHeight/147.2+windowWidth*0.5/5+15,
        left:0,
        right:0,
        height:windowHeight-(windowHeight/16.4+windowHeight/36.8+windowWidth*0.7/8+windowHeight/147.2+windowWidth*0.5/5+15),
        opacity:0.8,
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
        flexDirection:'row', 
        paddingLeft:windowWidth*0.01875,
        paddingRight:windowWidth*0.0375,
    },
    oneAddressIconTitleView:{
        flex:0.3,
        flexDirection:'row',        
    },
    oneAddressIcon:{
        width:windowHeight/16.675,
        height:windowHeight/16.675,
    },
    houseIconOrange:{
        width:windowHeight/16.675,
        height:windowHeight/16.675,
    },
    oneAddressTitleText:{
        marginTop:windowHeight/66.7,
        fontSize:windowHeight/39.24,
    },
    oneAddressTextView:{
        flex:0.7,
    },
    oneAddressText:{
        marginTop:windowHeight/55.583,
        fontSize:windowHeight/39.24,
        textAlign:'justify',
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
    },
    aptNumberViewInput:{
        borderWidth:1,
        width:windowWidth*0.27,
        height:windowHeight*0.044,
        alignSelf:'center',
        paddingHorizontal:7,
        fontSize:windowHeight/47.64,
        borderRadius:6,
        borderColor:'#9B9B9B',
    },
})    

module.exports = MapPage;