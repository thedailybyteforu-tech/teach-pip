import cv2, numpy as np, sys

def white_to_alpha(path, out, size=None, tol=26, pocket=400):
    im = cv2.imread(path, cv2.IMREAD_COLOR)
    h, w = im.shape[:2]
    f = im.astype(np.float32)
    # Distance from white; background = near-white pixels connected to the border.
    dist = np.linalg.norm(255.0 - f, axis=2)
    cand = (dist < tol).astype(np.uint8)
    n, lab = cv2.connectedComponents(cand)
    border = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
    areas = np.bincount(lab.ravel())
    # Background = near-white regions touching the border, plus enclosed white pockets (e.g. between
    # an arm and the body). Cream clothing is not near-white enough to be caught.
    ids = [i for i in range(1, len(areas)) if i in border or areas[i] > pocket]
    bgm = np.isin(lab, ids)
    # Soft edge: alpha ramps from 0 (pure white) to 1 (clearly coloured) near the boundary.
    alpha = np.clip((dist - 8) / 34.0, 0, 1)
    near = cv2.dilate(bgm.astype(np.uint8), np.ones((9, 9), np.uint8)) > 0
    a = np.where(bgm, 0.0, np.where(near, alpha, 1.0))
    # Remove white fringe: un-premultiply colour against white in the soft band.
    col = f.copy()
    soft = (a > 0) & (a < 1)
    af = np.maximum(a[..., None], 1e-3)
    col[soft] = np.clip((f[soft] - 255.0 * (1 - af[soft])) / af[soft], 0, 255)
    a8 = (a * 255).astype(np.uint8)
    # Keep the main subject only, drop specks.
    n2, lab2, st, _ = cv2.connectedComponentsWithStats((a8 > 12).astype(np.uint8))
    if n2 > 1:
        biggest = st[1:, cv2.CC_STAT_AREA].max()
        for k in range(1, n2):
            if st[k, cv2.CC_STAT_AREA] < biggest * 0.004:  # specks only; real parts are far larger
                a8[lab2 == k] = 0
    rgba = np.dstack([col.astype(np.uint8), a8])
    ys, xs = np.where(a8 > 8)
    rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    if size:
        s = size / max(rgba.shape[:2])
        rgba = cv2.resize(rgba, (int(rgba.shape[1] * s), int(rgba.shape[0] * s)), interpolation=cv2.INTER_AREA)
    cv2.imwrite(out, rgba)
    return rgba

def preview(rgba, out, colors=((150, 200, 235), (70, 60, 110))):
    tiles = []
    for c in colors:
        a = rgba[:, :, 3:4] / 255.0
        bg = np.full(rgba[:, :, :3].shape, c, np.uint8)
        tiles.append((rgba[:, :, :3] * a + bg * (1 - a)).astype(np.uint8))
    cv2.imwrite(out, np.hstack(tiles))

if __name__ == '__main__':
    r = white_to_alpha(sys.argv[1], sys.argv[2]); preview(r, sys.argv[2].replace('.png', '_prev.png')); print(r.shape)
