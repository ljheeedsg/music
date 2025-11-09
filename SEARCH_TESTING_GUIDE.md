# 搜索功能测试指南

## 快速搜索接口返回结构

### 接口
`GET /search/quick?key=周杰伦`

### 实际返回JSON结构
```json
{
  "result": 100,
  "data": {
    "album": {
      "count": 2,
      "itemlist": [
        {
          "docid": "36062",
          "id": "36062",
          "mid": "002Neh8l0uciQZ",
          "name": "魔杰座",
          "pic": "http://y.gtimg.cn/music/photo_new/T002R180x180M000002Neh8l0uciQZ_3.jpg",
          "singer": "周杰伦"
        }
      ],
      "name": "专辑",
      "order": 2,
      "type": 3
    },
    "mv": {
      "count": 2,
      "itemlist": [
        {
          "docid": "293791",
          "id": "293791",
          "mid": "00061J2t0b0PPW",
          "name": "晴天",
          "singer": "周杰伦",
          "vid": "w0026q7f01a"
        },
        {
          "docid": "199394",
          "id": "199394",
          "mid": "000o8suF4BZ0vX",
          "name": "花海",
          "singer": "周杰伦",
          "vid": "r00127x0yzd"
        }
      ],
      "name": "MV",
      "order": 3,
      "type": 4
    },
    "singer": {
      "count": 2,
      "itemlist": [...],
      "name": "歌手",
      "order": 1,
      "type": 2
    },
    "song": {
      "count": 4,
      "itemlist": [...],
      "name": "单曲",
      "order": 0,
      "type": 1
    }
  }
}
```

## MV数据提取

### 关键字段
从 `result.data.mv.itemlist` 中提取：

| 字段 | 说明 | 示例 |
|------|------|------|
| `vid` | MV视频ID（重要） | "w0026q7f01a" |
| `name` | MV名称 | "晴天" |
| `singer` | 歌手名 | "周杰伦" |
| `mid` | 音乐ID | "00061J2t0b0PPW" |
| `docid` | 文档ID | "293791" |
| `id` | MV ID | "293791" |

### 缺失字段处理

#### 1. 封面图片 `cover_pic`
快速搜索不返回 `pic` 字段，需要根据 `mid` 生成：

```javascript
cover_pic: `http://y.gtimg.cn/music/photo_new/T002R300x300M000${item.mid}.jpg`
```

**示例**:
- mid: `00061J2t0b0PPW`
- 封面: `http://y.gtimg.cn/music/photo_new/T002R300x300M00000061J2t0b0PPW.jpg`

#### 2. 时长 `duration`
快速搜索不返回时长，设置为 `0`:

```javascript
duration: item.time || 0
```

#### 3. 播放次数 `playcnt`
快速搜索不返回播放次数，设置为 `0`:

```javascript
playcnt: 0
```

## 数据转换代码

### 快速搜索MV提取
```javascript
async quickSearch(keyword) {
  const result = await request('/search/quick', { key: keyword });
  
  if (result.result === 100 && result.data) {
    const mvData = result.data.mv;
    const mvList = mvData?.itemlist || [];
    
    const searchResults = mvList.map(item => ({
      vid: item.vid,                    // MV视频ID
      name: item.name,                  // MV名称
      singer: item.singer,              // 歌手名
      mid: item.mid,                    // 音乐ID
      cover_pic: `http://y.gtimg.cn/music/photo_new/T002R300x300M000${item.mid}.jpg`,
      duration: 0,                      // 快速搜索不返回
      singers: [{ name: item.singer }], // 转换为数组格式
      playcnt: 0,                       // 快速搜索不返回
      isSearchResult: true              // 标记为搜索结果
    }));
    
    this.setData({ searchResults });
  }
}
```

## 测试用例

### 测试1: 搜索"周杰伦"
```javascript
// 输入
keyword = "周杰伦"

// 期望结果
{
  searchResults: [
    {
      vid: "w0026q7f01a",
      name: "晴天",
      singer: "周杰伦",
      cover_pic: "http://y.gtimg.cn/music/photo_new/T002R300x300M00000061J2t0b0PPW.jpg",
      // ... 其他字段
    },
    {
      vid: "r00127x0yzd",
      name: "花海",
      singer: "周杰伦",
      cover_pic: "http://y.gtimg.cn/music/photo_new/T002R300x300M000000o8suF4BZ0vX.jpg",
      // ... 其他字段
    }
  ]
}
```

### 测试2: 搜索"Taylor Swift"
```javascript
// 输入
keyword = "Taylor Swift"

