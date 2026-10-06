-- Aseprite registration and export only; not a claim of hand-pixelled production.
local root=app.params.root
local pc=app.pixelColor
local function export(im,id)
 local s=Sprite(im.width,im.height,ColorMode.RGB);s.cels[1].image=im
 s:saveAs(root..'/docs/production/lodge-v2/'..id..'.aseprite')
 im:saveAs(root..'/public/assets/lodge-v2/'..id..'.png');s:close()
 print(id..' '..im.width..'x'..im.height)
end
local function resize(im,b,w,h)
 local out=Image(w,h,ColorMode.RGB)
 for y=0,h-1 do for x=0,w-1 do
  local p=im:getPixel(b[1]+math.min(b[3]-1,math.floor((x+.5)*b[3]/w)),b[2]+math.min(b[4]-1,math.floor((y+.5)*b[4]/h)))
  if pc.rgbaA(p)>=128 then out:drawPixel(x,y,pc.rgba(pc.rgbaR(p),pc.rgbaG(p),pc.rgbaB(p),255)) end
 end end
 return out
end
local room=Image{fromFile=root..'/docs/production/lodge-v2/source/room.png'}
export(resize(room,{0,0,room.width,room.height},480,270),'room')
for _,spec in ipairs({{'bed',100},{'workbench',104}}) do
 local im=Image{fromFile=root..'/docs/production/lodge-v2/source/'..spec[1]..'.png'}
 local l,t,r,b=im.width,im.height,-1,-1
 for y=0,im.height-1 do for x=0,im.width-1 do
  if pc.rgbaA(im:getPixel(x,y))>=128 then l=math.min(l,x);t=math.min(t,y);r=math.max(r,x);b=math.max(b,y) end
 end end
 assert(l>0 and t>0 and r<im.width-1 and b<im.height-1,'Asset lacks transparent padding: '..spec[1])
 local w=spec[2];local h=math.floor((b-t+1)/(r-l+1)*w+.5)
 local out=Image(w+4,h+4,ColorMode.RGB);out:drawImage(resize(im,{l,t,r-l+1,b-t+1},w,h),Point(2,2))
 export(out,spec[1])
end
