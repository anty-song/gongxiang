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
    isAuthorization: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    pageHide: false,
    // 首页数据分页 默认从第一页渲染
    page: 1,
    // 数据容器
    list: [],
    // 页面底部提示语
    hint: '正在加载',
    // 分页内容
    isPage: true,
    // 下拉菜单控制隐藏
    actionSheetHidden: true,
    windowHeight: '',
    // 用户信息
    avatarUrl: '',
    // 小程序码
    codeUrl: ''
  },
  createCode: function() {
    var self = this;
    Req.POST(URL.GETCODE, {
      params: {
        type: 1
      },
      success: function(res) {
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
      fail: function() {},
      complete: function() {}
    })
  },
  createShareImg: function() {
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
      var avatarUrl = self.data.avatarUrl;
      ctx.drawImage(avatarUrl, 375 * w / 750 - 75 * h / 1334, 30 * h / 1334, 150 * h / 1334, 150 * h / 1334);
      // 绘制文字
      ctx.restore();
      ctx.setFillStyle('white');
      ctx.setTextAlign('center');
      ctx.setFontSize(22 * w / 750);
      ctx.fillText(app.globalData.userInfo.nickName, 375 * w / 750, 230 * h / 1334);
      ctx.setFontSize(24 * w / 750);
      ctx.fillText("转发了一个小程序", 375 * w / 750, 270 * h / 1334);
    } else {
      ctx.setFillStyle('red');
      ctx.setTextAlign('center');
      ctx.setFontSize(24 * w / 750);
      ctx.fillText("授权后可展示头像、昵称", 375 * w / 750, 230 * h / 1334);
    }
    ctx.setFillStyle('white');
    ctx.setTextAlign('center');
    ctx.setFontSize(36 * w / 750);
    ctx.fillText("共享投票 —— 用心的投票平台", 375 * w / 750, 330 * h / 1334);
    // 绘制小程序码
    var codeUrl = self.data.codeUrl
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
  bindGetUserInfo: function (e) {
    var self = this;
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo;
      var userInfo = app.globalData.userInfo;
      wx.downloadFile({
        url: userInfo.avatarUrl,
        success: function (res) {
          self.setData({
            avatarUrl: res.tempFilePath
          });
        }
      });
    }
    self.setData({
      pageHide: false,
      isAuthorization: true
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    self.createCode();
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              app.globalData.userInfo = res.userInfo;
              var userInfo = app.globalData.userInfo;
              wx.downloadFile({
                url: userInfo.avatarUrl,
                success: function (res) {
                  app.globalData.avatarUrl = res.tempFilePath;
                  self.setData({
                    avatarUrl: res.tempFilePath
                  });
                }
              });
              self.setData({
                pageHide: false,
                isAuthorization: true
              });
            }
          })
        } else {
          self.setData({
            pageHide: true,
            isAuthorization: false
          });
        }
      }
    });
    
    if (options) {
      // 是否由分享卡进入
      if (options.itemid) {
        app.globalData.itemid = options.itemid;
        if (options.page) {
          switch (options.page) {
            case 'active':
              wx.navigateTo({
                url: '../active/active',
              });
              break;
            case 'rank':
              wx.navigateTo({
                url: '../rank/rank',
              });
              break;
            case 'rules':
              wx.navigateTo({
                url: '../rules/rules',
              });
              break;
          }
        }
      }
      // 是否扫码小程序码
      if (options.scene) {
        var scene = decodeURIComponent(options.scene).split(',');
        if (scene[1]) {
          switch (scene[1]) {
            // 首页
            case '1':
              break;
            // 活动页
            case '2':
              app.globalData.itemid = scene[0];
              wx.navigateTo({
                url: "../active/active"
              });
              break;
            // 选项详情页
            case '3':
              app.globalData.itemid = scene[0];
              if (scene[2]) {
                app.globalData.voteitemid = scene[2];
                wx.navigateTo({
                  url: "../active/active?code=1"
                });
              }
              break;
            // 排名页
            case '4':
              app.globalData.itemid = scene[0];
              wx.navigateTo({
                url: "../rank/rank"
              });
              break;
            // 规则页
            case '5':
              app.globalData.itemid = scene[0];
              wx.navigateTo({
                url: "../rules/rules"
              });
              break;
          }
        }
      }
    }

    // 清空本地浏览记录的缓存
    // wx.setStorageSync('id_list', '');
    
    // 获取手机系统信息
    wx.getSystemInfo({
      success: function (res) {
        app.globalData.phoneSystem = res;
        self.setData({
          windowHeight: res.windowHeight
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    });
    // 初始化设置
    self.setData({
      list: [],
      page: 1,
      hint: '正在加载',
      isPage: true
    });
    var page = self.data.page;
    Req.POST(URL.INDEXLIST, {
      params: {
        page: page
      },
      success: function(res) {
        if (res.data.status == 1) {
          var itemList = self.data.list;
          for (var i = 0; i < res.data.list.length; i++) {
            itemList.push(res.data.list[i]);
          }
          self.setData({
            list: itemList
          })
        }
      },
      fail: function() {},
      complete: function() {}
    });
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
  pageCopyLink: function() {
    wx.setClipboardData({
      data: 'http://www.voteyun.com/mobile/',
      success: function (res) {
        wx.showToast({
          title: '复制成功',
          icon: 'none',
          duration: 2000
        })
      }
    });
  },
  /**
   * 进入二级页面
   */
  goActive: function(e) {
    var self = this;
    var itemid = e.currentTarget.dataset.itemid;
    app.globalData.itemid = itemid;
    var _idList = wx.getStorageSync('id_list') || [];
    
    _idList.reverse().push(itemid);
    // 数组去重
    var idList = [];
    var json = {};
    for (var i = _idList.length-1; i >= 0; i--) {
      if (!json[_idList[i]]) {
        idList.push(_idList[i]);
        json[_idList[i]] = 1;
      }
    }
    wx.setStorageSync('id_list', idList);
    wx.navigateTo({
      url: '../active/active'
    });
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
    var self = this;
    self.onLoad();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var self = this;
    var page = self.data.page;
    var isPage = self.data.isPage;
    if (isPage) {
      Req.POST(URL.INDEXLIST, {
        params: {
          page: page + 1
        },
        success: function (res) {
          if (res.data.endpage == 1) {
            var itemList = self.data.list;
            for (var i = 0; i < res.data.list.length; i++) {
              itemList.push(res.data.list[i]);
            }
            self.setData({
              list: itemList,
              page: page + 1,
              hint: "正在加载"
            });
          } else if (res.data.endpage == 2) {
            var endList = self.data.list;
            for (var i = 0; i < res.data.list.length; i++) {
              endList.push(res.data.list[i]);
            }
            self.setData({
              list: endList,
              hint: '我也是有底线的哟',
              isPage: false
            });
          }
        },
        fail: function () { },
        complete: function () { }
      });
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '共享简投',
      imageUrl: '../../images/share_default.png'
    }
  }
})