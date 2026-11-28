# Génère les modèles 3D détaillés des pièces de toupie (.glb) avec Blender en module Python (bpy).
# Lancer : <python avec bpy> outils/blender/toupies.py   → écrit assets/modeles/<piece>.glb
# Installation (une fois, dans un environnement virtuel) : python3 -m venv env && env/bin/pip install bpy
#
# Conventions (doivent correspondre à src/topMesh.js) :
# - unités en mètres, axe de rotation vertical ; chaque pièce part de y = 0 (le jeu la place à la bonne hauteur) ;
# - chaque objet porte un RÔLE dans son nom (« corps », « acier », « sombre ») : le jeu lui applique SES matériaux
#   (couleur de la pièce, motif tourné/moleté, lueur de niveau), comme pour les formes simples ;
# - mêmes dimensions que les formes simples (règle 5 : ce qu'on voit explique ce que fait la pièce).
import math
import os
import bpy
import bmesh

SORTIE = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'modeles')
PAS = 64  # nombre de facettes autour de l'axe


def vider():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def revolution(nom, profil, pas=PAS):
    """Objet de révolution autour de l'axe vertical à partir d'un profil [(rayon, hauteur), ...] (ordre : du bas vers le haut)."""
    bm = bmesh.new()
    verts = [bm.verts.new((r, 0.0, z)) for r, z in profil]
    for a, b in zip(verts, verts[1:]):
        bm.edges.new((a, b))
    geom = bm.verts[:] + bm.edges[:]
    bmesh.ops.spin(bm, geom=geom, cent=(0, 0, 0), axis=(0, 0, 1), angle=2 * math.pi, steps=pas, use_duplicate=False)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-7)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(nom)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(nom, me)
    bpy.context.collection.objects.link(ob)
    lisser(ob)
    return ob


def lisser(ob, angle=35):
    """Ombrage lisse, arêtes vives au-delà de `angle` degrés (les chanfreins restent nets)."""
    for p in ob.data.polygons:
        p.use_smooth = True
    mod = ob.modifiers.new('lissage', 'EDGE_SPLIT')
    mod.split_angle = math.radians(angle)


def objet_actif(nom):
    ob = bpy.context.object
    ob.name = nom
    return ob


def cylindre(nom, r, h, x=0.0, y=0.0, z=0.0, n=16, angle=50):
    bpy.ops.mesh.primitive_cylinder_add(vertices=n, radius=r, depth=h, location=(x, y, z))
    ob = objet_actif(nom)
    lisser(ob, angle)
    return ob


def tore(nom, R, r, z=0.0, n=PAS, m=10):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=n, minor_segments=m, location=(0, 0, z))
    ob = objet_actif(nom)
    lisser(ob, 80)
    return ob


def couronne_vis(nom, n, R, z, r=0.0011):
    for i in range(n):
        a = i * 2 * math.pi / n
        cylindre(f'{nom}{i}_acier', r, 0.0008, R * math.cos(a), R * math.sin(a), z, 10)


def helice_conique(nom, r0, r1, z0, z1, tours, fil, n=200):
    """Filet hélicoïdal le long d'un cône (courbe avec épaisseur), du rayon r0 (en z0) au rayon r1 (en z1)."""
    cu = bpy.data.curves.new(nom, 'CURVE')
    cu.dimensions = '3D'
    sp = cu.splines.new('POLY')
    sp.points.add(n)
    for i in range(n + 1):
        t = i / n
        a = t * tours * 2 * math.pi
        r = r0 + (r1 - r0) * t
        sp.points[i].co = (r * math.cos(a), r * math.sin(a), z0 + (z1 - z0) * t, 1)
    cu.bevel_depth = fil
    cu.bevel_resolution = 3
    ob = bpy.data.objects.new(nom, cu)
    bpy.context.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.convert(target='MESH')
    ob = bpy.context.object
    lisser(ob, 80)
    return ob


def exporter(nom):
    os.makedirs(SORTIE, exist_ok=True)
    chemin = os.path.abspath(os.path.join(SORTIE, nom + '.glb'))
    bpy.ops.export_scene.gltf(filepath=chemin, export_format='GLB', export_apply=True, export_yup=True,
                              export_materials='NONE', export_normals=True)
    print('écrit', chemin, os.path.getsize(chemin), 'octets')


