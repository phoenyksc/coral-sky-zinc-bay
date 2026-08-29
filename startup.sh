#!/bin/sh
set -eu
cd /workspace
if curl -sf -o /dev/null --max-time 3 http://127.0.0.1:8080/; then
  exit 0
fi
python3 - <<'PY'
import os, pathlib, signal, time

def kill_dev():
    killed = False
    for pid_dir in pathlib.Path("/proc").iterdir():
        if not pid_dir.name.isdigit():
            continue
        try:
            cmd = (pid_dir / "cmdline").read_bytes().replace(b"\x00", b" ").decode()
        except Exception:
            continue
        if "vite preview" in cmd:
            continue
        if (
            "vite dev --host 0.0.0.0 --port 8080" in cmd
            or "with-app-env.mjs vite dev" in cmd
            or cmd.strip() == "npm run dev"
        ):
            try:
                os.kill(int(pid_dir.name), signal.SIGTERM)
                killed = True
            except Exception:
                pass
    return killed

if kill_dev():
    time.sleep(0.6)
PY
npm run dev >>/tmp/app-startup.log 2>&1 &
