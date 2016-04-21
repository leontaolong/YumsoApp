module.exports={
    autoLogin:true,
    baseUrl: 'http://192.168.1.134:8080',
    email:'xihe@yumso.com',
    password:'123',
    googleApiName:'yumsoIOS	',
    googleApiKey:'AIzaSyBQdKxM-ZRQ2r95bkQLPlY10joKJeC6slw',
    googleGeoBaseUrl: 'https://maps.googleapis.com',
    reverseGeoCoding:'/maps/api/geocode/json?latlng=',
    searchAddress:'/maps/api/geocode/json?address=',
    //auth
    authEndpointEmail:'/api/v1/auth/authenticateByEmail/eater',
    authEndpointFacebook:'/api/v1/auth/authenticateFbToken/eater',
    //non-public
    createOrderEndpoint:'/api/v1/chef/order/createOrder',
    orderHistoryEndpoint:'/api/v1/chef/order/eaterOrders/',
    orderCommentEndpoint:'/api/v1/chef/order/eaterComments/',
    leaveEaterCommentEndpoint:'/api/v1/chef/order/leaveEaterComment/',
    eaterEndpoint:'/api/v1/eater/getEater',
    eaterUpdateEndpoint:'/api/v1/eater/updateEater',
    eaterPicUploadEndpoint:'/api/v1/eater/eaterPicUpload',
    //public
    chefDishesEndpoint:'/api/v1/public/getDishes/',
    chefSchedulesEndpoint:'/api/v1/public/getSchedules/',
    chefListEndpoint: '/api/v1/public/chefs',
    chefCommentsEndpoint:'/api/v1/public/chefComments/',
    getOneChefEndpoint:'/api/v1/public/chef/',
}