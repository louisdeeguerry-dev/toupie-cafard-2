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


def exporter(nom, materiaux=False):
    os.makedirs(SORTIE, exist_ok=True)
    chemin = os.path.abspath(os.path.join(SORTIE, nom + '.glb'))
    bpy.ops.export_scene.gltf(filepath=chemin, export_format='GLB', export_apply=True, export_yup=True,
                              export_materials='EXPORT' if materiaux else 'NONE', export_normals=True)
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


def base_noyau():  # noyau de météorite : roche lumineuse sertie de 4 griffes dans une coupelle tournée (dessus à 17 mm)
    vider()
    import random
    random.seed(11)
    revolution('coupelle_sombre', [(0.0, 0.0), (0.0110, 0.0), (0.0112, 0.0010), (0.0200, 0.0016), (0.0236, 0.0050),
        (0.0236, 0.0062), (0.0220, 0.0068), (0.0150, 0.0060), (0.0, 0.0060)])
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.0135, location=(0, 0, 0.0105))
    roc = objet_actif('roc_corps')
    for v in roc.data.vertices:  # roche facettée, irrégulière mais centrée (elle reste équilibrée sur l'axe)
        k = 1 + random.uniform(-0.07, 0.07)
        v.co.x *= k; v.co.y *= k; v.co.z *= 0.62 * k
    for p in roc.data.polygons:
        p.use_smooth = False
    for i in range(4):  # griffes d'acier qui tiennent la roche
        a = i * math.pi / 2 + math.pi / 4
        pts = [(0.0215 * math.cos(a), 0.0215 * math.sin(a), 0.0062), (0.0160 * math.cos(a), 0.0160 * math.sin(a), 0.0120),
               (0.0100 * math.cos(a), 0.0100 * math.sin(a), 0.0160)]
        courbe(f'griffe{i}_acier', pts, 0.0011)
    tore('jonc_or', 0.0228, 0.0009, 0.0060, 64, 8)
    exporter('base-noyau')


def base_tresor():  # base au trésor : corps doré, piles de pièces, joyaux et collier de perles, symétrie d'ordre 8 (dessus à 17 mm)
    vider()
    revolution('tresor_corps', [(0.0, 0.0), (0.0110, 0.0), (0.0112, 0.0010), (0.0200, 0.0016), (0.0236, 0.0060),
        (0.0262, 0.0100), (0.0262, 0.0112), (0.0250, 0.0120), (0.0, 0.0120)])
    for i in range(8):  # 8 piles de pièces de monnaie (2 ou 3 pièces, en alternance)
        a = i * math.pi / 4
        for j in range(3 if i % 2 else 2):
            cylindre(f'piece{i}_{j}_or', 0.0034, 0.0011, 0.0185 * math.cos(a), 0.0185 * math.sin(a), 0.0126 + j * 0.0012, 24, 30)
    # Rubis central taillé
    gem = revolution('rubis_centre_rubis', [(0.0, 0.0118), (0.0060, 0.0128), (0.0060, 0.0134), (0.0034, 0.0168), (0.0, 0.0170)], pas=8)
    for p in gem.data.polygons:
        p.use_smooth = False
    for i in range(4):  # saphirs et émeraudes entre les piles
        a = i * math.pi / 2 + math.pi / 8
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.0021, location=(0.0105 * math.cos(a), 0.0105 * math.sin(a), 0.0132))
        j = objet_actif(f'joyau{i}_' + ('saphir' if i % 2 else 'emeraude'))
        for p in j.data.polygons:
            p.use_smooth = False
    for i in range(24):  # collier de perles sur le bord
        a = i * 2 * math.pi / 24
        bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=6, radius=0.0011, location=(0.0250 * math.cos(a), 0.0250 * math.sin(a), 0.0124))
        lisser(objet_actif(f'perle{i}_perle'), 80)
    exporter('base-tresor')


