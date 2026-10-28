#!/usr/bin/env bash
# Compila y ejecuta todos los ejemplos de C++ con advertencias estrictas
# y sanitizadores (detectan fugas de memoria y comportamiento indefinido).
#
# Uso: scripts/compilar-ejemplos.sh
set -euo pipefail

raiz="$(cd "$(dirname "$0")/.." && pwd)"
salida="$(mktemp -d)"
trap 'rm -rf "$salida"' EXIT

CXX="${CXX:-g++}"
banderas=(-std=c++17 -Wall -Wextra -Wpedantic -Werror -g -fsanitize=address,undefined)

for fuente in "$raiz"/ejemplos/cpp/*.cpp; do
    nombre="$(basename "$fuente" .cpp)"
    echo "=== $nombre ==="
    "$CXX" "${banderas[@]}" "$fuente" -o "$salida/$nombre"
    "$salida/$nombre"
    echo
done

echo "Todos los ejemplos compilaron y se ejecutaron correctamente."
