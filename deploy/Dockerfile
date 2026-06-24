# Emerald Cut build-server image (T-019, ADR-002/ADR-006).
# Node + the GBA cross-toolchain. The repo is bind-mounted at runtime (see
# docker-compose.yml), NOT baked in, so updates are `git pull` + restart and the
# warm build/ cache + SQLite data persist on the host disk.
#
# Build deps are exactly those the decomp documents (docs/install/linux/UBUNTU.md)
# and CI uses (.github/workflows/build.yml). arm-none-eabi is a cross-compiler, so
# this image works on x86 and ARM hosts alike (ADR-001) — including Oracle's ARM box.
FROM node:24-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential \
      binutils-arm-none-eabi \
      gcc-arm-none-eabi \
      libnewlib-arm-none-eabi \
      libpng-dev \
      python3 \
      git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Run as uid 1000 (the image's `node` user), which matches Oracle Ubuntu's default
# `ubuntu` user that owns the bind-mounted repo — so the build can mutate/restore
# src/ without root (ADR-006 non-root requirement).
USER node

CMD ["node", "backend/server.js"]
