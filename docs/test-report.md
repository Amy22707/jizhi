# 浏览器构建验证记录

环境为 Windows、Node.js 24.18.0、npm 11.16.0，项目版本为 2.5.2。

| 检查 | 实际结果 |
| --- | --- |
| `npm run lint` | 通过 |
| `npm run test:random` | 4 组通过。1,000 次加权抽样中近 200 次无重复，500 次昼夜色池交替通过。另验证了异常历史、候选不足和写入失败 |
| `npm run build:all` | 一次编译生成三个 MV3 安装包，约 22.46 MiB 各。Webpack 有包体积提示 |
| `npm run verify:builds` | 三个 ZIP 各有 178 个文件，根目录清单有效。入口、脚本、图标尺寸、字体、数据和许可齐全，与各自解压目录逐文件相同。Chrome 与 Edge 的包内文件完全相同 |
| `npm run lint:firefox` | Mozilla web-ext 10.8.0，0 错误、0 notices、49 条 `UNSAFE_VAR_ASSIGNMENT` 依赖告警。无 `DANGEROUS_EVAL` 告警 |
| Chrome 156.0.8078.80 | 独立临时配置加载 Chrome 包。实际新标签页被覆盖，21 次断网刷新无重复诗句、无 HTTP(S) 请求或未捕获异常。字号、固定诗句、凤栖和繁体宋体可恢复，波浪画布有变化，Alt+S 实际下载有效 PNG |
| Edge 155.0.4283.45 | 用独立 Edge 产物执行同一测试，结果通过 |
| Firefox 159.0.1 | Mozilla 官方二进制与 geckodriver 0.36.0 临时安装 ZIP。确认 Firefox 注册了新标签页覆盖，再打开其注册的扩展地址。21 次离线刷新无重复诗句，画布动画、定制色名、凤栖和 PNG 下载通过 |
| 联网图标 | Chrome 以拦截响应验证。关闭时未知站点只显示首字、内置图标无网络请求。打开时只向测试站点请求图标，关闭后恢复首字 |
| AMO 审核源码 | 在空目录解压源码 ZIP，用锁文件重新安装依赖，构建 Firefox 并运行校验和 web-ext lint。重建后的 Firefox ZIP 内容与提交包逐文件一致 |
| 商店预览材料 | 从 Chrome 实际构建捕获两张 1280×800 RGB PNG。候选图标为 128×128、32×32、64×64，位于 `builds/store-assets/` |

## 复跑命令

```powershell
npm ci --legacy-peer-deps --ignore-scripts
npm run lint
npm run test:random
npm run build:all
npm run verify:builds
npm run lint:firefox
node scripts/chrome-smoke.cjs
node scripts/chrome-smoke.cjs 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' edge
node scripts/firefox-smoke.cjs <Firefox可执行文件> <geckodriver可执行文件>
```

## 剩余事项

- Mozilla 的 49 条 DOM 写入告警集中于打包后的第三方库，包含 p5 的可访问性与 HTML 辅助方法以及 React 的 DOM 写入实现。几枝页面源码没有调用 `innerHTML` 或 `dangerouslySetInnerHTML`。CSP 保持禁止动态字符串执行，审核备注需披露完整 [web-ext 报告](../builds/firefox-lint.json)。检查脚本对新增告警类型或应用脚本告警失败，既有告警会完整保留。
- `npm audit --omit=dev` 报告 12 项公告（7 高、5 中），主要涉及 Evergreen 的传递依赖和构建用 archiver。已移除未使用的 axios。公告统计涵盖 npm 依赖树，不代表每条都进入包或可通过几枝的路径触发。提交前复核剩余影响。
- 仍需通过普通 Firefox 窗口确认 Ctrl+T、工具栏按钮、可选数据权限拒绝/接受/撤销的原生提示。三浏览器的泡泡、暂停、各设置切换和商店签名后的安装也列入[人工复测](BROWSER_COMPATIBILITY.md)。
- GitHub Actions YAML 已本地解析，工作流尚未在 GitHub runner 上实际触发。没有提交商店、推送或发布 Release。
- 上架前仍需确认原版版权与资源分发范围，并发布可公开访问的隐私说明。详见[商店指南](STORE_PUBLISHING.md)。

## 变更文件

| 文件 | 用途 |
| --- | --- |
| `chrome.manifest.json`、`firefox.manifest.json` | 共用浏览器中立的 Chromium MV3 清单，Firefox 改 MV3、独立 ID、最低版本及可选数据类别 |
| `extension.background.js` | 统一工具栏行为，替代 `chrome.background.js` 和 `firefox.background.js` |
| `package.json`、`package-lock.json` | 统一命令、固定 npm 依赖，加入 web-ext 与 ZIP 检查工具 |
| `webpack.config.js`、`scripts/webpack-build.cjs`、`build.js` | 单次编译、各目标清单组装、ZIP 与 AMO 源码打包 |
| `scripts/csp-fallbacks-loader.cjs` | 限定生产依赖的旧动态执行回退适配 |
| `scripts/verify-builds.cjs`、`scripts/lint-firefox.cjs` | 校验产物和 Mozilla 静态检查 |
| `src/utils/networkConsent.js`、`src/App.jsx`、`src/components/Shortcuts.jsx`、`src/components/SearchInput.jsx` | 仅在同意后获取远程图标或提交 Firefox 搜索 |
| `src/components/ConfigMenu/MenuContent.jsx`、`src/components/ConfigMenu/Legal.jsx`、`src/components/Verses/VersesContent.jsx`、`src/constants/appConstants.js` | 联网选项、隐私入口、搜索目标与查询编码 |
| `scripts/chrome-smoke.cjs`、`scripts/firefox-smoke.cjs` | 实测浏览器运行和下载 |
| `README.md`、`PRIVACY.md`、`docs/BROWSER_COMPATIBILITY.md`、`docs/STORE_PUBLISHING.md`、`docs/RELEASE_CHECKLIST.md`、`docs/FIREFOX_SOURCE_BUILD.md`、`docs/test-report.md` | 安装、隐私、兼容、商店、审核及验证说明 |
| `.github/workflows/browser-release.yml` | 手动构建和对已发布 Release 附上安装包与审核源码 |
