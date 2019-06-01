 
var wxpay = require('../../utils/pay.js');
var service=require("../../services/shopService.js");
var config=require("../../config/base.js");
var app = getApp()
Page({
  data:{
    pageInfo:{},
    picUrl:config.picUrl,
    statusType: ["待付款", "已支付"],
    currentStatus:0,
    tabClass: ["", "", "", "", ""]
  },
  statusTap:function(e){
     var curType =  e.currentTarget.dataset.index;
     this.data.currentStatus = curType
     this.setData({
       currentStatus:curType
     });
     this.onShow();
  },
  orderDetail : function (e) {
    var orderId = e.currentTarget.dataset.guid;
    wx.navigateTo({
      url: "/pages/order-details/index?guid=" + orderId
    })
  },
  cancelOrderTap:function(e){
    wx.showModal({
      title:'取消订单',
      content: '你确定需要取消吗？',
      success:(res)=>{
        if (res.confirm){
          var guid = e.currentTarget.dataset.guid;
          service.deleteOrder(guid).then(result => {
            if (result) {
              this.onShow();
            }
          });
        }
        
      }
    })
    
  },
  toPayTap:function(e){
    //console.log(e.currentTarget.dataset);
    var guid = e.currentTarget.dataset.guid;
    var money = e.currentTarget.dataset.money;
    var payTypes = [this.data.pageInfo.OutlinePay || "线下支付"];
    if (app.globalData.config.IsCanCreateOrder){
      payTypes.push("微信支付")
    };
    wx.showActionSheet({
      itemList: payTypes,
      success:  (res)=> {
        if(res.tapIndex==0){
          service.updateOrderToPayStatus(guid,"线下支付").then(result=>{
            if(result){
              this.onShow();
            }
          });
         
        }
        if(res.tapIndex==1){
          wxpay.wxpay(app, money, guid, "/pages/order-list/index");
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })      
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
   this.initPageInfo();
  },
  initPageInfo: function () {
    service.getShopInfo().then((data) => {
      let tempPageInfo = data.pageInfo ? data.pageInfo.OrderCusInfo : {};
      this.setData({
        pageInfo: tempPageInfo
      });

      if (tempPageInfo.Title) {
        wx.setNavigationBarTitle({
          title: tempPageInfo.Title
        });
      }


    });
  },
  onReady:function(){
    // 生命周期函数--监听页面初次渲染完成
 
  },
  getOrderStatistics : function (status) {
    var tabClass = this.data.tabClass;
    tabClass[status] = "red-dot"

    this.setData({
      tabClass: tabClass,
    });
  },
  onShow:function(){
    // 获取订单列表
    wx.showLoading();
    service.getOrderByStatus(this.data.currentStatus).then(data=>{
      this.setData({
        orderList:data
      });
      if(data.length>0){
        this.getOrderStatistics(this.data.currentStatus);
      }
      wx.hideLoading();
    });

   
    
  },
  onHide:function(){
    // 生命周期函数--监听页面隐藏
 
  },
  onUnload:function(){
    // 生命周期函数--监听页面卸载
 
  },
  onPullDownRefresh: function() {
    // 页面相关事件处理函数--监听用户下拉动作
   
  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数
  
  }
})