# ---------------------------------------------------------------- Pointe standard (h = 18 mm, Ø 22 mm en haut)
def pointe_standard():
    vider()
    # Bille d'acier au bout : c'est elle qui touche le plateau (frottement faible, tourne longtemps)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.0016, location=(0, 0, 0.0016))
    bille = bpy.context.object
    bille.name = 'bille_acier'
    lisser(bille, 80)
    # Cône tourné avec une gorge de serrage, qui s'élargit jusqu'à la base
    revolution('cone_corps', [
        (0.0, 0.0022), (0.0016, 0.0024), (0.0042, 0.0045), (0.0068, 0.0085), (0.0078, 0.0110),
        (0.0074, 0.0118), (0.0074, 0.0128), (0.0086, 0.0136), (0.0102, 0.0158), (0.0110, 0.0170), (0.0110, 0.0180), (0.0, 0.0180)])
    # Bague de serrage sombre dans la gorge
    revolution('bague_sombre', [(0.0073, 0.0117), (0.0081, 0.0117), (0.0083, 0.0123), (0.0081, 0.0129), (0.0073, 0.0129)])
    exporter('pointe-standard')


# ---------------------------------------------------------------- Base standard (h = 14 mm, Ø 52 mm en haut, 42 mm en bas)
def base_standard():
    vider()
    # Corps tourné : chanfreins, gorge décorative du tour, embase creuse où s'emboîte la pointe, logement de l'âme
    revolution('base_corps', [
        (0.0, 0.0), (0.0110, 0.0), (0.0112, 0.0010), (0.0190, 0.0010), (0.0208, 0.0016), (0.0232, 0.0058),
        (0.0226, 0.0066), (0.0226, 0.0074), (0.0236, 0.0082), (0.0256, 0.0116), (0.0260, 0.0126), (0.0254, 0.0140),
        (0.0190, 0.0140), (0.0184, 0.0132), (0.0130, 0.0132), (0.0124, 0.0140), (0.0, 0.0140)])
    # Jonc d'acier serti dans la gorge (il protège le flanc des chocs)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.0229, minor_radius=0.00055, major_segments=PAS, minor_segments=10, location=(0, 0, 0.0070))
    jonc = bpy.context.object
    jonc.name = 'jonc_acier'
    lisser(jonc, 80)
    # 6 vis de fixation de la couronne, sur le dessus (elles tiennent vraiment l'anneau : règle 5)
    for i in range(6):
        a = i * math.pi / 3 + math.pi / 6
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.0013, depth=0.0008, location=(0.0222 * math.cos(a), 0.0222 * math.sin(a), 0.0142))
        vis = bpy.context.object
        vis.name = f'vis{i}_acier'
        lisser(vis, 50)
    exporter('base-standard')


# ---------------------------------------------------------------- Couronne standard (anneau de choc, rayon 34 mm, section 12 mm)
def couronne_standard():
    vider()
    # Section arrondie en « D » : bord extérieur bombé qui encaisse les chocs, flanc intérieur droit
    profil = []
    for i in range(13):  # demi-cercle extérieur
        t = -math.pi / 2 + i * math.pi / 12
        profil.append((0.034 + 0.0045 * math.cos(t), 0.0055 * math.sin(t)))
    profil = [(0.0288, -0.0040)] + profil + [(0.0288, 0.0040)]
    anneau = revolution('anneau_corps', profil, pas=96)
    # 16 crans de prise au tour de l'anneau (moletage grossier qui accroche l'adversaire)
    for i in range(16):
        a = i * 2 * math.pi / 16
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0.0385 * math.cos(a), 0.0385 * math.sin(a), 0))
        c = bpy.context.object
        c.scale = (0.0024, 0.0030, 0.0140)
        c.rotation_euler = (0, 0, a)
        b = anneau.modifiers.new(f'cran{i}', 'BOOLEAN')
        b.operation = 'DIFFERENCE'
        b.object = c
        b.solver = 'EXACT'
        c.hide_set(True)
        c.hide_render = True
    bpy.context.view_layer.objects.active = anneau
    for m in [m for m in anneau.modifiers if m.type == 'BOOLEAN']:
        bpy.ops.object.modifier_apply(modifier=m.name)
    for ob in [o for o in bpy.data.objects if o.name.startswith('Cube')]:
        bpy.data.objects.remove(ob, do_unlink=True)
    # Flasque intérieure sombre (elle relie l'anneau au disque et à la base)
    revolution('flasque_sombre', [(0.0262, -0.0016), (0.0292, -0.0016), (0.0292, 0.0016), (0.0262, 0.0016)])
    exporter('couronne-standard')


