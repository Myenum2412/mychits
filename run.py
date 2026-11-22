"""
Chit Fund Management System - Unified Single-File Service Runner
Runs both FastAPI backend and Next.js frontend concurrently with automated port cleanup,
dependency checks, unified colored logging, and browser auto-launch.
"""

import argparse
import os
import shutil
import signal
import socket
import subprocess
import sys
import threading
import time
import webbrowser
from pathlib import Path

# Enable ANSI escape sequence processing on Windows
if sys.platform == "win32":
    os.system("")

# ANSI Color codes
C_RESET = "\033[0m"
C_BOLD = "\033[1m"
C_CYAN = "\033[36m"
C_MAGENTA = "\033[35m"
C_GREEN = "\033[32m"
C_YELLOW = "\033[33m"
C_RED = "\033[31m"
C_GRAY = "\033[90m"

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"


def log(prefix: str, color: str, msg: str):
    """Print formatted message with colored prefix."""
    print(f"{color}{C_BOLD}[{prefix:<8}]{C_RESET} {msg}", flush=True)


def log_sys(msg: str):
    log("SYSTEM", C_GREEN, msg)


def log_warn(msg: str):
    log("WARNING", C_YELLOW, msg)


def log_err(msg: str):
    log("ERROR", C_RED, msg)


def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    """Check if a network port is currently listening."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.3)
        return s.connect_ex((host, port)) == 0


def kill_process_tree(pid: int):
    """Recursively kill a process and all its children."""
    if not pid:
        return
    if sys.platform == "win32":
        try:
            subprocess.run(
                ["taskkill", "/F", "/T", "/PID", str(pid)],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=False,
            )
        except Exception:
            pass
    else:
        try:
            os.killpg(os.getpgid(pid), signal.SIGTERM)
        except Exception:
            try:
                os.kill(pid, signal.SIGKILL)
            except Exception:
                pass


def free_port_if_busy(port: int):
    """Detect and terminate any process listening on the given port to prevent bind errors."""
    if not is_port_in_use(port):
        return

    log_warn(f"Port {port} is currently in use. Cleaning up stale process...")
    if sys.platform == "win32":
        try:
            # Use netstat to find PID listening on port
            output = subprocess.check_output(
                ["netstat", "-ano", "-p", "tcp"],
                stderr=subprocess.DEVNULL,
                text=True,
            )
            for line in output.splitlines():
                parts = line.strip().split()
                if len(parts) >= 5 and parts[3] == "LISTENING":
                    local_addr = parts[1]
                    if local_addr.endswith(f":{port}"):
                        pid = int(parts[4])
                        if pid > 0:
                            log_sys(f"Terminating lingering process PID {pid} on port {port}...")
                            kill_process_tree(pid)
                            time.sleep(0.5)
        except Exception as e:
            log_warn(f"Could not automatically free port {port}: {e}")
    else:
        try:
            cmd = f"lsof -ti:{port} | xargs kill -9"
            subprocess.run(cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            time.sleep(0.5)
        except Exception as e:
            log_warn(f"Could not automatically free port {port}: {e}")


def find_python_executable() -> str:
    """Locate the backend virtualenv Python or fallback to current python."""
    # Check Windows venv
    win_venv_py = BACKEND_DIR / "venv" / "Scripts" / "python.exe"
    if win_venv_py.is_file():
        return str(win_venv_py)

    # Check Unix venv
    unix_venv_py = BACKEND_DIR / "venv" / "bin" / "python"
    if unix_venv_py.is_file():
        return str(unix_venv_py)

    return sys.executable


def find_npm_executable() -> str:
    """Locate npm executable."""
    npm_path = shutil.which("npm.cmd" if sys.platform == "win32" else "npm")
    if not npm_path:
        npm_path = shutil.which("npm")
    return npm_path or "npm"


def stream_output(process: subprocess.Popen, prefix: str, color: str, stop_event: threading.Event):
    """Read process stdout line by line and print with colored tag."""
    try:
        for line in iter(process.stdout.readline, ""):
            if stop_event.is_set():
                break
            if line:
                line_str = line.rstrip("\r\n")
                if line_str:
                    print(f"{color}{C_BOLD}[{prefix:<8}]{C_RESET} {line_str}", flush=True)
    except (ValueError, OSError):
        pass


def wait_for_services(frontend_url: str, backend_url: str, stop_event: threading.Event, auto_open: bool):
    """Poll services until responsive, then notify and optionally open browser."""
    frontend_port = 3000
    backend_port = 8000

    backend_ready = False
    frontend_ready = False

    log_sys("Waiting for application services to start up...")
    for _ in range(60):  # up to 30 seconds
        if stop_event.is_set():
            return
        time.sleep(0.5)

        if not backend_ready and is_port_in_use(backend_port):
            backend_ready = True
            log_sys(f"FastAPI Backend is online at {C_CYAN}{backend_url}{C_RESET}")

        if not frontend_ready and is_port_in_use(frontend_port):
            frontend_ready = True
            log_sys(f"Next.js Frontend is online at {C_MAGENTA}{frontend_url}{C_RESET}")

        if backend_ready and frontend_ready:
            break

    banner = f"""
{C_GREEN}{C_BOLD}========================================================================
  Apex ROSCA Chit Fund & YouPI Payment Gateway is ONLINE!
  ------------------------------------------------------------------------
  * Web Dashboard:         {C_CYAN}{frontend_url}{C_GREEN}
  * YouPI Gateway Admin:   {C_CYAN}{frontend_url}/gateway-admin{C_GREEN}
  * Subscriber YouPI Pay:  {C_CYAN}{frontend_url}/payments{C_GREEN}
  * Messages & Social DM:  {C_CYAN}{frontend_url}/messages{C_GREEN}
  * WhatsApp Integration:  {C_CYAN}{frontend_url}/settings{C_GREEN}
  * FastAPI REST Backend:  {C_CYAN}{backend_url}{C_GREEN}
  * Interactive API Docs:  {C_CYAN}{backend_url}/docs{C_GREEN}
  ------------------------------------------------------------------------
  Default Logins:
  - OrgMenu Admin:       {C_YELLOW}admin@orgmenu.com{C_GREEN} / {C_YELLOW}admin{C_GREEN}
  - Chits Subscriber:    {C_YELLOW}user@chits.com{C_GREEN}    / {C_YELLOW}user{C_GREEN}
  ------------------------------------------------------------------------
  Press {C_YELLOW}Ctrl+C{C_GREEN} in this terminal at any time to gracefully stop all.
