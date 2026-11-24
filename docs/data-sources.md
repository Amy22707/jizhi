# 数据来源

整理日期为 2026 年 11 月 18 日。所有资源随扩展安装，本地读取。

| 来源 | 固定版本 / 文件 | 使用范围 |
| --- | --- | --- |
| [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry/tree/b8594f81a89752241442f2ce267d6f66f96704ee) | b8594f81a89752241442f2ce267d6f66f96704ee，MIT | 唐诗三百首、宋词三百首、全唐诗分片 poet.tang.1000.json 至 poet.tang.9000.json |
| [zerosoul/chinese-colors](https://github.com/zerosoul/chinese-colors/tree/a3e09ddc79c349473768e714d3180a04781a4e39) | a3e09ddc79c349473768e714d3180a04781a4e39，MIT | src/assets/colors.json 的名称和 HEX；不复制说明或图像 |
| 原版几枝 | e640cabf265e802167714eae81e5de93cfa065ff | 保留原波浪候选及昼夜标记 |
| [reorx/cht-colors](https://github.com/reorx/cht-colors)、[中国色](https://zhongguose.com/) | 仅用于对照，未确认可再分发许可 | 校对 HEX，未导入独有记录。HEX 相同不等于名称相同 |

可在 PowerShell 中运行 `./scripts/fetch-sources.ps1` 下载固定版本。用 Python 运行 `scripts/generate-data.py` 可重建数据。将上述全唐诗分片放在 `.data-work/tang-1.json` 至 `tang-9.json`，两本选集放在 `featured-tang.json`、`featured-song.json`；zerosoul、reorx 的 JSON 分别放在 `colors.json`、`reorx-colors.json`，参考网页快照放在 `zhongguose.html`（均在 .data-work 下）。两份参考快照仅用于生成对照报告，可省略。reorx 有 156 个相同 HEX；zhongguose 当前入口只取得网页内容，只有 1 个字符串命中，不能据此判定已完成原色表校对。

诗库先从开源数据筛出完整句组，再与[古诗文网（古文岛）](https://www.guwendao.net/)核对正文、篇名和署名。遇到异文优先使用原文页正文。宋词使用原文页篇名，旧页面只列词牌时按「词牌·题目或原词首句」补足。

篇名采用作品原文页的主标题。整理时去掉「杂曲歌辞」「相和歌辞」等分类前缀、并列别名和「一作」等版本说明。例如原先的「杂曲歌辞·饮酒乐」统一为「饮酒乐」。词的题记以「词牌·题记」显示。[古文岛《饮酒乐》](https://www.guwendao.net/shiwenv_abe125a9ce77.aspx)

内置库有 8,176 条，其中唐诗 7,664 条、宋代诗词 512 条。981 条的标题参照现行页面，其余条目参照古诗文网的历史快照整理。部分旧链接访问失败时保留快照依据。合并了 28 条因校订而重复的摘句，旧编号会打开保留的条目。另有 319 条旧记录还未找到足以确认的对应版本，暂不收入内置库。

从古文岛名句栏目补入的唐宋摘句，每首选一条，按作品原文页核对正文、署名和篇名。[古文岛名句](https://www.guwendao.net/mingjus/) · [写景名句](https://www.guwendao.net/mingjus/default.aspx?tstr=%E5%86%99%E6%99%AF)

新增名句的原文链接见 [featured-excerpts.json](../scripts/featured-excerpts.json)，其他条目的校对依据见 [gushiwen-versions.json](../scripts/gushiwen-versions.json)。其中 `gushiwen:shiwenv_…` 对应古诗文网的作品链接，记录自[含原文链接的历史快照](https://github.com/yxcs/poems-db/tree/7e9828204786a1501f5d3116fdbe007bfd4743d5)。`gushiwen:archive:…` 对应[旧版网站历史快照](https://github.com/shenyunhang/gushiwen-crawler-data/tree/64caebf936940a7746136e082c3d8677c24babee)按朝代目录下的数字编号。两个快照仅用于校对；扩展随附古代诗词摘句和出处，不随附快照及其译注、赏析或音频。

- 《登鹳雀楼》署名王之涣，选录「白日依山尽，黄河入海流」。[古诗文网《登鹳雀楼》](https://www.guwendao.net/shiwenv_c90ff9ea5a71.aspx)
- 《枫桥夜泊》选录「月落乌啼霜满天，江枫渔火对愁眠」。[古诗文网《枫桥夜泊》](https://www.guwendao.net/shiwenv_6fb73f607ad3.aspx)

颜色优先采用 zerosoul 的 161 个条目，再保留原版不冲突的 497 条，共 658 条。原版色表此前已有 526 条，故保留兼容候选后超过交接文档估算范围。名称和 HEX 分别唯一。冲突记录见 [color-conflicts.json](color-conflicts.json)，HEX 对照见 [color-crosscheck.json](color-crosscheck.json)。与原版完全匹配时沿用昼夜标记；新增记录按亮度计算候选范围。意境采用关键词和色系规则，只给随机权重加成。

许可证原文见 [src/static/licenses](../src/static/licenses)。古代原文与仓库的现代注释、整理版权是不同事项，本版仅提取古代原文及必要出处字段。
