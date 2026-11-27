#!/usr/bin/env python3
"""ART18b: build pixel-grid layers (117x117, same grid as the card art; shown pixelated). python3 tools/build.py"""
import os, random, math
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.path.join(R,'..','..','..','assets','cards','golden-eagle-diver.png')
im=Image.open(SRC).convert('RGBA'); a=np.array(im).astype(int); N=117
r,g,b=a[...,0],a[...,1],a[...,2]
# bird key: warm (gold / brown) pixels against blue sky and white-blue cloud
key=(r>b+8)|((r<90)&(r>b-4)&(g<70))      # + very dark brown shadow pixels
key=ndi.binary_closing(key,iterations=1)
lab,n=ndi.label(key); sizes=ndi.sum(key,lab,range(1,n+1)); big=lab==(1+int(np.argmax(sizes)))
for i,s in enumerate(sizes):            # pieces near the body (talons, feather tips)
    if s>=3 and ndi.binary_dilation(big,iterations=3)[lab==i+1].any(): big|=lab==i+1
big=ndi.binary_fill_holes(big)
mask=big
out=np.zeros((N,N,4),np.uint8); out[mask]=a[mask].astype(np.uint8)
Image.fromarray(out).save(os.path.join(R,'layers','bird.png'),optimize=True)
print('bird px',mask.sum(),'of',N*N)
def save(arr,name): Image.fromarray(arr.astype(np.uint8)).save(os.path.join(R,'layers',name),optimize=True)
def line(canvas,x0,y0,x1,y1,col):
    dx,dy=abs(x1-x0),-abs(y1-y0); sx=1 if x0<x1 else -1; sy=1 if y0<y1 else -1; e=dx+dy
    while True:
        if 0<=x0<N and 0<=y0<N: canvas[y0,x0]=col
        if x0==x1 and y0==y1: break
        e2=2*e
        if e2>=dy: e+=dy; x0+=sx
        if e2<=dx: e+=dx; y0+=sy
W=(240,248,255,255); W2=(190,215,240,255); GOLD=(255,214,110,255)
# V1 radial: 3 line sets (flicker), streaks from the card edge toward the eagle's head/chest
cx,cy=56,64
for k in range(3):
    c=np.zeros((N,N,4)); rnd=random.Random(10+k)
    for i in range(26):
        ang=(i+rnd.random()*.8)/26*2*math.pi
        rin=rnd.uniform(34,48); rl=rnd.uniform(12,26)
        # push endpoints to the card edge region
        x0=round(cx+math.cos(ang)*(rin+28)); y0=round(cy+math.sin(ang)*(rin+28))
        x1=round(cx+math.cos(ang)*(rin+28-rl)); y1=round(cy+math.sin(ang)*(rin+28-rl))
        col=W if i%3 else W2
        line(c,x0,y0,x1,y1,col)
        if i%2: line(c,x0+1,y0,x1+1,y1,col)
    save(c,f'radial{k}.png')
# V2 diagonal wind: seamless tile 117x117 translating (+117,-117) along 45deg (trailing up-right); bird heads down-left
def diag(seed,count,cols,minl,maxl):
    c=np.zeros((N,N,4)); rnd=random.Random(seed)
    for i in range(count):
        thick=i%3==0
        L=rnd.randint(minl,maxl); x=rnd.randrange(N); y=rnd.randrange(N)
        col=rnd.choice(cols)
        for t in range(L):          # wraps so the tile is seamless
            c[(y-t)%N,(x+t)%N]=col
            if thick: c[(y-t)%N,(x+t+1)%N]=col
    return c
save(diag(21,16,[W,W2],10,26),'wind_back.png')
save(diag(33,7,[W],12,30),'wind_front.png')
# V3 smear: bird silhouette copies trailing up-right, hard steps, pale gold
sm=np.zeros((N,N,4))
for step,(dx,dy,al) in enumerate([(4,-4,150),(8,-8,105),(12,-12,70),(16,-16,40)]):
    sh=np.zeros_like(mask); sh[max(0,dy):N+min(0,dy)] if False else None
    m2=np.roll(np.roll(mask,dy,0),dx,1)
    col=(235,245,255,al)
    for k in range(4): pass
    sm[m2&~mask&(sm[...,3]==0)]=col
save(sm,'smear.png')
# smear: second set offset by 2 for 2-frame jitter
sm2=np.zeros((N,N,4))
for (dx,dy,al) in [(6,-6,140),(10,-10,95),(14,-14,60),(18,-18,32)]:
    m2=np.roll(np.roll(mask,dy,0),dx,1); sm2[m2&~mask&(sm2[...,3]==0)]=(235,245,255,al)
save(sm2,'smear2.png')
# V3 few short streaks to go with the smear
c=np.zeros((N,N,4)); rnd=random.Random(5)
for i in range(9):
    x=rnd.randrange(55,N); y=rnd.randrange(0,60); 
    for t in range(rnd.randint(8,16)):
        if 0<=x+t<N and 0<=y-t<N: c[y-t,x+t]=GOLD if i%2 else W
save(c,'smear_lines.png')
