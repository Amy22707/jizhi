# 发布前检查

- [ ] 核对增强版身份、项目名称、版本、维护者、原作者署名及商店列表素材。升级时只修改 `package.json` 的版本，构建会同步三个清单。
- [ ] 确认原项目 MIT 版权文本、原版配色、图标、两款原版字体和其他素材的再分发依据。将许可证明保存在项目中。详见[鸣谢](../CREDITS.md)和[上架指南](STORE_PUBLISHING.md)。
- [ ] 用 Node.js 24、npm 11 执行 `npm ci --legacy-peer-deps --ignore-scripts`、`npm run lint`、`npm run test:random`、`npm run build:all`、`npm run verify:builds`、`npm run lint:firefox`。
- [ ] 临时加载三份实际产物，检查新标签页、工具栏按钮、设置重载、离线字体、诗词和色彩、动画暂停、快捷键和背景 PNG 下载。
- [ ] Firefox 真机确认选择拒绝、接受和撤销可选数据权限的行为。联网图标关闭后检查第三方请求是否停止。
- [ ] 更新并公开可访问的隐私说明 URL。对照实际设置和浏览器请求填写商店的数据披露。
- [ ] 准备当前构建的商店截图和有授权的图标。在商店后台核查材料尺寸、现行政策和审核提示。
- [ ] 先在 GitHub 手动运行构建工作流。核对四个产物后再由维护者发布 Release。工作流会将新版本的 ZIP 附到该 Release。
- [ ] 由维护者上传各自的商店包。AMO 同时提交源码包。记录后台验证和人工审核结果。
