const util=require("../../../utils/util.js");
const cache=require("../../../services/cacheService.js");
const service=require("../../../services/shopService.js");
var app = getApp();

Page({
  data: {
    pageInfo:{},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userInfo: null
  },
  onLoad: function (options) {
   
    this.initPageInfo();
  },
  initPageInfo: function () {
    service.getShopInfo().then((data) => {
      let tempPageInfo = data.pageInfo ? data.pageInfo.UserCenterCusInfo : {};
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
  onReady: function () {

  },
  onShow: function () {
    let that = this;
    util.getUserInfo().then(userInfo=>{
       this.setData({
          userInfo: userInfo,
        });
    });
   
  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭
  },
  goLogin() {
    
    if (this.data.userInfo){
      return;
    }
    wx.navigateTo({
      url: "/pages/authorize/index",
    })
  },
  clear:function(){
    wx.showModal({
      title: '清理',
      content: '你确定需要清理缓存吗？',
      success: (res) => {
        if(res.confirm){
          cache.clearAll().then(data => {
            if (data) {
              wx.showToast({
                title: '清理成功',
                duration: 2000
              })
            }
          })
        }
        
      }
    })
    
  }
})