def piece_moletee(nom, r, h, x=0.0, y=0.0, z=0.0, rot=(0.0, 0.0, 0.0), n=32):
    """Pièce de monnaie à tranche moletée (une strie sur deux rentrée) et listel en relief sur chaque face."""
    bpy.ops.mesh.primitive_cylinder_add(vertices=n, radius=r, depth=h, location=(0, 0, 0))
    ob = objet_actif(nom)
    for v in ob.data.vertices:  # stries de la tranche
        a = math.atan2(v.co.y, v.co.x)
        if round(a / (2 * math.pi / n)) % 2:
            v.co.x *= 0.93
            v.co.y *= 0.93
    anneaux = []
    for sens in (1, -1):  # listel : petit anneau en relief sur chaque face
        bpy.ops.mesh.primitive_torus_add(major_radius=r * 0.78, minor_radius=h * 0.18, major_segments=max(12, n // 2), minor_segments=4, location=(0, 0, sens * h / 2))
        anneaux.append(bpy.context.object)
    bpy.ops.object.select_all(action='DESELECT')
    for o in anneaux + [ob]:
        o.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.join()
    ob.location = (x, y, z)
    ob.rotation_euler = rot
    lisser(ob, 40)
    return ob


def base_tirelire():  # tirelire de céramique CREUSE (peu d'inertie) : fente avec une pièce glissée dedans, 4 hublots où l'on voit
    # les pièces économisées, 8 médailles en relief sur le flanc, cerclage doré (dessus à 17 mm)
    vider()
    revolution('tirelire_corps', [(0.0, 0.0), (0.0110, 0.0), (0.0112, 0.0010), (0.0190, 0.0014), (0.0228, 0.0040),
        (0.0252, 0.0075), (0.0258, 0.0095), (0.0250, 0.0120), (0.0226, 0.0145), (0.0185, 0.0160), (0.0120, 0.0168), (0.0, 0.0170)])
    bpy.ops.mesh.primitive_torus_add(major_radius=0.0256, minor_radius=0.0007, major_segments=PAS, minor_segments=10, location=(0, 0, 0.0085))
    lisser(objet_actif('cerclage_or'), 80)
    # Fente sur le dessus, et une pièce à moitié glissée dedans (debout, dans l'axe de la fente)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.0170))
    rebord = objet_actif('rebord_fente_or')
    rebord.scale = (0.0150, 0.0042, 0.0008)
    bev = rebord.modifiers.new('biseau', 'BEVEL'); bev.width = 0.0004; bev.segments = 2
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.0172))
    objet_actif('fente_sombre').scale = (0.0122, 0.0020, 0.0008)
    piece_moletee('piece_fente_or', 0.0048, 0.0013, 0, 0, 0.0190, rot=(math.pi / 2, 0, 0))
    # 4 hublots de verre fumé cerclés d'or : derrière, une pile de pièces (l'argent économisé)
    for i in range(4):
        a = i * math.pi / 2 + math.pi / 4
        cx, cy, cz = 0.0238 * math.cos(a), 0.0238 * math.sin(a), 0.0130
        incl = (0, math.radians(55), a)
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.0036, depth=0.0006, location=(cx, cy, cz), rotation=incl)
        lisser(objet_actif(f'hublot{i}_sombre'), 50)
        bpy.ops.mesh.primitive_torus_add(major_radius=0.0037, minor_radius=0.0005, major_segments=24, minor_segments=6, location=(cx, cy, cz), rotation=incl)
        lisser(objet_actif(f'cerclage_hublot{i}_or'), 80)
        for j in range(3):  # pièces empilées, vues à travers le verre
            piece_moletee(f'epargne{i}_{j}_or', 0.0015, 0.0005, cx * 1.012, cy * 1.012, cz - 0.0012 + j * 0.0008, rot=incl, n=16)
    # 8 médailles (pièces moletées) incrustées sur le flanc bas
    for i in range(8):
        a = i * math.pi / 4
        piece_moletee(f'medaille{i}_or', 0.0024, 0.0008, 0.0243 * math.cos(a), 0.0243 * math.sin(a), 0.0060, rot=(0, math.radians(124), a))  # face perpendiculaire au flanc
    # 16 points d'émail blanc au-dessus du cerclage (décor de céramique peinte)
    for i in range(16):
        a = i * math.pi / 8 + math.pi / 16
        bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=5, radius=0.0006, location=(0.0250 * math.cos(a), 0.0250 * math.sin(a), 0.0112))
        lisser(objet_actif(f'email{i}_blanc'), 80)
    exporter('base-tirelire')


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