# ================================================================ POINTES (le bout touche le plateau en y = 0)
def pointe_clou():  # h = 22 mm : pointe affûtée, tige moletée, tête plate
    vider()
    revolution('clou_corps', [(0.0, 0.0), (0.0006, 0.0003), (0.0035, 0.0060), (0.0035, 0.0090), (0.0031, 0.0095),
        (0.0035, 0.0100), (0.0035, 0.0130), (0.0031, 0.0135), (0.0035, 0.0140), (0.0035, 0.0193), (0.0048, 0.0200),
        (0.0090, 0.0202), (0.0092, 0.0212), (0.0086, 0.0220), (0.0, 0.0220)])
    exporter('pointe-clou')


def pointe_foreuse():  # h = 18 mm : cône de Ø 32 mm, filet hélicoïdal qui « mord » le plateau
    vider()
    revolution('foreuse_corps', [(0.0, 0.0), (0.0008, 0.0004), (0.0150, 0.0168), (0.0160, 0.0175), (0.0160, 0.0180), (0.0, 0.0180)])
    helice_conique('filet_sombre', 0.0012, 0.0150, 0.0012, 0.0168, 4.5, 0.0011)
    exporter('pointe-foreuse')


def pointe_diamant():  # h = 20 mm : diamant taillé (pavillon + couronne à facettes), serti de griffes dorées
    vider()
    gemme = revolution('gemme_corps', [(0.0, 0.0002), (0.0080, 0.0110), (0.0080, 0.0118), (0.0046, 0.0150), (0.0, 0.0150)], pas=8)
    for p in gemme.data.polygons:
        p.use_smooth = False  # facettes nettes
    revolution('serti_or', [(0.0060, 0.0140), (0.0090, 0.0150), (0.0090, 0.0200), (0.0, 0.0200), (0.0, 0.0175), (0.0058, 0.0170)])
    for i in range(4):  # griffes qui tiennent la pierre
        a = i * math.pi / 2 + math.pi / 4
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0.0078 * math.cos(a), 0.0078 * math.sin(a), 0.0128))
        g = objet_actif(f'griffe{i}_or')
        g.scale = (0.0012, 0.0012, 0.0050)
        g.rotation_euler = (0, 0.35 if i % 2 else -0.35, a)
    exporter('pointe-diamant')


def pointe_bille():  # bille Ø 14 mm tenue dans une cage
    vider()
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.007, location=(0, 0, 0.007))
    lisser(objet_actif('bille_corps'), 80)
    revolution('cage_sombre', [(0.0055, 0.0095), (0.0072, 0.0090), (0.0090, 0.0110), (0.0090, 0.0180), (0.0084, 0.0190),
        (0.0, 0.0190), (0.0, 0.0150), (0.0050, 0.0130)])
    couronne_vis('vis', 4, 0.0080, 0.0168, 0.0009)
    exporter('pointe-bille')


def pointe_ventouse():  # ventouse de caoutchouc creuse (elle accroche), sur un fût gris
    vider()
    revolution('ventouse_corps', [(0.0, 0.0016), (0.0080, 0.0006), (0.0118, 0.0), (0.0122, 0.0008), (0.0090, 0.0040),
        (0.0080, 0.0052), (0.0, 0.0052)])
    revolution('fut_sombre', [(0.0, 0.0050), (0.0060, 0.0050), (0.0100, 0.0160), (0.0100, 0.0175), (0.0, 0.0175)])
    exporter('pointe-ventouse')


