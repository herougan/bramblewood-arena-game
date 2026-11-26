import numpy as np, cv2
from scipy import ndimage as ndi
from PIL import Image
OUT='/home/claude/bramblewood-arena-game/docs/perf/art17/layers/'
import os; os.makedirs(OUT,exist_ok=True)
src=cv2.imread('/home/claude/bramblewood-arena-game/assets/cards/abyss-lantern-squid.webp')
m=np.load('body.npy')
hsv=cv2.cvtColor(src,cv2.COLOR_BGR2HSV).astype(int); H,S,V=hsv[...,0]*2,hsv[...,1],hsv[...,2]
up=lambda a: np.repeat(np.repeat(a,2,0),2,1)
# --- body: erode one source px of edge colour contamination, recolour the ring from the inside
core=ndi.binary_erosion(m,iterations=1)
ring=m&~core
body_rgb=src.copy()
body_rgb=cv2.inpaint(src,(ring|~m).astype(np.uint8)*255,2,cv2.INPAINT_TELEA)  # colours pulled in from the core
# alpha: keep full mask (ring pixels now recoloured to inside colour), then trim 1px at 512 for crispness
a=up(m.astype(np.uint8))
a=ndi.binary_erosion(a,iterations=1).astype(np.uint8)*255
body=np.dstack([up(body_rgb),a])
# --- bg: remove squid (grown), keep everything else
grow=ndi.binary_dilation(m,iterations=6)
bg=cv2.inpaint(src,grow.astype(np.uint8)*255,6,cv2.INPAINT_TELEA)
# --- glow layers (bloom of the cyan pixels, normal blend, pre-multiplied look: colour = bright cyan)
cy=((H>=165)&(H<=210)&(S>70)&(V>150))
lant=np.zeros_like(cy); lant[:,:]=False; lant[20:90,50:95]=True
gl_lure=cy&lant&~m; gl_body=cy&m
# the eye highlight: near-white pixels inside the head
eye=np.zeros_like(cy); eye[120:136,118:132]=True
gl_body|= (V>200)&(S<60)&eye&m
def bloom(mask,gain,sig):
    f=up(mask.astype(np.float32))
    core=cv2.GaussianBlur(f,(0,0),1.2); halo=cv2.GaussianBlur(f,(0,0),sig)
    al=np.clip(core*0.45+halo*gain,0,1)
    col=np.zeros((512,512,3),np.float32); col[...]=(255,235,120)  # BGR light cyan
    col=np.where(f[...,None]>0.5,up(src.astype(np.float32)*0+np.clip(src.astype(np.float32)*1.0+30,0,255)),col)
    return np.dstack([col.astype(np.uint8),(al*255).astype(np.uint8)])
glow_lure=bloom(gl_lure,2.2,10); glow_body=bloom(gl_body,1.6,4)
def save(name,arr,q=88):
    rgba=arr if arr.shape[2]==4 else np.dstack([arr,np.full(arr.shape[:2],255,np.uint8)])
    im=Image.fromarray(cv2.cvtColor(rgba[...,:3],cv2.COLOR_BGR2RGB)); 
    if arr.shape[2]==4: im.putalpha(Image.fromarray(rgba[...,3]))
    else: im=im.convert('RGB')
    im.save(OUT+name+'.webp',quality=q,method=6,alpha_quality=100)
    print(name,os.path.getsize(OUT+name+'.webp')//1024,'KB')
save('bg',up(bg)); save('body',body); save('glow_lure',glow_lure,80); save('glow_body',glow_body,80)
# 256 flat for the fallback is the shipped one; also 512 nearest copy for fair comparison
cv2.imwrite('flat512.png',up(src))
