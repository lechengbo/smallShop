
const config=require("../config/base.js");

var keyContainer={
  shopInfoData:"shopInfoData",
  couponData:"couponData",
  productInfoData:"productInfoData",
  shopCartInfo:"shopCartInfo",
  buyNowInfo:"buyNowInfo",
  tempOrder:"tempOrder",
  selectedAddress:"selectedAddress",
  orderList:"orderList"
}
/*
设置缓存，异步
*/
function set(key,value){
  if(!key || !value){
    return;
  }
  wx.setStorage({
    key: key,
    data: { value: value, updateTime: (new Date()).getTime() },
  });
};
/*
设置缓存，同步
*/
function setSync(key, value) {
  if (!key || !value) {
    return;
  }
  wx.setStorageSync(key, { value: value, updateTime: (new Date()).getTime() });
 
};
/*
从缓存中获取，同步
*/
function getSync(key){
  if (!key || config.environment=="dev"){
    return null;
  }
  
  try{
    var data = wx.getStorageSync(key);
    var now = (new Date()).getTime();
    //缓存两小时
    if (data && now - data.updateTime <= 11997200000) {
      return data.value;
    } else {
      return null;
    }

  }catch(error){
    return null;
  }
  
}
function removeSync(key){
  wx.removeStorageSync(key)
}
function clearAll(){
  
  for(let pro in keyContainer){
    if (!keyContainer.hasOwnProperty(pro)){
      continue;
    }
    wx.removeStorage({
      key: keyContainer[pro],
      success: function(res) {
        console.log(pro + ' ->清理成功')
      },
    })
  }
  return Promise.reject(true);
}

module.exports ={
  set:set,
  setSync:setSync,
  getSync:getSync,
  removeSync: removeSync,
  keys:keyContainer,
  clearAll:clearAll
}