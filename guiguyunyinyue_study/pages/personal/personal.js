import request from "../../utils/request";

let startY = 0; // 手指起始的坐标
let moveY = 0; // 手指移动的坐标
let moveDistance = 0; // 手指移动的距离
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverTransform: 'translateY(0)',
    coveTransition: '',
    userInfo: {}, // 用户信息
    recentPlayList: [], // 用户播放记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 读取用户的基本信息
    let userInfo = wx.getStorageSync('userInfo');
    if(userInfo){ // 用户登录
      try {
        const parsedUserInfo = JSON.parse(userInfo);
        // 更新userInfo的状态
        this.setData({
          userInfo: parsedUserInfo
        })
        
        // 获取用户播放记录 - 从多个可能的字段中获取用户ID
        const userId = parsedUserInfo.qqNumber || parsedUserInfo.data?.creator?.hostuin || parsedUserInfo.data?.hostuin || parsedUserInfo.userid;
        if(userId) {
          this.getUserRecentPlayList(userId);
        } else {
          console.warn('无法获取用户ID，跳过播放记录获取');
        }
      } catch (error) {
        console.error('解析用户信息失败:', error);
      }
    }
  },
  // 获取用户播放记录的功能函数
  async getUserRecentPlayList(userId){
    // QQMusicApi暂不支持用户播放记录接口，设置为空数组
    console.log('QQMusicApi暂不支持用户播放记录接口');
    this.setData({
      recentPlayList: []
    });
    
    /* 原始代码保留备用
    try {
      let recentPlayListData = await request('/user/record', {uid: userId, type: 0});
      
      // 验证返回数据的结构
      if(recentPlayListData && recentPlayListData.allData && Array.isArray(recentPlayListData.allData)) {
        let index = 0;
        let recentPlayList = recentPlayListData.allData.splice(0, 10).map(item => {
          item.id = index++;
          return item;
        })
        this.setData({
          recentPlayList
        })
      } else {
        console.warn('用户播放记录数据格式不正确:', recentPlayListData);
        this.setData({
          recentPlayList: []
        })
      }
    } catch (error) {
      console.error('获取用户播放记录失败:', error);
      this.setData({
        recentPlayList: []
      })
    }
    */
  },
  
  handleTouchStart(event){
    this.setData({
      coveTransition: ''
    })
    // 获取手指起始坐标
    startY = event.touches[0].clientY;
  },
  handleTouchMove(event){
    moveY = event.touches[0].clientY;
    moveDistance = moveY - startY;
    
    if(moveDistance <= 0){
      return;
    }
    if(moveDistance >= 80){
      moveDistance = 80;
    }
    // 动态更新coverTransform的状态值
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`
    })
  },
  handleTouchEnd(){
    // 动态更新coverTransform的状态值
    this.setData({
      coverTransform: `translateY(0rpx)`,
      coveTransition: 'transform 1s linear'
    })
  },
  
  // 跳转至登录login页面的回调
  toLogin(){
    wx.navigateTo({
      url: '/pages/login/login'
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
    // 每次页面显示时，重新获取用户信息
    try {
      const userInfoStr = wx.getStorageSync('userInfo');
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        this.setData({
          userInfo: userInfo
        });
      } else {
        // 如果没有用户信息，设置为空对象（显示游客状态）
        this.setData({
          userInfo: {}
        });
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      this.setData({
        userInfo: {}
      });
    }
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
