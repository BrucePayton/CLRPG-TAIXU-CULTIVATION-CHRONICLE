# 药庐室内生成提示词

工具：内置 image_gen；参考 `docs/production/camp-v2/source/lodge.png`。本轮未使用 ComfyUI / Blender。Aseprite 负责后续尺寸注册及 alpha 整理。

## 房间背景

Use case: stylized-concept. Production pixel RPG ROOM BACKGROUND, empty shell, NOT a concept illustration. Image 1 is material/style reference for the outside of this SAME Chinese herbalist lodge.
16:9 landscape 2.5D orthographic top-down RPG room at intended logical size 480x270. Camera faces the rear wall straight-on from above, no vanishing point and no diamond isometric rotation. Match the reference's deep warm wood, ivory plaster, muted jade and blue-grey stone, amber lanterns; crisp deliberate pixel clusters, same detailed retro Chinese fantasy style, quiet low-noise floor.
CRITICAL LAYOUT: rear wall occupies ONLY TOP 20% of frame, lower edge at y=55 in 270px coordinates. 80% of image below is EMPTY walkable slate floor extending edge to edge, except narrow 12px side boundary strips. Rear wall contains carved wooden uprights, paper lattice windows at x=90 and x=370, amber wall lamps at x=160 and x=320, shallow inset apothecary drawer niches and hanging dried herbs WITHIN WALL ONLY. No furniture on floor. Left and right walls are thin cutaway strips, no roof. Bottom wall omitted entirely, a modest flat wooden doorway threshold centered at x=240,y=244. Floor is horizontal staggered grey-blue stone, very low-contrast coherent slabs, few chips, sparse shadow bands. Keep all center floor open.
Do NOT include bed, table, cauldron, chairs, rugs, freestanding columns, people, labels, text, UI, borders, perspective vanishing point, diagonal rotated room, giant wall, bloom, depth of field or random pixel noise. No black padding. Fill whole 16:9 image. This will be a gameplay layer with separate sprites added later.

## 卧榻

Use case: stylized-concept. One isolated production pixel RPG furniture sprite. Image 1 is a material/style reference only.
A refined Chinese herbalist resting couch / low wooden daybed, wide horizontal orientation, elevated orthographic 2.5D view with visible mattress top and front feet, matching a top-down RPG. Deep warm walnut wood, elegant carved rails at left/right ends and a low back rail, ivory pillow at left, folded muted jade-green quilt across mattress, thin ochre textile trim. Adult bed, not miniature toy. Fine crisp deliberate pixel clusters, restrained detail matching the reference, broad coherent cloth folds, no noisy grain, no blur, no thick cartoon outline. Upper-left warm light with cool slate shadows.
Genuinely transparent background, full isolated bed visible, generous clear margin on all sides. No canopy, no curtains, no floor, no ground shadow outside feet, no other furniture, no people, no text. Intended in-game width 88 pixels and height about 52 pixels, ratio around 1.7:1. Flat horizontal ground baseline. Single sprite only, not a sheet.

## 炼丹台

Use case: stylized-concept. One production transparent furniture sprite for the interior of the Chinese herbalist lodge in image 1 (style/material reference).
An elegant low apothecary alchemy workbench, wide horizontal wooden table with a compact bronze-and-jade three-legged lidded pill furnace at its center; brass handles and restrained cloud carvings, tiny amber fire opening. On left of table a mortar and herb tray; on right two small jade ceramic medicine jars and one rolled parchment. All form ONE compact connected workstation.
Elevated orthographic 2.5D RPG camera, visible table top, straight horizontal front edge, subtly visible right side; not diamond isometric. Deep warm walnut with ochre edge highlights, cool patinated bronze/jade furnace, parchment/ivory accents, dark fine outlines. Same refined retro pixel clusters as reference, coherent material shapes readable at intended in-game 96px width, total height about 65px, 1.5:1 aspect. Furnace must not become a giant spherical pot. Upper-left illumination, no noisy grain or smooth rendering.
Genuinely transparent background with generous padding, full object and feet visible, no floor or shadow outside feet, no people, no writing/text/UI, no surrounding room or extra shelves, no massive magical glow. Single sprite not sheet.
