# 药庐室内美术 V2

范围：只替换听雨药庐室内的程序化占位表现，沿用外部药庐的深木色、青灰石板、玉色器皿和暖灯光。不改剑阵、布阵、原 Boss 战或原主角资产。

## 已接入

- 墙地背景 480×270：窗棂、嵌墙药柜、悬药、木梁、墙灯和门槛；保留中央通行区域。
- 卧榻 104×44：雕花木框、枕席、玉绿色被褥，脚底基点 y=42。
- 炼丹台 108×52：铜玉丹炉、药钵、药材盘、瓷罐和卷轴，脚底基点 y=50。
- 家具是独立透明精灵，加入现有按 y 坐标排序的绘制队列，而不是烘焙在背景上；接入对应遮挡与暖色光源。
- 卧榻/丹炉交互位置、出口和玩法保持不变。生成背景的墙脚约在逻辑 y=80，实际可行走范围调整为 x=2033–2447、y=83–250，防止走进后墙或侧墙。

## 来源与实际流程

内置 image_gen 参考本项目 `docs/production/camp-v2/source/lodge.png` 分三次生成。未使用 ComfyUI 或 Blender，也未复制新的外部素材。完整提示词见 [PROMPTS.md](./PROMPTS.md)，固定来源和哈希见 [manifest.json](./manifest.json)。

Aseprite 脚本 `tools/prepare-lodge-v2.lua` 做等比裁切/采样、透明边距、二值 alpha 和基点注册；背景采样为逻辑视口尺寸。保留生成原图、可编辑 `.aseprite` 和运行时 PNG。这是生成资产整理，不冒充逐像素手工精修。

工作台原图有柔和外围 alpha 光晕，导出时通过 alpha 阈值去除半透明背景，不靠按颜色抠除木纹或瓷器。`source/workbench-original.png` 保留原始结果，`source/workbench.png` 是相同内容的处理输入。

## 检查

- `npm test` / `npm run build` 通过。新增室内边界、交互点可用、素材路径/尺寸/来源哈希检查；原主角、Boss、战斗特效保护哈希仍通过。
- 正常键鼠回归，不注入玩家状态：从听雨驿步行到门口、R 入室、卧榻 R 休整、丹炉处 B 打开炼制、门口 R 返回。并复查技能按钮与采草布阵。
- 实机截图 [room.png](./runtime/room.png) 已目视检查：没有之前的矩形床与圆形锅占位，人物与家具尺寸可辨。浏览器结果见 [checks.json](./runtime/checks.json)。

复现整理：

```sh
/Applications/Aseprite.app/Contents/MacOS/aseprite -b --script-param root="$PWD" --script tools/prepare-lodge-v2.lua
node tools/record-lodge-v2.mjs
npm test
npm run build
ROOM_REVIEW_DIR=docs/production/lodge-v2/runtime PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node tools/review-arrays-room.mjs
```

浏览器回归依赖本地开发服务 4174。游戏生产预览使用 4173。

## 未宣称完成的部分

本轮已接入预览、功能回归通过，用户最终美术认可仍待审。房间沿用较空的既有布局；没有新增床上躺卧动画、实际炼丹演出、家具交互动画或更多功能房间。背景仍有轻微透视，未宣称严格等距投影。未修改音乐，未提交或推送远程。
