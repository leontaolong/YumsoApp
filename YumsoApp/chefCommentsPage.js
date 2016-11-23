var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var rating = require('./rating');
var dateRender = require('./commonModules/dateRender');
var commonAlert = require('./commonModules/commonAlert');
var backIcon = require('./icons/icon-back.png');
var NetworkUnavailableScreen = require('./networkUnavailableScreen');
var LoadingSpinnerViewFullScreen = require('./loadingSpinnerViewFullScreen')
import Dimensions from 'Dimensions';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

import React, {
  Component,
  StyleSheet,
  Text,
  View,
  Image,
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
        var shopName = routeStack[routeStack.length-1].passProps.shopName;
        this.state = {
            dataSource: ds.cloneWithRows([]),
            showProgress:false,
            showCommentBox:false,
            showNetworkUnavailableScreen:false,
            chefId: chefId,
            chefProfilePic:chefProfilePic,
            shopName:shopName,
        };
    }

    componentDidMount(){
        this.client = new HttpsClient(config.baseUrl, true);
        this.fetchComments(); 
    }
    
    fetchComments() {
        this.setState({showProgress:true});
        const start = 'start=0';
        const end = 'end='+ new Date().getTime();
        return this.client.getWithoutAuth(config.chefCommentsEndpoint + this.state.chefId + '?' + start + '&' + end)
            .then((res) => {
                if (res.statusCode != 200 && res.statusCode!=202) {
                    throw new Error('Fail getting past comments');
                }
                let comments = res.data.comments;
                this.setState({ dataSource: this.state.dataSource.cloneWithRows(comments), showProgress:false, showNetworkUnavailableScreen:false, comments:comments });
            }).catch((err)=>{
                this.setState({showProgress: false,showNetworkUnavailableScreen:true});
                commonAlert.networkError(err);
            });
    }

    renderRow(comment){
        return (<View style={styleChefCommentsPage.oneListingView}>
                    <View style={styleChefCommentsPage.eaterPhotoView}>
                        <Image source={{uri:comment.eaterProfilePic}} style={styleChefCommentsPage.eaterPhoto}/>
                    </View>
                    <View style={styleChefCommentsPage.oneCommentView}>
                        <View style={styleChefCommentsPage.reviewerNameCommentTimeView}>
                            <Text style={styleChefCommentsPage.reviewerNameText}>{comment.eaterAlias}</Text>
                            <Text style={styleChefCommentsPage.commentTimeText}>{dateRender.renderDate3(comment.eaterCommentTime)}</Text>
                        </View>
                        <View style={styleChefCommentsPage.ratingView}>
                            {rating.renderRating(comment.starRating)}
                        </View>
                        <Text style={styleChefCommentsPage.commentText}>{comment.eaterComment && comment.eaterComment.trim()? comment.eaterComment.trim():'No Comment'}</Text>
                        {this.displayChefComment(comment)}
                    </View>   
                </View>);
    }
    
    displayChefComment(comment){
         if(comment.chefComment){
           var chefCommentSection = [(<View key={'chefNameCommentTimeView'} style={styleChefCommentsPage.chefNameCommentTimeView}>
                                            <Text style={styleChefCommentsPage.reviewerNameText}>{this.state.shopName}</Text>
                                            <Text style={styleChefCommentsPage.commentTimeText}>{dateRender.renderDate3(comment.chefCommentTime)}</Text>
                                      </View>),
                                     (<Text key={'commentText'} style={styleChefCommentsPage.commentText}>{comment.chefComment}</Text>)];
           return chefCommentSection;
        }
        return[];
   }
    
    render() {
        var loadingSpinnerView = null;
        if (this.state.showProgress) {
            loadingSpinnerView = <LoadingSpinnerViewFullScreen/>  
        }
        
        if(this.state.comments && this.state.comments.length==0){
           var  noReviewText = <Text style={styles.listViewEmptyText}>This chef does not have any review left</Text>
        }
        
        var commentListView = <ListView style={styles.dishListViewWhite}
                               dataSource = {this.state.dataSource}
                               renderRow={this.renderRow.bind(this)}/>
        var networkUnavailableView = null;
        if(this.state.showNetworkUnavailableScreen){
           networkUnavailableView = <NetworkUnavailableScreen onReload = {this.fetchComments.bind(this)} />
           commentListView = null;
        }

        return (
            <View style={styles.container}>
               <View style={styles.headerBannerView}>    
                   <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBackToChefPage()}>
                      <View style={styles.backButtonView}>
                         <Image source={backIcon} style={styles.backButtonIcon}/>
                      </View>
                   </TouchableHighlight>    
                   <View style={styles.titleView}>
                      <Text style={styles.titleText}>Reviews</Text>
                   </View>
                   <View style={styles.headerRightView}>
                   </View>
               </View>
               {noReviewText}
               {networkUnavailableView}
               {commentListView}
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
       flexDirection:'row',
       paddingTop:windowHeight*0.03,
       paddingBottom:windowHeight*0.015,
       borderBottomWidth:1,
       borderColor: '#EAEAEA',
       width:windowWidth*0.9,
       alignSelf:'center',
    },
    eaterPhotoView:{
       flex:1/6,
       flexDirection:'column',
       alignItems:'center',
       justifyContent:'flex-start',
    },
    eaterPhoto:{
        width:windowWidth*0.11,
        height:windowWidth*0.11,
        borderWidth:0.5,
        borderColor:'#EAEAEA',
        borderRadius:0.5*windowWidth*0.11,
    },
    oneCommentView:{
        flex:5/6,
        flexDirection:'column',
        paddingLeft:windowWidth*0.027,
    },
    reviewerNameCommentTimeView:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
    },
    reviewerNameText:{
        fontSize:14*windowHeight/667.0,
        fontWeight:'bold',
        color:'#4A4A4A',
    },
    commentTimeText:{
        fontSize:12*windowHeight/667.0,
        color:'#979797',
        fontWeight:'300',
    },
    ratingView:{
        flexDirection:'row',
        height:windowHeight*0.027,
        flex:1,
        justifyContent:'flex-start',
        alignItems:'flex-end',
    },
    chefNameCommentTimeView:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        borderColor:'#EAEAEA',
        borderTopWidth:1,
        paddingTop:windowHeight*0.015,
    },
    commentText:{
        paddingVertical:windowHeight*0.015,
        fontSize:14*windowHeight/667.0,
        color:'#4A4A4A',
        lineHeight:17*windowHeight/667.0,
    },
}); 

module.exports = ChefCommentsPage;