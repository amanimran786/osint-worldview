#!/bin/sh
set -e
export API_UPSTREAM="${API_UPSTREAM:-https://osint-worldview-cyan.vercel.app}"
envsubst '${API_UPSTREAM}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
exec nginx -g "daemon off;"
