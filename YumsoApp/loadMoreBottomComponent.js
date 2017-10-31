var styles = require('./style');

import React, {
  Component,
  StyleSheet,
  Dimensions,
  Text,
  View,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicatorIOS,
} from 'react-native';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

class LoadMoreBottomComponent extends Component {
    render() {
        if(!this.props.isAllItemsLoaded){
           if(this.props.isloading){
              return (
                <View style={loadMoreBottomComponentStyle.loaderView} onPress={()=>this.props.pressToLoadMore()}>
                    <ActivityIndicatorIOS animating={true} color={'#4A4A4A'}  size="small"/>
                </View>
               );
           }else{
              return (
                <TouchableOpacity style={loadMoreBottomComponentStyle.loaderView}  onPress={()=>this.props.pressToLoadMore()}>
                    <Text style={loadMoreBottomComponentStyle.loadMoreText}>Load more</Text>
                </TouchableOpacity>
              );
           }
        }else{
           return (
                <View style={loadMoreBottomComponentStyle.loaderView}>
                    <Text style={loadMoreBottomComponentStyle.endOfAllItemsText}>End of all {this.props.itemsName}</Text>
                </View>
           );
        }

    }
}

var loadMoreBottomComponentStyle = StyleSheet.create({
    loaderView:{
      height:40*windowHeight/667,
      flexDirection:'row',
      justifyContent:'center',
      alignItems:'center',
      backgroundColor:'#FFFFFF'
    },
    endOfAllItemsText:{
        fontSize:16*windowHeight/667,
        color:'#979797',
        fontWeight:'400',
    },
    loadMoreText:{
        fontSize:18*windowHeight/667,
        color:'#FFCC33',
        fontWeight:'400',
    },
});

module.exports = LoadMoreBottomComponent;
