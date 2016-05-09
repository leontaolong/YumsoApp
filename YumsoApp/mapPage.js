var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var MapView = require('react-native-maps');
var RCTUIManager = require('NativeModules').UIManager;
var ballonIcon = require('./icons/ic_location_on_48pt_3x.png');
var labelIcon = require('./icons/2000px-Tag_font_awesome.svg.png');
var searchIcon = require('./icons/ic_search_48pt_3x.png');
var houseIconOrange = require('./icons/Icon-home-orange.png');
var backIcon = require('./icons/ic_keyboard_arrow_left_48pt_3x.png');
var locatorIcon = require('./icons/Icon-location.png');
var houseIcon = require('./icons/Icon-house.png');
var cancelIcon = require('./icons/Icon-cancel.png');

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
  ActivityIndicatorIOS,
  AsyncStorage,
  Alert,
  Picker,
  ScrollView,
} from 'react-native';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;
var mapViewYposition = 0;

class MapPage extends Component {
    constructor(props){
        super(props);
        let routeStack;
        let eater;
        if(this.props.navigator){
           routeStack = this.props.navigator.state.routeStack;
        }   
        if(routeStack && routeStack.length!=0){
            this.onSelectAddress = routeStack[routeStack.length-1].passProps.onSelectAddress;
            eater = routeStack[routeStack.length-1].passProps.eater;
        }
        if(this.props.eater && this.props.eater!=null){
            eater = this.props.eater;
        }
        this.state = {
            showProgress:true,
            showMapView:true,
            showAddNewAddressInputView:false,
            markers:[],
            eater:eater
        };
        this.client = new HttpsClient(config.baseUrl, true);
        this.googleClient = new HttpsClient(config.googleGeoBaseUrl);
        this.getLocation();
    }
   
