// pages/index/index.js
Page({
  data: {
    messages: [{ id: 1, role: 'ai', content: '你好，我是 DeepSeek AI，请选择模式后开始对话！' }],
    inputValue: '',
    isTyping: false,
    scrollTop: 0,
    msgId: 2,
    history: [{ role: 'system', content: 'You are a helpful assistant' }],
    mode: 'fast',
    showWish: false,
    particles: [],
    today: '',
    quickKeys: ['推荐一首歌', '讲个笑话', '今天天气', '今日新闻', '随机冷知识']
  },

  onLoad() {
    this.setToday();
    setInterval(this.setToday, 60000);
  },

  setToday() {
    const now = new Date();
    const str = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    this.setData({ today: str });
  },

  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  switchMode(e) {
    const newMode = e.currentTarget.dataset.mode;
    this.setData({ mode: newMode });
    wx.showToast({ title: newMode === 'fast' ? '已切换极速模式' : '已切换思考模式', icon: 'none' });
  },

  // 点击快捷键直接发送
  sendQuickKey(e) {
    const quickKey = e.currentTarget.dataset.key;
    this.setData({ inputValue: quickKey });
    this.sendMessage();
  },

  sendMessage() {
    const text = this.data.inputValue.trim();
    if (!text) return;

    const userMsg = { id: this.data.msgId++, role: 'user', content: text };
    this.setData({
      messages: [...this.data.messages, userMsg],
      inputValue: '',
      history: [...this.data.history, { role: 'user', content: text }]
    });
    this.scrollBottom();
    this.callDeepSeek();
  },

  callDeepSeek() {
    this.setData({ isTyping: true });
    const modelMap = { fast: 'deepseek-chat', reason: 'deepseek-chat' };
    wx.request({
      url: 'https://api.deepseek.com/v1/chat/completions',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-5205b603683c4454866ded5711f11828'
      },
      data: {
        model: modelMap[this.data.mode],
        messages: this.data.history,
        stream: false
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.choices) {
          const reply = res.data.choices[0].message.content;
          this.typeWriter(reply);
        } else {
          throw new Error('response error');
        }
      },
      fail: () => {
        this.setData({ isTyping: false });
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  typeWriter(text) {
    let i = 0;
    const showText = () => {
      if (i <= text.length) {
        const aiMsg = { id: this.data.msgId, role: 'ai', content: text.slice(0, i) };
        this.setData({ messages: [...this.data.messages.slice(0, -1), aiMsg], scrollTop: 99999 });
        i++;
        setTimeout(showText, 30);
      } else {
        this.setData({
          isTyping: false,
          history: [...this.data.history, { role: 'assistant', content: text }],
          msgId: this.data.msgId + 1
        });
      }
    };
    this.setData({ messages: [...this.data.messages, { id: this.data.msgId, role: 'ai', content: '' }], isTyping: false });
    showText();
  },

  scrollBottom() {
    setTimeout(() => this.setData({ scrollTop: 99999 }), 100);
  },

  startWish() {
    const pts = [];
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * 360;
      const r = 100 + Math.random() * 300;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      pts.push(`--x:${x}rpx; --y:${y}rpx; left:50%; top:50%;`);
    }
    this.setData({ showWish: true, particles: pts });
    setTimeout(() => this.setData({ showWish: false, particles: [] }), 3000);
  }
});