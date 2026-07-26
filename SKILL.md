---
name: rbh-seadrop-sybil-mint
description: "Mint NFT on any EVM chain (Robinhood Chain RBH, Ethereum L1, etc.) via SeaDrop public mint using sybil wallets. Use when user wants to mint their NFT project across many wallets, or mentions RobinGeckos, HoodPunks, SeaDrop, mintPublic, or sybil mint. CRITICAL: the correct call is SeaDrop.mintPublic, NOT mintSeaDrop on the NFT contract. USER ABANDONED RBH mid-2026 — new projects target ETHEREUM L1 (different RPC + different SeaDrop address per chain; never hardcode RBH's)."
version: 1.0.0
author: Community
license: MIT
platforms: [linux, macos, windows]
tags: [general]
---

# Rbh Seadrop Sybil Mint — Skill

Mint NFT on any EVM chain (Robinhood Chain RBH, Ethereum L1, etc.) via SeaDrop public mint using sybil wallets. Use when user wants to mint their NFT project across many wallets, or mentions RobinGeckos, HoodPunks, SeaDrop, mintPublic, or sybil mint. CRITICAL: the correct call is SeaDrop.mintPublic, NOT mintSeaDrop on the NFT contract. USER ABANDONED RBH mid-2026 — new projects target ETHEREUM L1 (different RPC + different SeaDrop address per chain; never hardcode RBH's).

## Install

```bash
cp -r <skill-name> ~/.hermes/skills/<skill-path>/
```

Or clone this repository:

```bash
git clone https://github.com/iizcm/rbh-seadrop-sybil-mint-skill.git ~/.hermes/skills/<skill-path>/
```

## Usage

Invoke your AI agent with a clear instruction matching this skill's purpose. The agent will route tasks to this skill when the instruction matches its description or trigger keywords.

Refer to `README.md` in this repository for:
- Detailed step-by-step installation guide
- Bilingual documentation (English + Indonesian)
- Troubleshooting table
- Security best practices
- Customization tips

## Safety rules

- Never commit private keys, seed phrases, API tokens, or personal data to version control
- Use placeholders (`<YOUR_...>`) in all examples and code snippets
- Validate all outputs before acting on them
- Keep real credentials in your runtime's secure credential store only
