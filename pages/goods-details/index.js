const service=require("../../services/shopService.js");
const config=require("../../config/base.js");
const cache=require("../../services/cacheService.js");
//index.js
//获取应用实例
var app = getApp();

Page({
  data: {
    pageInfo:{},
    picUrl: config.picUrl,
    goods:{},
    currentSpec:{},
    priceRange:"",
    hideShopPopup: true,
    shopType: "addShopCar",//购物类型，加入购物车或立即购买，默认为加入购物车
    buyNumber: 1,
    currentTab:0,
    shopNum: 0,
    isShowBigPic:false
  },

  onLoad: function (e) {
    this.setGoods(e.id);
    this.setShopNum();
    
  },
  initPageInfo:function() {
    service.getShopInfo().then((data) => {
      let tempPageInfo = data.pageInfo ? data.pageInfo.ProCusInfo : {};
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
  setGoods:function(id){
    service.getGoods(id, app.globalData.shopId).then((data)=>{
      this.setData({
        goods:data
      });
      this.caculatePriceRange();
    });
  },
  caculatePriceRange:function(){
    let specList= this.data.goods.SpecList;
    let tempPriceRange="";
    if(!specList || specList.length==0){
      tempPriceRange = this.data.goods.Price+"";
    }else{
      let minPrice , maxPrice;
      minPrice=maxPrice=specList[0].Price;
      for(let i=1;i<specList.length;i++){
        minPrice=Math.min(minPrice,specList[i].Price);
        maxPrice=Math.max(maxPrice,specList[i].Price);
      }
      tempPriceRange=(minPrice==maxPrice)?minPrice+"":minPrice+" - "+maxPrice;
    };
    this.setData({
      priceRange:tempPriceRange
    });
  },
  setShopNum:function(){
    service.getShopCart(app.globalData.shopId).then((data)=>{
      //console.log(data);
      this.setData({
        shopNum:data.TotalNum
      });
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


  goShopCar: function () {
    wx.reLaunch({
      url: "/pages/shop-cart/index"
    });
  },
  toAddShopCar: function () {
    this.setData({
      shopType: "addShopCar"
    })
    this.bindGuiGeTap();
  },
  tobuy: function () {
    this.setData({
      shopType: "tobuy"
    });
    this.bindGuiGeTap();
    
  },  
  /**
   * 规格选择弹出框
   */
  bindGuiGeTap: function() {
     this.setData({  
        hideShopPopup: false 
    })  
  },
  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function() {
    this.setShopNum();
     this.setData({  
        hideShopPopup: true 
    })  

  },
  
	  
  onShareAppMessage: function () {
   
    return {
      title: this.data.goods.Name,
      path: '/pages/goods-details/index?id=' + this.data.goods.Id ,
      success: function (res) {
        // 转发成功
        console.log("我分享了");
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
 
 
})
