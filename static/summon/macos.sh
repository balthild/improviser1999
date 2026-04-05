#!/usr/bin/env bash

function reverse1999_summon_log() {
  local file url

  file=$(ls ~/Library/Containers/*/Data/Library/Caches/com.bluepoch.m.reverse1999/Cache.db | head -n 1)
  if [ -z "$file" ]; then echo Error: cannot find game cache; return 1; fi

  url=$(sqlite3 $file "
    SELECT request_key
    FROM cfurl_cache_response
    WHERE request_key GLOB 'https://game-re-service.sl916.com/query/summon?userId=*'
    ORDER BY time_stamp DESC
    LIMIT 1;
  ")
  if [ -z "$url" ]; then echo Error: cannot find summon log url in game cache; return 1; fi

  echo $url
}

reverse1999_summon_log