    render() {           
            this.state.savedAddressesView = this.renderSavedAddresses(); //todo: also include home and work addresses for selection.
            let addressSelectionView=[];
            if(!this.state.showMapView){
               addressSelectionView.push(
                    <View style={styleMapPage.addressSelectionView}>
                        {this.state.savedAddressesView}               
                    </View>);  
            }                       

            var searchAddressResultViewWrapper;
            if(this.state.searchAddressResultView){
               searchAddressResultViewWrapper=(<View style={{backgroundColor:'#fff', position:'absolute', top: this.state.mapViewYposition,left:0,right:0, height:windowHeight-this.state.mapViewYposition,opacity:0.8}}> 
                                                 {this.state.searchAddressResultView}
                                               </View>);  
            }
                                            
            return (
                 <View style={styles.container}>
                     <View style={styles.headerBannerView}>
                         <View style={styles.backButtonView}>
                             <TouchableHighlight onPress={() => this.navigateBack() }>
                                 <Image source={backIcon} style={styles.backButtonIcon}/>
                             </TouchableHighlight>
                         </View>
                         <View style={styles.locationView}>
                             <View style={{marginTop:3,marginLeft:2,}}><Image source={ballonIcon} style={styles.locationIcon}/></View>
                             <Text style={styles.locationText}>{this.state.city}</Text>
                         </View>
                         <View style={styleMapPage.houseIconOrangeView}>
                             <TouchableHighlight onPress={() =>{this.setState({showMapView: false})}}>
                                 <Image source={houseIconOrange} style={styleMapPage.houseIconOrange}/>
                             </TouchableHighlight>
                         </View>
                    </View>
                    
                    <View style={{alignSelf:'stretch', alignItems:'center'}}>
                       <View  style={styleMapPage.locationSearchInputCancelView}>
                            <View style={styleMapPage.locationSearchInputView}>
                                <TouchableHighlight style={styleMapPage.locationSearchIconView} onPress={() => this.searchAddress() }>
                                    <Image source={searchIcon} style={styleMapPage.searchIcon}/>
                                </TouchableHighlight>  
                                <TextInput placeholder="City/State/Zip Code" style={styleMapPage.locationSearchInput}
                                    onChangeText = {(text)=>this.setState({searchAddress: text,selectedAddress:''})} value={this.state.selectedAddress?this.state.selectedAddress.formatted_address:this.state.searchAddress}/>
                            </View>
                            <TouchableHighlight style={styleMapPage.cancelIconView} onPress={() => {this.setState({showMapView:true,selectedAddress:'',searchAddressResultView:'',searchAddress:''})}}>
                                <Image source={cancelIcon} style={styleMapPage.cancelIcon}/>
                            </TouchableHighlight>
                       </View>
                       <View style={styleMapPage.currentLocationClickableView}>
                            <TouchableHighlight onPress={()=>this.locateToCurrentAddress()}>
                                <View style={styleMapPage.currentLocationClickableView}>
                                        <Image source={locatorIcon} style={styleMapPage.currentLocationClickableIcon}/>
                                        <Text style={styleMapPage.currentLocationClickableText}>Current Location</Text>
                                </View>
                            </TouchableHighlight>
                       </View>                       
                    </View>
                    <MapView ref='MapView' style={styleMapPage.mapView}
                        initialRegion={{
                            latitude: 47.6062095,
                            longitude:  -122.3320708,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
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
                    <TouchableHighlight style={styleMapPage.confirmAddressButtonView} onPress={() => this.doneSelectAddress() }>
                        <Text style={styleMapPage.confirmAddressButtonText}>Use this Address</Text>
                    </TouchableHighlight>
                    {searchAddressResultViewWrapper}
                    {addressSelectionView}   
                </View>
            );                      
    }

    renderSavedAddresses(){
        if(!this.state.eater){
            return undefined;
        }
        //let workAddress = this.state.eater.workAddress;
        let workAddress = this.state.GPSproxAddress;
        //let homeAddress = this.state.eater.homeAddress;
        let homeAddress = this.state.GPSproxAddress;
        let otherAddresses = this.state.eater.addressList;
        var addressesView = []
        if(homeAddress){
            addressesView.push(
                <TouchableHighlight key={'homeAddress'} onPress={()=>this.useAddress(homeAddress)}>
                <View style={styleMapPage.oneAddressView}>
                    <View style={styleMapPage.oneAddressIconTitleView}>
                        <Image source={houseIcon} style={styleMapPage.oneAddressIcon}/>
                        <Text style={styleMapPage.oneAddressTitleText}>Home</Text>
                    </View>
                    <View style={styleMapPage.oneAddressTextView}>
                        <Text style={styleMapPage.oneAddressText}>
                            {homeAddress.formatted_address}
                        </Text>
                    </View>
                </View>
                </TouchableHighlight>
            );
        }
        if(workAddress){
            addressesView.push(
                <TouchableHighlight key={'workAddress'} onPress={()=>this.useAddress(workAddress)}>
                <View style={styleMapPage.oneAddressView}>
                    <View style={styleMapPage.oneAddressIconTitleView}>
                        <Image source={houseIcon} style={styleMapPage.oneAddressIcon}/>
                        <Text style={styleMapPage.oneAddressTitleText}>Work</Text>
                    </View>
                    <View style={styleMapPage.oneAddressTextView}>
                        <Text style={styleMapPage.oneAddressText}>
                            {workAddress.formatted_address}
                        </Text>
                    </View>
                </View>
                </TouchableHighlight>
            );
        }
        for(let address of otherAddresses){
            addressesView.push(
                <TouchableHighlight key={address.formatted_address} onPress={()=>this.useAddress(address)}>
                <View style={styleMapPage.oneAddressView}>
                    <View style={styleMapPage.oneAddressIconTitleView}>
                        <Image source={houseIcon} style={styleMapPage.oneAddressIcon}/>
                        <Text style={styleMapPage.oneAddressTitleText}>Other</Text>
                    </View>
                    <View style={styleMapPage.oneAddressTextView}>
                        <Text style={styleMapPage.oneAddressText}>
                            {address.formatted_address}
                        </Text>
                    </View>
                </View>
                </TouchableHighlight>
            );
        }
        return addressesView;
    }
    //todo: this two should be the same thing?
    renderSearchResult(addressList){
        var addressesView = []
        for(let address of addressList){
            addressesView.push(<View style={styleMapPage.possibleAddressView}><Text style={styleMapPage.possibleAddressText} key={address.formatted_address} onPress={()=>this.useAddress(address)}>  {address.formatted_address}</Text></View>);
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
                        var streetNumber = 'unknown';
                        var streetName = 'unknown';
                        var city = 'unknown';
                        var state = 'unknown';
                        var postal = 'unknown';
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
            (error) => alert(error.message),
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
                var city;
                var state;
                var postal;
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
                        }
                    }
                    address.formatted_address = formatAddress;
                    address.city = city;
                    address.state = state;
                    address.postal = postal;
                    this.useAddress(address);
               }
            }); 
    } 

    doneSelectAddress() {
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
        console.log(region);    
        this.setState({markers: markers, region: region, selectedAddress: address, showMapView: true,searchAddressResultView:''}); 
        this.refs.m1.showCallout();
    }
    
    locateToCurrentAddress(){
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
                    for(var possibleAddress of res.data.results){
                        let city; let state; let postal;
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
                            }
                        }
                        var onePossibility = {
                            formatted_address: possibleAddress.formatted_address,
                            lat: possibleAddress.geometry.location.lat,
                            lng: possibleAddress.geometry.location.lng,
                            city: city,
                            state: state,
                            postal:postal
                        };
                        addresses.push(onePossibility);
                    }

                    let view = this.renderSearchResult(addresses);
                    //If only one possible address returned, locate it on the map
                    if(addresses.length==1){
                       this.useAddress(addresses[0]);
                    }else{
                       this.setState({searchAddressResultView: view,showMapView:true}); 
                    }
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
}

