import numpy as np, cv2
from scipy import ndimage as ndi
src=cv2.imread('/home/claude/bramblewood-arena-game/assets/cards/abyss-lantern-squid.webp')  # BGR 256
hsv=cv2.cvtColor(src,cv2.COLOR_BGR2HSV).astype(int)
H,S,V=hsv[...,0]*2,hsv[...,1],hsv[...,2]
rgb=src[...,::-1].astype(int)
R,G,B=rgb[...,0],rgb[...,1],rgb[...,2]
orange=(H>=5)&(H<=48)&(S>80)&(V>70)&(R>G)&(G>=B)
# pale fins: light grey/white, only inside the squid's neighbourhood and not blue
pale=(V>110)&(S<90)&(R>=B-10)
cyan=(H>=170)&(H<=205)&(S>80)&(V>140)
# lantern region (separate object): box
yy,xx=np.mgrid[:256,:256]
lant=(xx>50)&(xx<95)&(yy<90)
body=orange|pale|((R>B+6)&(R>G-4)&(V>25)&(S>30))
body&=~lant
body=ndi.binary_closing(body,iterations=2)
lab,n=ndi.label(body); sizes=ndi.sum(body,lab,range(1,n+1))
big=1+int(np.argmax(sizes)); cx=ndi.binary_dilation(lab==big,iterations=10)
keep=np.zeros_like(body)
for i,s in enumerate(sizes):
    if (lab==i+1)[cx].any(): keep|=lab==i+1
body=keep
# cyan spots inside body hull
hull=ndi.binary_fill_holes(ndi.binary_closing(body,iterations=3))
spots=cyan&hull&~lant
body=body|ndi.binary_fill_holes(body|spots)
body=ndi.binary_fill_holes(body)
np.save('/tmp/art17/body.npy',body)
cv2.imwrite('/tmp/art17/bodymask.png',(body*255).astype(np.uint8))
# lantern: bright cyan/blue glow + metal cap
lantglow=((H>=170)&(H<=225)&(V>120)&(S>60))&lant
lantglow=ndi.binary_fill_holes(ndi.binary_closing(lantglow,iterations=2))
np.save('/tmp/art17/lantglow.npy',lantglow)
cv2.imwrite('/tmp/art17/lantmask.png',(lantglow*255).astype(np.uint8))
print(body.sum(),lantglow.sum())
