var util = require('../../utils/util.js');
var service=require('../../services/shopService.js')
var config=require('../../config/base.js')

var app=getApp();
Page({
  data: {
    specPageInfo:{},
    pageInfo:{},
    hideShopPopup:true,
    shopType:"addShopCar",
    picUrl: config.picUrl,
    keywrod: '',
    categoryList: [],
    productList:[],
    currentCategory: { Id: 0, Name: "全部" },
    currentGoods:[],
    selectedGoods:{}
  },
  inputFocus:function(e){
    if(!this.data.keyword){
      return;
    }
    this.setData({
      currentGoods: this.search()
    });
  },
  inputChange: function (e) {

    this.setData({
      keyword: e.detail.value
    });
    this.setData({
      currentGoods: this.search()
    });
     
  },
  search: function () {
    if (!this.data.keyword) {
      return this.getGoodsByCate(this.data.currentCategory);
    }

    var tempGoods=[];
    var tempSource = this.getGoodsByCate(this.data.currentCategory);
    for (let i = 0; i < tempSource.length; i++) {
      if (tempSource[i].Name.indexOf(this.data.keyword) > -1) {
        tempGoods.push(tempSource[i]);
      }
    }
    return tempGoods;
  },
  clearKeyword: function () {
    this.setData({
      keyword: ''
    });
    this.setData({
      currentGoods: this.search()
    });
  },
  onKeywordConfirm(e) {
    console.log(e);
  },
  onLoad: function (options) {
    this.getProductInfo(options);
    this.initPageInfo();
  },
  getProductInfo: function (options) {
    //CatalogList
    let that = this;
    wx.showLoading({
      title: '加载中...',
    });
    service.getProductsInfo(app.globalData.shopId).then((data)=>{
      data.categoryList.unshift({Id:0,Name:"全部"});
      that.setData({
        categoryList: data.categoryList,
        productList: data.productList,
        
      });
     
      that.setCurrentCategory(options.categoryId);
      that.setCateGoods(that.data.currentCategory);
      wx.hideLoading();
    });
    

  },
  setCurrentCategory:function(cateId=0){
    let array = this.data.categoryList;
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      if(element.Id==cateId){
        this.setData({
          currentCategory: element
        });
        break;
      }
    }
  },
  setCateGoods:function(currentCate){
    let tempCurrentGoods = this.getGoodsByCate(currentCate);
    this.setData({
      currentGoods: tempCurrentGoods
    });
  },
  getGoodsByCate(category){
    //当前类目为空时显示全部
    if (!category || !category.Id) {
      return this.data.productList;
    }

    let productIds = category.GoodsIds;
    let tempGoods = [];
    for (let i = 0; i < productIds.length; i++) {
      for (let index = 0; index < this.data.productList.length; index++) {
        const product = this.data.productList[index];
        if (productIds[i] == product.Id) {
          tempGoods.push(product);
          break;
        }

      }
    }
    return tempGoods;

  },
 
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },

  switchCate: function (event) {
    var that = this;
    var currentTarget = event.currentTarget;
    var currentId = event.currentTarget.dataset.id;
    if (this.data.currentCategory.Id == currentId) {
      return false;
    }
    
    for (let index = 0; index < this.data.categoryList.length; index++) {
      const element = this.data.categoryList[index];
      if (element.Id == currentId) {
        this.setData({
          currentCategory: element
        });
        this.setCateGoods(element);
        break;
      }

    }

  },
  toDetailsTap:function(e){
    wx.navigateTo({
      url: '/pages/goods-details/index?id=' + e.currentTarget.dataset.id,
    })
  },
  bindGuiGeTap: function (e) {
    let tempGoods=this.data.currentGoods[e.currentTarget.dataset.index];
    this.setData({
      selectedGoods:tempGoods,
      hideShopPopup: false
    })
  },
  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function () {
    this.setData({
      hideShopPopup: true
    })

  },
  initPageInfo:function(){
    service.getShopInfo().then((data) => {
      let tempPageInfo = data.pageInfo ? data.pageInfo.CateCusInfo : {};
      let tempSpecPageInfo = data.pageInfo ? data.pageInfo.ProCusInfo : {};
      this.setData({
        pageInfo: tempPageInfo,
        specPageInfo:tempSpecPageInfo
      });
     
      if(tempPageInfo.Title){
        wx.setNavigationBarTitle({
          title: tempPageInfo.Title
        });
      }
     
      
    });
  }

})