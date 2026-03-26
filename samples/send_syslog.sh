#!/bin/bash
# Usage: ./send_syslog.sh "message" [port]

MSG=${1:-"<134>Mar 17 20:00:00 fw01 action=deny src=10.0.1.10 dst=8.8.8.8 sport=1234 dport=443 proto=tcp"}
PORT=${2:-514}
HOST="localhost"

echo "Sending Syslog message via UDP to $HOST:$PORT..."
echo "$MSG" | nc -u -w1 $HOST $PORT
echo "Done."
