-- Registration and nearest-neighbour export, not hand-pixel retouch.
local root=app.params.root
local pc=app.pixelColor
for _,spec in ipairs({{'deer',52},{'boar',40},{'wolf',39}}) do
 local id,h=spec[1],spec[2]
 local im=Image{fromFile=root..'/docs/production/beasts-v3/source/'..id..'.png'}
 local l,t,r,b=im.width,im.height,-1,-1
 for y=0,im.height-1 do for x=0,im.width-1 do
  if pc.rgbaA(im:getPixel(x,y))>=128 then l=math.min(l,x);t=math.min(t,y);r=math.max(r,x);b=math.max(b,y) end
 end end
 assert(l>0 and t>0 and r<im.width-1 and b<im.height-1,'Missing transparent margin: '..id)
 local w=math.floor((r-l+1)/(b-t+1)*h+.5)
 local out=Image(w+4,h+4,ColorMode.RGB)
 for y=0,h-1 do for x=0,w-1 do
  local p=im:getPixel(l+math.min(r-l,math.floor((x+.5)*(r-l+1)/w)),t+math.min(b-t,math.floor((y+.5)*(b-t+1)/h)))
  if pc.rgbaA(p)>=128 then out:drawPixel(x+2,y+2,pc.rgba(pc.rgbaR(p),pc.rgbaG(p),pc.rgbaB(p),255)) end
 end end
 local s=Sprite(out.width,out.height,ColorMode.RGB);s.cels[1].image=out
 s:saveAs(root..'/docs/production/beasts-v3/'..id..'.aseprite')
 out:saveAs(root..'/public/assets/beasts-v3/'..id..'.png');s:close()
 print(id..' '..out.width..'x'..out.height)
end
