#!/usr/bin/env bash
# Joue N parties par stratégie (en parallèle, P à la fois) et affiche la synthèse.
# Usage : tests/lancer-strategies.sh [N=5] [P=3] [dossier=./resultats-strategies]
set -u
N=${1:-5}; P=${2:-3}; OUT=${3:-./resultats-strategies}
ICI="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$OUT"; OUT="$(cd "$OUT" && pwd)"; export ICI OUT
( cd "$ICI/.." && python3 -m http.server 8123 >/dev/null 2>&1 & echo $! > "$OUT/serveur.pid" )
sleep 1
for s in sacrifice eco mixte force; do for i in $(seq 1 "$N"); do echo "$s $i"; done; done |
  xargs -P "$P" -n 2 sh -c 'node "$ICI/strategies.js" "$0" > "$OUT/$0-$1.log" 2>&1'
kill "$(cat "$OUT/serveur.pid")" 2>/dev/null
node "$ICI/synthese-strategies.mjs" "$OUT"
