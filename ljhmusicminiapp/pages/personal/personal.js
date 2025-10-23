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
  onLoad(options) {
     // 读取缓存中的数据
  const userInfo = wx.getStorageSync('userInfo') || '{}';
  const cookie = wx.getStorageSync('cookie');
  
  if (userInfo) {
    this.setData({
      userInfo: userInfo // 渲染到页面
    });
  }
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
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
        // // 每次页面显示时，重新获取用户信息
        // try {
        //   const userInfoStr = wx.getStorageSync('userInfo');
        //   if (userInfoStr) {
        //     const userInfo = JSON.parse(userInfoStr);
        //     this.setData({
        //       userInfo: userInfo
        //     });
        //   } else {
        //     // 如果没有用户信息，设置为空对象（显示游客状态）
        //     this.setData({
        //       userInfo: {}
        //     });
        //   }
        // } catch (error) {
        //   console.error('获取用户信息失败:', error);
        //   this.setData({
        //     userInfo: {}
        //   });
        // }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})