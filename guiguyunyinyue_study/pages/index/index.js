import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [], // 轮播图数据
    recommendList: [], // 推荐歌单
    topList: [], // 排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let bannerListData = await request('/recommend/banner');
    console.log('轮播图数据:', bannerListData);
    this.setData({
      bannerList: bannerListData.data || []
    })
    
    // 获取推荐歌单数据 - 修改为QQ音乐API
    let recommendListData = await request('/recommend/playlist/u');
    console.log('推荐歌单数据:', recommendListData);
    this.setData({
      recommendList: recommendListData.data?.list || []
    })
    
    
    // 获取排行榜数据 - 修改为QQ音乐API
    /*
    * 需求分析：
    *   1. 先获取排行榜分类列表
    *   2. 然后获取前5个排行榜的详情数据
    * */
    
    // 先获取排行榜分类
    let topCategoryData = await request('/top/category');
    let resultArr = [];
    
    // 获取前5个排行榜的详情
    for(let i = 0; i < Math.min(5, topCategoryData.data.length); i++) {
      if(topCategoryData.data[i] && topCategoryData.data[i].list && topCategoryData.data[i].list.length > 0) {
        let topId = topCategoryData.data[i].list[0].topId;
        let topListData = await request('/top', {id: topId, pageSize: 3});
        if(topListData && topListData.data) {
          let topListItem = {
            name: topListData.data.info ? topListData.data.info.title : '排行榜', 
            tracks: (topListData.data.list || []).slice(0, 3).map(item => ({
              id: item.id,
              name: item.name,
              al: {
                picUrl: item.album ? item.album.pmid : ''
              }
            }))
          };
          resultArr.push(topListItem);
          // 不需要等待五次请求全部结束才更新，用户体验较好，但是渲染次数会多一些
          this.setData({
            topList: resultArr
          })
        }
      }
    }

    // 更新topList的状态值, 放在此处更新会导致发送请求的过程中页面长时间白屏，用户体验差
    // this.setData({
    //   topList: resultArr
    // })
  },
  
  // 跳转至recommendSong页面的回调
  toRecommendSong(){
    wx.navigateTo({
      url: '/songPackage/pages/recommendSong/recommendSong'
    })
  },
  // 跳转至other页面
  toOther(){
    wx.navigateTo({
      url: '/songPackage/pages/other/other'
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
