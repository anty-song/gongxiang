// 获取API
var URL = require('../../utils/interface.js');
// 获取网络请求
var Req = require("../../utils/request.js");
// 获取小程序实例
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  	list: [],
  	itemHide: false,
  	hintHide: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var self = this;
    self.setData({
      itemHide: false,
      hintHide: true
    })
    var itemids = wx.getStorageSync('id_list');
    var timestamp = new Date().getTime();
    if (itemids != []) {
    	itemids = itemids.join(',');
	    var params = {
	      itemids: itemids
	    };
	    Req.POST(URL.HISTORY, {
	      params: params,
	      success: function (res) {
	      	var list = res.data.list;
	      	for (var i = 0; i < list.length; i++) {
	      		switch (list[i].isend) {
	      			case 1:
	      				var startTime = list[i].starttime * 1000;
	      				var leftTime = startTime - timestamp;
	      				if (leftTime >= 31536000000) {
	      					var _Y = new Date(startTime).getYear() + '-';
	      					var _M = self.fillZero(new Date(startTime).getMonth() + 1) + '-';
	      					var _D = self.fillZero(new Date(startTime).getDate());
	      					list[i].time = _Y + _M + _D + '开始';
	      				} else if (leftTime > 86400000) {
	      					var M = self.fillZero(new Date(startTime).getMonth() + 1) + '-';
	      					var D = self.fillZero(new Date(startTime).getDate());
	      					list[i].time = M + D + '开始';
	      				} else if (leftTime > 3600000) {
	      					var H = parseInt(leftTime / 1000 / 60 / 60 % 24);
	      					list[i].time = H + '小时后开始';
	      				} else if (leftTime > 0) {
	      					var m = parseInt(leftTime / 1000 / 60 % 60);
	      					list[i].time = m + '分钟后开始';
	      				}
	      				break;
	      			case 2:
	      				list[i].time = '已结束';
	      				break;
	      			case 3:
	      				var endTime = list[i].endtime * 1000;
	      				var leftTime = endTime - timestamp;
	      				if (leftTime >= 31536000000) {
	      					var _Y = new Date(endTime).getYear() + '-';
	      					var _M = self.fillZero(new Date(endTime).getMonth() + 1) + '-';
	      					var _D = self.fillZero(new Date(endTime).getDate());
	      					list[i].time = _Y + _M + _D + '结束';
	      				} else if (leftTime > 86400000) {
	      					var M = self.fillZero(new Date(endTime).getMonth() + 1) + '-';
	      					var D = self.fillZero(new Date(endTime).getDate());
	      					list[i].time = M + D + '结束';
	      				} else if (leftTime > 3600000) {
	      					var H = parseInt(leftTime / 1000 / 60 / 60 % 24);
	      					list[i].time = H + '小时后结束';
	      				} else if (leftTime > 0) {
	      					var m = parseInt(leftTime / 1000 / 60 % 60);
	      					list[i].time = m + '分钟后结束';
	      				}
	      		}
	      	}
	      	self.setData({
	      		list: list
	      	});
	      },
	      fail: function() {},
	      complete: function() {}
	    });
    } else {
    self.setData({
      itemHide: true,
      hintHide: false
    });
    }
  },

  /**
   * 处理时间显示格式 月/日 不足十时 添加0补位
   */
  fillZero: function (v) {
  	if (v < 10) {
  		v = '0' + v;
  	}
  	return v;
  },

  /**
   * 进入次级页面 即活动详情页
   */
  goItem: function(e) {
    app.globalData.itemid = e.currentTarget.dataset.itemid;
    wx.navigateTo({
      url: '../active/active'
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var self = this;
    self.onLoad();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})