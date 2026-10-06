# 营地 V2 生成提示词

实际工具：内置 image_gen。Aseprite 仅做后续尺度、alpha 与纹理格式整理；本轮未调用 ComfyUI 或 Blender。

参考：`docs/production/style-v2/candidate-02.png`，医师另参考 `public/assets/hero-atlas.png`。

## 药庐

Use case: stylized-concept. Production game sprite, NOT an illustration.
Image 1 is an art direction reference only. Create JUST ONE complete isolated Chinese mountain herbalist lodge matching the jade slate roof, dark weathered wood, ivory plaster, warm amber lanterns in that reference, but redraw as clean small-resolution retro pixel game art.
Camera: elevated orthographic 2.5D RPG, near frontal facade, visible roof top and a small right side, not steep diamond isometric. Front entrance centered, wide low building. Full object including roof tips and shallow front step visible, 8% empty margin on every side. Genuinely transparent background, no ground patch, no trees, no people, no text/signage, no shadow extending beyond foundation.
Designed to occupy approximately 210x146 GAME PIXELS: small clearly defined pixel clusters, medium detail; use broad contiguous color planes, 3-4 shade ramps per material, dark warm wood frames, grouped roof tiles rather than noisy individually textured shingles. Doorway about one third building height so 51px tall adult fits. Two restrained lanterns. Cool blue-grey/jade roof, parchment wall, ochre light; upper-left illumination. Deliberate crisp stepped edges and fine outlines matching retro Chinese fantasy sprites, no thick cartoon outlines, no grain, no tiny random speckles, no gradients, no blur, no realistic rendering. Produce a single horizontal building sprite, not sheet, no surrounding landscape.

## 松树

Use case: stylized-concept. One production pixel-game prop sprite with genuinely transparent background.
Reference image is art direction only. Create ONE Chinese mountain pine tree in matching slate-jade and warm brown palette. Full crown and roots visible with transparent 8% margin. Elevated orthographic 2.5D RPG view, subtly visible tops of canopy; no landscape or ground island. Trunk bottom centered for a game ground pivot.
Intended logical size about 95x110 pixels, rendered in deliberate crisp pixel-art clusters with clean stepped outline; branches form 4 to 6 graceful layered horizontal canopies, thin dark branches and recognizable twisted warm grey-brown trunk. Canopies should have broad cohesive dark teal shadow masses with clustered muted jade highlights, no isolated needle noise. One or two small gaps reveal transparent background. Upper-left lighting. Restrained mature traditional Chinese fantasy, NOT a cartoon bonsai, NOT a bush on a pole. Preserve airy asymmetrical pine silhouette, avoid bulky spherical foliage or chunky voxel blocks. Limited material shade ramps, no smooth painterly gradients, no antialias blur, no ground shadow, no text, no other objects.

## 地面

Use case: stylized-concept. Asset type: seamless game ground texture.
Make a square opaque tileable texture of quiet blue-grey slate courtyard paving for the Chinese fantasy pixel RPG in the reference. Texture ONLY, no perspective scene, no objects, no foliage, no shadows from props, no text. Orthographic overhead surface, horizontal staggered rectangular stone blocks suitable for elevated RPG ground (wide low stones). Logical tile about 96x96 pixels, around four columns by eight rows of stones, low contrast thin dark seams. Broad flat stone faces with only one or two coherent lighter edge clusters, very sparse chips; subtle muted jade-grey variation. 8-12 restrained colors, deliberate clean pixel clusters, no grain, noise, stippling, cracks everywhere or ornate focal motifs. Fill entire square edge-to-edge; opposite edges match seamlessly. Keep it quiet enough behind a 51px-tall detailed character. Upper-left edge highlights but no strong cast shadows.

## 医师

Use case: stylized-concept. Production character sprite atlas for a Chinese xianxia pixel RPG.
Image 1: original hero sheet is ONLY reference for adult body proportions, pixel treatment and consistent orthographic RPG directions. Image 2: art-direction scene supplies physician costume (ivory/slate long robe, russet belt, black tied hair, herb basket).
Create ONE healer character sheet on genuine transparent background, exactly 4 columns and 3 rows of equally sized cells. No borders, labels, UI or other characters. Every cell contains the same full adult male physician, never chibi. Slender approximately 6.5 heads tall, mature calm face; same body scale as original hero; ivory robe, slate collar, brown/russet sash, simple shoes, small herb basket on back. No sword. Warm highlights, cool slate shadows, clear crisp small pixel clusters and thin outline. Low noise, broad readable robe folds. ALL feet at identical baseline within cells, ALL figures same size, padded empty space around each pose. Orthographic mild elevated RPG camera.
Row 1 columns: front/south idle; back/north idle; left/west profile idle; right/east profile idle.
Row 2 columns: same four directions with eyes closed for subtle blink (back is identical neutral).
Row 3 columns: four successive front-facing herb inspection poses, stationary FEET: 1 both hands bring herb sprig to chest, 2 lift sprig near face, 3 gaze down at herb held at chest with elbow slightly lowered, 4 lower hands to belt. Sprig clearly held by hands. No extra table, no walking, no kneeling.
Designed for 51 pixel body height per frame in game. Crisp readable adult sprite silhouettes; avoid detailed illustration, soft shading, inconsistent sizes, caricature heads, cut-off feet or duplicate extraneous figures.
