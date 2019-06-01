
const service=require("../../../services/shopService.js");
var app=getApp();
// pages/ucenter/myCoupon/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    keywrod: '',
    couponLogList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  inputChange: function (e) {
    this.setData({
      keyword: e.detail.value
    });
  },
  search:function(e){
    var that = this;
    let couponlogP= service.searchCounpon(this.data.keyword);
    let couponP = service.getCoupon();
    Promise.all([couponlogP,couponP]).then(([logs,coupons])=>{
      for (let index = 0; index < logs.length; index++) {
        const element = logs[index];
        for(let j=0;j<coupons.length;j++){
          let tempCoupon=coupons[j];
          if(element.Coupon.CId==tempCoupon.Id){
            element.Coupon=tempCoupon;
            break;
          }
        }
      };
      this.setData({couponLogList:logs});
      console.log(logs);
    })
  },
  gotoCouponDetail: function (e) {
    wx.navigateTo({
      url: "/pages/couponDetail/index?showType=onlyShowDetail&id=" + e.currentTarget.dataset.id,
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})