#!/usr/bin/env sh

# Read secrets at runtime
export VITE_SUPABASE_URL=$(cat /run/secrets/supabase_url)
export VITE_SUPABASE_ANON_KEY=$(cat /run/secrets/supabase_anon_key)
export VITE_BACKEND_URL='http://backend:3000'

# Inject into index.html
for var in VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY VITE_BACKEND_URL; do
  placeholder="${var}_PLACEHOLDER"
  value=$(eval echo \$$var)
  sed -i "s|${placeholder}|${value}|g" /usr/share/nginx/html/index.html
done

# Execute the original command
exec "$@" 