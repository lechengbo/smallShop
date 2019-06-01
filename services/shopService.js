const config=require('../config/base.js');
const util=require('../utils/util.js');
const cache=require('./cacheService.js');
const keys=cache.keys;
const app=getApp();

function getShopConfig(){
  return new Promise((resolve,reject)=>{

  });
}

function getShopInfo(data){
  var tempData=cache.getSync(keys.shopInfoData);
  if(tempData){
    return new Promise((resolve, reject)=>{
      resolve(tempData);
    });
  };
  //如果没有或者过期就从远程获取
  return new Promise((resolve, reject) => {
    util.request(config.shopUrl + 'vapi/shop/GetInfo',data).then((res) => {
      console.log(res);
      if (res.Success) {
        cache.set(keys.shopInfoData,res.Data);
        resolve(res.Data);
      } else {
        util.showErrorToast(res.Message);
        reject(res);
      }
    });
  });
}

function getCoupon(shopId){
  var tempData = cache.getSync(keys.couponData);
  if (tempData) {
    return new Promise((resolve, reject) => {
      resolve(tempData);
    });
  };

  return new Promise((resolve, reject) => {
    util.request(config.couponUrl + 'vapi/CouponAgg/GetCanGetAll?shopId='+app.globalData.shopId).then((res) => {
      if (res.Success) {
        cache.set(keys.couponData, res.Data);
        resolve(res.Data);
      } else {
        util.showErrorToast(res.Message);
        reject(res);
      }
    });
  });

};
function getCouponById(id){
  return getCoupon(app.globalData.shopId).then(array=>{
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      if(element.Id==id){
        return element;
      }
    }
  });
};
function userGetCounpon(id, mobile, userName){
  return new Promise((resolve, reject) => {
    util.request(config.couponUrl + 'vapi/CouponAgg/UserGet?id=' + id + '&userMobile=' + mobile + '&userName=' + userName,{},"POST").then((res) => {
      resolve(res.Data);
      util.handleReturn(res);
    });
  });
};
function searchCounpon( mobile) {
  return new Promise((resolve, reject) => {
    util.request(config.couponUrl + 'vapi/CouponAgg/SearchLog?shopId=' + app.globalData.shopId + '&userMobile=' + mobile, {}, "POST" ).then((res) => {
      resolve(res.Data);
      util.handleReturn(res);
    });
  });
};
function getProductsInfo(shopId) {
  var tempData = cache.getSync(keys.productInfoData);
  if (tempData) {
    return new Promise((resolve, reject) => {
      resolve(tempData);
    });
  };

  return new Promise((resolve, reject) => {
    util.request(config.productUrl + 'vapi/Goods/GetdAllSellingInfo?shopId=' + shopId).then((res) => {
      if (res.Success) {
        res.Data=operateProductsInfoUrls(res.Data);
        cache.set(keys.productInfoData, res.Data);
        resolve(res.Data);
      } else {
        util.showErrorToast(res.Message);
        reject(res);
      }
    });
  });

};
function getGoods(id,shopId){
   return  getProductsInfo(shopId).then((data)=>{
      let tempgoodsList= data.productList;
      let tempGoods={};
      for(let i=0;tempgoodsList.length;i++){
        if(tempgoodsList[i].Id==id){
          tempGoods=tempgoodsList[i];
          break;
        }
      }
      return tempGoods;
    });
};
function getShopCart(shopId=0){
  var tempData = cache.getSync(keys.shopCartInfo);
  if (!tempData) {
    tempData={
      TotalNum:0,
      CartGoodsList:[]
    };
   
  };
  return new Promise((resolve, reject) => {
    resolve(tempData);
  });

};
function addGoodsToShopCart(cartGoods,shopId=0){
 return  getShopCart(shopId).then(shopCart=>{
    shopCart.TotalNum +=cartGoods.Num;
    for (let i = 0; i < shopCart.CartGoodsList.length;i++){
      let tempCartGoods = shopCart.CartGoodsList[i];
      if(cartGoods.GoodsId==tempCartGoods.GoodsId && cartGoods.SpecName==tempCartGoods.SpecName){
        cartGoods.Num+=tempCartGoods.Num;
        shopCart.CartGoodsList.splice(i,1,cartGoods);
        cache.setSync(keys.shopCartInfo,shopCart);
        return shopCart;
      }
    };
    shopCart.CartGoodsList.push(cartGoods);
    cache.setSync(keys.shopCartInfo,shopCart);
    return shopCart;
  });

};
function removeGoodsFromShopCart(cartGoodsList,shoppId=0){
 return getShopCart(shoppId).then(shopCart=>{
   for(let j=0;j<cartGoodsList.length;j++){
     let cartGoods=cartGoodsList[j];
     for (let i = 0; i < shopCart.CartGoodsList.length; i++) {
       let tempCartGoods = shopCart.CartGoodsList[i];
       if (cartGoods.GoodsId == tempCartGoods.GoodsId && cartGoods.SpecName == tempCartGoods.SpecName) {
         tempCartGoods.Num -=cartGoods.Num;
         shopCart.TotalNum -= cartGoods.Num;
         if (tempCartGoods.Num <= 0) {
           shopCart.CartGoodsList.splice(i, 1);
         }
       }
     };
    };

    cache.setSync(keys.shopCartInfo, shopCart);
    return true;
  })
};
function updateShopCartGoods(cartGoods,shopId=0){
  return getShopCart(shopId).then(shopCart=>{
    shopCart.CartGoodsList=cartGoods;
    let tempTotalNum=0;
    cartGoods.forEach(value=>{
      tempTotalNum+=value.Num;
    });
    shopCart.TotalNum=tempTotalNum;
    cache.setSync(keys.shopCartInfo, shopCart);
    return shopCart;
  })
}
/**
 * 组建购物车信息
 */
