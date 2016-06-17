var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var rating = require('./rating');
var dateRender = require('./commonModules/dateRender');
var backIcon = require('./icons/icon-back.png');
import Dimensions from 'Dimensions';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

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
  Picker
} from 'react-native';

class ChefCommentsPage extends Component {
    constructor(props){
        super(props);
        var ds = new ListView.DataSource({
           rowHasChanged: (r1, r2) => r1!=r2 
        }); 
        var routeStack = this.props.navigator.state.routeStack;
        var chefId = routeStack[routeStack.length-1].passProps.chefId;
        var chefProfilePic = routeStack[routeStack.length-1].passProps.chefProfilePic;
        this.state = {
            dataSource: ds.cloneWithRows([]),
            showProgress:true,
            showCommentBox:false,
            chefId: chefId,
            chefProfilePic:chefProfilePic,
        };
    }

    componentDidMount(){
        this.client = new HttpsClient(config.baseUrl, true);
        this.fetchComments(); 
    }
    
    fetchComments() {
        const start = 'start=' + new Date().setDate(new Date().getDate() - 7);
        const end = 'end=9999999999999999';
        return this.client.getWithoutAuth(config.chefCommentsEndpoint + this.state.chefId + '?' + start + '&' + end)
            .then((res) => {
                if (res.statusCode != 200) {
                    throw new Error('Fail getting past comments');
                }
                let comments = res.data.comments;
                this.setState({ dataSource: this.state.dataSource.cloneWithRows(comments), showProgress: false });
            });
    }

    renderRow(comment){
        // let imageSrc =require('./icons/dishImageUnavailable.png') ;               
        return (
            <View style={styleChefCommentsPage.oneListingView}>
                <View style={styleChefCommentsPage.eaterNameView}>
                   <Text style={styleChefCommentsPage.eaterNameText}>{comment.eaterAlias}</Text>
                </View>
                <View style={styleOrderDetailPage.commentBox}>
                   <View style={styleOrderDetailPage.ratingCommentTimeView}>
                       <View style={styleOrderDetailPage.ratingView}>
                           {rating.renderRating(comment.starRating)}
                       </View>
                       <View style={styleOrderDetailPage.commentTimeView}>
                           <Text style={styleOrderDetailPage.commentTimeText}>{dateRender.renderDate3(comment.eaterCommentTime)}</Text>
                       </View>
                   </View>
                   <Text style={styleOrderDetailPage.commentText}>{comment.eaterComment && comment.eaterComment.trim()? comment.eaterComment.trim():'No Comment'}</Text>
                </View>
                {this.displayChefComment(comment)}  
            </View>
        );
    }
    
    displayChefComment(comment){
         if(comment.chefComment){
           var chefCommentSection = <View key={'chefReplyView'} style={styleOrderDetailPage.chefReplyBox}>
                                        <View style={styleOrderDetailPage.chefPhotoView}>
                                        <Image source={{uri:this.state.chefProfilePic}} style={styleOrderDetailPage.chefPhoto}/>
                                        </View>
                                        <View style={styleOrderDetailPage.chefReplyContentView}>
                                        <Text style={styleOrderDetailPage.chefReplyText}>{comment.chefComment}</Text>
                                        </View>
                                    </View>;
           return chefCommentSection;
        }
        return[];
   }
    
    render() {
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView =<View style={styles.loaderView}>
                                    <ActivityIndicatorIOS animating={this.state.showProgress} size="large" style={styles.loader}/>
                                </View>;  
        }
        return (
            <View style={styles.container}>
               <View style={styles.headerBannerView}>    
                   <View style={styles.headerLeftView}>
                   <TouchableHighlight style={styles.backButtonView} underlayColor={'transparent'} onPress={() => this.navigateBackToChefPage()}>
                     <Image source={backIcon} style={styles.backButtonIcon}/>
                   </TouchableHighlight>
                   </View>    
                   <View style={styles.titleView}>
                     <Text style={styles.titleText}>Reviews</Text>
                   </View>
                   <View style={styles.headerRightView}>
                   </View>
               </View>
               <ListView style={styles.dishListView}
                    dataSource = {this.state.dataSource}
                    renderRow={this.renderRow.bind(this) }/>
               {loadingSpinnerView}                  
            </View>
        );
    }

    navigateBackToChefPage() {
        this.props.navigator.pop();
    }
}

var styleChefCommentsPage = StyleSheet.create({
    oneListingView:{
       flex:1,
       flexDirection:'column',
       paddingHorizontal:10,
       paddingVertical:15,
       borderBottomWidth:1,
       borderColor: '#f5f5f5',
    },
    eaterNameView:{
        width:windowWidth*0.93,
        flexDirection:'row',
        alignSelf:'center',
    },
    eaterNameText:{
        fontSize:14,
        fontWeight:'600',
    },
}); 

var styleOrderDetailPage = StyleSheet.create({  
    commentBox:{
        alignSelf:'center',
        backgroundColor:'#F5F5F5',
        width:windowWidth*0.93,
        marginTop:windowHeight*0.01
    },
    ratingView:{
        flex:0.5,
        justifyContent:'flex-start',
        flexDirection:'row',
        backgroundColor:'#FFFFFF',
    },
    commentText:{
        padding:15,
        fontSize:14,
        color:'#4A4A4A',
    },
    chefReplyBox:{
        flexDirection:'row',
        alignSelf:'center',
        width:windowWidth*0.93,
        marginTop:10,
    },
    chefPhotoView:{
        flex:1/6,
        flexDirection:'column',
        alignItems:'flex-start',
        justifyContent:'flex-start',
    },
    chefPhoto:{
        width:windowWidth*0.93/7,
        height:windowWidth*0.93/7,
        borderWidth:0,
        borderRadius:8,
    },
    chefReplyContentView:{
         flex:5/6,
         backgroundColor:"#4A4A4A",
    },
    chefReplyText:{
        padding:15,
        fontSize:14,
        color:'#F5F5F5',
    },
    ratingCommentTimeView:{
        flexDirection:'row',
        height:windowHeight*0.028,
        flex:1,
    },
    commentTimeView:{
        flex:0.5,
        flexDirection:'row',
        justifyContent:'flex-end',
        backgroundColor:'#FFFFFF'
    },
    commentTimeText:{
        fontSize:12,
        color:'#9B9B9B',
        fontWeight:'600',
    }
});

module.exports = ChefCommentsPage;