'use strict';

import React, {
    Component,
    Alert
} from 'react-native';

class CommonAlert {
    //Network Error
    networkError(err){
        var title = 'Network Error';
        var text = err.message;
        Alert.alert(title, text,[ { text: 'OK' }]);
    }
    //Location Error
    locationError(err){
        var title = 'Location Unavailable';
        var text = err.message;
        Alert.alert(title, text,[ { text: 'OK' }]);
    }
}

module.exports = new CommonAlert();