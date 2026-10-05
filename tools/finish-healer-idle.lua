-- Select only four-direction standing/blink poses. Walk candidates are NOT approved.
local root=app.params.root;local pc=app.pixelColor
local source=Image{fromFile=root..'/docs/production/visual-v1/healer-directions-candidate.png'}
local sprite=Sprite(48,58,ColorMode.RGB);sprite.layers[1].name='complete-body'
local sheet=Image(48*12,58,ColorMode.RGB)
local direction={'south','north','west','east'}
local baselines={247,249,246,246}
for row=0,3 do for col=0,1 do
  local frame=row*2+col+1
  if frame>1 then sprite:newEmptyFrame() end
  local im=Image(48,58,ColorMode.RGB)
  -- Uniform body scale, pelvis registration; never per-frame bounding-box stretching.
  for y=0,57 do for x=0,47 do
    local sx=math.floor(64+col*224+114+(x-24)/.216)
    local sy=math.floor(row*250+baselines[row+1]+(y-56)/.216)
    if sx>=64+col*224 and sx<288+col*224 and sy>=row*250+(row>0 and 10 or 0) and sy<(row+1)*250 then
      local p=source:getPixel(sx,sy)
      if pc.rgbaA(p)>=224 then im:drawPixel(x,y,pc.rgba(pc.rgbaR(p),pc.rgbaG(p),pc.rgbaB(p),255)) end
    end
  end end
  if frame==1 then sprite.cels[1].image=im else sprite:newCel(sprite.layers[1],frame,im,Point(0,0)) end
  sprite.frames[frame].duration=col==0 and 3.88 or .12
  sheet:drawImage(im,Point((frame-1)*48,0))
end
  local tag=sprite:newTag(row*2+1,row*2+2);tag.name=direction[row+1]..'-idle'
end
local work=Image{fromFile=root..'/docs/production/visual-v1/healer-work-sheet.png'}
local centers={298,780,1280,1770}
local ratio=work.width/2048
for col=0,3 do
  local im=Image(48,58,ColorMode.RGB)
  for y=0,57 do for x=0,47 do
    local sx,sy=math.floor((centers[col+1]+(x-24)/.0807)*ratio),math.floor((660+(y-56)/.0807)*ratio)
    if sx>=col*512*ratio and sx<(col+1)*512*ratio and sy>=0 and sy<work.height then
      local p=work:getPixel(sx,sy)
      if pc.rgbaA(p)>=224 then im:drawPixel(x,y,pc.rgba(pc.rgbaR(p),pc.rgbaG(p),pc.rgbaB(p),255)) end
    end
  end end
  sprite:newEmptyFrame();sprite:newCel(sprite.layers[1],9+col,im,Point(0,0));sprite.frames[9+col].duration=({.8,.35,1.1,.4})[col+1]
  sheet:drawImage(im,Point((8+col)*48,0))
end
local tag=sprite:newTag(9,12);tag.name='inspect-herb'
sprite:saveAs(root..'/docs/production/visual-v1/healer-atlas.aseprite')
sheet:saveAs(root..'/public/assets/camp-v1/healer-atlas.png')
local preview=Image(sheet.width*4,sheet.height*4,ColorMode.RGB)
for y=0,preview.height-1 do for x=0,preview.width-1 do preview:drawPixel(x,y,sheet:getPixel(math.floor(x/4),math.floor(y/4))) end end
preview:saveAs(root..'/docs/production/visual-v1/healer-atlas-4x.png')