# ================================================================ ÂMES (partent de y = 0 : socle sombre de 4 mm, symbole au-dessus)
# Le symbole porte le rôle « corps » : le jeu lui donne la couleur de l'âme et sa LUEUR (plus forte à chaque niveau).
def socle():
    revolution('socle_sombre', [(0.0, 0.0), (0.0118, 0.0), (0.0122, 0.0007), (0.0114, 0.0040), (0.0082, 0.0042),
        (0.0078, 0.0034), (0.0, 0.0034)])
    couronne_vis('vis', 6, 0.0100, 0.0041, 0.0007)


def courbe(nom, pts, fil, ferme=False):
    cu = bpy.data.curves.new(nom, 'CURVE')
    cu.dimensions = '3D'
    sp = cu.splines.new('POLY')
    sp.points.add(len(pts) - 1)
    for i, (x, y, z) in enumerate(pts):
        sp.points[i].co = (x, y, z, 1)
    sp.use_cyclic_u = ferme
    cu.bevel_depth = fil
    cu.bevel_resolution = 3
    cu.use_fill_caps = True
    ob = bpy.data.objects.new(nom, cu)
    bpy.context.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.convert(target='MESH')
    ob = bpy.context.object
    lisser(ob, 80)
    return ob


def ame_vide():  # sans pouvoir : une simple bille polie dans son socle
    vider(); socle()
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.0042, location=(0, 0, 0.0052))
    lisser(objet_actif('bille_corps'), 80)
    exporter('ame-vide')


def ame_oeil():  # Œil de lynx : globe blanc, iris lumineux, pupille fendue
    vider(); socle()
    revolution('globe_blanc', [(0.0, 0.0034), (0.0060, 0.0040), (0.0064, 0.0058), (0.0050, 0.0074), (0.0, 0.0080)])
    revolution('iris_corps', [(0.0, 0.0081), (0.0034, 0.0078), (0.0036, 0.0080), (0.0, 0.0084)])
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.0085))
    pup = objet_actif('pupille_sombre'); pup.scale = (0.0010, 0.0048, 0.0006)
    exporter('ame-oeil')


def ame_aimant():  # aimant en fer à cheval debout, pôles d'acier
    vider(); socle()
    pts = [(0.0050 * math.cos(t), 0.0, 0.0080 + 0.0050 * math.sin(t)) for t in [i * math.pi / 20 for i in range(21)]]
    pts = [(0.0050, 0.0, 0.0046)] + pts + [(-0.0050, 0.0, 0.0046)]
    courbe('arc_corps', pts, 0.0016)
    for sx in (-1, 1):
        cylindre(f'pole{sx}_acier', 0.0017, 0.0018, sx * 0.0050, 0.0, 0.0044, 12)
    exporter('ame-aimant')


def ame_ressort():  # petit ressort hélicoïdal, spires de bout jointives
    vider(); socle()
    pts = []
    for i in range(3 * 32 + 1):
        a = i / 32 * 2 * math.pi
        t = i / 96
        z = 0.0040 + (0.0012 * t * 3 if t < 1 / 3 else 0.0012 + (t - 1 / 3) * 3 * 0.0040 if t < 2 / 3 else 0.0052 + (t - 2 / 3) * 3 * 0.0012)
        pts.append((0.0050 * math.cos(a), 0.0050 * math.sin(a), z))
    courbe('spire_corps', pts, 0.0011)
    exporter('ame-ressort')


def ame_flamme():  # flamme torsadée (trois langues)
    vider(); socle()
    for j in range(3):
        a0 = j * 2 * math.pi / 3
        pts = []
        for i in range(25):
            t = i / 24
            r = 0.0032 * math.sin(math.pi * min(1, t * 1.2)) * (1 - t) + 0.0004
            a = a0 + t * 2.2
            pts.append((r * math.cos(a), r * math.sin(a), 0.0040 + t * (0.0140 - j * 0.0022)))
        courbe(f'langue{j}_corps', pts, 0.0016 - j * 0.0002)
    exporter('ame-flamme')


