#!/usr/bin/env bash
set -euo pipefail

main() {
  cd "$(dirname "$0")/../.."
  
  # 设置版本（如果没有设置）
  if [ -z "${VERSION:-}" ]; then
    VERSION="$(git describe --tags --abbrev=0 | sed 's/^v//')"
    echo "Using version from git: $VERSION"
  fi
  
  # 设置 Galxe 镜像仓库
  export GALXE_REGISTRY="us-west1-docker.pkg.dev/galxe-internal-artifacts/galxe-app/code-server"
  
  # 禁用官方仓库
  export DOCKER_REGISTRY=""
  export GITHUB_REGISTRY=""
  
  echo "Building and pushing Galxe Docker images ONLY..."
  echo "Registry: $GALXE_REGISTRY"
  echo "Version: $VERSION"
  echo "Official registries disabled"
  
  # 构建并推送 Galxe 镜像（只构建 galxe 组）
  docker buildx bake -f ci/release-image/docker-bake.hcl --push galxe
  
  echo "✅ Galxe Docker images built and pushed successfully!"
  echo "Available tags:"
  echo "  - $GALXE_REGISTRY:latest"
  echo "  - $GALXE_REGISTRY:$VERSION"
  echo "  - $GALXE_REGISTRY:debian"
  echo "  - $GALXE_REGISTRY:bookworm"
  echo "  - $GALXE_REGISTRY:ubuntu"
  echo "  - $GALXE_REGISTRY:focal"
}

main "$@"
