-- Aseprite source isolation. Deliberately crop actual subjects, not entire sheets.
local root=app.params.root
local pc=app.pixelColor
local function saveReference(source, crop, name)
  local input=Image{fromFile=root..source}
  local im=Image(crop[3],crop[4],ColorMode.RGB)
  for y=0,im.height-1 do for x=0,im.width-1 do
    local p=input:getPixel(x+crop[1],y+crop[2])
    local r,g,b,a=pc.rgbaR(p),pc.rgbaG(p),pc.rgbaB(p),pc.rgbaA(p)
    if a<128 or (name=='healer' and ((r>230 and g>230 and b>230) or (math.max(r,g,b)-math.min(r,g,b)<8 and r>120))) then
      p=pc.rgba(245,245,245,255)
    end
    im:drawPixel(x,y,p)
  end end
  local canvas=Image(768,640,ColorMode.RGB);canvas:clear(pc.rgba(245,245,245,255))
  local scale=math.min(620/im.width,540/im.height)
  im:resize{width=math.floor(im.width*scale),height=math.floor(im.height*scale)}
  canvas:drawImage(im,Point(math.floor((768-im.width)/2),math.floor((640-im.height)/2)))
  canvas:saveAs(root..'/docs/production/visual-v1/'..name..'-reference.png')
end
saveReference('/public/assets/world-v2/healer.png',{278,156,218,542},'healer')
saveReference('/docs/production/visual-v1/lodge-blockout.png',{0,0,768,640},'lodge')
