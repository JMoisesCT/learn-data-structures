#!/usr/bin/env bash
# Arma el sitio estático en _site/ (lo mismo que publica GitHub Pages):
#   - copia site/
#   - copia los ejemplos de C++ a _site/codigo/ para mostrarlos en cada tema
#
# Uso: scripts/construir-sitio.sh
# Vista previa local: python3 -m http.server -d _site 8000
set -euo pipefail

raiz="$(cd "$(dirname "$0")/.." && pwd)"
destino="$raiz/_site"

rm -rf "$destino"
cp -r "$raiz/site" "$destino"
mkdir -p "$destino/codigo"
cp "$raiz"/ejemplos/cpp/*.cpp "$destino/codigo/"
touch "$destino/.nojekyll"

echo "Sitio generado en $destino"