# ================================================================ BASES (partent de y = 0)
def base_lourde():  # Ø 58 mm, h = 17 mm : acier martelé, 6 masselottes de tungstène en périphérie
    vider()
    revolution('lourde_corps', [(0.0, 0.0), (0.0120, 0.0), (0.0122, 0.0012), (0.0225, 0.0012), (0.0240, 0.0024), (0.0280, 0.0110),
        (0.0290, 0.0140), (0.0290, 0.0158), (0.0280, 0.0170), (0.0130, 0.0170), (0.0124, 0.0162), (0.0, 0.0162)])
    for i in range(6):
        a = i * math.pi / 3
        cylindre(f'masselotte{i}_sombre', 0.0030, 0.0016, 0.0228 * math.cos(a), 0.0228 * math.sin(a), 0.0170, 20)
    exporter('base-lourde')


def base_legere():  # alu ajouré : jante, moyeu et 6 rayons effilés (h = 14 mm)
    vider()
    revolution('jante_corps', [(0.0140, 0.0030), (0.0230, 0.0030), (0.0240, 0.0060), (0.0240, 0.0080), (0.0230, 0.0110),
        (0.0140, 0.0110), (0.0136, 0.0070)])
    revolution('moyeu_corps', [(0.0, 0.0), (0.0070, 0.0), (0.0082, 0.0012), (0.0082, 0.0128), (0.0070, 0.0140), (0.0, 0.0140)])
    for i in range(6):
        a = i * math.pi / 3
        bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.0018, depth=0.0070, location=(0.0108 * math.cos(a), 0.0108 * math.sin(a), 0.0070))
        r = objet_actif(f'rayon{i}_corps')
        r.rotation_euler = (0, math.pi / 2, a)
        r.scale = (0.9, 1.0, 1.0)
        lisser(r, 60)
    exporter('base-legere')


def base_gyro():  # base tournée creusée d'une fenêtre où tourne le gyroscope (animé par le jeu), avec ses pivots
    vider()
    revolution('gyro_corps', [(0.0, 0.0), (0.0110, 0.0), (0.0112, 0.0010), (0.0208, 0.0016), (0.0226, 0.0050),
        (0.0210, 0.0050), (0.0210, 0.0110), (0.0250, 0.0110), (0.0260, 0.0126), (0.0254, 0.0140), (0.0, 0.0140)])
    for s in (-1, 1):  # pivots de la cardan du gyroscope
        cylindre(f'pivot{s}_acier', 0.0011, 0.0040, s * 0.0195, 0.0, 0.0080, 12).rotation_euler = (0, math.pi / 2, 0)
    exporter('base-gyro')


def base_noyau():  # fragment de météorite (noyau rocheux) tenu par un cerclage doré ; dessus à 17 mm
    vider()
    import random
    random.seed(7)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=0.0200, location=(0, 0, 0.0100))
    roc = objet_actif('roc_corps')
    for v in roc.data.vertices:  # surface irrégulière, aplatie (même encombrement que la forme simple)
        k = 1 + random.uniform(-0.09, 0.09)
        v.co.x *= k; v.co.y *= k; v.co.z *= 0.7 * k
    for p in roc.data.polygons:
        p.use_smooth = False
    tore('cerclage_or', 0.0186, 0.0012, 0.0100, 64, 8)
    exporter('base-noyau')


# ================================================================ COURONNES (centrées sur leur plan, y = 0)
def couronne_large():  # anneau large et plat (Ø 100 mm) : grande surface de contact, vissé
    vider()
    revolution('large_corps', [(0.0300, -0.0030), (0.0480, -0.0030), (0.0500, -0.0012), (0.0500, 0.0012), (0.0480, 0.0030),
        (0.0300, 0.0030)], pas=96)
    couronne_vis('vis', 12, 0.0400, 0.0034)
    exporter('couronne-large')


def couronne_dents():  # jante qui porte les dents (le jeu ajoute les dents : leur nombre dépend du niveau)
    vider()
    revolution('jante_corps', [(0.0290, -0.0035), (0.0380, -0.0035), (0.0395, -0.0015), (0.0395, 0.0015), (0.0380, 0.0035),
        (0.0290, 0.0035)], pas=96)
    exporter('couronne-dents')


