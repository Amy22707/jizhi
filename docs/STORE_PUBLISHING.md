# 商店上架指南

本项目是几枝的非官方增强版。构建包可用于商店上传流程，仍需维护者确认授权、提供商店材料并提交审核。三家商店分别审核及签名。GitHub Release 只分发文件。

## 通用材料

- 准备公开、长期有效的隐私政策页面。可用本仓库的 [PRIVACY.md](../PRIVACY.md)，推送后确认页面能匿名访问，再填写该 URL。
- 商品名称使用「几枝·增强版」。描述开头说明这是基于 Unicar 和贡献者的几枝制作的非官方增强版，明确安装后会更换新标签页。描述功能时注明搜索和联网图标可选。
- 说明用户设置保存在本机。若开启联网图标，浏览器向用户固定的网站请求图片。搜索词只在用户提交后发送到选定的搜索引擎。按三家后台的具体字段逐项披露，避免把「维护者没有收集服务器」写成「扩展从不传输数据」。
- 在正式上架前核实原版 MIT 声明对应的完整版权和许可文本，以及原版配色、图标、两款原版字体和品牌图标的嵌入与分发权。已有署名与可核实的许可保存在 [CREDITS.md](../CREDITS.md) 和 `src/static/licenses/`。特别注意 p5 的 LGPL 分发义务及经过修改的兼容代码，见 Firefox 源码说明。
- 截图建议统一为 1280×800。已在 `builds/store-assets/` 生成两张实拍 PNG 与候选图标，审核授权后使用。现有 README 图用于文档预览。商店的隐私说明、截图和审核备注不得包含私有固定网址或凭据。
- 每次更新提高 `package.json` 中的版本号，三个构建清单会同步。已发布过的商店项目应沿用各自的项目 ID。Firefox Gecko ID 应保持稳定。

## Chrome Web Store

1. 注册开发者账号并完成一次性注册付费及账号资料，进入 [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)。
2. 选择 **New Item** 并上传 `builds/chrome.zip`。后台从包根读取 MV3 清单。更新已有项目时，在原项目上传新版本。
3. 完成 **Store listing**。准备 128×128 图标和 1–5 张 1280×800 截图。补充简介、分类、语言与支持链接。
4. 完成 **Privacy practices**。单一用途是用离线诗词、传统色和动画美化新标签页。按后台字段说明本地保存及可选网络行为。清单无额外 API 或主机权限，运行代码随包提供。填入公开隐私政策 URL。
5. 设置 **Distribution**，检查预览，由维护者点击 **Submit for review**。

[注册](https://developer.chrome.com/docs/webstore/register) · [发布步骤](https://developer.chrome.com/docs/webstore/publish) · [列表材料](https://developer.chrome.com/docs/webstore/cws-dashboard-listing) · [隐私字段](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy) · [远程代码政策](https://developer.chrome.com/docs/extensions/develop/migrate/remote-hosted-code)

## Microsoft Edge Add-ons

1. 注册 Edge 扩展开发者账号，进入 [Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/overview)，选择创建新的扩展项目。
2. 在 **Packages** 上传 `builds/edge.zip`。运行文件与 Chrome 版相同，使用浏览器中立的名称和描述。选择继续，在 **Availability** 设置市场及可见性。
3. 在 **Properties**、**Privacy** 和 **Store listings** 填写属性、隐私说明、分类、简介及支持链接。每种语言提供方形图标，最低 128×128，建议 300×300。截图可选，最多 6 张，可用 1280×800 或 640×480。可选宣传图为 440×280 或 1400×560。
4. 在 **Submission options** 填写审核员说明。说明新标签页覆盖、离线模式和可选联网图标的测试方法，再由维护者提交认证。

[Partner Center 操作与素材规格](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension) · [开发者政策](https://learn.microsoft.com/en-us/legal/microsoft-edge/extensions/developer-policies)

## Firefox Add-ons（AMO）

1. 登录 [AMO Developer Hub](https://addons.mozilla.org/developers/)，接受开发者协议，选择 **Submit a New Add-on**。若要在商店公开列出，选择 AMO 托管分发。
2. 上传 `builds/firefox.zip` 并等待自动验证。清单采用 MV3、独立 Gecko ID 和 Firefox 内置数据传输声明。默认使用无需传输数据的核心功能，两个可选类别在使用时分别请求同意。
3. 在源码问题处选择需要提交源码，上传 `builds/firefox-source.zip`。审核员按 [英文构建说明](FIREFOX_SOURCE_BUILD.md) 复现。填入必要的第三方库、CSP 兼容调整和 Mozilla linter 告警说明。
4. 填写名称、简介、分类、支持链接与公开隐私政策。AMO 推荐用 1280×800 截图。准备 32×32 和 64×64 图标用于扩展列表与展示。
5. 检查验证结果、隐私提示和审核备注后，由维护者提交。正式 Firefox 一般安装 AMO 签名后的 XPI。本仓库的 ZIP 可通过调试页面临时加载。

[提交扩展](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/) · [源代码要求](https://extensionworkshop.com/documentation/publish/source-code-submission/) · [内置数据同意](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/) · [AMO 列表素材](https://extensionworkshop.com/documentation/develop/create-an-appealing-listing/)

## GitHub 构建

`.github/workflows/browser-release.yml` 可在 Actions 中手动运行，产物位于本次运行的 Artifacts。由维护者发布 GitHub Release 时，同一工作流检出该 Release 对应的标签，在 Windows 运行构建与检查，再把三个安装包和 Firefox 源码包附到该 Release。工作流只在附件上传阶段使用 GitHub 的仓库写权限，不使用任何商店凭据。已存在的同名 Release 附件需要由维护者处理后重跑。
