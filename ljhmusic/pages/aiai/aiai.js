// pages/index/index.js
Page({
  data: {
    messages: [{
      id: 1,
      role: 'ai',
      content: '你好，我是 DeepSeek AI，请选择模式后开始对话！'
    }],
    inputValue: '',
    isTyping: false,
    scrollTop: 0,
    msgId: 2,
    history: [{
      role: 'system',
      content: 'You are a helpful assistant'
    }],
    mode: 'fast',
    showWish: false, // 烟花显示开关
    particles: [] // 粒子坐标
  },

  /* -------- 原函数全部保留，只追加下面两个 -------- */

  // 点击祝福按钮
  startWish() {
    const pts = [];
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * 360;
      const r = 100 + Math.random() * 300; // 100~400 rpx
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      pts.push(`--x:${x}rpx; --y:${y}rpx; left:50%; top:50%;`);
    }
    this.setData({
      showWish: true,
      particles: pts
    });
    // 3 秒后自动消失
    setTimeout(() => this.setData({
      showWish: false,
      particles: []
    }), 3000);
  },

  /* ============== 以下原函数不动 ============== */
  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },
  switchMode(e) {
    const m = e.currentTarget.dataset.mode;
    this.setData({
      mode: m
    });
    wx.showToast({
      title: m === 'fast' ? '已切换极速模式' : '已切换思考模式',
      icon: 'none'
    });
  },
  sendMessage() {
    const t = this.data.inputValue.trim();
    if (!t) return;
    const u = {
      id: this.data.msgId++,
      role: 'user',
      content: t
    };
    this.setData({
      messages: [...this.data.messages, u],
      inputValue: '',
      history: [...this.data.history, {
        role: 'user',
        content: t
      }]
    });
    this.scrollBottom();
    this.callDeepSeek();
  },
  callDeepSeek() {
    this.setData({
      isTyping: true
    });
    const mMap = {
      fast: 'deepseek-chat',
      reason: 'deepseek-chat'
    };
    wx.request({
      url: 'https://api.deepseek.com/v1/chat/completions',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-5205b603683c4454866ded5711f11828'
      },
      data: {
        model: mMap[this.data.mode],
        messages: this.data.history,
        stream: false
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.choices) {
          this.typeWriter(res.data.choices[0].message.content);
        } else {
          throw new Error('response error');
        }
      },
      fail: () => {
        this.setData({
          isTyping: false
        });
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },
  typeWriter(txt) {
    let i = 0;
    const run = () => {
      if (i <= txt.length) {
        const ai = {
          id: this.data.msgId,
          role: 'ai',
          content: txt.slice(0, i)
        };
        this.setData({
          messages: [...this.data.messages.slice(0, -1), ai],
          scrollTop: 99999
        });
        i++;
        setTimeout(run, 30);
      } else {
        this.setData({
          isTyping: false,
          history: [...this.data.history, {
            role: 'assistant',
            content: txt
          }],
          msgId: this.data.msgId + 1
        });
      }
    };
    this.setData({
      messages: [...this.data.messages, {
        id: this.data.msgId,
        role: 'ai',
        content: ''
      }],
      isTyping: false
    });
    run();
  },
  scrollBottom() {
    setTimeout(() => this.setData({
      scrollTop: 99999
    }), 100);
  }
});