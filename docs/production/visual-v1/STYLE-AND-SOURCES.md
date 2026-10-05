# 听雨驿样板：规格与制作来源

日期：2026-10-04。状态：可运行审阅样板，**不是最终美术批准，也不是 V1 全部完成**。

## 实际规格

- 逻辑视口仍为 480×270；主角主体约 51 像素高，Boss 仍约 76。旧图集、旧圆台、剑弧、闪身、符火与光照实现文件的哈希保存在 `baseline/hashes.json`。
- 听雨驿从 420×900 竖条调整为 740×720。保留东侧出口坐标和所有现有实体 ID；西侧扩展到负坐标。这仍是旧图册上的隔离区域，**没有宣称全项目已迁移到地图内坐标**。
- 地面使用低对比灰绿像素簇、青灰石庭和浅暖石路；木、瓦、灯与药材提供有限强调色。地面目前是 Canvas 程序绘制，不冒充 ComfyUI 生成地块或完整 Aseprite 地形集。
- 药庐 150 像素画布高，含 4 像素透明留边；Aseprite 源分屋顶与立面层。运行时仍整体绘制，玩家在后方时淡化；不是已经实现可进入建筑或逐屋顶拆分渲染。
- 医师图集每格 48×58，固定脚底锚点 (24,56)，身体约 51 像素，完整帧等比采样。8 个四方向待机/眨眼格＋4 个辨药姿势；背面中立格重复不计作新动作原画。
- 松树从旧 ComfyUI 三树图中选取右上单棵，Aseprite 去灰底、统一青绿树冠与透明边缘；只有一种形态，后续仍需变体。
- 新处理素材不再经过运行时自动去底。`src/camp-assets.js` 显式选择运行资产；原候选和旧资产保留，缺图时有明确失败显示，不动态搜寻“最新候选”。

## 真实工具链

1. `tools/camp-blockout.py`：Blender 正交建筑体块，保存 `.blend` 和透明参考图。
2. `tools/prepare-camp-references.lua`：Aseprite 隔离医师主体、合成建筑参考底色。
3. `tools/comfy-camp-sample.mjs`：本机 ComfyUI，SDXL Base＋Pixel Art XL LoRA，图生图；真实工作流、种子与任务 ID 在相邻 JSON。
4. `tools/finish-camp-assets.lua`：Aseprite 脚本清理、固定比例最近邻采样、屋瓦材质内的像素修整、分层与导出。属于可重复脚本修整，**不声称人工逐像素手绘**。
5. ComfyUI 的辨药候选没有改变手势且脸部漂移，因此拒绝。随后使用内置 `image_gen`（非 CLI）补完整人物方向和生活姿势，身份参考来自 ComfyUI 医师，细节风格参考旧主角。
6. `tools/finish-healer-idle.lua`：Aseprite 从真实生成完整帧中选帧，清除低 alpha 背景残留，用统一比例/髋轴/脚底注册，保存 `.aseprite` 与 PNG；不拼接半身或程序伪造另一条腿。

全部运行素材已复制到项目 `public/assets/camp-v1/`，不依赖 Codex 默认输出目录或生成服务。`manifest.json` 记录实际使用文件的 SHA-256；所有用户视觉批准均为 pending。

## 内置图像生成提示词与来源

### 四方向候选

输出：`healer-directions-candidate.png`（1536×1024）。来源文件标识 `exec-db629537-c90e-4894-b4b1-a16ddf05bd85.png`。输入：`healer-candidate.png` 为身份参考，项目旧 `hero-atlas.png` 仅为精细度/成人比例参考。

提示词：

> Use case: stylized-concept, game runtime sprite sheet. Image 1 is the IDENTITY reference: adult male herbalist, tied black hair, slate blue outer hanfu, russet inner robe and sleeves, blue sash, bamboo herb basket carried with both hands at waist, dark cloth shoes. Image 2 is ONLY reference for the finer deliberate pixel-art detail and adult proportions, NOT identity or clothing. Generate one clean transparent PNG sprite sheet, landscape 3:2 aspect ratio, EXACTLY 6 evenly spaced columns and 4 rows, 24 complete full-body sprites. Each equal square cell centered on the same pelvis axis, same full body scale throughout, feet baseline consistent, generous padding so sprites do not touch cell edges. No grid lines, text, labels, scenery, shadows or decorative border. Row 1 facing south/front, Row 2 facing north/back (back of head, no face), Row 3 facing west/left profile, Row 4 facing east/right profile. In EACH row the six columns are: 1 standing idle with eyes open; 2 standing idle with gentle blink (back stays neutral); 3 walk contact pose A, one foot forward other foot behind; 4 passing pose A, supporting foot planted other foot passing at low height; 5 opposite contact pose B, feet exchange forward and backward positions; 6 passing pose B with opposite support. Walk uses small natural steps, NOT running. Clearly alternate support legs in columns 3 and 5; for front/back views the shoe closer to the bottom switches screen sides, for profiles the near leg moves from forward to backward. Garment hem follows stride without detached waist. Keep basket and body coherent across all frames. Keep head, face, hairstyle, robe construction, basket, sleeves, scale and muted colors identical within the sheet. Detailed retro Chinese xianxia 2.5D slightly elevated RPG pixel sprites with crisp pixel clusters, dark readable contour, six-head adult proportions, not chibi, not a smooth painting. Genuine transparent background. Deliver the sprite sheet only.

审阅：输出没有严格满足所有规格。站姿/方向可作为样板；原始图有低 alpha 残留，需要清理；侧面步态不能证明相反支撑腿，因此第 3–6 列未接入。

### 辨药四姿势

输出：`healer-work-sheet.png`（实际 2172×724，并非提示词要求的 4:1）。来源文件标识 `exec-c9de853b-6c03-4458-a893-d81ae85ddb27.png`。输入：上述四方向候选。

提示词：

> Game runtime sprite animation, exact identity and fine pixel style of the south-facing adult herbalist in the first row of reference. Create ONLY FOUR full-body front-facing frames in one horizontal row, equal square cells, landscape 4:1 sheet, genuine transparent background with no gradients or cast shadow. Same adult male tied black hair, slate blue outer robe, russet inner robe and sleeves, blue sash, cloth shoes and bamboo basket containing herbs. Same height, body proportions, pelvis center, foot baseline and camera in all four cells. The action is carefully examining medicinal herbs, while both feet stay planted. Frame 1: both hands hold basket at waist, eyes open, neutral pose. Frame 2: left hand supports basket, right hand has reached into the basket to pick one leafy green sprig, gaze lowered. Frame 3: right hand clearly raised to chest/face height holding a leafy sprig between fingers, elbow bent, eyes looking toward the sprig; left hand still holds basket at waist. Frame 4: right hand clearly returning sprig toward basket, head still slightly lowered. Whole body must be drawn coherently in every frame, no waist splice, no change in head size, no pose drift, no duplicated neutral poses in place of action, no new accessories, no outlines/grid/text/labels outside sprites. Leave a clean transparent margin between complete sprites, all shoes fully visible. Crisp detailed retro Chinese xianxia 2.5D RPG pixel art, not chibi. Deliver the sprite sheet only.

审阅：四帧有取药、举药和放回的可见变化；按实际输出尺寸注册，不假定生成尺寸满足提示词。跨待机/工作图集的细部仍有差异，保持样板待审状态。

## 技术参考

Aseprite 像素读写、合成和导出 API 按[官方 Image 文档](https://www.aseprite.org/api/image)核对；最终采样使用脚本显式最近邻，并以 PNG 像素测试验证二值 alpha，不依赖默认缩放设置。