// 期望
返回 Taylor Swift 相关的MV列表
```

### 测试3: 搜索不存在的关键词
```javascript
// 输入
keyword = "xyzabc123"

// 期望
mvList.length === 0
显示 "未找到相关MV"
```

## 调试方法

### 1. 查看原始返回数据
在 `quickSearch` 方法中添加：
```javascript
console.log('快速搜索原始结果:', result);
console.log('MV数据:', result.data.mv);
console.log('MV列表:', result.data.mv?.itemlist);
```

### 2. 查看处理后的数据
```javascript
console.log('处理后的搜索结果:', this.data.searchResults);
```

### 3. 在开发者工具中检查
1. 打开微信开发者工具
2. 切换到 Console 标签
3. 输入关键词搜索
4. 查看日志输出

### 4. 检查AppData
在开发者工具的 AppData 面板中查看：
- `searchResults`: 搜索结果数组
- 每个对象的字段是否正确

## 常见问题

### Q1: 搜索结果为空
**检查点**:
1. 网络请求是否成功（200状态码）
2. `result.result === 100` 是否为真
3. `result.data.mv` 是否存在
4. `result.data.mv.itemlist` 是否为空数组

**解决方法**:
```javascript
console.log('result.result:', result.result);
console.log('result.data:', result.data);
console.log('mv对象:', result.data?.mv);
console.log('itemlist长度:', result.data?.mv?.itemlist?.length);
```

### Q2: 封面图片不显示
**原因**: mid格式不正确或URL拼接错误

**检查**:
```javascript
console.log('mid:', item.mid);
console.log('生成的封面URL:', cover_pic);
```

**解决**: 在浏览器中直接访问封面URL测试

### Q3: 无法播放MV
**原因**: vid不正确

**检查**:
```javascript
console.log('vid:', item.vid);
console.log('获取播放链接:', await this.getMvUrl(item.vid));
```

## 封面图片URL规则

根据返回的专辑封面格式，推断MV封面格式：

### 专辑封面格式
```
http://y.gtimg.cn/music/photo_new/T002R{size}M000{mid}_{version}.jpg
```

参数：
- `size`: 图片尺寸，如 180x180, 300x300
- `mid`: 音乐/MV的mid
- `version`: 版本号，如 3, 5

### MV封面尝试格式
```javascript
// 方法1: 基础格式
`http://y.gtimg.cn/music/photo_new/T002R300x300M000${item.mid}.jpg`

// 方法2: 带版本号
`http://y.gtimg.cn/music/photo_new/T002R300x300M000${item.mid}_1.jpg`

// 方法3: MV专用格式（如果存在）
`http://y.gtimg.cn/music/photo_new/T053R300x300M000${item.mid}.jpg`
```

## 完整测试流程

### 步骤1: 启动后端服务
```bash
cd QQMusicApi-master
npm start
```

### 步骤2: 测试接口
在浏览器中访问：
```
http://localhost:3300/search/quick?key=周杰伦
```

验证返回数据结构

### 步骤3: 在小程序中测试
1. 打开视频页面
2. 点击"搜索MV"
3. 输入"周杰伦"
4. 等待500ms
5. 查看搜索结果
6. 查看控制台日志

### 步骤4: 验证数据
检查 Console 输出：
```
快速搜索结果: { result: 100, data: {...} }
搜索到的MV: [...]
MV数量: 2
处理后的MV列表: [...]
```

### 步骤5: 测试播放
1. 点击搜索结果中的MV
2. 验证是否获取播放链接
3. 验证是否开始播放

## 成功标准

- ✅ 接口返回 `result: 100`
- ✅ 提取到MV数组（长度 > 0）
- ✅ 每个MV有正确的 `vid`
- ✅ 封面图片能显示
- ✅ 点击后能获取播放链接
- ✅ MV能正常播放

## 注意事项

1. **数据可用性**: 不是所有关键词都有MV结果
2. **网络延迟**: 快速搜索也需要网络请求时间
3. **图片加载**: 封面图片可能加载较慢
4. **播放限制**: 部分MV可能有播放限制

## 后续优化

1. **封面预加载**: 提前加载封面图片
2. **缓存搜索结果**: 避免重复搜索
3. **搜索历史**: 记录用户搜索历史
4. **搜索建议**: 根据输入提供搜索建议

