const util=require("../../../utils/util.js");
const servcie=require("../../../services/shopService.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    needReply:false,
    userName:'',
    canSubmit:true
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
    util.login().then(res => {

    });
    util.getUserInfo().then(userInfo => {
      this.setData({
        userName: userInfo.nickName
      });
    });
  },
  submitAdvice:function(e){
    console.log(e.detail.value);
    if(!e.detail.value.content){
      wx.showToast({
        title: '内容不能为空',
        duration:2000
      });
      return;
    };
    if(e.detail.value.isNeedReply && !e.detail.value.mobile){
      wx.showToast({
        title: '手机号码不能为空',
      });
      return;
    }
    this.setData({
      canSubmit:false
    })
    servcie.adviceAdd(e.detail.value);
  },
  goLogin:function() {
    wx.navigateTo({
      url: "/pages/authorize/index",
    })
  },
  isNeedReplyChange:function(e){
    this.setData({
      needReply:e.detail.value
    });
    if(e.detail.value){
      wx.showToast({
        title: '手机号码必填',
      })
    }
    
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