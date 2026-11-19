#!/usr/bin/env bash
# Compila y ejecuta todos los ejemplos de C++ (los de español y los de
# inglés, en ejemplos/cpp/en/) con advertencias estrictas y sanitizadores
# (detectan fugas de memoria y comportamiento indefinido).
#
# Uso: scripts/compilar-ejemplos.sh
set -euo pipefail

raiz="$(cd "$(dirname "$0")/.." && pwd)"
salida="$(mktemp -d)"
trap 'rm -rf "$salida"' EXIT

CXX="${CXX:-g++}"
banderas=(-std=c++17 -Wall -Wextra -Wpedantic -Werror -g -fsanitize=address,undefined)

shopt -s nullglob
for fuente in "$raiz"/ejemplos/cpp/*.cpp "$raiz"/ejemplos/cpp/en/*.cpp; do
    nombre="${fuente#"$raiz"/ejemplos/cpp/}"
    nombre="${nombre%.cpp}"
    echo "=== $nombre ==="
    "$CXX" "${banderas[@]}" "$fuente" -o "$salida/${nombre//\//-}"
    "$salida/${nombre//\//-}"
    echo
done

echo "Todos los ejemplos compilaron y se ejecutaron correctamente."