========================================================================{C_RESET}
"""
    print(banner, flush=True)

    if auto_open and not stop_event.is_set():
        try:
            log_sys(f"Opening {frontend_url} in your default web browser...")
            webbrowser.open(frontend_url)
        except Exception as e:
            log_warn(f"Could not open browser automatically: {e}")


def main():
    parser = argparse.ArgumentParser(description="Apex Chit Fund - Unified Single-File Service Runner")
    parser.add_argument("--no-browser", action="store_true", help="Do not automatically open the browser")
    parser.add_argument("--backend-only", action="store_true", help="Start only the FastAPI backend")
    parser.add_argument("--frontend-only", action="store_true", help="Start only the Next.js frontend")
    parser.add_argument("--backend-port", type=int, default=8000, help="Backend port (default: 8000)")
    parser.add_argument("--frontend-port", type=int, default=3000, help="Frontend port (default: 3000)")
    args = parser.parse_args()

    print(f"\n{C_BOLD}{C_GREEN}Chit Fund Management System & YouPI-PG Gateway{C_RESET}")
    print(f"{C_GRAY}Working Directory: {ROOT_DIR}{C_RESET}\n")

    # Clean up any stale processes holding the target ports
    if not args.frontend_only:
        free_port_if_busy(args.backend_port)
    if not args.backend_only:
        free_port_if_busy(args.frontend_port)

    # Locate tools
    py_exec = find_python_executable()
    npm_exec = find_npm_executable()

    log_sys(f"Python Runtime: {py_exec}")
    log_sys(f"Node / NPM:     {npm_exec}")

    # Check frontend dependencies
    if not args.backend_only:
        node_modules = FRONTEND_DIR / "node_modules"
        if not node_modules.exists():
            log_warn("Frontend 'node_modules' not found. Installing packages with npm...")
            subprocess.run([npm_exec, "install"], cwd=FRONTEND_DIR, check=True)

    # Ensure backend database tables are initialized
    if not args.frontend_only:
        try:
            log_sys("Verifying database tables & YouPI gateway schema in SQLite...")
            init_code = (
                "import sys; sys.path.insert(0, 'backend'); "
                "from app.core.database import Base, engine; "
                "import app.models; "
                "Base.metadata.create_all(bind=engine)"
            )
            subprocess.run([py_exec, "-c", init_code], cwd=ROOT_DIR, check=True)
            log_sys("Database schema verified.")
        except Exception as e:
            log_warn(f"Database pre-check notice: {e}")

    processes = []
    stop_event = threading.Event()

    # Function to handle shutdown cleanly
    def shutdown(signum=None, frame=None):
        if stop_event.is_set():
            return
        stop_event.set()
        print()
        log_sys("Stopping all services gracefully...")
        for proc, name in processes:
            if proc.poll() is None:
                log_sys(f"Stopping {name} (PID: {proc.pid})...")
                kill_process_tree(proc.pid)
        log_sys("All servers stopped successfully. Bye!")
        sys.exit(0)

    # Register signal handlers
    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    # Start Backend
    if not args.frontend_only:
        log_sys(f"Starting FastAPI backend on http://127.0.0.1:{args.backend_port}...")
        backend_cmd = [
            py_exec,
            "-m",
            "uvicorn",
            "app.main:app",
            "--reload",
            "--host",
            "127.0.0.1",
            "--port",
            str(args.backend_port),
        ]
        backend_proc = subprocess.Popen(
            backend_cmd,
            cwd=BACKEND_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            encoding="utf-8",
            errors="replace",
        )
        processes.append((backend_proc, "Backend"))
        t_backend = threading.Thread(
            target=stream_output,
            args=(backend_proc, "BACKEND", C_CYAN, stop_event),
            daemon=True,
        )
        t_backend.start()

    # Start Frontend
    if not args.backend_only:
        log_sys(f"Starting Next.js frontend on http://localhost:{args.frontend_port}...")
        if sys.platform == "win32":
            frontend_proc = subprocess.Popen(
                f'"{npm_exec}" run dev -- -p {args.frontend_port}',
                cwd=FRONTEND_DIR,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                encoding="utf-8",
                errors="replace",
            )
        else:
            frontend_proc = subprocess.Popen(
                [npm_exec, "run", "dev", "--", "-p", str(args.frontend_port)],
                cwd=FRONTEND_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                encoding="utf-8",
                errors="replace",
            )
        processes.append((frontend_proc, "Frontend"))
        t_frontend = threading.Thread(
            target=stream_output,
            args=(frontend_proc, "FRONTEND", C_MAGENTA, stop_event),
            daemon=True,
        )
        t_frontend.start()

    # Background waiter for readiness and browser opening
    frontend_url = f"http://localhost:{args.frontend_port}"
    backend_url = f"http://127.0.0.1:{args.backend_port}"
    auto_open = not args.no_browser and not args.backend_only

    t_waiter = threading.Thread(
        target=wait_for_services,
        args=(frontend_url, backend_url, stop_event, auto_open),
        daemon=True,
    )
    t_waiter.start()

    # Keep main thread alive monitoring child processes
    try:
        while not stop_event.is_set():
            for proc, name in processes:
                ret = proc.poll()
                if ret is not None and not stop_event.is_set():
                    log_warn(f"{name} exited with return code {ret}.")
                    shutdown()
            time.sleep(0.5)
    except KeyboardInterrupt:
        shutdown()


if __name__ == "__main__":
    main()