def couronne_bouclier():  # jupe évasée qui protège la toupie, bord renforcé d'acier
    vider()
    revolution('jupe_corps', [(0.0400, -0.0060), (0.0430, -0.0060), (0.0420, 0.0040), (0.0410, 0.0058), (0.0395, 0.0058),
        (0.0405, 0.0040), (0.0390, -0.0045), (0.0300, -0.0045), (0.0300, -0.0060)], pas=96)
    tore('bord_acier', 0.0418, 0.0018, 0.0058, 96, 10)
    for i in range(8):  # nervures de renfort
        a = i * math.pi / 4
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0.0428 * math.cos(a), 0.0428 * math.sin(a), -0.0005))
        n = objet_actif(f'nervure{i}_sombre')
        n.scale = (0.0012, 0.0030, 0.0090)
        n.rotation_euler = (0, 0, a)
    exporter('couronne-bouclier')


def couronne_lames():  # moyeu des lames (le jeu ajoute les lames : une de plus par niveau)
    vider()
    revolution('moyeu_corps', [(0.0240, -0.0030), (0.0310, -0.0030), (0.0320, -0.0015), (0.0320, 0.0015), (0.0310, 0.0030),
        (0.0240, 0.0030)], pas=96)
    exporter('couronne-lames')


def couronne_inertie():  # volant d'inertie : jante lourde à section en « T », toute la masse à l'extérieur
    vider()
    revolution('volant_corps', [(0.0280, -0.0030), (0.0360, -0.0030), (0.0360, -0.0080), (0.0420, -0.0080), (0.0440, -0.0060),
        (0.0440, 0.0060), (0.0420, 0.0080), (0.0360, 0.0080), (0.0360, 0.0030), (0.0280, 0.0030)], pas=96)
    couronne_vis('vis', 8, 0.0320, 0.0034)
    exporter('couronne-inertie')


# ================================================================ LANCEUR : boîtier (le jeu garde ses vraies roues dentées)
def lanceur_boitier():  # coque Ø 68 mm, h = 16 mm, crantée pour la prise en main, 8 vis sur la tranche
    vider()
    profil = [(0.0, -0.0080), (0.0300, -0.0080), (0.0340, -0.0050), (0.0340, 0.0050), (0.0310, 0.0080), (0.0, 0.0080)]
    coque = revolution('coque_corps', profil, pas=96)
    for i in range(24):  # crans de prise sur la tranche
        a = i * 2 * math.pi / 24
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0.0346 * math.cos(a), 0.0346 * math.sin(a), 0))
        c = objet_actif(f'cran{i}')
        c.scale = (0.0018, 0.0020, 0.0080)
        c.rotation_euler = (0, 0, a)
        b = coque.modifiers.new(f'b{i}', 'BOOLEAN'); b.operation = 'DIFFERENCE'; b.object = c; b.solver = 'EXACT'
        c.hide_set(True)
    bpy.context.view_layer.objects.active = coque
    for m in [m for m in coque.modifiers if m.type == 'BOOLEAN']:
        bpy.ops.object.modifier_apply(modifier=m.name)
    for ob in [o for o in bpy.data.objects if o.name.startswith('cran')]:
        bpy.data.objects.remove(ob, do_unlink=True)
    for i in range(8):
        a = i * math.pi / 4 + math.pi / 8
        v = cylindre(f'vis{i}_acier', 0.0014, 0.0010, 0.0336 * math.cos(a), 0.0336 * math.sin(a), 0.0, 12)
        v.rotation_euler = (0, math.pi / 2, a)
    exporter('lanceur-boitier')


if __name__ == '__main__':
    for f in (pointe_standard, pointe_clou, pointe_foreuse, pointe_diamant, pointe_bille, pointe_ventouse,
              base_standard, base_lourde, base_legere, base_gyro, base_noyau,
              couronne_standard, couronne_large, couronne_dents, couronne_bouclier, couronne_lames, couronne_inertie,
              lanceur_boitier):
        f()
