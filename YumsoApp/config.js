module.exports={
    
    baseUrl: 'http://172.31.98.111:8080',
    email:'xihe@yumso.com',
    password:'123',
    authEndpointEmail:'/api/v1/auth/authenticateByEmail/eater',
    createOrderEndpoint:'/api/v1/chef/order/createOrder',
    orderHistoryEndpoint:'/api/v1/chef/order/eaterOrders/',
    orderCommentEndpoint:'/api/v1/chef/order/eaterComments/',
    leaveEaterCommentEndpoint:'/api/v1/chef/order/leaveEaterComment/',
    getOneChefEndpoint:'/api/v1/eater/chef/'
}