function bulidShopCartGoods(goodsId, showUrl, name, specName, price,num,) {
  var shopCartGoods = {};
  shopCartGoods.GoodsId = goodsId;
  shopCartGoods.Name = name;
  shopCartGoods.Num = num;
  shopCartGoods.SpecName = specName;
  shopCartGoods.Price=price;
  shopCartGoods.ShowUrl=showUrl;
  shopCartGoods.Selected=true;
  
  return shopCartGoods;
};
function getOrderList(shopId=0){
  if (!app.globalData.config.IsCanCreateOrder) {
    return getOrderListLocal(shopId);
  }
  return getOrderListRemote(shopId);
};
function getOrderByStatus(status=0,shopId=0){
  return getOrderList(shopId).then(orderList=>{
    var tempOrderList=[];
    orderList.forEach(order=>{
      if(order.status==status){
        tempOrderList.push(order);
      }
    });
    return tempOrderList;
  });
}
function addOrder(order,shopId=0){
  if (!app.globalData.config.IsCanCreateOrder){
    return addOrderLocal(order,shopId);
  }
  return addOrderRemote(order, shopId);
 
};

function getOrderListLocal(shopId=0){
  var tempData = cache.getSync(keys.orderList) || [];

  return new Promise((resolve, reject) => {
    resolve(tempData);
  });
};
function addOrderLocal(order,shopId=0){
  let p1=  getOrderListLocal(shopId).then(orderList => {
    orderList.unshift(order);
    //保存最近50条；
    orderList.splice(50);
    cache.setSync(keys.orderList, orderList);
    
  });
  let p2 = order.orderType=="buyNow"?new Promise(resolve=>{resolve(true)}): removeGoodsFromShopCart(order.goodsList,shopId);
  return Promise.all([p1,p2]).then(([r1,r2])=>{
    return true;
  })
}
function getOrderListRemote(shopId = 0) {

};
function addOrderRemote(order, shopId = 0) {

}
function deleteOrder(guid){
  return deleteOrderLocal(guid);
}
function deleteOrderLocal(guid){
  return getOrderListLocal().then(orderList=>{
    for (let index = 0; index < orderList.length; index++) {
      const element = orderList[index];
      if(element.guid==guid){
        orderList.splice(index,1);
        cache.setSync(keys.orderList, orderList);
        return true;
      }
    }
    return false
  });
}
function getOrderById(guid){
  return getOrderByIdLocal(guid);
}
function getOrderByIdLocal(guid){
  return getOrderListLocal().then(orderList => {
    for (let index = 0; index < orderList.length; index++) {
      const element = orderList[index];
      if (element.guid == guid) {
        return element;
      }
    }
    return {}
  });
}
function updateOrderToPayStatus(guid,payDes){
  return updateOrderToPayStatusLocal(guid,payDes);
}
function updateOrderToPayStatusLocal(guid, payDes){
  return getOrderListLocal().then(orderList => {
    for (let index = 0; index < orderList.length; index++) {
      const element = orderList[index];
      if (element.guid == guid) {
        element.status=1;
        element.payDes=payDes;
        cache.setSync(keys.orderList, orderList);
        return true;
      }
    }
    return false
  });
}
function operateProductsInfoUrls(data){
  let array = data.productList;
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    element.SpecList = util.operateUrl(element.SpecList, "Url");
    element.LoopPicList = util.operateUrl(element.LoopPicList, null);
    element.PicDescriptionList = util.operateUrl(element.PicDescriptionList, null);
  }
  return data;
}
function adviceAdd(advice) {
  advice.shopId=app.globalData.shopId;
  return new Promise((resolve, reject) => {
    util.request(config.shopUrl + 'vapi/advice/add', advice, "POST").then((res) => {
      resolve(res.Data);
      util.handleReturn(res);
    });
  });
};

module.exports={
  getShopConfig,
  getShopInfo,
  getCoupon,
  getCouponById,
  userGetCounpon,
  searchCounpon,
  getProductsInfo,
  getGoods,
  getShopCart,
  addGoodsToShopCart,
  removeGoodsFromShopCart,
  bulidShopCartGoods,
  updateShopCartGoods,
  addOrder,
  getOrderByStatus,
  deleteOrder,
  getOrderById,
  updateOrderToPayStatus,
  adviceAdd
}