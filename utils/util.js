const config=require('../config/base.js');

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
/*
处理url中\成/
*/
function operateUrl(obj,propertyName){
  
  if(Array.isArray(obj)){
    //字符串数组
    if(!propertyName){
      for (let i = 0; i < obj.length; i++) {
        if (!obj[i]){
          continue;
        }
        obj[i]= obj[i].replace(/\\/g, "/");
      }
      return obj;
    }
    for(let i=0;i<obj.length;i++){
      if (!obj[i][propertyName] ){
        continue;
      }
      obj[i][propertyName] = obj[i][propertyName].replace(/\\/g, "/");
    }
    return obj;
  }
  if(obj instanceof Object){
    if (obj[propertyName] ){
      obj[propertyName] = obj[propertyName].replace(/\\/g, "/");
    }
    
    return obj;
  }
}
function guid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (S4() + S4()  + S4() + S4() + S4() +  S4() + S4() + S4());
}

/**
 * 封封微信的的request
 */
function getShopId(){
  return 1;
}
function addShopNOToUrl(url){
  if(url.indexOf('?')>-1){
    url+="&shopNO="+config.identity;
  }else{
    url += "?shopNO=" + config.identity;
  }
  return url;
}
function addShopNOToData(data){
  data=data||{};
  data.shopNO=config.identity;
  return data;
}
function handleReturn(ret){
  wx.showToast({
    title: ret.Message ||(ret.Success?"操作成功":"操作失败"),
    icon: ret.Success ?'success':'none'
  })
}
function request(url, data={} , method = "GET") {
  wx.showLoading({
    title: '拼命加载中',
  });
  return new Promise(function (resolve, reject) {
    wx.request({
      url: addShopNOToUrl(url),
      data:data,
      method: method,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        
        if (res.statusCode == 200) {
          resolve(res.data);
        } else {
          reject(res.errMsg);
        }
        wx.hideLoading();
      },
      fail: function (err) {
        reject(err)
        console.log("failed")
        wx.hideLoading();
      }
    })
  });
}

/**
 * 检查微信会话是否过期
 */
function checkSession() {
  return new Promise(function (resolve, reject) {
    wx.checkSession({
      success: function () {
        resolve(true);
      },
      fail: function () {
        reject(false);
      }
    })
  });
}

/**
 * 调用微信登录
 */
function login() {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: function (res) {
        if (res.code) {
          //登录远程服务器
          console.log(res)
          resolve(res);
        } else {
          reject(res);
        }
      },
      fail: function (err) {
        reject(err);
      }
    });
  });
}

function getUserInfo() {
  return new Promise(function (resolve, reject) {
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              resolve(res.userInfo);
            }
          })
        }else{
          reject(res)
        }
      }
    });
  
  });
}

function redirect(url) {

  //判断页面是否需要登录
  if (false) {
    wx.redirectTo({
      url: '/pages/auth/login/login'
    });
    return false;
  } else {
    wx.redirectTo({
      url: url
    });
  }
}

function showErrorToast(msg) {
  msg=msg || "请求出错";
  wx.showToast({
    title: msg,
    image: '/static/images/icon_error.png'
  })
}

module.exports = {
  handleReturn,
  operateUrl,
  formatTime,
  request,
  redirect,
  showErrorToast,
  checkSession,
  login,
  getUserInfo,
  guid,
}

