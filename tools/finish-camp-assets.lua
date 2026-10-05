-- Reproducible Aseprite cleanup and material-specific pixel retouch.
-- This is scripted cleanup, not a claim of hand-drawn animation or user approval.
local root=app.params.root
local pc=app.pixelColor
local function nearest(input,w,h)
  local output=Image(w,h,ColorMode.RGB)
  for y=0,h-1 do for x=0,w-1 do
    output:drawPixel(x,y,input:getPixel(math.min(input.width-1,math.floor((x+.5)*input.width/w)),math.min(input.height-1,math.floor((y+.5)*input.height/h))))
  end end
  return output
end
local function finish(id,path,crop,targetHeight,kind)
  local source=Image{fromFile=root..path}
  local clean=Image(crop[3],crop[4],ColorMode.RGB)
  local minX,minY,maxX,maxY=clean.width,clean.height,0,0
  for y=0,clean.height-1 do for x=0,clean.width-1 do
    local p=source:getPixel(x+crop[1],y+crop[2])
    local r,g,b=pc.rgbaR(p),pc.rgbaG(p),pc.rgbaB(p)
    local bg=math.min(r,g,b)>224
    if kind=='tree' then bg=(math.abs(r-g)<24 and b>=r-8 and b>=g-13) end
    if not bg and pc.rgbaA(p)>127 then
      if kind=='tree' then
        -- Cooler blue-green canopy; preserve warm bark, no runtime tint.
        if g>r*1.12 and g>b*1.18 then p=pc.rgba(math.floor(r*.73),math.floor(g*.87),math.min(255,math.floor(g*.65+b*.25)),255) end
      end
      clean:drawPixel(x,y,p)
      minX=math.min(minX,x);maxX=math.max(maxX,x);minY=math.min(minY,y);maxY=math.max(maxY,y)
    end
  end end
  local cropped=Image(maxX-minX+1,maxY-minY+1,ColorMode.RGB)
  cropped:drawImage(clean,Point(-minX,-minY))
  cropped=nearest(cropped,math.floor(cropped.width*targetHeight/cropped.height+.5),targetHeight)
  if kind=='lodge' then
    -- Add restrained tile grooves only inside the already generated teal roof.
    for y=2,cropped.height-2 do for x=2,cropped.width-2 do
      local p=cropped:getPixel(x,y);local r,g,b=pc.rgbaR(p),pc.rgbaG(p),pc.rgbaB(p)
      if pc.rgbaA(p)>0 and g>r*1.23 and math.abs(g-b)<24 and y<100 then
        if (y-math.floor(x*.09))%7==0 then cropped:drawPixel(x,y,pc.rgba(math.floor(r*.83),math.floor(g*.83),math.floor(b*.83),255))
        elseif (x+math.floor(y/7)*4)%9==0 then cropped:drawPixel(x,y,pc.rgba(math.min(255,r+14),math.min(255,g+15),math.min(255,b+12),255)) end
      end
    end end
  end
  local sprite=Sprite(cropped.width+4,cropped.height+4,ColorMode.RGB)
  sprite.layers[1].name=kind=='lodge' and 'facade-and-foundation' or 'clean-subject'
  local first=Image(sprite.width,sprite.height,ColorMode.RGB)
  local top=Image(sprite.width,sprite.height,ColorMode.RGB)
  for y=0,cropped.height-1 do for x=0,cropped.width-1 do
    local p=cropped:getPixel(x,y)
    if kind=='lodge' and (y<76 or (x>115 and y<96)) then top:drawPixel(x+2,y+2,p)
    else first:drawPixel(x+2,y+2,p) end
  end end
  sprite.cels[1].image=first
  if kind=='lodge' then local layer=sprite:newLayer();layer.name='roof';sprite:newCel(layer,1,top,Point(0,0)) end
  sprite:saveAs(root..'/docs/production/visual-v1/'..id..'.aseprite')
  local output=Image(sprite.spec);output:drawSprite(sprite,1)
  output:saveAs(root..'/public/assets/camp-v1/'..id..'.png')
  -- Actual output at 4x, for review only; not used by the game.
  local review=nearest(output,output.width*4,output.height*4)
  review:saveAs(root..'/docs/production/visual-v1/'..id..'-4x.png')
  sprite:close()
end
finish('healer','/docs/production/visual-v1/healer-candidate.png',{266,46,235,544},51,'healer')
finish('lodge','/docs/production/visual-v1/lodge-candidate.png',{156,150,438,355},146,'lodge')
finish('pine','/public/assets/world-v2/pine.png',{420,20,338,330},100,'tree')
