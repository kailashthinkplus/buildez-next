#!/usr/bin/env python3

from __future__ import annotations

import argparse
import datetime
import os
import pathlib
import shlex
import subprocess
import sys
import time
from dataclasses import dataclass


ROOT = pathlib.Path("/Users/kailash/buildez")
APP = ROOT / "apps/web-app"
RESULTS_ROOT = ROOT / "test-results/manual-rc"


@dataclass
class CommandResult:
    name: str
    command: list[str]
    exit_code: int
    duration_seconds: float
    log_path: pathlib.Path


COMMANDS: dict[str, list[str]] = {
    "typecheck": [
        "pnpm",
        "--dir",
        str(APP),
        "typecheck:builder",
    ],
    "rc-t3-node": [
        "pnpm",
        "--dir",
        str(APP),
        "test:builder:rc-t3",
    ],
    "operations-node": [
        "pnpm",
        "--dir",
        str(APP),
        "test:builder:operations",
    ],
    "palette": [
        "pnpm",
        "--dir",
        str(APP),
        "test:builder:browser:operations:palette",
    ],
    "invalid-dnd": [
        "pnpm",
        "--dir",
        str(APP),
        "test:builder:browser:operations:invalid",
    ],
    "dnd": [
        "pnpm",
        "--dir",
        str(APP),
        "test:builder:browser:operations:dnd",
    ],
    "reorder": [
        "pnpm",
        "--dir",
        str(APP),
        "test:builder:browser:operations:reorder",
    ],
    "keyboard": [
        "pnpm",
        "--dir",
        str(APP),
        "test:builder:browser:operations:keyboard",
    ],
    "cleanup": [
        "pnpm",
        "--dir",
        str(APP),
        "test:builder:browser:operations:cleanup",
    ],
    "full-builder": [
        "pnpm",
        "--dir",
        str(APP),
        "test:builder",
    ],
}


def run_command(
    name: str,
    command: list[str],
    run_dir: pathlib.Path,
    env: dict[str, str],
) -> CommandResult:
    log_path = run_dir / f"{name}.log"
    started = time.monotonic()

    print(f"\n{'=' * 72}")
    print(f"RUNNING: {name}")
    print(f"COMMAND: {shlex.join(command)}")
    print(f"LOG:     {log_path}")
    print(f"{'=' * 72}")

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

    print(
        f"\n{'PASS' if exit_code == 0 else 'FAIL'}: "
        f"{name} ({duration:.1f}s, exit {exit_code})"
    )

    return CommandResult(
        name=name,
        command=command,
        exit_code=exit_code,
        duration_seconds=duration,
        log_path=log_path,
    )


def capture_git_context(run_dir: pathlib.Path) -> None:
    commands = {
        "git-status.txt": ["git", "status", "--short"],
        "git-diff-stat.txt": ["git", "diff", "--stat"],
        "git-diff.txt": [
            "git",
            "diff",
            "--",
            "apps/web-app/modules/builder-v2",
            "apps/web-app/playwright",
            "docs/builder",
        ],
    }

    for filename, command in commands.items():
        result = subprocess.run(
            command,
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
        )
        (run_dir / filename).write_text(result.stdout, encoding="utf-8")


def tail_log(path: pathlib.Path, max_lines: int = 100) -> str:
    if not path.exists():
        return ""

    lines = path.read_text(
        encoding="utf-8",
        errors="replace",
    ).splitlines()

    return "\n".join(lines[-max_lines:])


def write_summary(
    run_dir: pathlib.Path,
    results: list[CommandResult],
) -> pathlib.Path:
    summary_path = run_dir / "REPORT_TO_SHARE.md"

    passed = [result for result in results if result.exit_code == 0]
    failed = [result for result in results if result.exit_code != 0]

    lines = [
        "# BuildEZ Manual RC Test Report",
        "",
        f"- Run directory: `{run_dir}`",
        f"- Passed commands: {len(passed)}",
        f"- Failed commands: {len(failed)}",
        "",
        "## Command Results",
        "",
    ]

    for result in results:
        status = "PASS" if result.exit_code == 0 else "FAIL"
        lines.extend(
            [
                f"### {status} — {result.name}",
                "",
                f"- Exit code: {result.exit_code}",
                f"- Duration: {result.duration_seconds:.1f}s",
                f"- Command: `{shlex.join(result.command)}`",
                f"- Log: `{result.log_path}`",
                "",
            ]
        )

        if result.exit_code != 0:
            lines.extend(
                [
                    "#### Failure log tail",
                    "",
                    "```text",
                    tail_log(result.log_path),
                    "```",
                    "",
                ]
            )

    lines.extend(
        [
            "## Git Status",
            "",
            "```text",
            (run_dir / "git-status.txt").read_text(
                encoding="utf-8",
                errors="replace",
            ),
            "```",
            "",
            "## Diff Stat",
            "",
            "```text",
            (run_dir / "git-diff-stat.txt").read_text(
                encoding="utf-8",
                errors="replace",
            ),
            "```",
        ]
    )

    summary_path.write_text("\n".join(lines), encoding="utf-8")
    return summary_path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "tests",
        nargs="+",
        choices=sorted(COMMANDS),
        help="Focused tests to run",
    )
    parser.add_argument(
        "--stop-on-failure",
        action="store_true",
    )
    args = parser.parse_args()

    timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    run_dir = RESULTS_ROOT / timestamp
    run_dir.mkdir(parents=True, exist_ok=True)

    env = os.environ.copy()
    results: list[CommandResult] = []

    for test_name in args.tests:
        result = run_command(
            test_name,
            COMMANDS[test_name],
            run_dir,
            env,
        )
        results.append(result)

        if result.exit_code != 0 and args.stop_on_failure:
            break

    capture_git_context(run_dir)
    summary_path = write_summary(run_dir, results)

    print("\nReport ready:")
    print(summary_path)
    print("\nShare REPORT_TO_SHARE.md with ChatGPT.")

    return 1 if any(result.exit_code != 0 for result in results) else 0


if __name__ == "__main__":
    sys.exit(main())
