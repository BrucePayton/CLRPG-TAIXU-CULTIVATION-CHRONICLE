# 本地资产记录 · 2026-10-01

- 主角：复制自 `one-life-one-world/assets/playable/v3/hero-atlas.png`，运行时修正非等距行裁切；现有站立和行走素材，不宣称含完整挥剑动画。青珩玉剑、手部锚点和飞行剑由 Canvas 绘制。
- 云海：ComfyUI SDXL 本机生成，工作流 `cloud-workflow.json`，任务 `140a02a2-9c7b-4fb6-bc6e-0899ecbbfa62`。运行时叠加可战斗的俯视石台、阵纹、台阶和石柱，保证画面与碰撞区一致。
- 第一版 `arena.png` 生成了水池庭院，未用于最终场景；保留作为迭代记录。
- Boss 迭代：ComfyUI SDXL `boss-workflow.json` 返回多人表；`boss-refined-workflow.json` 返回带框年画，未用于最终版本。
- 最终 Boss：内置 imagegen 生成透明单体 `public/assets/boss-final.png`（1145×1374）。青铜面具、白发、赤黑金纹袍、赤晶法杖。游戏中按 76 像素高最近邻绘制，叠加聚光、浮动和符箓；暂无完整逐帧攻击图集。公开记录省略本机绝对路径。
- Q 玉剑音效：SoundGenerated MLX Small SFX；任务 `30bb76df-96fa-4c9f-90e0-14da57eb9a57`，最终资产 `9a0080b8-b15c-4878-84da-31b564b22058`，1.5 秒、44.1kHz、单声道 WAV。机械检查通过；接入本地原型试听，未代替用户提交人工批准记录。
- 其余短音效：WebAudio 分层合成，不标记为 AI 模型产物。
- 对话音乐：用户目录 `GameMusic/方烁 - 对峙.mp3`。
- 战斗音乐：用户目录 `GameMusic/方烁 - 战斗.mp3`。
- 音乐用于用户要求的本地原型；未推定具有公开发行授权。

生成工作流、随机种子和提示词均保存在本目录。运行时只使用 `public` 内资产，不依赖生成服务在线。

## 最终 Boss 提示词（内置 imagegen）

Create a production game sprite, one single full-body enemy character on genuinely transparent background. Use case stylized-concept. Chinese xianxia boss 'Crimson Firmament Warden', an imposing old male immortal wearing a bronze demon ritual face MASK, white hair and a narrow long white beard. Tall angular black and dark crimson Chinese robes with restrained antique gold embroidered hems, broad bronze shoulder ornaments, layered cloth boots. His right hand holds a bronze staff topped with a glowing red crystal, his other hand makes a casting gesture. Three-quarter frontal standing view, elevated orthographic RPG camera. Style: deliberate crisp pixel art with chunky pixel clusters and a limited roughly 24-color palette, matching a detailed retro 2D Chinese RPG hero sprite. Render character as about 120 pixels tall, nearest-neighbor enlarged, no soft antialiasing or painted smooth gradients. Silhouette completely visible with all staff, hair, robe hems inside image and ample transparent margin. Character alone, NO frame, NO scenery, NO ground, NO lettering, NO presentation board, NO grid, NO multiple characters. Actual transparent alpha. Strong readable face-mask geometry, layered robe folds, gold belt, visible boots. Not cute/chibi. Staff should be to viewer's right.
