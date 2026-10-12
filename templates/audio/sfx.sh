#!/usr/bin/env bash
# Generates the sound effects in ../public/sfx/ with ffmpeg. No samples, no licences.
set -euo pipefail
cd "$(dirname "$0")/../public"
mkdir -p sfx && cd sfx

tone() { # <expression> <seconds> <file> [filter]
  ffmpeg -hide_banner -loglevel error -y -f lavfi -i "aevalsrc='$1':s=44100:d=$2" -af "${4:-anull}" "$3"
}

tone '(random(0)-0.5)*exp(-180*t) + 0.25*sin(2*PI*170*t)*exp(-90*t)' 0.05 key.wav "highpass=f=400,lowpass=f=7000"
tone '0.5*sin(2*PI*1500*t)*exp(-60*t)' 0.08 tick.wav
tone '0.35*sin(2*PI*880*t)*exp(-5*t) + 0.3*gt(t,0.09)*sin(2*PI*1318.5*(t-0.09))*exp(-5*(t-0.09))' 0.9 chime.wav
tone '0.4*sin(2*PI*(500*t+1500*t*t))*exp(-14*t)' 0.2 blip.wav
tone '0.9*sin(2*PI*(50*t + 4*(1-exp(-20*t))))*exp(-6*t)' 0.6 thump.wav
