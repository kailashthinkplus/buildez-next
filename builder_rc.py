#!/usr/bin/env python3
"""
BuildEZ Builder RC Manager

Runs focused Builder RC certification commands, manages the local Next.js server,
loads local E2E credentials, archives logs, and creates a shareable Markdown report.

No third-party Python packages are required.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import pathlib
import shlex
import signal
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from typing import Iterable, Sequence


ROOT = pathlib.Path("/Users/kailash/buildez")
APP = ROOT / "apps/web-app"
ENV_FILE = APP / ".env.e2e.local"
RESULTS_ROOT = ROOT / "test-results" / "builder-rc-manager"
SERVER_LOG_NAME = "next-dev-server.log"
DEFAULT_BASE_URL = "http://127.0.0.1:3000"


@dataclass(frozen=True)
class Ticket:
    key: str
    title: str
    commands: tuple[str, ...]
    description: str
    requires_browser: bool = False
    repeat: int = 1


@dataclass
class CommandResult:
    key: str
    command: list[str]
    exit_code: int
    duration_seconds: float
    log_path: pathlib.Path
    run_number: int = 1
    notes: list[str] = field(default_factory=list)


COMMANDS: dict[str, list[str]] = {
    "cleanup": [
        "pnpm", "--dir", str(APP),
        "test:builder:browser:operations:cleanup",
    ],
    "typecheck": [
        "pnpm", "--dir", str(APP),
        "typecheck:builder",
    ],
    "rc-t3-node": [
        "pnpm", "--dir", str(APP),
        "test:builder:rc-t3",
    ],
    "operations-node": [
        "pnpm", "--dir", str(APP),
        "test:builder:operations",
    ],
    "fixture": [
        "pnpm", "--dir", str(APP),
        "test:builder:browser:operations:fixture",
    ],
    "palette": [
        "pnpm", "--dir", str(APP),
        "test:builder:browser:operations:palette",
    ],
    "invalid-dnd": [
        "pnpm", "--dir", str(APP),
        "test:builder:browser:operations:invalid",
    ],
    "dnd": [
        "pnpm", "--dir", str(APP),
        "test:builder:browser:operations:dnd",
    ],
    "reorder": [
        "pnpm", "--dir", str(APP),
        "test:builder:browser:operations:reorder",
    ],
    "keyboard": [
        "pnpm", "--dir", str(APP),
        "test:builder:browser:operations:keyboard",
    ],
    "browser-operations": [
        "pnpm", "--dir", str(APP),
        "test:builder:browser:operations",
    ],
    "full-builder": [
        "pnpm", "--dir", str(APP),
        "test:builder",
    ],
    "scoped-diff-check": [
        "git", "diff", "--check", "--",
        "apps/web-app/modules/builder-v2",
        "apps/web-app/playwright",
        "docs/builder",
        "docs/implementation",
        "docs/developer-logs",
    ],
}


TICKETS: dict[str, Ticket] = {
    "baseline": Ticket(
        key="baseline",
        title="Current RC-T3 green baseline",
        commands=(
            "cleanup", "typecheck", "rc-t3-node", "operations-node",
            "invalid-dnd", "dnd", "palette", "reorder", "keyboard",
            "scoped-diff-check",
        ),
        description="Runs all currently implemented RC-T3 certification gates.",
        requires_browser=True,
    ),
    "scroll": Ticket(
        key="scroll",
        title="RC-T3I-01 Scroll-aware targeting",
        commands=("cleanup", "scroll", "cleanup"),
        description="Reserved for the scroll-aware Playwright ticket.",
        requires_browser=True,
    ),
    "zoom": Ticket(
        key="zoom",
        title="RC-T3I-02 Zoom-aware targeting",
        commands=("cleanup", "zoom", "cleanup"),
        description="Reserved for the zoom-aware Playwright ticket.",
        requires_browser=True,
    ),
    "responsive": Ticket(
        key="responsive",
        title="RC-T3I-03 Responsive operation matrix",
        commands=("cleanup", "responsive", "cleanup"),
        description="Reserved for Desktop, Tablet and Mobile operation tests.",
        requires_browser=True,
    ),
    "persistence": Ticket(
        key="persistence",
        title="RC-T3I-04 Persistence matrix",
        commands=("cleanup", "persistence", "cleanup"),
        description="Reserved for independent insert/delete/duplicate/reorder/move/paste persistence.",
        requires_browser=True,
    ),
    "copy-paste": Ticket(
        key="copy-paste",
        title="RC-T3I-05 Browser copy/paste",
        commands=("cleanup", "copy-paste", "cleanup"),
        description="Reserved for same-parent and cross-container clipboard tests.",
        requires_browser=True,
    ),
    "journeys": Ticket(
        key="journeys",
        title="RC-T3I-06/07 Golden journeys",
        commands=("cleanup", "journeys", "cleanup"),
        description="Reserved for landing-page and nested-layout journeys.",
        requires_browser=True,
    ),
    "full-rc-t3": Ticket(
        key="full-rc-t3",
        title="Final RC-T3 certification",
        commands=(
            "cleanup", "typecheck", "rc-t3-node", "operations-node",
            "fixture", "palette", "invalid-dnd", "dnd", "reorder",
            "keyboard", "scroll", "zoom", "responsive", "persistence",
            "copy-paste", "journeys", "browser-operations",
            "full-builder", "cleanup", "scoped-diff-check",
        ),
        description="Final full RC-T3 gate after all reserved scripts exist.",
        requires_browser=True,
    ),
}


RESERVED_COMMANDS: dict[str, list[str]] = {
    "scroll": [
        "pnpm", "--dir", str(APP),
        "test:builder:browser:operations:scroll",
    ],
    "zoom": [
        "pnpm", "--dir", str(APP),
        "test:builder:browser:operations:zoom",
    ],
    "responsive": [
        "pnpm", "--dir", str(APP),
        "test:builder:browser:operations:responsive",
    ],
    "persistence": [
        "pnpm", "--dir", str(APP),
        "test:builder:browser:operations:persistence",
    ],
    "copy-paste": [
        "pnpm", "--dir", str(APP),
        "test:builder:browser:operations:copy-paste",
    ],
    "journeys": [
        "pnpm", "--dir", str(APP),
        "test:builder:browser:operations:journeys",
    ],
}
COMMANDS.update(RESERVED_COMMANDS)


def parse_env_file(path: pathlib.Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()

        if value and value[0] == value[-1] and value[0] in {"'", '"'}:
            value = value[1:-1]

        values[key] = value

    return values


def build_environment() -> dict[str, str]:
    env = os.environ.copy()
    file_values = parse_env_file(ENV_FILE)

    # Existing shell variables take precedence over the local file.
    for key, value in file_values.items():
        env.setdefault(key, value)

    env.setdefault("PLAYWRIGHT_BASE_URL", DEFAULT_BASE_URL)
    return env


def validate_browser_environment(env: dict[str, str]) -> list[str]:
    missing: list[str] = []
    for key in ("E2E_USER_EMAIL", "E2E_USER_PASSWORD"):
        if not env.get(key, "").strip():
            missing.append(key)
    return missing


def http_ready(url: str, timeout: float = 1.5) -> bool:
    request = urllib.request.Request(url, method="GET")
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return 200 <= response.status < 500
    except (urllib.error.URLError, TimeoutError, ConnectionError):
        return False


def wait_for_server(url: str, timeout_seconds: int = 90) -> bool:
    deadline = time.monotonic() + timeout_seconds
    while time.monotonic() < deadline:
        if http_ready(url):
            return True
        time.sleep(1)
    return False


def start_local_server(
    run_dir: pathlib.Path,
    env: dict[str, str],
) -> subprocess.Popen[str] | None:
    base_url = env.get("PLAYWRIGHT_BASE_URL", DEFAULT_BASE_URL).rstrip("/")
    health_url = f"{base_url}/app/login"

    if http_ready(health_url):
        print(f"Local app already available at {base_url}")
        return None

    server_log_path = run_dir / SERVER_LOG_NAME
    print(f"Starting Next.js development server. Log: {server_log_path}")

    server_log = server_log_path.open("w", encoding="utf-8")
    process = subprocess.Popen(
        ["pnpm", "--dir", str(APP), "dev"],
        cwd=ROOT,
        env=env,
        stdout=server_log,
        stderr=subprocess.STDOUT,
        text=True,
        start_new_session=True,
    )
    # Keep the file handle associated with the process for cleanup.
    setattr(process, "_rc_server_log", server_log)

    if wait_for_server(health_url):
        print(f"Local app is ready at {base_url}")
        return process

    stop_local_server(process)
    raise RuntimeError(
        f"BuildEZ did not become ready within 90 seconds. "
        f"Inspect {server_log_path}"
    )


def stop_local_server(process: subprocess.Popen[str] | None) -> None:
    if process is None:
        return

    print("Stopping Next.js development server...")
    try:
        os.killpg(process.pid, signal.SIGTERM)
    except (ProcessLookupError, PermissionError):
        process.terminate()

    try:
        process.wait(timeout=15)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(process.pid, signal.SIGKILL)
        except (ProcessLookupError, PermissionError):
            process.kill()
        process.wait(timeout=5)

    server_log = getattr(process, "_rc_server_log", None)
    if server_log is not None:
        server_log.close()


def package_scripts() -> dict[str, str]:
    package_path = APP / "package.json"
    payload = json.loads(package_path.read_text(encoding="utf-8"))
    scripts = payload.get("scripts", {})
    return {str(key): str(value) for key, value in scripts.items()}


def command_is_available(key: str) -> tuple[bool, str | None]:
    if key not in RESERVED_COMMANDS:
        return True, None

    script_name = {
        "scroll": "test:builder:browser:operations:scroll",
        "zoom": "test:builder:browser:operations:zoom",
        "responsive": "test:builder:browser:operations:responsive",
        "persistence": "test:builder:browser:operations:persistence",
        "copy-paste": "test:builder:browser:operations:copy-paste",
        "journeys": "test:builder:browser:operations:journeys",
    }[key]

    scripts = package_scripts()
    if script_name not in scripts:
        return False, f"Package script not implemented yet: {script_name}"
    return True, None


def safe_name(value: str) -> str:
    return "".join(character if character.isalnum() or character in "-_" else "_" for character in value)


def run_command(
    key: str,
    run_number: int,
    run_dir: pathlib.Path,
    env: dict[str, str],
) -> CommandResult:
    available, reason = command_is_available(key)
    log_path = run_dir / f"{safe_name(key)}-run-{run_number}.log"

    if not available:
        message = reason or f"Command unavailable: {key}"
        log_path.write_text(message + "\n", encoding="utf-8")
        print(f"BLOCKED: {key} — {message}")
        return CommandResult(
            key=key,
            command=COMMANDS[key],
            exit_code=2,
            duration_seconds=0,
            log_path=log_path,
            run_number=run_number,
            notes=[message],
        )

    command = COMMANDS[key]
    started = time.monotonic()

    print()
    print("=" * 78)
    print(f"RUNNING: {key} (run {run_number})")
    print(f"COMMAND: {shlex.join(command)}")
    print(f"LOG:     {log_path}")
    print("=" * 78)

    with log_path.open("w", encoding="utf-8") as log_file:
        process = subprocess.Popen(
            command,
            cwd=ROOT,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
        )

        assert process.stdout is not None
        for line in process.stdout:
            print(line, end="")
            log_file.write(line)

        exit_code = process.wait()

    duration = time.monotonic() - started
    status = "PASS" if exit_code == 0 else "FAIL"
    print(f"{status}: {key} ({duration:.1f}s, exit {exit_code})")

    return CommandResult(
        key=key,
        command=command,
        exit_code=exit_code,
        duration_seconds=duration,
        log_path=log_path,
        run_number=run_number,
    )


def capture_command_output(command: Sequence[str]) -> str:
    result = subprocess.run(
        command,
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )
    return result.stdout


def capture_repository_context(run_dir: pathlib.Path) -> None:
    captures = {
        "git-status-short.txt": ["git", "status", "--short"],
        "git-diff-stat.txt": [
            "git", "diff", "--stat", "--",
            "apps/web-app/modules/builder-v2",
            "apps/web-app/playwright",
            "docs/builder",
            "docs/implementation",
            "docs/developer-logs",
            "apps/web-app/package.json",
            "scripts",
        ],
        "package-operation-scripts.txt": [
            "node", "-e",
            (
                'const p=require("./apps/web-app/package.json");'
                'for(const [k,v] of Object.entries(p.scripts||{}))'
                'if(k.includes("builder:browser:operations")) console.log(`${k}=${v}`);'
            ),
        ],
    }

    for filename, command in captures.items():
        (run_dir / filename).write_text(
            capture_command_output(command),
            encoding="utf-8",
        )


def tail_text(path: pathlib.Path, max_lines: int = 120) -> str:
    if not path.exists():
        return ""
    lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    return "\n".join(lines[-max_lines:])


def write_report(
    run_dir: pathlib.Path,
    ticket: Ticket,
    results: list[CommandResult],
    server_started: bool,
) -> pathlib.Path:
    report_path = run_dir / "REPORT_TO_SHARE.md"

    passed = [item for item in results if item.exit_code == 0]
    blocked = [item for item in results if item.exit_code == 2]
    failed = [item for item in results if item.exit_code not in (0, 2)]

    lines: list[str] = [
        "# BuildEZ Builder RC Manager Report",
        "",
        f"- Ticket: `{ticket.key}` — {ticket.title}",
        f"- Run directory: `{run_dir}`",
        f"- Local server started by manager: {'yes' if server_started else 'no'}",
        f"- Passed commands: {len(passed)}",
        f"- Failed commands: {len(failed)}",
        f"- Blocked/unimplemented commands: {len(blocked)}",
        "",
        "## Ticket Description",
        "",
        ticket.description,
        "",
        "## Results",
        "",
    ]

    for item in results:
        if item.exit_code == 0:
            status = "PASS"
        elif item.exit_code == 2:
            status = "BLOCKED"
        else:
            status = "FAIL"

        lines.extend([
            f"### {status} — {item.key} (run {item.run_number})",
            "",
            f"- Exit code: {item.exit_code}",
            f"- Duration: {item.duration_seconds:.1f}s",
            f"- Command: `{shlex.join(item.command)}`",
            f"- Log: `{item.log_path}`",
            "",
        ])

        if item.notes:
            lines.append("Notes:")
            for note in item.notes:
                lines.append(f"- {note}")
            lines.append("")

        if item.exit_code != 0:
            lines.extend([
                "#### Log tail",
                "",
                "```text",
                tail_text(item.log_path),
                "```",
                "",
            ])

    lines.extend([
        "## Git Status",
        "",
        "```text",
        (run_dir / "git-status-short.txt").read_text(
            encoding="utf-8",
            errors="replace",
        ),
        "```",
        "",
        "## Scoped Diff Stat",
        "",
        "```text",
        (run_dir / "git-diff-stat.txt").read_text(
            encoding="utf-8",
            errors="replace",
        ),
        "```",
        "",
        "## Builder Operation Scripts",
        "",
        "```text",
        (run_dir / "package-operation-scripts.txt").read_text(
            encoding="utf-8",
            errors="replace",
        ),
        "```",
        "",
        "## Recommended Sharing",
        "",
        "Share this file with ChatGPT together with the failing test file "
        "and relevant production source when a command fails.",
    ])

    report_path.write_text("\n".join(lines), encoding="utf-8")
    return report_path


def ticket_requires_browser(ticket: Ticket) -> bool:
    return ticket.requires_browser


def run_ticket(
    ticket: Ticket,
    stop_on_failure: bool,
    repeat_override: int | None,
) -> int:
    timestamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    run_dir = RESULTS_ROOT / f"{timestamp}-{ticket.key}"
    run_dir.mkdir(parents=True, exist_ok=True)

    env = build_environment()
    if ticket_requires_browser(ticket):
        missing = validate_browser_environment(env)
        if missing:
            print(
                "Missing required browser-test environment variables: "
                + ", ".join(missing),
                file=sys.stderr,
            )
            print(f"Populate {ENV_FILE} and rerun.", file=sys.stderr)
            return 2

    server_process: subprocess.Popen[str] | None = None
    results: list[CommandResult] = []

    try:
        if ticket_requires_browser(ticket):
            server_process = start_local_server(run_dir, env)

        total_repeats = repeat_override or ticket.repeat
        for repeat_number in range(1, total_repeats + 1):
            for key in ticket.commands:
                result = run_command(
                    key=key,
                    run_number=repeat_number,
                    run_dir=run_dir,
                    env=env,
                )
                results.append(result)

                if result.exit_code != 0 and stop_on_failure:
                    raise StopIteration

    except StopIteration:
        pass
    finally:
        # Always attempt final cleanup while the app is still available.
        if ticket_requires_browser(ticket):
            cleanup_result = run_command(
                key="cleanup",
                run_number=999,
                run_dir=run_dir,
                env=env,
            )
            results.append(cleanup_result)

        capture_repository_context(run_dir)
        report_path = write_report(
            run_dir=run_dir,
            ticket=ticket,
            results=results,
            server_started=server_process is not None,
        )
        stop_local_server(server_process)

        print()
        print("=" * 78)
        print(f"Report ready: {report_path}")
        print("=" * 78)

    return 1 if any(item.exit_code != 0 for item in results) else 0


def print_menu() -> None:
    print()
    print("BuildEZ Builder RC Manager")
    print("=" * 34)

    keys = list(TICKETS)
    for index, key in enumerate(keys, start=1):
        ticket = TICKETS[key]
        print(f"{index:2d}. {ticket.title}")
        print(f"    key: {ticket.key}")

    print(" 0. Exit")


def interactive_choice() -> str | None:
    keys = list(TICKETS)
    while True:
        print_menu()
        raw = input("\nSelect a ticket: ").strip()
        if raw == "0":
            return None
        if raw in TICKETS:
            return raw
        try:
            index = int(raw)
        except ValueError:
            print("Enter a ticket key or menu number.")
            continue

        if 1 <= index <= len(keys):
            return keys[index - 1]

        print("Invalid selection.")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="BuildEZ Builder Release Candidate manager",
    )
    parser.add_argument(
        "ticket",
        nargs="?",
        choices=sorted(TICKETS),
        help="Ticket to run. Omit for an interactive menu.",
    )
    parser.add_argument(
        "--continue-on-failure",
        action="store_true",
        help="Continue running later commands after a failure.",
    )
    parser.add_argument(
        "--repeat",
        type=int,
        default=None,
        help="Repeat the selected ticket N times.",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List tickets and exit.",
    )
    args = parser.parse_args()

    if args.list:
        for ticket in TICKETS.values():
            print(f"{ticket.key:15} {ticket.title}")
        return 0

    ticket_key = args.ticket or interactive_choice()
    if ticket_key is None:
        return 0

    return run_ticket(
        ticket=TICKETS[ticket_key],
        stop_on_failure=not args.continue_on_failure,
        repeat_override=args.repeat,
    )


if __name__ == "__main__":
    raise SystemExit(main())
