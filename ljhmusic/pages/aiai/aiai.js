// pages/index/index.js
Page({
  data: {
    messages: [
      { id: 1, role: 'ai', content: '你好，我是赛博 AI，有什么可以帮你？' }
    ],
    inputValue: '',
    isTyping: false,
    scrollTop: 0,
    msgId: 2,
    history: [{ role: 'system', content: 'You are a helpful assistant' }]
  },

  onInput(e) {
    this.setData({ inputValue: e.detail.value });
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
    wx.request({
      url: 'https://api.deepseek.com/v1/chat/completions',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-5205b603683c4454866ded5711f11828'
      },
      data: {
        model: 'deepseek-chat',
        messages: this.data.history,
        stream: false
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.choices) {
          const reply = res.data.choices[0].message.content;
          this.typeWriter(reply);   // <-- 打字机效果
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

  // 打字机效果
  typeWriter(text) {
    let i = 0;
    const showText = () => {
      if (i <= text.length) {
        const aiMsg = {
          id: this.data.msgId,
          role: 'ai',
          content: text.slice(0, i)
        };
        this.setData({
          messages: [...this.data.messages.slice(0, -1), aiMsg],
          scrollTop: 99999
        });
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
    // 先 push 一个空占位
    this.setData({
      messages: [...this.data.messages, { id: this.data.msgId, role: 'ai', content: '' }],
      isTyping: false
    });
    showText();
  },

  scrollBottom() {
    setTimeout(() => this.setData({ scrollTop: 99999 }), 100);
  }
});