def ame_sangsue():  # sangsue annelée, enroulée sur elle-même
    vider(); socle()
    for i in range(9):
        t = i / 8
        a = t * 1.6 * math.pi
        r = 0.0055 - t * 0.0035
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=0.0022 - t * 0.0008,
                                             location=(r * math.cos(a), r * math.sin(a), 0.0058 + t * 0.0030))
        seg = objet_actif(f'anneau{i}_corps'); seg.scale = (1, 1, 0.8); lisser(seg, 80)
    exporter('ame-sangsue')


def ame_cyclone():  # tourbillon : spirale conique qui s'élève
    vider(); socle()
    pts = []
    for i in range(121):
        t = i / 120
        a = t * 3 * 2 * math.pi
        r = 0.0068 * (1 - t) + 0.0012
        pts.append((r * math.cos(a), r * math.sin(a), 0.0044 + t * 0.0080))
    courbe('spirale_corps', pts, 0.0009)
    exporter('ame-cyclone')


def ame_fer():  # fer à cheval porte-bonheur, debout, avec ses trous de clous
    vider(); socle()
    pts = [(0.0058 * math.cos(t), 0.0, 0.0100 + 0.0058 * math.sin(t)) for t in [-0.3 * math.pi + i * 1.6 * math.pi / 30 for i in range(31)]]
    fer = courbe('fer_corps', pts, 0.0017)
    fer.scale = (1, 1.6, 1)  # fer plat (plus large qu'épais)
    for i in range(5):
        t = -0.15 * math.pi + i * 1.3 * math.pi / 4
        bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=4, radius=0.0006, location=(0.0058 * math.cos(t), -0.0026, 0.0100 + 0.0058 * math.sin(t)))
        objet_actif(f'clou{i}_sombre')
    exporter('ame-fer')


def ame_carapace():  # carapace bombée à écailles hexagonales (elle bloque le premier gros choc)
    vider(); socle()
    revolution('dome_corps', [(0.0, 0.0034), (0.0082, 0.0036), (0.0080, 0.0050), (0.0060, 0.0072), (0.0030, 0.0082), (0.0, 0.0084)], pas=6)
    for p in bpy.data.objects['dome_corps'].data.polygons:
        p.use_smooth = False
    revolution('ecaille_sombre', [(0.0, 0.0084), (0.0024, 0.0083), (0.0024, 0.0086), (0.0, 0.0087)], pas=6)
    exporter('ame-carapace')



def lanceur_pied():  # pied du lanceur : socle sombre, jonc doré, colonne d'acier (h = 50 mm), collier qui tient le manche
    vider()
    revolution('socle_sombre', [(0.0, 0.0), (0.0210, 0.0), (0.0212, 0.0010), (0.0185, 0.0050), (0.0, 0.0050)])
    tore('jonc_or', 0.0195, 0.0014, 0.0050, 48, 8)
    revolution('colonne_acier', [(0.0, 0.0050), (0.0060, 0.0050), (0.0055, 0.0080), (0.0046, 0.0120), (0.0042, 0.0460),
        (0.0048, 0.0470), (0.0, 0.0470)], pas=32)
    revolution('collier_sombre', [(0.0, 0.0470), (0.0068, 0.0470), (0.0070, 0.0478), (0.0070, 0.0522), (0.0068, 0.0530), (0.0, 0.0530)], pas=32)
    exporter('lanceur-pied')


def lanceur_manche():  # manche rond (75 mm) le long de l'axe de tir, bagues de prise sombres, butée dorée au bout
    vider()
    long = 0.075
    prof = [(0.0, 0.0), (0.0055, 0.0), (0.0055, long - 0.004), (0.0, long - 0.004)]
    m = revolution('manche_corps', prof, pas=32)
    for i in range(6):  # bagues de prise
        z = 0.010 + i * 0.0095
        revolution(f'bague{i}_sombre', [(0.0054, z), (0.0062, z + 0.0006), (0.0062, z + 0.0024), (0.0054, z + 0.0030)], pas=32)
    revolution('butee_or', [(0.0, long - 0.004), (0.0072, long - 0.004), (0.0076, long - 0.002), (0.0072, long), (0.0, long)], pas=32)
    # le manche est couché le long de l'axe de tir : on le bascule (axe vertical de Blender → axe « avant »)
    for ob in bpy.data.objects:
        ob.rotation_euler = (math.radians(90), 0, 0)
    exporter('lanceur-manche')


