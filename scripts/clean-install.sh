#!/bin/bash
# Clean pnpm cache and reinstall dependencies
echo "Cleaning pnpm cache..."
pnpm store prune || true
rm -rf pnpm-lock.yaml
rm -rf node_modules
echo "Cache cleaned. Ready for fresh install."
