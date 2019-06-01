const service = require("../../services/shopService.js");
const config = require("../../config/base.js");
const cache=require("../../services/cacheService.js");
//index.js
var app = getApp()
Page({
  data: {
    pageInfo:{},
    selectedTotalPrice: 0,
    selectedTotalNum: 0,
    allSelect: false,
    cartGoodsList: [],
    picUrl: config.picUrl,
    delBtnWidth: 120,    //删除按钮宽度单位（rpx）
    startX:0,
  },

  //获取元素自适应后的实际宽度
  getEleWidth: function (w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth;
      var scale = (750 / 2) / (w / 2);  //以宽度750px设计稿做宽度的自适应
      // console.log(scale);
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },
  initEleWidth: function () {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },
  onLoad: function () {
    this.initEleWidth();
    this.onShow();
  },
  initPageInfo: function () {
    service.getShopInfo().then((data) => {
      let tempPageInfo = data.pageInfo ? data.pageInfo.ShopCarCusInfo : {};
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
    service.getShopCart(app.globalData.shopId).then(shopCart => {
      this.updateGoods(shopCart);
    });

  },
  
  toIndexPage: function () {
    wx.switchTab({
      url: "/pages/category/index"
    });
  },

  touchS: function (e) {
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX
      });
    }
  },
  touchM: function (e) {
    var index = e.currentTarget.dataset.index;

    if (e.touches.length == 1) {
      var moveX = e.touches[0].clientX;
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var left = "";
      if (disX == 0 || disX < 0) {//如果移动距离小于等于0，container位置不变
        left = "margin-left:0px";
      } else if (disX > 0) {//移动距离大于0，container left值等于手指移动距离
        left = "margin-left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          left = "left:-" + delBtnWidth + "px";
        }
      }
      var list = this.data.cartGoodsList;
      list[parseInt(index)].left = left;
    }
  },

  touchE: function (e) {
    var index = e.currentTarget.dataset.index;
    if (e.changedTouches.length == 1) {
      var endX = e.changedTouches[0].clientX;
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth / 2 ? "margin-left:-" + delBtnWidth + "px" : "margin-left:0px";
      var list = this.data.cartGoodsList;
      list[parseInt(index)].left = left;
      this.setData({
        cartGoodsList: list
      });
    }
  },
  delItem: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.cartGoodsList;
    list.splice(index, 1);
    service.updateShopCartGoods(list, app.globalData.shopId).then(shopCart => {
      this.updateGoods(shopCart);
    })
  },
  caculateSelectedInfo: function () {
    let tempTotalPrice = 0;
    let tempTotalNum = 0;
    let isAllSelected = true;
    for (let i = 0; i < this.data.cartGoodsList.length; i++) {
      let tempGoods = this.data.cartGoodsList[i];
      if (tempGoods.Selected) {
        tempTotalPrice += tempGoods.Price * tempGoods.Num;
        tempTotalNum += tempGoods.Num;
      }
      isAllSelected = isAllSelected && tempGoods.Selected;
    };
    this.setData({
      selectedTotalPrice: parseInt(tempTotalPrice * 100) / 100,
      selectedTotalNum: tempTotalNum,
      allSelect: isAllSelected
    });
  },
  updateGoods: function (shopCart) {
    this.setData({
      cartGoodsList: shopCart.CartGoodsList
    });
    this.caculateSelectedInfo();
  },
  updateShopCartGoods: function (goodsList) {
    service.updateShopCartGoods(goodsList, app.globalData.shopId).then(shopCart => {
      this.updateGoods(shopCart);
    })
  },
  selectTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.cartGoodsList;
    list[index].Selected = !list[index].Selected;
    this.updateShopCartGoods(list);
  },

 
bindAllSelect: function () {
  let selected=!this.data.allSelect;
  var list = this.data.cartGoodsList;
  for (var i = 0; i < list.length; i++) {
   list[i].Selected=selected;
  }
  this.updateShopCartGoods(list);
},
jiaBtnTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.cartGoodsList;
    list[parseInt(index)].Num++;
    this.updateShopCartGoods(list);

},
jianBtnTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.cartGoodsList;
    if (--list[parseInt(index)].Num == 0) {
      wx.showModal({
        title: '删除',
        content: '你确定需要删除吗？',
        success: (res)=> {
          if (res.confirm) {
            this.delItem(e);
          } else if (res.cancel) {
            list[parseInt(index)].Num++
          }
        }
      })
    }else{
      this.updateShopCartGoods(list);
    }

},

getSelectedGoods(){
  let tempGoodsList=[];
  
  for(let i=0;i<this.data.cartGoodsList.length;i++){
    let goods = this.data.cartGoodsList[i]
    if(goods.Selected){
      tempGoodsList.push(goods)
    }
  }
  return tempGoodsList;
},
toPayOrder: function () {
  let selectedGoods = this.getSelectedGoods();
  if(selectedGoods.length<=0){
      wx.showToast({
        title: '请选择商品',
        icon: 'clear',
        duration: 2000
      });
      return;
  }
  //临时存储
  cache.setSync(cache.keys.tempOrder,selectedGoods);
  wx.navigateTo({
    url: "/pages/to-pay-order/index"
  });
},

})
