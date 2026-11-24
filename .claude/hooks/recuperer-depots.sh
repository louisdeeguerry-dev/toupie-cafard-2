#!/usr/bin/env bash
# Au démarrage de chaque session : récupère (ou met à jour) tous les dépôts liés à Toupie Cafard 2,
# à côté de ce projet, pour avoir tout le code et tous les assets sous la main.
# Ne modifie jamais ces dépôts : lecture seule (clone / pull en avance rapide).
set -u
BASE="$(cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}/.." && pwd)"
DEPOTS=(
  "toupie-cafards/toupie-cafards.github.io|toupie-cafards.github.io"   # jeu 1 (code, sons, modèles, presse, outils)
  "louisdeeguerry-dev/voxel-sword|voxel-sword"                        # prototype voxel
  "louisdeeguerry-dev/toupie-cafards|toupie-cafards-ancienne-adresse" # page de redirection
  "louisdeeguerry-dev/github-dashboard|github-dashboard"              # privé : stats des dépôts
)
ok=(); manquants=()
for entree in "${DEPOTS[@]}"; do
  depot="${entree%%|*}"; dossier="$BASE/${entree##*|}"
  if git -C "$dossier" rev-parse HEAD >/dev/null 2>&1; then
    timeout 60 git -C "$dossier" pull -q --ff-only >/dev/null 2>&1
    ok+=("$depot → $dossier")
  elif [ ! -e "$dossier" ] && GIT_LFS_SKIP_SMUDGE=1 timeout 300 git clone -q --depth 1000 "https://github.com/$depot" "$dossier" >/dev/null 2>&1; then
    ok+=("$depot → $dossier")
  else
    rm -rf "$dossier" 2>/dev/null; manquants+=("$depot")
  fi
done
echo "Dépôts Toupie Cafard 2 disponibles :"
for l in "${ok[@]}"; do echo "  - $l"; done
if [ ${#manquants[@]} -gt 0 ]; then
  echo "Non récupérés (rattacher avec add_repo puis cloner, voir CLAUDE.md) : ${manquants[*]}"
fi
exit 0
