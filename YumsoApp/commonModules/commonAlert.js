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
        }else if(err.statusCode == 500){
           this.serverSideError(err);
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

    serverSideError(errorObject){
        var title = 'Server Side Error';
        if(errorObject.data && errorObject.data.exceptionId){
           var text = "Sorry about the inconvenience. We will get it fixed ASAP.\n"
           text = text + 'ExceptionId: ' + errorObject.data.exceptionId;
        }
        Alert.alert(title, text,[ { text: 'OK' }]);
    }
}

module.exports = new CommonAlert();