# ================================================================ CAFARDS (pièces de taille unité : le jeu les met à l'échelle)
def cafard():
    vider()
    # Abdomen : sphère unité aplatie dessous, anneaux sur l'arrière, fente des élytres sur le dos (avant = −Y de Blender)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=1.0, location=(0, 0, 0))
    ab = objet_actif('abdomen')
    for v in ab.data.vertices:
        x, y, z = v.co
        if z < 0: z *= 0.55  # ventre plat
        if y > 0.1: k = 1 + 0.045 * math.cos(y * 14); x *= k; z *= k if z > 0 else 1  # anneaux de l'abdomen
        if z > 0.6 and abs(x) < 0.07 and y < 0.4: z -= 0.05  # fente entre les élytres
        v.co = (x, y, z)
    lisser(ab, 60)
    # Tête : petite sphère unité avec deux mandibules à l'avant
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=10, radius=1.0, location=(0, 0, 0))
    te = objet_actif('tete')
    for v in te.data.vertices:
        x, y, z = v.co
        if y < -0.6 and z < 0.1: y -= 0.35 * (1 - abs(x)) * (abs(x) > 0.25)  # deux pointes de mandibules
        v.co = (x, y, z * 0.8)
    lisser(te, 60)
    # Pronotum : bouclier bombé avec un rebord relevé
    bpy.ops.mesh.primitive_uv_sphere_add(segments=28, ring_count=12, radius=1.0, location=(0, 0, 0))
    pr = objet_actif('pronotum')
    for v in pr.data.vertices:
        x, y, z = v.co
        if z < 0: z *= 0.3
        if 0.0 < z < 0.25: x *= 1.06; y *= 1.06  # rebord
        v.co = (x, y, z)
    lisser(pr, 60)
    # Patte articulée (longueur unité vers le bas) : fémur qui monte vers le genou, tibia épineux qui redescend
    pts = [(0.0, 0.0, 0.0), (0.24, 0.0, -0.42), (0.20, 0.0, -0.70), (0.08, 0.0, -1.0)]
    cu = bpy.data.curves.new('patte', 'CURVE'); cu.dimensions = '3D'
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for i, (x, y, z) in enumerate(pts):
        sp.points[i].co = (x, y, z, 1)
        sp.points[i].radius = 1.0 - 0.45 * i / 3
    cu.bevel_depth = 0.06; cu.bevel_resolution = 1; cu.use_fill_caps = True
    ob = bpy.data.objects.new('patte', cu); bpy.context.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob; ob.select_set(True)
    bpy.ops.object.convert(target='MESH')
    pa = bpy.context.object
    for k in range(3):  # épines du tibia
        bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.02, depth=0.12, location=(0.20 - k * 0.04, 0.0, -0.55 - k * 0.12),
                                        rotation=(0, math.radians(-60), 0))
        ep = bpy.context.object
        ep.select_set(True); pa.select_set(True); bpy.context.view_layer.objects.active = pa
        bpy.ops.object.join()
    lisser(pa, 70)
    exporter('cafard')



# ================================================================ DÉCOR DU BUREAU (avec ses propres couleurs)
def materiau(ob, couleur, rugosite=0.5, metal=0.0):
    m = bpy.data.materials.new(ob.name + '_mat')
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*couleur, 1)
    b.inputs['Roughness'].default_value = rugosite
    b.inputs['Metallic'].default_value = metal
    ob.data.materials.append(m)
    return ob


