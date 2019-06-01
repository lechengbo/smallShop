const service = require("../../../services/shopService.js");
const config = require("../../../config/base.js");
const cache = require("../../../services/cacheService.js");
var app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // currentSpec:{
    //   type:Object,
    //   value:{}
    // },
    goods:{
      type:Object,
      value:{}
    },
    pageInfo: {
      type: Object,
      value: {}
    },
    shopType:{
      type:String,
      value:'addShopCar'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    picUrl: config.picUrl,
    goods: {},//this.properties.goods,
    currentSpec: {},
    buyNumber: 1,
    isShowBigPic: false
  },
 
  /**
   * 组件的方法列表
   */
  methods: {
    closePopupTap: function () {
      this.triggerEvent("closePopupTap",{});
    },
    numJianTap: function () {

      var currentNum = this.data.buyNumber;
      currentNum--;
      if (currentNum <= 0) {
        return;
      }
      this.setData({
        buyNumber: currentNum
      })
    },
    numJiaTap: function () {
      var currentNum = this.data.buyNumber;
      currentNum++;
      this.setData({
        buyNumber: currentNum
      });
    },
    /**
     * 选择商品规格
     * @param {Object} e
     */
    labelItemTap: function (e) {
      //var that = this;
      for (let i = 0; i < this.data.goods.SpecList.length; i++) {
        let spec = this.data.goods.SpecList[i];
        if (spec.Id == e.currentTarget.dataset.id) {
          this.setData({
            currentSpec: spec
          });
          break
        }
      }


    },
    /**
    * 加入购物车
    */
    addShopCar: function () {
      let shopCartGoods = this.createShopCartGoods();
      if (!shopCartGoods) {
        return;
      }
      service.addGoodsToShopCart(shopCartGoods, app.globalData.shopId).then((data) => {
        this.closePopupTap();
        
        wx.showToast({
          title: '加入购物车成功',
          icon: 'success',
          duration: 2000
        })
      });
    },
    createShopCartGoods: function () {
      let tempSpecName = "";
      let tempPrice = 0;
      let tempUrl = "";
      if (this.data.goods.SpecList && this.data.goods.SpecList.length > 0 && !this.data.currentSpec.Id) {
        wx.showModal({
          title: '提示',
          content: '请选择商品规格！',
          showCancel: false
        })
        //this.triggerEvent('bindGuiGeTap', {})
        return;
      } else {
        tempSpecName = this.data.currentSpec.Name;
        tempPrice = this.data.currentSpec.Price;
        tempUrl = this.data.currentSpec.Url;
      }

      if (!this.data.goods.SpecList || this.data.goods.SpecList.length == 0) {
        tempPrice = this.data.goods.Price;
      }
      tempUrl = tempUrl || this.data.goods.LoopPicList[0];
      //组建购物车商品
      var shopCartGoods = service.bulidShopCartGoods(
        this.data.goods.Id,
        tempUrl,
        this.data.goods.Name,
        tempSpecName,
        tempPrice,
        this.data.buyNumber
      )
      return shopCartGoods;
    },
    /**
      * 立即购买
      */
    buyNow: function () {

      let shopCartGoods = this.createShopCartGoods();
      if (!shopCartGoods) {
        return;
      };
      //临时存储
      cache.setSync(cache.keys.tempOrder, [shopCartGoods]);
      wx.navigateTo({
        url: "/pages/to-pay-order/index?orderType=buyNow"
      })
    },
   
    closeBigPic: function () {
      this.setData({
        isShowBigPic: false
      })
    },
    showBigPic: function () {
      this.setData({
        isShowBigPic: true
      })
    },
  }
})
