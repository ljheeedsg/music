/**
作者: Created by zhiyongzaixian
说明: QQ音乐登录流程
1. 支持Cookie登录和QQ号+Cookie登录两种方式
2. 前端验证Cookie格式
3. 调用用户主页信息接口验证登录状态
4. 登录成功后存储用户信息
*/
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginType: 'cookie', // 登录类型：cookie 或 qq
    cookie: '', // Cookie值
    qqNumber: '' // QQ号
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  // 处理输入事件
  handleInput(event){
    let type = event.currentTarget.dataset.type;
    this.setData({
      [type]: event.detail.value.trim()
    })
  },

  // 切换登录方式
  switchLoginType(event) {
    const type = event.currentTarget.dataset.type;
    this.setData({
      loginType: type,
      cookie: '',
      qqNumber: ''
    });
  },

  // 显示Cookie获取帮助
  showCookieHelp() {
    wx.showModal({
      title: '如何获取Cookie',
      content: '1. 在浏览器中登录QQ音乐\n2. 按F12打开开发者工具\n3. 在Network标签页中刷新页面\n4. 找到任意请求，复制Cookie值',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 登录的回调
  async login(){
    // 1. 收集表单项数据
    let {loginType, cookie, qqNumber} = this.data;
    
    // 2. 前端验证
    if(!cookie){
      wx.showToast({
        title: 'Cookie不能为空',
        icon: 'none'
      })
      return;
    }

    if(loginType === 'qq' && !qqNumber){
      wx.showToast({
        title: 'QQ号不能为空',
        icon: 'none'
      })
      return;
    }

    // 验证Cookie格式（基本检查）
    if(!cookie.includes('uin=') && !cookie.includes('skey=')){
      wx.showToast({
        title: 'Cookie格式不正确',
        icon: 'none'
      })
      return;
    }

    try {
      // 3. 验证登录状态
      wx.showLoading({
        title: '登录中...'
      });

      // 构建请求参数
      let params = {};
      if(loginType === 'qq') {
        params.id = qqNumber;
      }

      // 设置Cookie到请求头
      let result = await request('/user/detail', params, {
        cookie: cookie
      });

      wx.hideLoading();

      if(result && result.data) {
        // 登录成功
        wx.showToast({
          title: '登录成功'
        });

        // 存储用户信息和Cookie
        const userInfo = {
          ...result.data,
          cookie: cookie,
          loginType: loginType,
          qqNumber: loginType === 'qq' ? qqNumber : ''
        };

        wx.setStorageSync('userInfo', JSON.stringify(userInfo));
        wx.setStorageSync('cookie', cookie);

        // 跳转至个人中心页面
        wx.reLaunch({
          url: '/pages/personal/personal'
        });
      } else {
        wx.showToast({
          title: '登录失败，请检查Cookie',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('登录错误:', error);
      
      if(error.statusCode === 301) {
        wx.showToast({
          title: 'Cookie已过期，请重新获取',
          icon: 'none'
        });
      } else {
        wx.showToast({
          title: '登录失败，请检查网络或Cookie',
          icon: 'none'
        });
      }
    }
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

  }
})
