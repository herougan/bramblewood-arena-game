#!/usr/bin/env python3
"""Hand-authored depth map for art/splash.png (white = near, black = far).
No ML model is reachable from the build sandbox, so the depth is built from the scene's known
layout plus colour masks: sky far, ground rising toward the viewer, otters and hummingbirds
standing in front of the ground they're on, and the flower/leaf frame nearest of all.
    python3 tools/make_splash_depth.py   ->  art/splash_depth.png
"""
import numpy as np
from PIL import Image, ImageFilter
import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
im = np.asarray(Image.open(os.path.join(ROOT, 'art/splash.png')).convert('RGB')).astype(float) / 255
H, W, _ = im.shape
r, g, b = im[..., 0], im[..., 1], im[..., 2]
yy, xx = np.mgrid[0:H, 0:W]
u, v = xx / (W - 1), yy / (H - 1)
smooth = lambda a, b, x: np.clip((x - a) / (b - a), 0, 1) ** 2 * (3 - 2 * np.clip((x - a) / (b - a), 0, 1))

# 1. ground plane: far at the horizon (~0.40 down), near at the bottom; sky behind everything
horizon = 0.40
depth = 0.12 + 0.6 * smooth(horizon, 1.0, v)
sky = (b > r + 0.05) & (b > g) & (v < horizon + 0.02)
depth[v < horizon] = 0.06 + 0.06 * (v[v < horizon] / horizon)   # distant hills/treeline
cloudsun = (v < 0.25) & ((r + g + b) / 3 > 0.75)
depth[sky] = 0.02
depth[cloudsun] = 0.04

# 2. characters stand in front of the ground under them
def box(x0, x1, y0, y1):
    return (u >= x0) & (u <= x1) & (v >= y0) & (v <= y1)
brown = (r > g) & (g > b) & (r - b > 0.15) & (r < 0.85)
otters = box(0.12, 0.41, 0.36, 0.80) & brown
def close(mask, n=5):
    m = Image.fromarray((mask*255).astype(np.uint8), 'L').filter(ImageFilter.MaxFilter(n)).filter(ImageFilter.MinFilter(n))
    return np.asarray(m) > 127
otters = close(otters, 5) & box(0.12, 0.41, 0.36, 0.80)
depth[otters] = 0.78
birds_zone = box(0.57, 0.93, 0.18, 0.70)
grass = (g > r + 0.08) & (g > b + 0.05)
river = (b > r + 0.15) & (b > g)
birds = close(birds_zone & ~grass & ~river & ~sky, 3) & birds_zone
depth[birds] = np.maximum(depth[birds], 0.66 + 0.12 * v[birds])

# 3. the flower/leaf frame at the edges is nearest
edge = np.maximum(smooth(0.22, 0.0, u), smooth(0.86, 1.0, u)) * smooth(0.10, 0.45, v)
frame = edge > 0.35
depth[frame & ~otters] = np.maximum(depth[frame & ~otters], 0.82 + 0.15 * edge[frame & ~otters])
bottom = smooth(0.86, 1.0, v)
corner = (bottom > 0) & (np.abs(u - 0.5) > 0.2)
depth[corner] = np.maximum(depth[corner], 0.75 + 0.2 * bottom[corner])

img = Image.fromarray((np.clip(depth, 0, 1) * 255).astype(np.uint8), 'L')
img = img.filter(ImageFilter.GaussianBlur(1.2))   # soften seams so the parallax doesn't tear

# 4. water mask (green channel): only the river ripples and glints. The shader used to guess water
#    from "blue in the lower half", which also rippled blue hummingbirds and blue flowers.
#    Keep the largest connected blue region below the horizon (the river), close small gaps
#    (foam, glints), and feather the edge.
from scipy import ndimage
blue = (b > r + 0.12) & (b > g) & (v > horizon + 0.05)
lab, n = ndimage.label(blue)
sizes = ndimage.sum(blue, lab, range(1, n + 1))
water = lab == (int(np.argmax(sizes)) + 1)
water = ndimage.binary_closing(water, iterations=3)
water = ndimage.binary_fill_holes(water)
wimg = Image.fromarray((water * 255).astype(np.uint8), 'L').filter(ImageFilter.GaussianBlur(1.0))
out = Image.merge('RGB', (img, wimg, Image.new('L', img.size, 0)))
out.save(os.path.join(ROOT, 'art/splash_depth.png'), optimize=True)
print('wrote art/splash_depth.png (R = depth, G = water mask)', out.size, 'water px', int(water.sum()))
