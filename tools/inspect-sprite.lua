local image=Image{fromFile=app.params.file}
local transparent,opaque,partial=0,0,0
local buckets={0,0,0,0,0,0,0,0}
for p in image:pixels() do local a=app.pixelColor.rgbaA(p());if a==0 then transparent=transparent+1 elseif a==255 then opaque=opaque+1 else partial=partial+1 end;buckets[math.min(8,math.floor(a/32)+1)]=buckets[math.min(8,math.floor(a/32)+1)]+1 end
print(json.encode{width=image.width,height=image.height,transparent=transparent,opaque=opaque,partial=partial,buckets=buckets})
