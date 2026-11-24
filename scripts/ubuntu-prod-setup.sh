#!/usr/bin/env bash
# ==============================================================================
# Ubuntu Server VM (Windows 11 Pro Host) — Production Hardening & Ops Script
# Safe, idempotent setup for Coolify + Docker hosts.
# Usage: sudo bash ubuntu-prod-setup.sh
# ==============================================================================

set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Please run as root (e.g. sudo bash $0)" >&2
  exit 1
fi

echo "==> 1/5 Whitelisting Docker & localhost subnets in Fail2ban..."
if command -v fail2ban-client >/dev/null 2>&1; then
  mkdir -p /etc/fail2ban/jail.d
  cat >/etc/fail2ban/jail.d/00-ignore-docker.local <<'EOF'
[DEFAULT]
ignoreip = 127.0.0.1/8 ::1 10.0.0.0/8 172.16.0.0/12
EOF
  systemctl reload fail2ban || systemctl restart fail2ban
  echo "    ✔ Fail2ban updated."
else
  echo "    - Fail2ban not installed; skipping."
fi

echo "==> 2/5 Configuring Docker log rotation (/etc/docker/daemon.json)..."
mkdir -p /etc/docker
python3 - <<'PY'
import json, os

path = "/etc/docker/daemon.json"
data = {}
if os.path.exists(path):
    with open(path, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            data = {}

data.setdefault("log-driver", "json-file")
log_opts = data.setdefault("log-opts", {})
log_opts.setdefault("max-size", "10m")
log_opts.setdefault("max-file", "3")

with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
    f.write("\n")
PY
systemctl reload docker 2>/dev/null || systemctl restart docker
echo "    ✔ Docker log rotation configured (10m x 3 files)."

echo "==> 3/5 Ensuring 4 GB swapfile exists..."
if swapon --show | grep -q '/'; then
  echo "    ✔ Swap already active."
else
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl -w vm.swappiness=10 >/dev/null
  echo 'vm.swappiness=10' >/etc/sysctl.d/99-swappiness.conf
  echo "    ✔ 4 GB swapfile created and enabled."
fi

echo "==> 4/5 Enabling automatic security updates (unattended-upgrades)..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq unattended-upgrades >/dev/null
cat >/etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF
echo "    ✔ Unattended security upgrades enabled."

echo "==> 5/5 Adding weekly Docker build-cache & unused image prune..."
cat >/etc/cron.weekly/docker-prune <<'EOF'
#!/usr/bin/env bash
docker image prune -af --filter "until=168h" >/dev/null 2>&1 || true
docker builder prune -af --filter "until=168h" >/dev/null 2>&1 || true
EOF
chmod +x /etc/cron.weekly/docker-prune
echo "    ✔ Weekly Docker cleanup scheduled."

echo ""
echo "=============================================================================="
echo " Production Setup Complete — Host Health Summary"
echo "=============================================================================="
echo "SSH:      $(systemctl is-active ssh || systemctl is-active sshd)"
echo "Docker:   $(systemctl is-active docker)"
echo "Fail2ban: $(systemctl is-active fail2ban 2>/dev/null || echo 'not installed')"
echo "Memory:"
free -h
echo "Disk (/):"
df -h /
