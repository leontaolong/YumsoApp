'use strict';

import React, {
    Component,
    Alert
} from 'react-native';

class CommonAlert {
    //Network Error
    networkError(err){
        if(err.statusCode == 412){
           this.appVersionError();
        }else{
          var title = 'Network Error';
          var text = err.message;
          Alert.alert(title, text,[ { text: 'OK' }]);
        }
    }
    //Location Error
    locationError(err){
        var title = 'Location Unavailable';
        var text = err.message;
        Alert.alert(title, text,[ { text: 'OK' }]);
    }

    appVersionError(){
        var title = 'Deprecated App Version';
        var text = 'Please update your Yumso App';
        Alert.alert(title, text,[ { text: 'OK' }]);
    }

    serverSideError(){
        var title = 'Server Error';
        var text = 'Server side error. Please try again later.';
        Alert.alert(title, text,[ { text: 'OK' }]);
    }
}

module.exports = new CommonAlert();