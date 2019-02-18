#!/usr/bin/env bash

  for file in *.webp; do
    DESTFILE=$(basename "$file" .webp).png
    FOO=$(/usr/local/bin/dwebp -nofancy -nofilter -nodither -noasm -mt $file -o $DESTFILE)

    if [ -z "$FOO" ]; then
      echo unlinking $file
      unlink $file
    fi
  done
