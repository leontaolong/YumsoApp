var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var MapView = require('react-native-maps');

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
            showLocLookup:false,
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
            return (
                <ScrollView style={styles.container}>
                    {locLookupView}
                    <TouchableHighlight style={styles.button} onPress={()=>this.setState({showLocLookup:true})}>
                        <Text style={styles.buttonText}> Search Map</Text>
                    </TouchableHighlight> 
                    <TouchableHighlight style={styles.button} onPress={() => this.navigateBack() }>
                        <Text style={styles.buttonText}> Cancel</Text>
                    </TouchableHighlight>             
                    <MapView style={{ height: 500, width: 400 }}
                        initialRegion={{
                            latitude: 37.78825,
                            longitude: -122.4324,
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
                    <TouchableHighlight style={styles.button} onPress={() => this.doneSelectAddress() }>
                        <Text style={styles.buttonText}>Use this Address</Text>
                    </TouchableHighlight>
                </ScrollView>
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
            addressesView.push(<Text key={address.formatted_address} onPress={()=>this.useAddress(address)}>{address.formatted_address}</Text>);
        }
        return addressesView;
    }
    
    onRegionChange(region){ //todo: Will this be used?
        this.setState({ region });
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
                                }
                            }
                            self.setState({GPSproxAddress: {formatted_address: address, lat: position.coords.latitude, lng:position.coords.longitude, city:city, state:state, postal: postal}});
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
        this.setState({markers: markers, region: region, selectedAddress:address, showLocLookup:false}); 
        this.refs.m1.showCallout();
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
                    this.setState({searchAddressResultView: view});
                }
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

module.exports = MapPage;