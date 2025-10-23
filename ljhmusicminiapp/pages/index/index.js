import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [], // 轮播图数据
    recommendList: [], //推荐歌单
    hotBandList: [], //排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let bannerListData = await request('/recommend/banner');
    console.log('轮播图数据:', bannerListData);
    this.setData({
      bannerList: bannerListData.data
    })

    // 获取推荐歌单数据 - 修改为QQ音乐API
    let recommendListData = await request('/recommend/playlist/u');
    console.log('推荐歌单数据:', recommendListData);
    this.setData({
      recommendList: recommendListData.data?.list || []
    })

    //获取热门歌数据
    let topCategoryData = await request('/top/category');
    // 处理每个主榜：取前3个子榜 + 主榜标题
    let result = topCategoryData.data.map(mainBang => {
      return {
        // 主榜的标题（如“巅峰榜”）
        mainTitle: mainBang.title,
        // 该主榜下的前3个子榜（包含子榜的label、picUrl等信息）
        subBangs: mainBang.list.slice(0, 3)
      };
    });
    this.setData({
     hotBandList: result
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

  }
})