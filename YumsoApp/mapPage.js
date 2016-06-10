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
var cancelIcon = require('./icons/icon-cancel.png');

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
        if (this.props.specificAddressMode) {
            this.isSpecific = true;
        }
        
        this.state = {
            showProgress:true,
            showMapView:true,
            showAddNewAddressInputView:false,
            markers:[],
            eater:eater,
            showApartmentNumber:false,
            aptNumberViewYposition:windowHeight-windowHeight*0.074*2,
        };
        this.client = new HttpsClient(config.baseUrl, true);
        this.googleClient = new HttpsClient(config.googleGeoBaseUrl);
        this.getLocation();
    }
   
    render() {  
            let aptView = <View></View> 
            if(this.state.showApartmentNumber){
               aptView = (<View key={'aptView'} style={{backgroundColor:'#fff', position:'absolute', flexDirection:'row', justifyContent:'center', 
                                top: this.state.aptNumberViewYposition, left:0, right:0, height:windowHeight*0.074,}}>
                              <Text style={styleMapPage.aptNumberViewTitle}>Apt/Suite# </Text>
                              <TextInput style={styleMapPage.aptNumberViewInput} onFocus = {()=>this.slideUpAptNumberView()} clearButtonMode={'while-editing'} returnKeyType = {'done'}
                                   keyboardType={'numbers-and-punctuation'} onSubmitEditing = {()=>this.slideDownAptNumberView()} onChangeText = {(text) => this.setState({ apartmentNumber: text })}/>
                          </View>);
            }   
            
            this.state.savedAddressesView = this.renderSavedAddresses(); //todo: also include home and work addresses for selection.
            let addressSelectionView=[];
            if(!this.state.showMapView){
               addressSelectionView.push(<View key={'addressSelectionView'} style={styleMapPage.addressSelectionView}>
                                          {this.state.savedAddressesView}               
                                         </View>);  
            }                       

            var searchAddressResultViewWrapper;
            if(this.state.searchAddressResultView){
               searchAddressResultViewWrapper=(<View key={'searchAddressResultView'} style={{backgroundColor:'#fff', position:'absolute', top: this.state.mapViewYposition,left:0,right:0, height:windowHeight-this.state.mapViewYposition,opacity:0.8}}> 
                                                 {this.state.searchAddressResultView}
                                               </View>);  
            }
                                                
            return (
                 <View style={styles.container}>
                     <View style={styles.headerBannerView}>
                         <View style={styles.headerLeftView}>
                             <TouchableHighlight style={styles.backButtonView} underlayColor={'transparent'} onPress={() => this.navigateBack() }>
                                 <Image source={backIcon} style={styles.backButtonIcon}/>
                             </TouchableHighlight>
                         </View>
                         <View style={styles.titleView}>
                             <Text style={styles.titleText}>{this.state.city}</Text>
                         </View>
                         <View style={styles.headerRightView}>
                             <TouchableHighlight underlayColor={'transparent'} onPress={() =>{this.setState({showMapView: false})}}>
                                 <Image source={houseIconOrange} style={styleMapPage.houseIconOrange}/>
                             </TouchableHighlight>
                         </View>
                    </View>
                    
                    <View style={{alignSelf:'stretch', alignItems:'center'}}>
                       <View  style={styleMapPage.locationSearchInputCancelView}>
                            <View style={styleMapPage.locationSearchInputView}>
                                <TouchableHighlight style={styleMapPage.locationSearchIconView} underlayColor={'transparent'} onPress={() => this.searchAddress() }>
                                    <Image source={searchIcon} style={styleMapPage.searchIcon}/>
                                </TouchableHighlight>  
                                <TextInput placeholder="City/State/Zip Code" style={styleMapPage.locationSearchInput}  onSubmitEditing = {()=> this.searchAddress()} returnKeyType = {'search'}
                                    onChangeText = {(text)=>this.setState({searchAddress: text,selectedAddress:''})} value={this.state.selectedAddress?this.state.selectedAddress.formatted_address:this.state.searchAddress}/>
                            </View>
                            <TouchableHighlight style={styleMapPage.cancelIconView} underlayColor={'transparent'} onPress={() => {this.setState({showMapView:true,selectedAddress:'',searchAddressResultView:'',searchAddress:''})}}>
                                <Image source={cancelIcon} style={styleMapPage.cancelIcon}/>
                            </TouchableHighlight>
                       </View>
                       <View style={styleMapPage.currentLocationClickableView}>
                            <TouchableHighlight onPress={()=>this.locateToCurrentAddress()} underlayColor={'transparent'}>
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
                    
                    <TouchableHighlight style={styleMapPage.confirmAddressButtonView} underlayColor={'transparent'} onPress={() => this.doneSelectAddress() }>
                        <Text style={styleMapPage.confirmAddressButtonText}>{this.isSpecific && !this.state.showApartmentNumber ? 'Next': 'Use this Address'}</Text>
                    </TouchableHighlight>
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
                <TouchableHighlight key={'homeAddress'} onPress={()=>this.useSavedAddress(homeAddress)}>
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
                <TouchableHighlight key={'workAddress'} onPress={()=>this.useSavedAddress(workAddress)}>
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
                <TouchableHighlight key={'otherAddresses'+i} onPress={()=>this.useSavedAddress(address)}>
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
            i++;
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
                let city; let state; let postal; let streetNumber; let streetName;
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
                    address.formatted_address = formatAddress;
                    address.city = city;
                    address.state = state;
                    address.postal = postal;
                    address.streetNumber = streetNumber;
                    address.streetName = streetName;
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
            if (this.state.apartmentNumber === undefined) {
                this.setState({showApartmentNumber: true});
                return;
            }              
            this.state.selectedAddress.apartmentNumber = this.state.apartmentNumber;      
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
        this.isSpecific = false;
        this.setState({showApartmentNumber:false});
        this.useAddress(address);
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
                        if(streetNumber==undefined && this.isSpecific){
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
        alignSelf:'center',
        marginRight:windowWidth/103.5,
    },
    searchIcon:{
        width:30,
        height:30,
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
        borderColor:'#D7D7D7',
    },
})    

module.exports = MapPage;