var styleMapPage = StyleSheet.create({
    locationSearchInputCancelView:{
        flex:1,
        flexDirection:'row',
    },
    locationSearchInputView:{
        flexDirection:'row',
        alignItems:'flex-end',
        marginLeft:windowWidth*0.03,
        width:windowWidth*0.87,
        height:windowWidth*0.7/8,
        marginTop:windowHeight/36.8,
        marginBottom:windowHeight/147.2,
        borderWidth:1,
        borderRadius:8,
        borderColor:'#D7D7D7',
    },
    locationSearchIconView:{
        alignSelf:'flex-end',
        marginLeft:windowHeight/147.2,
        marginRight:windowWidth/103.5,
        marginBottom:windowHeight/736.0,
    },
    searchIcon:{
        width:windowHeight/27.26,
        height:windowHeight/27.26,
    },
    cancelIconView:{
        width:windowWidth*0.1,
        flexDirection:'row',
        alignItems:'flex-end',
        paddingTop:windowHeight/44.47,
        marginRight:windowWidth/75.0,  
    },
    cancelIcon:{
        width:windowHeight/16.675,
        height:windowHeight/16.675,
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
        borderColor:'#ff9933',
        borderWidth:0,
        borderRadius:6, 
        overflow: 'hidden', 
        alignSelf:'center',
    },
    currentLocationClickableIcon:{
        width:windowWidth*0.1,
        height:windowWidth*0.1,
    },
    currentLocationClickableText:{
        fontSize:windowHeight/36.8,
        color:'#ff9933',
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
        height:windowHeight/13.38,
        flexDirection:'row',        
        justifyContent: 'center',
        backgroundColor:'#ff9933',
        position:'absolute',
        left: 0, 
        right: 0,
        top:windowHeight-windowHeight/13.38,
    }, 
    confirmAddressButtonText:{
        fontSize:windowHeight/30.6,
        fontWeight:'300',
        color:'#fff',
        alignSelf:'center', 
    },
    addressSelectionView:{
        flexDirection:'column',
        borderTopWidth:1,
        borderColor:'#D7D7D7', 
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
        color:'#ff9933',
        fontWeight:'400',
        marginTop:windowHeight/105.14,
    },
    oneAddressView:{
        flex:1,
        flexDirection:'row', 
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
    houseIconOrangeView:{
        flex:0.1/3, 
        width:windowWidth/3,
        alignItems:'flex-end',
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
    },

})    

module.exports = MapPage;