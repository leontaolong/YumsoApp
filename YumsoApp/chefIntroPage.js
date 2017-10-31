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
        var introPlaceholder1 = this.state.chef.chefDescription;
        var introPlaceholder2 = this.state.chef.storeDescription;
        var imgPlaceholder1 = this.state.chef.shopPictures[0];
        var imgPlaceholder2 = this.state.chef.shopPictures[1];

        var myKitchenImages = [imgPlaceholder1, imgPlaceholder2];

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
                    {introPlaceholder1 != undefined ?
                        <View style={styleChefIntroPage.introContentView}>
                            <Text style={styles.pageText}>{introPlaceholder1}</Text>
                        </View>:null
                    }
                    {introPlaceholder2 != undefined ?
                        <View style={styleChefIntroPage.introContentView}>
                            <Text style={styles.pageText}>{introPlaceholder2}</Text>
                        </View> : null
                    }
                    <View style={styleChefIntroPage.chefMyKitchenView}>
                        <Text style={styles.pageSubTitle}></Text>
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