# 鸣谢与第三方许可

几枝·增强版是 [Unicar 和贡献者的几枝](https://github.com/liminalpurr/jizhi) 的非官方改进版。原版动画基于 p5.js；原版截图和图标归原权利人。请参阅[数据来源](docs/data-sources.md)。

- 诗词：chinese-poetry 维护者，MIT。
- 新增传统色：Tristan Yang / zerosoul，MIT。
- 霞鹜文楷：LXGW 与原 Klee One 作者，SIL OFL 1.1；源字库 [v1.530](https://github.com/lxgw/LxgwWenKai/releases/tag/v1.530)，子集名称 JizhiLiterary。
- 马善政毛笔楷书和站酷小薇宋体：各字体项目作者，SIL OFL 1.1；取自 [Google Fonts 2fe1e8c](https://github.com/google/fonts/tree/2fe1e8c6b137fb13041a7cfca6fdcd8a910ea4dc/ofl)，子集名称 JizhiBrush、JizhiSong。
- 女书凤栖来自 [nushu-script/Nyushu NshuF](https://github.com/nushu-script/Nyushu/releases/tag/NshuF)（MY1L）。v1.003 发布字库的元数据标注 OFL 1.1，同版网页字体的发布页也注明允许嵌入和再分发。扩展使用重新命名的 JizhiFengqi 子集，保留版权和许可。

[许可证原文](src/static/licenses/)随安装包提供。字体子集重建脚本：将原始字体放在 .data-work 下，安装 fonttools 和 brotli 后先运行 `node scripts/font-charset.cjs` 生成简繁字符集，再运行 `python scripts/subset-fonts.py`。

- Noto Serif TC：由 [Fontsource 5.3.1](https://www.npmjs.com/package/@fontsource/noto-serif-tc/v/5.3.1) 提供的原始常规字重 WOFF2 分片（OFL 1.1）。运行 `python scripts/install-noto-serif-tc.py` 可从对应 npm 压缩包重建。
- 简繁字形转换由 [OpenCC JS](https://github.com/nk2028/opencc-js) 1.4.2 在本地完成，MIT 及词典的第三方许可随包附上。

- 香萃刻宋来自 [Miiiller/Xiangcui-Kesong c49b294](https://github.com/Miiiller/Xiangcui-Kesong/tree/c49b2946c48a7b27b087800d2190cd7fc43363b8)，OFL 1.1，子集名 JizhiWoodcut。
- 朱雀仿宋来自 [TrionesType/zhuque v0.212](https://github.com/TrionesType/zhuque/releases/tag/v0.212)，OFL 1.1，子集名 JizhiBookSerif。
- 霞鹜臻楷采用 [LXGW ZhenKai Slab GB v0.827](https://github.com/lxgw/LxgwZhenKai/releases/tag/v0.827)，OFL 1.1，子集名 JizhiRegularScript。

- 常用网址图标用于识别对应网站，标识归各自权利人。各图标的来源见 [shortcut-icons.json](src/constants/shortcut-icons.json)。部分图标采用 [Simple Icons](https://github.com/simple-icons/simple-icons) 的 CC0 图形。