def decor_bureau():  # objets posés sur le bureau, autour du plateau (Ø 1,2 m) : tasse, pot à crayons, cahier, règle, écrous
    vider()
    # Tasse de café (en haut à gauche)
    t = revolution('tasse', [(0.0, 0.0), (0.040, 0.0), (0.044, 0.004), (0.046, 0.090), (0.042, 0.092), (0.040, 0.010), (0.0, 0.010)], pas=48)
    t.location = (-0.80, -0.40, 0.0); materiau(t, (0.80, 0.18, 0.12), 0.25)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.022, minor_radius=0.006, location=(-0.752, -0.40, 0.048), rotation=(math.pi / 2, 0, 0))
    an = objet_actif('anse'); materiau(an, (0.80, 0.18, 0.12), 0.25); lisser(an, 80)
    cafe = revolution('cafe', [(0.0, 0.070), (0.040, 0.070), (0.0, 0.0701)], pas=48); cafe.location = (-0.80, -0.40, 0.0)
    materiau(cafe, (0.10, 0.05, 0.02), 0.05)
    # Pot à crayons (en haut à droite) avec 4 crayons hexagonaux
    pot = revolution('pot', [(0.0, 0.0), (0.045, 0.0), (0.045, 0.110), (0.041, 0.110), (0.041, 0.006), (0.0, 0.006)], pas=6)
    pot.location = (0.82, -0.42, 0.0); materiau(pot, (0.15, 0.35, 0.65), 0.4)
    for i, (dx, dy, c) in enumerate([(0.012, 0.010, (1.0, 0.75, 0.10)), (-0.014, 0.006, (0.20, 0.60, 0.25)), (0.004, -0.016, (0.85, 0.25, 0.35)), (-0.006, 0.0, (0.95, 0.55, 0.15))]):
        cr = revolution(f'crayon{i}', [(0.0, 0.0), (0.0045, 0.0), (0.0045, 0.170), (0.0, 0.178)], pas=6)
        cr.location = (0.82 + dx, -0.42 + dy, 0.01); cr.rotation_euler = (dy * 6, -dx * 6, i)
        materiau(cr, c, 0.5)
        mi = revolution(f'mine{i}', [(0.0, 0.170), (0.0045, 0.170), (0.0, 0.192)], pas=6)
        mi.location = cr.location; mi.rotation_euler = cr.rotation_euler; materiau(mi, (0.85, 0.70, 0.50), 0.6)
    # Cahier fermé et règle (à droite, côté joueur)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.90, 0.30, 0.008)); ca = objet_actif('cahier')
    ca.scale = (0.21, 0.29, 0.016); ca.rotation_euler = (0, 0, 0.25); materiau(ca, (0.10, 0.45, 0.40), 0.6)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.90, 0.30, 0.0165)); pg = objet_actif('pages')
    pg.scale = (0.205, 0.285, 0.002); pg.rotation_euler = (0, 0, 0.25); materiau(pg, (0.95, 0.93, 0.86), 0.8)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.86, 0.35, 0.002)); re = objet_actif('regle')
    re.scale = (0.035, 0.32, 0.004); re.rotation_euler = (0, 0, -0.4); materiau(re, (0.80, 0.85, 0.90), 0.15, 0.6)
    # Quelques écrous et vis égarés (l'atelier n'est pas loin)
    for i, (x, y) in enumerate([(-0.78, -0.62), (0.80, -0.66), (-1.10, 0.05), (1.15, -0.15)]):
        e = revolution(f'ecrou{i}', [(0.006, 0.0), (0.016, 0.0), (0.016, 0.010), (0.006, 0.010)], pas=6)
        e.location = (x, y, 0.0); e.rotation_euler = (0, 0, i); materiau(e, (0.70, 0.72, 0.75), 0.3, 0.9)
    exporter('decor-bureau', materiaux=True)


# ================================================================ TERRAINS DE DUEL
def terrain_rebond():  # une bande rebondissante (longueur 1,264 m) : boudin de caoutchouc poussé par 5 ressorts, sur ses supports
    vider()
    L = 2 * 0.6 + 0.064
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.018, depth=L, location=(0, 0, 0.012), rotation=(0, math.pi / 2, 0))
    lisser(objet_actif('boudin_corps'), 50)
    for i in range(5):  # ressorts entre le boudin et le rail arrière : ce sont eux qui relancent la toupie
        x = -0.48 + i * 0.24
        pts = []
        for k in range(6 * 16 + 1):
            a = k / 16 * 2 * math.pi
            pts.append((x + 0.007 * math.cos(a), 0.022 + k / 96 * 0.026, 0.012 + 0.007 * math.sin(a)))
        courbe(f'ressort{i}_acier', pts, 0.0016)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.052, 0.012)); r = objet_actif('rail_sombre'); r.scale = (L, 0.008, 0.030)
    exporter('terrain-rebond')


