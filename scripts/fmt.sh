#!/usr/bin/env bash
# Applies `procoder format` to each file given. The launcher prints a header line and then the
# formatted body, so the header is stripped; an empty body means "already formatted".
set -uo pipefail
L="/Users/pascal/.claude/plugins/cache/procoder/procoder/3.4.0/hooks/launcher.sh"
for f in "$@"; do
	"$L" format "$PWD/$f" | tail -n +2 >/tmp/pmr-fmt.out
	if [ -s /tmp/pmr-fmt.out ] && ! cmp -s /tmp/pmr-fmt.out "$f"; then
		mv /tmp/pmr-fmt.out "$f"
		echo "formatted $f"
	fi
done
