// 获取API
var URL = require('../../utils/interface.js');
// 获取网络请求
var Req = require("../../utils/request.js");
// 获取小程序实例
var app = getApp();
// 引入解析富文本的插件
var WxParse = require('../../utils/wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selected: 'rules-bar',
    goList: 'goList',
    goRank: 'goRank',
    goRules: '',
    changeLeft: 0,
    activeData: {},
    activeList: {},
    // 活动状态 开始/结束/进行
    activeState: '',
    time: '',
    isIntro: false,
    actionSheetHidden: true,
    codeUrl: ''
  },
  createCode: function () {
    var self = this;
    Req.POST(URL.GETCODE, {
      params: {
        itemid: app.globalData.itemid,
        type: 5
      },
      success: function (res) {
        // 下载小程序码图片到本地（临时）
        wx.downloadFile({
          url: res.data.list,
          success: function (res) {
            self.setData({
              codeUrl: res.tempFilePath
            });
          }
        });
      },
      fail: function () { },
      complete: function () { }
    })
  },
  createShareImg: function () {
    var self = this;
    // canvas 画图
    var phoneSystem = app.globalData.phoneSystem;
    var h = phoneSystem.windowHeight;
    var sH = phoneSystem.screenWidth;
    var w = phoneSystem.windowWidth;
    const ctx = wx.createCanvasContext('shareCanvas');
    // 绘制背景图
    ctx.drawImage('../../images/share.png', 0, 0, w, h);
    if (app.globalData.userInfo) {
      // 绘制用户信息
      ctx.save();
      ctx.arc(375 * w / 750, 105 * h / 1334, 75 * h / 1334, 0, 2 * Math.PI);
      ctx.clip();
      var avatarUrl = app.globalData.avatarUrl;
      ctx.drawImage(avatarUrl, 375 * w / 750 - 75 * h / 1334, 30 * h / 1334, 150 * h / 1334, 150 * h / 1334);
      // 绘制文字
      ctx.restore();
      ctx.setFillStyle('white');
      ctx.setTextAlign('center');
      ctx.setFontSize(22 * w / 750);
      ctx.fillText(app.globalData.userInfo.nickName, 375 * w / 750, 230 * h / 1334);
      ctx.setFontSize(24 * w / 750);
      ctx.fillText("转发了一个投票活动", 375 * w / 750, 270 * h / 1334);
    } else {
      ctx.setFillStyle('red');
      ctx.setTextAlign('center');
      ctx.setFontSize(24 * w / 750);
      ctx.fillText("授权后可展示头像、昵称", 375 * w / 750, 230 * h / 1334);
    }
    ctx.save();
    ctx.beginPath()
    ctx.rect(123 * w / 750, 287 * h / 1334, 504 * w / 750, 56 * h / 1334);
    ctx.setFillStyle('#0095ea')
    ctx.fill()
    ctx.clip()
    ctx.setFillStyle('white');
    ctx.setFontSize(36 * w / 750);
    // 字符串长度
    const metrics = ctx.measureText(self.data.title);
    console.log(metrics);
    if (metrics.width < 252) {
      ctx.fillText(self.data.title, 375 * w / 750, 330 * h / 1334);
    } else {
      ctx.setTextAlign('left');
      ctx.fillText(self.data.title, 123 * w / 750, 330 * h / 1334);
    }
    ctx.closePath()
    ctx.restore();
    // 绘制小程序码
    if (metrics.width >= 252) {
      ctx.fillText('. . .', 645 * w / 750, 335 * h / 1334)
    }
    var codeUrl = self.data.codeUrl;
    ctx.drawImage(codeUrl, 375 * w / 750 - 122 * h / 1334, 935 * h / 1334, 244 * h / 1334, 244 * h / 1334);
    ctx.draw(false, function (res) {
      // 把当前画布指定区域的内容导出生成指定大小的图片，并返回文件路径
      wx.canvasToTempFilePath({
        canvasId: 'shareCanvas',
        success: function (res) {
          if (res.tempFilePath) {
            wx.hideToast();
            wx.previewImage({
              urls: [res.tempFilePath],
              success: function (res) { }
            });
          }
        },
        fail: function (res) {
          wx.showToast({
            title: '生成分享图失败',
            icon: 'none',
            duration: 2000
          })
        }
      }, this)
    }
    );
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    self.createCode();
    self.marquee();
    var params = {
      itemid: app.globalData.itemid
    };
    Req.POST(URL.RULE, {
      params: params,
      success: function (res) {
        wx.setNavigationBarTitle({
          title: res.data.data.title,
        });
        self.setData({
          activeData: res.data.data,
          activeList: res.data.list
        });
        var article = res.data.list.content;
        if (article) {
          WxParse.wxParse('article', 'html', article, self);
          self.setData({
            isIntro: false
          });
        } else {
          self.setData({
            isIntro: true
          });
        }
        
        if (res.data.data.othertime) {
          var time = res.data.data.othertime;
          setInterval(function () {
            time--;
            var days = parseInt(time / 60 / 60 / 24);
            var hours = parseInt(time / 60 / 60 % 24);
            var minutes = parseInt(time / 60 % 60);
            var seconds = parseInt(time % 60);
            self.setData({
              time: days + '天' + hours + '小时' + minutes + '分' + seconds + '秒'
            });
          }, 1000);
        }
        switch (res.data.data.isend) {
          case 1:
            self.setData({
              activeState: '距活动开始还有'
            });
            break;
          case 2:
            self.setData({
              activeState: '活动已结束'
            });
            break;
          case 3:
            self.setData({
              activeState: '距活动开始还有'
            });
            break;
        };

      },
      fail: function () { },
      complete: function () { }
    })
  },

  /**
   * 跑马灯
   */
  marquee: function () {
    var self = this;
    setInterval(function () {
      var left = self.data.changeLeft;
      if (left >= -1000) {
        self.setData({
          changeLeft: left - 2
        });
      } else {
        left = 750;
        self.setData({
          changeLeft: left - 2
        });
      }
    }, 20);
  },
  showActionSheet: function () {
    this.setData({
      actionSheetHidden: false
    });
  },
  hideActionSheet: function () {
    this.setData({
      actionSheetHidden: true
    });
  },
  pageCopyLink: function () {
    wx.setClipboardData({
      data: 'http://www.voteyun.com/mobile/show.php?itemid=' + app.globalData.itemid + '&action=rule',
      success: function (res) {
        wx.showToast({
          title: '复制成功',
          icon: 'none',
          duration: 2000
        })
      }
    });
  },
  goList: function () {
    wx.redirectTo({
      url: '../active/active'
    })
  },
  goRank: function () {
    wx.redirectTo({
      url: '../rank/rank'
    })
  },
  goRules: function () {
    wx.redirectTo({
      url: '../rules/rules'
    })
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
    var self = this;
    return {
      title: self.data.activeData.title,
      path: '/pages/index/index?itemid=' + app.globalData.itemid + '&page=rules'
    }
  }
})