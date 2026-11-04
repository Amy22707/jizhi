# 数据来源

整理日期：2026-11-04。所有资源随扩展安装，本地读取。

| 来源 | 固定版本 / 文件 | 使用范围 |
| --- | --- | --- |
| [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry/tree/b8594f81a89752241442f2ce267d6f66f96704ee) | b8594f81a89752241442f2ce267d6f66f96704ee，MIT | 唐诗三百首、宋词三百首、全唐诗分片 poet.tang.1000.json 至 poet.tang.9000.json |
| [zerosoul/chinese-colors](https://github.com/zerosoul/chinese-colors/tree/a3e09ddc79c349473768e714d3180a04781a4e39) | a3e09ddc79c349473768e714d3180a04781a4e39，MIT | src/assets/colors.json 的名称和 HEX；不复制说明或图像 |
| 原版几枝 | e640cabf265e802167714eae81e5de93cfa065ff | 保留原波浪候选及昼夜标记 |
| [reorx/cht-colors](https://github.com/reorx/cht-colors)、[中国色](https://zhongguose.com/) | 仅用于对照，未确认可再分发许可 | 校对 HEX，未导入独有记录。HEX 相同不等于名称相同 |

可在 PowerShell 中运行 `./scripts/fetch-sources.ps1` 下载固定版本。用 Python 运行 `scripts/generate-data.py` 可重建数据。将上述全唐诗分片放在 `.data-work/tang-1.json` 至 `tang-9.json`，两本选集放在 `featured-tang.json`、`featured-song.json`；zerosoul、reorx 的 JSON 分别放在 `colors.json`、`reorx-colors.json`，参考网页快照放在 `zhongguose.html`（均在 .data-work 下）。两份参考快照仅用于生成对照报告，可省略。reorx 有 156 个相同 HEX；zhongguose 当前入口只取得网页内容，只有 1 个字符串命中，不能据此判定已完成原色表校对。

诗词保留原文繁简，不将现代译注、专有数据库或书籍扫描纳入。按来源记录关联作者、篇名或词牌，过滤空字段、缺字标记、断裂诗行和过长段落。唐诗仅取完整五言或七言对句；宋词取带句末标点的原始段落。优先含明显意象的完整句组，扩展层一般每首一条，另收录经核对的武则天《如意娘》后两句。作者采用常用名「武则天」，原数据署名为「則天皇后」。按去空格及标点的正文全局去重，保留首次归属，避免同一句因不同出处重复显示。原文异体字未强行归并。8,501 条中精选 1,183 条、扩展 7,318 条；唐诗 7,988 条、宋词 513 条。作者和篇名来自源记录，经结构校验，未逐条进行文献版本核勘；扩展条目是自动筛出的摘句。

颜色优先采用 zerosoul 的 161 个条目，再保留原版不冲突的 497 条，共 658 条。原版色表此前已有 526 条，故保留兼容候选后超过交接文档估算范围。名称和 HEX 分别唯一。冲突记录见 [color-conflicts.json](color-conflicts.json)，HEX 对照见 [color-crosscheck.json](color-crosscheck.json)。与原版完全匹配时沿用昼夜标记；新增记录按亮度计算候选范围。意境采用关键词和色系规则，只给随机权重加成。

许可证原文见 [src/static/licenses](../src/static/licenses)。古代原文与仓库的现代注释、整理版权是不同事项，本版仅提取古代原文及必要出处字段。
