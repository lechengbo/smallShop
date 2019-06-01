
const service = require("../../services/shopService.js");
const config = require("../../config/base.js");
const cache = require("../../services/cacheService.js");
const util=require("../../utils/util.js");
//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    pageInfo:{},
    picUrl: config.picUrl,
    goodsList: [],
    allGoodsPrice: 0,
    curAddressData:{},
    totalNum:0,
    
    orderSpecialNote:"实际价格以双方协商为准，此价格不包含优惠，活动等价格",
    orderType: "cart",
  },
 
  onLoad: function (e) {
    
    //显示收货地址标识
    this.setData({
      orderType: e.orderType || "cart"
    });
    this.initPageInfo();
  },
  initPageInfo: function () {
    service.getShopInfo().then((data) => {
      let tempPageInfo = data.pageInfo ? data.pageInfo.SubmitOrderCusInfo : {};
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
  onShow: function () {
    var that = this;
    var tempGoodsList = cache.getSync(cache.keys.tempOrder);

    that.setData({
      goodsList: tempGoodsList,
    });
    that.caculateAll();
    that.initShippingAddress();
  },
  caculateAll:function(){
    var list=this.data.goodsList;
    var tempTotalPrice=0;
    var temptotalNum=0;
    for(let i=0;i<list.length;i++){
      temptotalNum+=list[i].Num;
      tempTotalPrice += parseInt(list[i].Price * list[i].Num*100)/100;
    }
    this.setData({
      allGoodsPrice: tempTotalPrice,
      totalNum: temptotalNum,
    });
  },
  createOrder:function (e) {
    service.addOrder({
      guid:util.guid(),
      goodsList:this.data.goodsList,
      address: this.data.curAddressData,
      note: e.detail.value.remark,
      createdTime: util.formatTime(new Date()),
      orderType:this.data.orderType,
      status:0,//0：未支付，1：已支付
      totalPrice: this.data.allGoodsPrice,
      totalNum: this.data.totalNum
    }).then(data=>{
      console.log(data);
      if(data){
        wx.showToast({
          title: '提交成功',
          icon:"success",
          duration:2000,
        })
        wx.navigateTo({
          url: '/pages/order-list/index',
        });
      }
    })
  },
  initShippingAddress: function () {
    let tempAddress= cache.getSync(cache.keys.selectedAddress);
    this.setData({
      curAddressData:tempAddress
    })
  },
 
  addAddress: function () {
    wx.navigateTo({
      url:"/pages/address-add/index"
    })
  },
  selectAddress: function () {
    wx.navigateTo({
      url:"/pages/address-add/index"
    })
  },
  
})
