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


if __name__ == '__main__':
    pointe_standard()
    base_standard()
    couronne_standard()
