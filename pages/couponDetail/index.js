const service = require("../../services/shopService.js");
const util=require("../../utils/util.js");
// pages/couponDetail/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: { mobile: '', name: '' },
    coupon: {},
    willGet: false,
    onlyShowDetail: false,


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCouponById(options.id);

    this.setData({
      onlyShowDetail: options.showType == "onlyShowDetail"
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  getPhoneNumber: function (e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
  },
  bindGetUserInfo: function (e) {
    console.log(e.detail.userInfo)
  },
  userGetCoupon: function () {
    if (!this.data.willGet) {
      this.setData({
        willGet: true
      });
     
      return;
    }

    if (!this.data.user.mobile) {
      wx.showToast({
        title: '请输入领用人手机号码',
      })
      return;
    };
    if (!this.data.coupon.Id || this.data.coupon.Id <= 0) {
      wx.showToast({
        title: '该优惠卷不存在',
      })
      return;
    }

    service.userGetCounpon(this.data.coupon.Id, this.data.user.mobile, this.data.user.name).then(ret => {

    });
  },
  getCouponById: function (id) {
    if (!id) {
      return;
    }
    service.getCouponById(id).then(data => {
      this.setData({
        coupon: data
      });
    });
  },
  userNameChange: function (e) {
      this.data.user.name=e.detail.value;
  },
  userMobileChange: function (e) {
      this.data.user.mobile=e.detail.value
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    util.login().then(res => {

    });
    util.getUserInfo().then(userInfo => {
      this.setData({
        user: { mobile: this.data.user.mobile, name: userInfo.nickName }
      });
    });
   
  },
  goLogin:function() {

    wx.navigateTo({
      url: "/pages/authorize/index",
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