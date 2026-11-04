# 原版架构审计

基线：e640cabf265e802167714eae81e5de93cfa065ff。Chrome 清单已是 MV3，使用 newtab override 和本地 service worker，无主机权限。Firefox 有单独的清单。Webpack 4 / Neutrino 从 src/index.jsx 构建 React 16 页面；webpack.config.js 分别输出到 builds/build_chrome 和 builds/build_firefox，build.js 将目录压缩。

- 诗词：src/index.jsx → App.componentDidMount → src/utils/jinrishici.js → https://v2.jinrishici.com/one.json?client=npm-sdk/1.0。localStorage 保留 token；有 token 时通过 X-User-Token 查询参数继续请求。没有 TTL 或历史。App 同时读取 verses 缓存用于本页，网络结果只更新下一页的缓存；错误则从 20 条本地句子中有放回抽一条写缓存。在线响应不去重，旧缓存也可能在快开多个标签页时重复出现。这是从源码得到的原因，未推定在线服务故障。
- 颜色：原 src/utils/index.js 从 wavesColors.json 的 526 个原始记录按 lightSuitable / darkSuitable 筛选，再有放回抽取。App 把 HEX 传给 p5，waves.js 对同一颜色应用五层透明度和高度。Blobs 用独立的预设，和波浪底色无关。
- 持久化：src/utils/storager.js 使用 localStorage 保存页面偏好；旧版还缓存诗句和远程字体 CSS。本版不读取旧诗句或 CSS 缓存。
- 许可：原版 package.json 声明 MIT，仓库根目录未见独立 LICENSE。原作者署名与示例保留；原图标、favicon、原色库的单独授权范围需要在公开再分发前核实。原 src/fonts/JXZhuoKai.woff 已从当前源码树移除；旧远程欣意吉祥宋、方正细金陵及历史素材也不打包。新增数据和字体的完整许可证随扩展复制。今日诗词旧 SDK 源码自带 Apache-2.0 标头，已脱离运行路径。
- 修改范围：App 数据入口、独立抽样与数据模块、设置里的个性化和字体、诗句字号和字体样式、构建兼容配置及说明。保留波浪几何与噪声动画、Blobs、截图、色名淡出和原有新标签页布局。

主要运行时包：p5 1.4.1（LGPL-2.1，源代码：https://github.com/processing/p5.js/tree/v1.4.1）、React 与 React DOM、react-p5-wrapper、Evergreen、styled-components、retina-dom-to-image 和 lodash。构建脚本复制安装包中可找到的这些库的许可证；公开发行前仍须核对传递依赖及 LGPL 的再分发要求。