def terrain_collant():  # coulures de colle collées sur l'intérieur du rebord rond (le jeu les place tout autour)
    vider()
    import random
    random.seed(5)
    for i in range(18):
        a = i * 2 * math.pi / 18 + random.uniform(-0.08, 0.08)
        r = 0.6 - 0.004
        long = random.uniform(0.02, 0.05)
        pts = [(r * math.cos(a), r * math.sin(a), 0.020), ((r - long * 0.6) * math.cos(a), (r - long * 0.6) * math.sin(a), 0.004),
               ((r - long) * math.cos(a), (r - long) * math.sin(a), 0.001)]
        courbe(f'coulure{i}_corps', pts, random.uniform(0.004, 0.007))
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=0.009, location=((r - long) * math.cos(a), (r - long) * math.sin(a), 0.0))
        g = objet_actif(f'goutte{i}_corps'); g.scale = (1, 1, 0.35); lisser(g, 80)
    exporter('terrain-collant')


def terrain_cuve():  # le plateau se relève en pente douce près du bord : c'est une vraie cuve (les toupies glissent au centre)
    vider()
    revolution('pente_corps', [(0.30, 0.0), (0.45, 0.004), (0.55, 0.014), (0.598, 0.026), (0.598, 0.0), (0.30, -0.001)], pas=128)
    exporter('terrain-cuve')



# ================================================================ BOÎTE MYSTÈRE (ouverture 3D) : quincaillerie sur la boîte en carton du jeu
def boite_ferrures():  # boîte de 90 × 110 × 60 mm (L × H × P) : coins de métal rivetés, 2 charnières à l'arrière, fermoir doré devant
    vider()
    L, H, P = 0.09, 0.11, 0.06
    for sx in (-1, 1):
        for sy in (-1, 1):  # Blender : y = profondeur (avant = −y, car il devient +z dans le jeu), z = hauteur
            for z in (0.0, H):
                bpy.ops.mesh.primitive_cube_add(size=1, location=(sx * (L / 2 - 0.004), sy * (P / 2 - 0.004), z + (0.004 if z == 0 else -0.004)))
                c = objet_actif(f'coin{sx}{sy}{int(z * 100)}_acier'); c.scale = (0.0105, 0.0105, 0.0105)
                bev = c.modifiers.new('biseau', 'BEVEL'); bev.width = 0.0012; bev.segments = 2
                cylindre(f'rivet{sx}{sy}{int(z * 100)}_or', 0.0011, 0.0010, sx * (L / 2 - 0.004), sy * (P / 2 + 0.0012), z + (0.004 if z == 0 else -0.004), 10).rotation_euler = (math.pi / 2, 0, 0)
    for sx in (-1, 1):  # charnières : le couvercle pivote vraiment autour de cet axe (arête arrière du haut)
        c = cylindre(f'charniere{sx}_acier', 0.0026, 0.018, sx * 0.025, P / 2, H, 16)
        c.rotation_euler = (0, math.pi / 2, 0)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -P / 2 - 0.0015, H - 0.010))
    f = objet_actif('fermoir_or'); f.scale = (0.014, 0.003, 0.012)
    bev = f.modifiers.new('biseau', 'BEVEL'); bev.width = 0.001; bev.segments = 2
    exporter('boite-ferrures')


if __name__ == '__main__':
    for f in (pointe_standard, pointe_clou, pointe_foreuse, pointe_diamant, pointe_bille, pointe_ventouse,
              base_standard, base_lourde, base_legere, base_gyro, base_noyau, base_tresor, base_tirelire,
              couronne_standard, couronne_large, couronne_dents, couronne_bouclier, couronne_lames, couronne_inertie,
              lanceur_boitier, ame_vide, ame_oeil, ame_aimant, ame_ressort, ame_flamme, ame_sangsue, ame_cyclone,
              ame_fer, ame_carapace, lanceur_pied, lanceur_manche, cafard, decor_bureau, terrain_rebond, terrain_collant,
              terrain_cuve, boite_ferrures):
        f()
