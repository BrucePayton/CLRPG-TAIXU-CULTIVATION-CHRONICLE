-- Non-destructive Aseprite format/scale preparation. Generated sources are kept.
-- This is not hand-drawn pixel cleanup or a visual approval.
local root=app.params.root
local pc=app.pixelColor
local function bounds(im,x0,y0,w,h)
 local l,t,r,b=x0+w,y0+h,-1,-1
 for y=y0,y0+h-1 do for x=x0,x0+w-1 do
  if pc.rgbaA(im:getPixel(x,y))>=128 then l=math.min(l,x);t=math.min(t,y);r=math.max(r,x);b=math.max(b,y) end
 end end
 assert(r>=l,'Empty crop');return {l,t,r-l+1,b-t+1}
end
local function scaled(im,box,w,h)
 local out=Image(w,h,ColorMode.RGB)
 for y=0,h-1 do for x=0,w-1 do
  local p=im:getPixel(box[1]+math.min(box[3]-1,math.floor((x+.5)*box[3]/w)),box[2]+math.min(box[4]-1,math.floor((y+.5)*box[4]/h)))
  if pc.rgbaA(p)>=128 then out:drawPixel(x,y,pc.rgba(pc.rgbaR(p),pc.rgbaG(p),pc.rgbaB(p),255)) end
 end end
 return out
end
local function save(im,name)
 local spr=Sprite(im.width,im.height,ColorMode.RGB);spr.cels[1].image=im
 spr.layers[1].name='prepared-generated-source'
 spr:saveAs(root..'/docs/production/camp-v2/'..name..'.aseprite')
 im:saveAs(root..'/public/assets/camp-v2/'..name..'.png');spr:close()
 print(name..' '..im.width..'x'..im.height)
end
for _,spec in ipairs({{'lodge',146},{'pine',100}}) do
 local im=Image{fromFile=root..'/docs/production/camp-v2/source/'..spec[1]..'.png'}
 local b=bounds(im,0,0,im.width,im.height)
 assert(b[3]<im.width and b[4]<im.height,'Source requires transparent margins')
 local h=spec[2];local w=math.floor(b[3]/b[4]*h+.5)
 local out=Image(w+4,h+4,ColorMode.RGB);out:drawImage(scaled(im,b,w,h),Point(2,2));save(out,spec[1])
end
-- Average-filter and restrained ramp conversion removes high-frequency stone noise.
-- First eight complete brick rows; this crop avoids the partial bottom row.
local stone=Image{fromFile=root..'/docs/production/camp-v2/source/stone.png'}
local out=Image(96,96,ColorMode.RGB)
local sh=math.floor(stone.height*8/9)
for y=0,95 do for x=0,95 do
 local sum,n=0,0
 for yy=math.floor(y*sh/96),math.floor((y+1)*sh/96)-1 do
  for xx=math.floor(x*stone.width/96),math.floor((x+1)*stone.width/96)-1 do
   local p=stone:getPixel(xx,yy);sum=sum+(pc.rgbaR(p)+pc.rgbaG(p)+pc.rgbaB(p))/3;n=n+1
  end
 end
 local v=math.floor((sum/n-65)/9+.5)*5+68;v=math.max(57,math.min(103,v))
 out:drawPixel(x,y,pc.rgba(v-7,v+4,v+6,255))
end end
-- Register opposite border pixels for a periodic tile, including corners.
local function average(a,b)
 return pc.rgba(math.floor((pc.rgbaR(a)+pc.rgbaR(b))/2),math.floor((pc.rgbaG(a)+pc.rgbaG(b))/2),math.floor((pc.rgbaB(a)+pc.rgbaB(b))/2),255)
end
for y=0,95 do local p=average(out:getPixel(0,y),out:getPixel(95,y));out:drawPixel(0,y,p);out:drawPixel(95,y,p) end
for x=0,95 do local p=average(out:getPixel(x,0),out:getPixel(x,95));out:drawPixel(x,0,p);out:drawPixel(x,95,p) end
save(out,'stone')
local healer=Image{fromFile=root..'/docs/production/camp-v2/source/healer.png'}
local boxes={};local tallest=0
for row=0,2 do for col=0,3 do
 local x0=math.floor(col*healer.width/4);local x1=math.floor((col+1)*healer.width/4)
 local y0=math.floor(row*healer.height/3);local y1=math.floor((row+1)*healer.height/3)
 local b=bounds(healer,x0,y0,x1-x0,y1-y0);boxes[row*4+col+1]=b;tallest=math.max(tallest,b[4])
end end
local atlas=Image(576,58,ColorMode.RGB)
-- Runtime order: south idle/blink, north idle/blink, west, east, four work poses.
for index,source in ipairs({1,5,2,2,3,7,4,8,9,10,11,12}) do
 local b=boxes[source];local w=math.floor(b[3]*51/tallest+.5);local h=math.floor(b[4]*51/tallest+.5)
 atlas:drawImage(scaled(healer,b,w,h),Point((index-1)*48+math.floor((48-w)/2),56-h))
 print('healer frame '..index..' source '..source..' bounds '..table.concat(b,','))
end
save(atlas,'healer-atlas')
