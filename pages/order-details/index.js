const service=require("../../services/shopService.js");
const config=require("../../config/base.js");
var app = getApp();
Page({
    data:{
      picUrl: config.picUrl,
      order:{}
    },
    onLoad:function(e){
      var orderId = e.guid;
      service.getOrderById(orderId).then(data=>{
        this.setData({
          order:data
        })
      })
    },
    onShow : function () {
      
      
    },
    
    
    
})