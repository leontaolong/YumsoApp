var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var MapView = require('react-native-maps');
var RCTUIManager = require('NativeModules').UIManager;
var ballonIcon = require('./icons/ic_location_on_48pt_3x.png');
var labelIcon = require('./icons/2000px-Tag_font_awesome.svg.png');
var searchIcon = require('./icons/ic_search_48pt_3x.png');
var backIcon = require('./icons/ic_keyboard_arrow_left_48pt_3x.png');
var locatorIcon = require('./icons/Icon-location.png');

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
            markers:[],
            eater:eater
        };
        this.client = new HttpsClient(config.baseUrl, true);
        this.googleClient = new HttpsClient(config.googleGeoBaseUrl);
        this.getLocation();
    }
   
    render() {
            let locLookupView;
            if(this.state.showLocLookup){
                this.state.savedAddressesView = this.renderSavedAddresses(); //todo: also include home and work addresses for selection.
                locLookupView = (//todo: GPS location currect should be pin on map. //gps turn of what to do?
                    <View style={styles.container}>
                        <TouchableHighlight style={styles.button} onPress={() => this.setState({showLocLookup:false}) }>
                            <Text style={styles.buttonText}> Cancel</Text>
                        </TouchableHighlight>   
                        <View style={{alignSelf:'stretch', alignItems:'center'}}>
                            <Text> {this.state.city+','+this.state.state} </Text>  
                            <TextInput placeholder="City/State/Zip Code" style={styles.loginInput}
                            onChangeText = {(text)=>this.setState({searchAddress: text})}/>  
                            <TouchableHighlight style={styles.button} onPress={() => this.searchAddress() }>
                                <Text style={styles.buttonText}> Search Location</Text>
                            </TouchableHighlight>   
                            {this.state.searchAddressResultView}
                            <Text style={styles.title} onPress={()=>this.getLocation()}>Click get Current Location </Text>
                            <Text onPress={()=>this.useAddress(this.state.GPSproxAddress)}> {this.state.GPSproxAddress?this.state.GPSproxAddress.formatted_address:''}</Text>   
                            {this.state.savedAddressesView}                  
                        </View>   
                    </View>   );        
            }
            console.log("this.state.GPSproxAddress")
            console.log(this.state.GPSproxAddress);
            console.log(this.state.savedAddressesView)
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
                         <View style={styles.searchButtonView}>
                             <TouchableHighlight onPress={() => this.setState({showChefSearch:true}) }>
                                 <Image source={searchIcon} style={styles.searchIcon}/>
                             </TouchableHighlight>
                         </View>
                    </View>
                    
                    <View style={{alignSelf:'stretch', alignItems:'center'}}>
                       <View style={styleMapPage.locationSearchInputView}>
                         <TouchableHighlight style={styleMapPage.locationSearchIconView} onPress={() => this.searchAddress() }>
                               <Image source={searchIcon} style={styleMapPage.searchIcon}/>
                         </TouchableHighlight>  
                         <TextInput placeholder="City/State/Zip Code" style={styleMapPage.locationSearchInput}
                            onChangeText = {(text)=>this.setState({searchAddress: text})}/>
                       </View>
                       <TouchableHighlight onPress={()=>this.locateToCurrentAddress()}>
                       <View style={styleMapPage.currentLocationClickableView}>
                            <Image source={locatorIcon} style={styleMapPage.currentLocationClickableIcon}/>
                            <Text style={styleMapPage.currentLocationClickableText}>Current Location</Text>
                       </View>
                       </TouchableHighlight>
                       
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
                        )) }
                    </MapView>                    
                     
                    <View style={styleMapPage.selectedAddressView}>
                        <Text style={styleMapPage.selectedAddressText}>{this.state.GPSproxAddress? this.state.GPSproxAddress.streetNumber+' '+this.state.GPSproxAddress.streetName:''}</Text>
                        <Text style={styleMapPage.selectedAddressText}>{this.state.GPSproxAddress? this.state.GPSproxAddress.city+', '+this.state.GPSproxAddress.state+' '+this.state.GPSproxAddress.postal:''}</Text>
                    </View>
                    <TouchableHighlight style={styleMapPage.confirmAddressButtonView} onPress={() => this.doneSelectAddress() }>
                        <Text style={styleMapPage.confirmAddressButtonText}>Use this Address</Text>
                    </TouchableHighlight>
                    
                    <View style={{backgroundColor:'#DCDCDC', position:'absolute', top: this.state.mapViewYposition,left:0,right:0,opacity:0.7}}>
                            {this.state.searchAddressResultView}
                    </View>
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
        addressesView.push(<Text>Home Address</Text>);
        addressesView.push(<Text key={this.state.eater.homeAddress.formatted_address} onPress={()=>this.useAddress(this.state.eater.homeAddress)}>{this.state.eater.homeAddress.formatted_address}</Text>);
        addressesView.push(<Text>Work Address</Text>);
        addressesView.push(<Text key={this.state.eater.workAddress.formatted_address}onPress={()=>this.useAddress(this.state.eater.workAddress)}>{this.state.eater.workAddress.formatted_address}</Text>);      
        addressesView.push(<Text>Other Address</Text>);
        for(let address of otherAddresses){
            addressesView.push(<Text key={address.formatted_address} onPress={()=>this.useAddress(address)}>{address.formatted_address}</Text>);
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
        this.setState({markers: markers, region: region, selectedAddress: address}); 
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
                       view.push(<TouchableHighlight style={styleMapPage.dismissButtonView} onPress={() => {this.setState({searchAddressResultView:[]});}}>
                                     <Text style={styleMapPage.possibleAddressText}>Dismiss</Text>
                                   </TouchableHighlight>);
                       this.setState({searchAddressResultView: view}); 
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
    locationSearchInputView:{
        flex:1,
        flexDirection:'row',
        width:windowWidth*0.7,
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
    locationSearchInput:{
        flex:0.9,
        fontSize:windowHeight/43.2,
        color:'#696969',
        textAlign:'center',
    },
    currentLocationClickableView:{
        flex:1,
        flexDirection:'row',
        width:windowWidth*0.5,
        height:windowWidth*0.5/5,
    },
    currentLocationClickableIcon:{
        width:windowWidth*0.5/5,
        height:windowWidth*0.5/5,
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
        borderTopWidth:0.5,
        borderColor:'#696969',
        justifyContent:'center',
    },
    dismissButtonView:{
        height:40,
        borderTopWidth:0.5,
        borderColor:'#696969',
        justifyContent:'center',
    },
    mapView:{
        height: windowWidth, 
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
})    

module.exports = MapPage;