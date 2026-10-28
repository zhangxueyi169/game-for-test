# 20关配置

唯一运行来源为 `rooms.json`。地图不是运行时随机生成；修改后执行 `npm test` 与 `npm run levels:validate`。

顶层 `schemaVersion: 1`，`rooms` 必须20项，number连续1～20，id唯一。每项包含：

|字段|含义|
|---|---|
|id / revision|稳定关卡标识、存档兼容版本；改布局或预算时增加revision|
|rows|等宽字符行，`#`阻挡、`.`地板、`S`起点、`M`软垫、`N`猫窝；S/N各一个|
|name / theme|中文名称；base/living/study/bedroom/greenhouse/attic|
|intent / tutorial|设计意图、可选教学提示|
|challengeBudget|限步模式预算，整数且不小于验证解长度|
|optimalSteps / optimalityProven|最短步数与是否证明；仅BFS搜索成功可标记true|
|verifiedSolution|方向数组up/down/left/right；从初始状态回放必须获胜|
|verification|求解状态、搜索状态数、目标格数，辅助制作记录|

起点预覆盖，软垫和猫窝都计入覆盖目标。进入软垫立即停下，猫窝不强制停下。全部覆盖且一次移动结束在猫窝才获胜。

求解状态为位置与覆盖位集，共用 `src/core/rules.ts` 的 move。BFS首个找到的解证明最短；`unsolvable`表示可达状态穷尽，`timeout`表示状态数量上限，`depth_limit`表示深度上限，后两者不能声称全局无解。挑战提示的深度上限是剩余步数；Worker返回的请求编号必须匹配当前局面。

验证输出：`docs/qa/phase710/level-validation.json`、`docs/关卡预览与验证.html`。预览可以直接双击。地图还会检查旋转/镜像完全重复，并分别回放探索与挑战。

`tools/author_levels.mjs`、`refine_levels.mjs`、`repair_layouts.mjs`、`replace_unreachable.mjs`、`fix_nine.mjs` 是首轮制作过程脚本，会改写配置，不属于日常验证命令。日常请编辑JSON并重新计算证明数据，不要直接重跑草案生成脚本覆盖正式地图。
