module.exports={
    baseUrl: 'http://10.0.0.242:8080',
    googleApiName:'yumsoIOS	',
    googleApiKey:'AIzaSyBQdKxM-ZRQ2r95bkQLPlY10joKJeC6slw',
    googleGeoBaseUrl: 'https://maps.googleapis.com',
    reverseGeoCoding:'/maps/api/geocode/json?latlng=',
    searchAddress:'/maps/api/geocode/json?address=',
    //auth and payment
    authEndpointEmail:'/api/v1/auth/authenticateByEmail/eater',
    registerEndpointEmail:'/api/v1/auth/registerByEmail/eater',
    resetPasswordEndpoint:'/api/v1/auth/reset/eater',
    forgotPasswordEndpointEmail:'/api/v1/auth/forgotPassword/eater/',
    authEndpointFacebook:'/api/v1/auth/authenticateFbToken/eater',
    authStatusEndpoint:'/api/v1/auth/getloginstatus',
    paymentTokenEndpoint:'/api/v1/payment/client_token',
    checkout:'/api/v1/payment/checkout',
    addAPayment:'/api/v1/payment/addAPayment/eater',
    getPaymentList:'/api/v1/payment/paymentList/',
    deletePayment:'/api/v1/payment/deletePayment',
    //non-public
    createOrderEndpoint:'/api/v1/chef/order/createOrder',
    orderHistoryEndpoint:'/api/v1/chef/order/eaterOrders/',
    orderCommentEndpoint:'/api/v1/chef/order/eaterComments/',
    leaveEaterCommentEndpoint:'/api/v1/chef/order/leaveEaterComment/',
    eaterEndpoint:'/api/v1/eater/getEater',
    eaterUpdateEndpoint:'/api/v1/eater/updateEater',
    eaterPicUploadEndpoint:'/api/v1/eater/eaterPicUpload',
    addFavoriteEndpoint:'/api/v1/eater/addOrRemoveFavorite/add',
    removeFavoriteEndpoint:'/api/v1/eater/addOrRemoveFavorite/remove',
    //public
    chefDishesEndpoint:'/api/v1/public/getDishes/',
    chefSchedulesEndpoint:'/api/v1/public/getSchedules/',
    chefListEndpoint: '/api/v1/public/chefs',
    chefCommentsEndpoint:'/api/v1/public/chefComments/',
    priceQuoteEndpoint:'/api/v1/public/quoteOrderPrice/',
    getOneChefEndpoint:'/api/v1/public/chef/',
}