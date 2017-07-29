'use strict'
var HttpsClient = require('./httpsClient');
var styles = require('./style');
var config = require('./config');
var AuthService = require('./authService');
var backIcon = require('./icons/icon-back.png');
import Dimensions from 'Dimensions';


var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;


import React, {
    Component,
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    ListView,
    TouchableHighlight,
    AsyncStorage,
    Alert
} from 'react-native';


class chefIntroPage extends Component {
    constructor(props) {
        super(props);
        var routeStack = this.props.navigator.state.routeStack;
        let chef = routeStack[routeStack.length - 1].passProps.chef;

        this.state = {
            chef: chef,
        };
        this.client = new HttpsClient(config.baseUrl, true);
    }

    render() {

        // placeholders
        var introPlaceholder = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";
        var imgPlaceholder = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBu4EToVRDElSv5pyfmL5z1qtl39ux94YOyciIqYGZTHDxp65Plw';

        var myKitchenImages = [imgPlaceholder, imgPlaceholder];

        var kitchenImgView = [];
        var index = 0;
        for (var oneImg of myKitchenImages) {
            var key = 'myKitchenImg' + index; //sudo key
            kitchenImgView.push(<Image key={key} source={{ uri: oneImg }} style={styleChefIntroPage.kitchenImg} />)
            index++;
        }

        return (
            <View style={styles.container}>
                <View style={styles.headerBannerView}>
                    <TouchableHighlight style={styles.headerLeftView} underlayColor={'#F5F5F5'} onPress={() => this.navigateBackToShopPage()}>
                        <View style={styles.backButtonView}>
                            <Image source={backIcon} style={styles.backButtonIcon} />
                        </View>
                    </TouchableHighlight>
                    <View style={styles.titleView}></View>
                    <View style={styles.headerRightView}></View>
                </View>
                <ScrollView style={styles.scrollViewContainer}>
                    <View style={styles.pageTitleView}>
                        <Text style={styles.pageTitle}>Introduction</Text>
                    </View>
                    <View style={styleChefIntroPage.introContentView}>
                        <Text style={styles.pageText}>{introPlaceholder}</Text>
                    </View>
                    <View style={styleChefIntroPage.chefMyKitchenView}>
                        <Text style={styles.pageSubTitle}>My Kitchen</Text>
                        <View style={styleChefIntroPage.kitchenImgView}>
                            {kitchenImgView}
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }

    navigateBackToShopPage() {
        this.props.navigator.pop();
    }
}

var styleChefIntroPage = StyleSheet.create({
    introContentView: {
        flex: 1,
        flexDirection: 'column',
        paddingBottom: windowHeight * 0.03,
    },
    chefMyKitchenView: {
        height: windowHeight * 0.317,
        flexDirection: 'column',
        borderTopWidth: 1,
        borderColor: '#EAEAEA',
    },
    kitchenImgView: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'stretch',
    },
    kitchenImg: {
        width: windowWidth * 0.438,
        height: windowHeight * 0.15,
        margin: windowWidth * 0.006,
    },
});

module.exports = chefIntroPage;