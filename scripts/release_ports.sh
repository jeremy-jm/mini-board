#!/usr/bin/env bash
#
# Kills processes that are listening on the TCP ports listed below.
# Edit PORTS when your dev servers use different ports.
#

set -u

# Ports to free (e.g. Vite frontend + API backend)
PORTS=(
  5432
  3001
  5187
)

exit_code=0

for port in "${PORTS[@]}"; do
  if ! [[ "$port" =~ ^[0-9]+$ ]] || [ "$port" -gt 65535 ]; then
    echo "Invalid port in PORTS: $port (expected integer 0-65535)" >&2
    exit 1
  fi
done

for port in "${PORTS[@]}"; do
  # -t: PIDs only; -sTCP:LISTEN: listeners only (not outbound clients)
  pids=$(lsof -ti ":${port}" -sTCP:LISTEN 2>/dev/null || true)
  if [ -z "$pids" ]; then
    echo "Port ${port}: no listening process"
    continue
  fi

  echo "Port ${port}: killing PID(s) -> ${pids//$'\n'/, }"
  # shellcheck disable=SC2086
  if kill ${pids} 2>/dev/null; then
    :
  else
    # shellcheck disable=SC2086
    if kill -9 ${pids} 2>/dev/null; then
      echo "  (used SIGKILL)"
    else
      echo "  Warning: could not kill some PID(s); missing permission or process already exited" >&2
      exit_code=1
    fi
  fi
done

exit "$exit_code"
