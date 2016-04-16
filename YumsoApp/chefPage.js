var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  ListView,
  TouchableHighlight,
  ActivityIndicatorIOS,
  Navigator
} from 'react-native';

class ChefPage extends Component {
     constructor(props){
        super(props);      

        var ds = new ListView.DataSource({
           rowHasChanged: (r1, r2) => r1!=r2 
        });
        var routeStack = this.props.navigator.state.routeStack;
        this.chefId = routeStack[routeStack.length-1].passProps.chefId;
        
        this.state = {
            dataSource: ds.cloneWithRows(['A','B']),
            showProgress:true,
            chefId:this.chefId,
        };
    }
    
    componentDidMount(){
        this.client = new HttpsClient(config.baseUrl, true);
        this.fetchChefProfile(); 
    }
    
    fetchChefProfile(){
        var self = this;
        var chefId = this.state.chefId;
        return this.client.getWithAuth(config.getOneChefEndpoint+chefId).then(function(res){
            if(res.statusCode===200){
               var chef=res.data.chef;
               console.log("chef:");
               console.log(chef); 
               self.setState({chef:chef, showProgress:false});
            }
        });
    }
    
    fetchDishes(){
        var self = this;
        var chefId = this.state.chefId;
        return this.client.getWithAuth(config.getOneChefEndpoint+chefId).then(function(res){
            if(res.statusCode===200){
               var chef=res.data.chef;
               console.log("chef:");
               console.log(chef); 
               self.setState({chef:chef, showProgress:false});
            }
        });
    }

    render() {
            if(this.state.showProgress){
                return (
                <View>
                    <ActivityIndicatorIOS
                        animating={this.state.showProgress}
                        size="large"
                        style={styles.loader}/>
                </View>);
            }
            return(
               <View>
                 <Image source={{ uri: this.state.chef.shopPictures[0] }} style={styleChefPage.shopPicture}
                    onError={(e) => this.setState({error: e.nativeEvent.error, loading: false})}/>              
                 <View style={styleChefPage.chefNameRow}>
                   <Image source={{ uri: this.state.chef.chefProfilePic }} style={styleChefPage.chefProfilePic}
                    onError={(e) => this.setState({error: e.nativeEvent.error, loading: false})}/>
                   <View style={{paddingLeft: 20}}>
                     <Text style={{fontSize:18}}>{this.state.chef.shopname}</Text>
                     <View style={{flex:1,flexDirection:'row'}}>
                      <Image source={require('./icons/Icon-Small.png')} style={{width:12,height:12,padding:5}}/>
                      <Image source={require('./icons/Icon-Small.png')} style={{width:12,height:12}}/>
                      <Image source={require('./icons/Icon-Small.png')} style={{width:12,height:12}}/>
                      <Image source={require('./icons/Icon-Small.png')} style={{width:12,height:12}}/>
                     </View>
                     <Text style={{fontSize:14,color:'#696969'}}>{this.state.chef.firstname} {this.state.chef.lastname}, Kirkland</Text>
                   </View>
                 </View>
                 <View style={styleChefPage.chefDiscriptionView}>
                   <Text style={{fontSize: 14,paddingBottom:10}}>My Story</Text>
                   <Text style={{fontSize: 12}}>{this.state.chef.storeDescription}{this.state.chef.storeDescription}</Text>
                 </View>
                 <View style={styleChefPage.shopDiscriptionView}>
                   <Image source={require('./icons/ic_radio_48pt_3x.png')} style={{width:20,height:20}}/>
                   <View style={styleChefPage.shopDiscriptionTextView}>
                     <Text style={{fontSize: 12, color:'#A9A9A9'}}>{this.state.chef.storeDescription}</Text>
                   </View>
                 </View>
                 <View style={styleChefPage.pickupAddressView}>
                   <Image source={require('./icons/ic_map_48pt_3x-2.png')} style={{width:20,height:20}}/>
                   <View style={styleChefPage.pickupAddressTextView}>
                     <Text style={{fontSize: 12, color:'#A9A9A9'}}>{this.state.chef.pickupAddress}</Text>
                   </View>
                 </View>
                 
                 <TouchableHighlight style={styles.button}
                    onPress={() => this.navigateBackToChefList() }>
                    <Text style={styles.buttonText}>Back</Text>
                 </TouchableHighlight> 

              </View>
            );            
    }
    
    navigateBackToChefList(){
         this.props.navigator.pop();
    }

}

var styleChefPage = StyleSheet.create({
    shopPicture:{
        width: 500,
        height: 280,
    },
    chefNameRow:{
        flex: 1,
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#f5f5f5'
    },
    chefProfilePic:{
        width:60,
        height:60,
    },
    chefDiscriptionView:{
        flex: 1,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
        justifyContent:'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#fff'
    },
    shopDiscriptionView:{
        flex: 1,
        flexDirection: 'row',
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
        alignItems:'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#fff'
    },
    shopDiscriptionTextView:{
        flex: 1,
        paddingLeft:15,
        justifyContent:'center',
    },
    pickupAddressView:{
        flex: 1,
        flexDirection: 'row',
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
        alignItems:'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#fff'
    },
    pickupAddressTextView:{
        flex: 1,
        paddingLeft:15,
        justifyContent:'center',
    }
    
});

module.exports = ChefPage;