var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
import Dimensions from 'Dimensions';
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

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

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
            }else{
              var ratingIcons = [];
            //var starNumber = this.state.chef.rateStar;
              var rating = 3;
              var maxRating = 5;
              for(let i = 0;i < maxRating; i++){
                  if(i<rating){
                     ratingIcons.push(
                        <View style={{marginRight:windowWidth/83.0}}>
                         <Image source={require('./icons/Icon-Small.png')} style={{width:windowWidth/32,height:windowWidth/32}}/> 
                        </View>
                     );
                  }else{
                     ratingIcons.push(
                         <View style={{marginRight:5}}>
                         <Image source={require('./icons/forkhand2.png')} style={{width:windowWidth/32,height:windowWidth/32}}/> 
                         </View>
                     );
                  }
                  
              }
              
              return(
               <View>
                 <Image source={{ uri: this.state.chef.shopPictures[0] }} style={styleChefPage.shopPicture}
                    onError={(e) => this.setState({error: e.nativeEvent.error, loading: false})}>
                    <View style={{flex:1,flexDirection:'row'}}>
                      
                      <View style={{flex:0.1,flexDirection:'row',paddingTop:10,height:40}}>
                      <TouchableHighlight onPress={() => this.navigateBackToChefList() }>
                        <Image source={require('./icons/ic_keyboard_arrow_left_48pt_3x.png')} style={{width:40,height:40}}/>
                      </TouchableHighlight> 
                      </View>

                      <View style={{flex:0.8,flexDirection:'row',paddingTop:10}}>
                      </View>
                      <View style={{flex:0.1,flexDirection:'row',paddingTop:10}}>
                        <Image source={require('./icons/ic_favorite_border_48pt_3x.png')} style={{width:30,height:30}}/>
                      </View>
                      <View style={{flex:0.1,flexDirection:'row',paddingTop:10}}>
                        <Image source={require('./icons/ic_share_48pt_3x.png')} style={{width:30,height:30}}/>
                      </View>
                    </View>
                 </Image>              
                 <View style={styleChefPage.chefNameRow}>
                   <View style={{borderRadius:12,borderWidth:0,overflow:'hidden'}}>
                      <Image source={{ uri: this.state.chef.chefProfilePic }} style={styleChefPage.chefProfilePic}
                    onError={(e) => this.setState({error: e.nativeEvent.error, loading: false})}/>
                   </View>
                   <View style={{paddingLeft: windowWidth/20.7}}>
                     <Text style={{fontSize:windowHeight/36.8,marginBottom:windowHeight/61.3}}>{this.state.chef.shopname}</Text>
                     <View style={{flex:1,flexDirection:'row',marginBottom:windowHeight/245.3}}>
                       <View style={{flex:0.5,flexDirection:'row'}}>{ratingIcons}</View>
                       <View style={{flex:0.5,flexDirection:'row',marginLeft:windowWidth/27.6}}><Text style={{color:'#A9A9A9'}}>10 reviews | $$</Text></View>
                     </View>                     
                     <Text style={{fontSize:16,color:'#696969'}}>{this.state.chef.firstname} {this.state.chef.lastname}, Kirkland</Text>
                   </View>
                 </View>
                 <View style={styleChefPage.chefDiscriptionView}>
                   <Text style={{fontSize: windowHeight/46.0,paddingBottom:windowHeight/73.6}}>My Story</Text>
                   <Text style={{fontSize: windowHeight/52.6}}>{this.state.chef.storeDescription}{this.state.chef.storeDescription}</Text>
                 </View>
                 <View style={styleChefPage.shopDiscriptionView}>
                   <Image source={require('./icons/ic_radio_48pt_3x.png')} style={{width:windowHeight/36.8,height:windowHeight/36.8}}/>
                   <View style={styleChefPage.shopDiscriptionTextView}>
                     <Text style={{fontSize: windowHeight/52.6, color:'#A9A9A9'}}>{this.state.chef.storeDescription}</Text>
                   </View>
                 </View>
                 <View style={styleChefPage.pickupAddressView}>
                   <Image source={require('./icons/ic_map_48pt_3x-2.png')} style={{width:windowHeight/36.8,height:windowHeight/36.8}}/>
                   <View style={styleChefPage.pickupAddressTextView}>
                     <Text style={{fontSize: windowHeight/52.6, color:'#A9A9A9'}}>{this.state.chef.pickupAddress}</Text>
                   </View>
                 </View>
                 
                 <TouchableHighlight style={styles.button}
                    onPress={() => this.navigateBackToChefList() }>
                    <Text style={styles.buttonText}>Back</Text>
                 </TouchableHighlight> 

              </View>
            );     
            }                      
    }
    
    navigateBackToChefList(){
         this.props.navigator.pop();
    }

}

var styleChefPage = StyleSheet.create({
    shopPicture:{
        width: windowWidth,
        height: windowHeight/2.63,
        marginTop:18,
    },
    chefNameRow:{
        flex: 1,
        flexDirection: 'row',
        padding: windowHeight/49,
        alignItems: 'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#f5f5f5'
    },
    chefProfilePic:{
        width:windowHeight/10.8,
        height:windowHeight/10.8,
    },
    chefDiscriptionView:{
        flex: 1,
        paddingHorizontal: windowWidth/27.6,
        paddingVertical: windowHeight/73.6,
        justifyContent:'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#fff'
    },
    shopDiscriptionView:{
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: windowWidth/27.6,
        paddingVertical: windowHeight/73.6,
        alignItems:'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#fff'
    },
    shopDiscriptionTextView:{
        flex: 1,
        paddingLeft:windowWidth/27.6,
        justifyContent:'center',
    },
    pickupAddressView:{
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: windowWidth/27.6,
        paddingVertical: windowHeight/73.6,
        alignItems:'center',
        borderColor: '#D7D7D7',
        borderBottomWidth: 1,
        backgroundColor: '#fff'
    },
    pickupAddressTextView:{
        flex: 1,
        paddingLeft:windowWidth/27.6,
        justifyContent:'center',
    }
    
});

module.exports = ChefPage;