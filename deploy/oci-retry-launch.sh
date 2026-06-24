#!/usr/bin/env bash
# Retry-launch the Always Free Ampere A1 instance until capacity is available (T-019).
# Works around Oracle's "Out of host capacity" by looping over the ADs and retrying.
# Run from YOUR machine. Requires: OCI CLI (configured) + jq. Config: deploy/.env.local.
#
#   deploy/oci-retry-launch.sh
#
# Leave it running (e.g. in a tmux/screen or with `nohup … &`); it grabs the box the
# moment a slot frees up and prints the public IP.
set -uo pipefail
cd "$(dirname "$0")/.."

[ -f deploy/.env.local ] || { echo "Create deploy/.env.local from deploy/.env.local.example"; exit 1; }
# shellcheck disable=SC1091
source deploy/.env.local

: "${OCI_COMPARTMENT_OCID:?set OCI_COMPARTMENT_OCID in deploy/.env.local}"
: "${OCI_SUBNET_OCID:?set OCI_SUBNET_OCID in deploy/.env.local}"
: "${OCI_SSH_PUBKEY_FILE:?set OCI_SSH_PUBKEY_FILE in deploy/.env.local}"

SHAPE="VM.Standard.A1.Flex"
OCPUS="${OCI_OCPUS:-2}"
MEM="${OCI_MEMORY_GB:-12}"
BOOT_GB="${OCI_BOOT_GB:-50}"
NAME="${OCI_DISPLAY_NAME:-emerald-cut}"
SLEEP="${OCI_RETRY_SLEEP:-60}"
PUBKEY="$(cat "${OCI_SSH_PUBKEY_FILE/#\~/$HOME}")"

command -v oci >/dev/null || { echo "OCI CLI not found — install + 'oci setup config' first"; exit 1; }
command -v jq  >/dev/null || { echo "jq not found — brew install jq"; exit 1; }

echo "==> discovering availability domains"
ADS=()  # portable read loop (macOS ships bash 3.2 — no mapfile)
while IFS= read -r _ad; do [ -n "$_ad" ] && ADS+=("$_ad"); done < <(oci iam availability-domain list --compartment-id "$OCI_COMPARTMENT_OCID" --query 'data[].name' | jq -r '.[]')
[ "${#ADS[@]}" -gt 0 ] || { echo "No ADs found — is the OCI CLI authenticated?"; exit 1; }

IMAGE="${OCI_IMAGE_OCID:-}"
if [ -z "$IMAGE" ]; then
  echo "==> discovering latest Ubuntu 22.04 image for $SHAPE"
  IMAGE="$(oci compute image list --compartment-id "$OCI_COMPARTMENT_OCID" \
    --operating-system "Canonical Ubuntu" --operating-system-version "22.04" \
    --shape "$SHAPE" --sort-by TIMECREATED --query 'data[0].id' --raw-output)"
fi
[ -n "$IMAGE" ] && [ "$IMAGE" != "null" ] || { echo "No Ubuntu 22.04 A1 image found — set OCI_IMAGE_OCID"; exit 1; }

echo "Image: $IMAGE"
echo "ADs:   ${ADS[*]}"
echo "Shape: $SHAPE  ${OCPUS} OCPU / ${MEM} GB / ${BOOT_GB} GB boot"

# A prior attempt may have actually created the instance but timed out reading the
# response — reuse it instead of duplicating.
find_instance() {
  oci compute instance list --compartment-id "$OCI_COMPARTMENT_OCID" --output json 2>/dev/null \
    | jq -r --arg n "$NAME" '.data[]? | select(."display-name"==$n and ."lifecycle-state"!="TERMINATED" and ."lifecycle-state"!="TERMINATING") | .id' | head -1
}

IID=""
attempt=0
while [ -z "$IID" ] || [ "$IID" = "null" ]; do
  EXIST=$(find_instance)
  if [ -n "$EXIST" ] && [ "$EXIST" != "null" ]; then IID="$EXIST"; echo "reusing existing instance $IID"; break; fi

  for AD in "${ADS[@]}"; do
    attempt=$((attempt + 1))
    printf '[%s] launching in %s ... ' "$attempt" "$AD"
    if OUT=$(oci compute instance launch \
        --availability-domain "$AD" \
        --compartment-id "$OCI_COMPARTMENT_OCID" \
        --shape "$SHAPE" \
        --shape-config "{\"ocpus\": $OCPUS, \"memoryInGBs\": $MEM}" \
        --image-id "$IMAGE" \
        --subnet-id "$OCI_SUBNET_OCID" \
        --assign-public-ip true \
        --boot-volume-size-in-gbs "$BOOT_GB" \
        --display-name "$NAME" \
        --metadata "{\"ssh_authorized_keys\": \"$PUBKEY\"}" \
        2>/tmp/oci-launch.err); then
      IID=$(echo "$OUT" | jq -r '.data.id')
      echo "✅ accepted ($IID)"
      break
    fi
    # Never abort the loop: capacity AND transient/unknown errors just retry.
    if grep -qiE 'capacity|out of host|InternalError|LimitExceeded|TooManyRequests|429|500' /tmp/oci-launch.err; then
      echo "no capacity"
    elif grep -qiE 'timed out|timeout|connection|temporarily|RequestException' /tmp/oci-launch.err; then
      echo "transient — will retry"
    else
      echo "unexpected (will retry) — last lines:"; tail -3 /tmp/oci-launch.err
    fi
  done

  [ -n "$IID" ] && [ "$IID" != "null" ] && break
  echo "    round done — sleeping ${SLEEP}s"
  sleep "$SLEEP"
done

echo "==> instance $IID — waiting for RUNNING + public IP"
oci compute instance get --instance-id "$IID" --wait-for-state RUNNING --max-wait-seconds 600 >/dev/null 2>&1 || true
IP=$(oci compute instance list-vnics --instance-id "$IID" --query 'data[0]."public-ip"' --raw-output 2>/dev/null)
echo "✅ RUNNING"
echo "Instance: $IID"
echo "Public IP: ${IP:-<run: oci compute instance list-vnics --instance-id $IID>}"
