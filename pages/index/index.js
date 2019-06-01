const service=require("../../services/shopService.js");
const config=require("../../config/base.js");
const util=require("../../utils/util.js");
//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    pageInfo:{},
    currentTab:0,
    isShowBigPic:false,
    bigPicUrl:'',

    picUrl:config.picUrl,
    shop : {},
    loopPicList: [],
    showPicList: [],
    couponList: [],
    noticeList: [],
    helperList:[]
  },

 
  onLoad: function () {
    this.getShopInfo ();
  },

  
  getCoupons: function () {
    var that = this;
    service.getCoupon(app.globalData.shopId).then((data)=>{
      that.setData({
        couponList:data
      });
    });
  },
  
  
  getShopInfo: function () {
    var that = this;
    service.getShopInfo().then((data)=>{
      let tempPageInfo = data.pageInfo ? data.pageInfo.HomeCusInfo : {};
      that.setData({
        shop: data.shop,
        loopPicList: util.operateUrl(data.loopPicList,"Url"),
        showPicList: util.operateUrl(data.showPicList,"Url"),
        noticeList: data.noticeList,
        helperList: data.helperList,
        pageInfo: tempPageInfo
      });
      app.config=data.config;
      app.globalData.shopId=data.shop.Id;

      //设置标题
      if(tempPageInfo.Title){
        wx.setNavigationBarTitle({
          title: tempPageInfo.Title
        });
      }else{
        wx.setNavigationBarTitle({
          title: data.shop.Name
        });
      }
      
      that.getCoupons();
    })
    
  },
  
  callTap:function(e){
    console.log(e);
    let phone = e.currentTarget.dataset.phone || this.data.shop.PhoneNO;
    wx.makePhoneCall({
      phoneNumber: phone //仅为示例，并非真实的电话号码
    })
  },
  openMap:function(){
    wx.openLocation({
      latitude: this.data.shop.Address.Latitude,
      longitude: this.data.shop.Address.Longitude,
      scale: 28
    });
  },
  showBigPic:function(e){
    this.setData({
      isShowBigPic:true,
      bigPicUrl: e.currentTarget.dataset.url
    })
  },
  closeBigPic:function(){
    this.setData({
      isShowBigPic: false,
    })
  },
  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {

    var that = this;

    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  gotoCouponDetail:function(e){
    wx.navigateTo({
      url: "/pages/couponDetail/index?id=" + e.currentTarget.dataset.id,
    })
  },

 
})
