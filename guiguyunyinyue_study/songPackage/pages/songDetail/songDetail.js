import PubSub from 'pubsub-js';
import moment from 'moment'
import request from '../../../utils/request'
// 获取全局实例
const appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false, // 音乐是否播放
    song: {}, // 歌曲详情对象
    musicId: '', // 音乐id
    musicLink: '', // 音乐的链接
    currentTime: '00:00',  // 实时时间
    durationTime: '00:00', // 总时长
    currentWidth: 0, // 实时进度条的宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // options: 用于接收路由跳转的query参数
    // 原生小程序中路由传参，对参数的长度有限制，如果参数长度过长会自动截取掉
    // console.log(JSON.parse(options.songPackage));
    
    let musicId = options.musicId;
    this.setData({
      musicId
    })
    // 获取音乐详情
    this.getMusicInfo(musicId);
    
    
    /*
    * 问题： 如果用户操作系统的控制音乐播放/暂停的按钮，页面不知道，导致页面显示是否播放的状态和真实的音乐播放状态不一致
    * 解决方案：
    *   1. 通过控制音频的实例 backgroundAudioManager 去监视音乐播放/暂停
    *
    * */
    
    // 判断当前页面音乐是否在播放
    if(appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId){
      // 修改当前页面音乐播放状态为true
      this.setData({
        isPlay: true
      })
    }
  
    // 创建控制音乐播放的实例
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    // 监视音乐播放/暂停/停止
    this.backgroundAudioManager.onPlay(() => {
      this.changePlayState(true);
      // 修改全局音乐播放的状态
      appInstance.globalData.musicId = musicId;
    });
    this.backgroundAudioManager.onPause(() => {
      this.changePlayState(false);
    });
    this.backgroundAudioManager.onStop(() => {
      this.changePlayState(false);
    });
    
    // 监听音乐播放自然结束
    this.backgroundAudioManager.onEnded(() => {
      // 自动切换至下一首音乐，并且自动播放
      PubSub.publish('switchType', 'next')
      // 将实时进度条的长度还原成 0；时间还原成 0；
      this.setData({
        currentWidth: 0,
        currentTime: '00:00'
      })
    });
    
    // 监听音乐实时播放的进度
    this.backgroundAudioManager.onTimeUpdate(() => {
      // console.log('总时长: ', this.backgroundAudioManager.duration);
      // console.log('实时的时长: ', this.backgroundAudioManager.currentTime);
      // 格式化实时的播放时间
      let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')
      let currentWidth = this.backgroundAudioManager.currentTime/this.backgroundAudioManager.duration * 450;
      this.setData({
        currentTime,
        currentWidth
      })
      
    })
  
  
    
  },
  // 修改播放状态的功能函数
  changePlayState(isPlay){
    // 修改音乐是否的状态
    this.setData({
      isPlay
    })
  
    // 修改全局音乐播放的状态
    appInstance.globalData.isMusicPlay = isPlay;
  },
  // 获取音乐详情的功能函数
  async getMusicInfo(musicId){
    let songData = await request('/song', {songmid: musicId});
    console.log('songData:', songData);
    
    // 检查数据结构是否正确 - 修正：歌曲信息在track_info中
    if (!songData || !songData.data || !songData.data.track_info) {
      console.error('获取歌曲详情失败:', songData);
      wx.showToast({
        title: '获取歌曲详情失败',
        icon: 'none'
      });
      return;
    }
    
    // 从返回的数据中提取歌曲信息 - 修正：使用track_info
    let songInfo = songData.data.track_info;
    console.log('songInfo:', songInfo);
    
    let song = {
      name: songInfo.name || '',
      ar: songInfo.singer ? songInfo.singer.map(s => ({name: s.name})) : [],
      al: {
        name: songInfo.album ? songInfo.album.name : '',
        picUrl: songInfo.album ? songInfo.album.picurl : ''
      },
      dt: songInfo.interval ? songInfo.interval * 1000 : 0, // 转换为毫秒
      mid: songInfo.mid || musicId // 保存songmid用于播放链接获取
    };
    
    console.log('处理后的song对象:', song);
    
    let durationTime = moment(song.dt).format('mm:ss');
    this.setData({
      song: song,
      durationTime
    })
    
    // 动态修改窗口标题
    wx.setNavigationBarTitle({
      title: song.name
    })
  },
  // 点击播放/暂停的回调
  handleMusicPlay(){
    let isPlay = !this.data.isPlay;
    // // 修改是否播放的状态
    // this.setData({
    //   isPlay
    // })
    
    // 使用song.mid作为musicId来获取播放链接
    let musicId = this.data.song.mid || this.data.musicId;
    let {musicLink} = this.data;
    this.musicControl(isPlay, musicId, musicLink);
  },
  
  // 控制音乐播放/暂停的功能函数
  async musicControl(isPlay, musicId, musicLink){
    
    if(isPlay){ // 音乐播放
      if(!musicLink){
        // 获取音乐播放链接
        let musicLinkData = await request('/song/urls', {id: musicId});
        console.log('musicLinkData:', musicLinkData);
        console.log('musicId:', musicId);
        
        // 检查返回的数据结构和播放链接
        if (!musicLinkData || !musicLinkData.data) {
          console.error('获取播放链接失败: API返回数据格式错误', musicLinkData);
          wx.showToast({
            title: '获取播放链接失败',
            icon: 'none'
          });
          return;
        }
        
        musicLink = musicLinkData.data[musicId];
        console.log('原始播放链接:', JSON.stringify(musicLink));
        
        // 去除播放链接前后的空格和特殊字符
        if (musicLink) {
          musicLink = musicLink.trim();
        }
        
        // 检查播放链接是否有效
        if (!musicLink || musicLink === '') {
          console.error('获取播放链接失败: 播放链接为空', musicLinkData);
          console.error('所有可用的键:', Object.keys(musicLinkData.data));
          wx.showToast({
            title: '该歌曲暂无播放链接',
            icon: 'none'
          });
          return;
        }
        
        console.log('处理后播放链接:', musicLink);
        
        this.setData({
          musicLink
        })
      }
      
      this.backgroundAudioManager.src = musicLink;
      this.backgroundAudioManager.title = this.data.song.name;
    }else { // 暂停音乐
      this.backgroundAudioManager.pause();
    }
    
  },
  
  // 点击切歌的回调
  handleSwitch(event){
    // 获取切歌的类型
    let type = event.currentTarget.id;
    
    // 关闭当前播放的音乐
    this.backgroundAudioManager.stop();
    // // 订阅来自recommendSong页面发布的musicId消息
    PubSub.subscribe('musicId', (msg, musicId) => {
      // console.log(musicId);
      
      // 获取音乐详情信息
      this.getMusicInfo(musicId);
      // 自动播放当前的音乐
      this.musicControl(true, musicId);
      // 取消订阅
      PubSub.unsubscribe('musicId');
    })
    // 发布消息数据给recommendSong页面
    PubSub.publish('switchType', type)
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
