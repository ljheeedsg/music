// pages/chat/chat.js
Page({
  data: {
    messages: [
      {
        id: 1,
        role: 'ai',
        content: '您好！我是AI智能助手，有什么可以帮您的吗？'
      }
    ],
    inputValue: '',
    isTyping: false,
    scrollTop: 0,
    autoFocus: false,
    messageId: 2
  },

  onLoad: function () {
    // 页面加载时设置初始焦点
    this.setData({
      autoFocus: true
    });
  },

  onInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  sendMessage: function () {
    const message = this.data.inputValue.trim();
    if (!message) return;

    // 添加用户消息
    const userMessage = {
      id: this.data.messageId++,
      role: 'user',
      content: message
    };

    this.setData({
      messages: [...this.data.messages, userMessage],
      inputValue: '',
      isTyping: true
    });

    // 滚动到底部
    this.scrollToBottom();

    // 模拟AI回复（后续可替换为真实API调用）
    setTimeout(() => {
      this.receiveAIResponse(message);
    }, 1000);
  },

  receiveAIResponse: function (userMessage) {
    // 模拟AI回复逻辑
    let response = '';
    
    if (userMessage.includes('你好') || userMessage.includes('您好')) {
      response = '您好！很高兴为您服务。';
    } else if (userMessage.includes('天气')) {
      response = '我目前无法获取实时天气数据，但您可以告诉我您所在的城市，我可以提供一般性的天气信息。';
    } else if (userMessage.includes('帮助')) {
      response = '我可以回答各种问题、提供信息、聊天交流等。请随时向我提问！';
    } else {
      response = '这是一个模拟回复。在实际应用中，这里会调用AI API生成智能回复。您刚才说的是：' + userMessage;
    }

    const aiMessage = {
      id: this.data.messageId++,
      role: 'ai',
      content: response
    };

    this.setData({
      messages: [...this.data.messages, aiMessage],
      isTyping: false
    });

    // 滚动到底部
    this.scrollToBottom();
  },

  scrollToBottom: function () {
    // 使用延时确保消息渲染完成后再滚动
    setTimeout(() => {
      this.setData({
        scrollTop: 99999  // 设置一个足够大的值确保滚动到底部
      });
    }, 100);
  }
});