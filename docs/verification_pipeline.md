# Verification Pipeline

## Inputs
- `imageBuffer`: Raw bytes captured by the mobile client.
- `depthFrame` (optional): Structured depth map containing width, height, and depth values.
- `expectedDeviceId` (optional): Device identifier used to boost EXIF confidence when matched.

## Stages
1. **Checksum & Integrity**
   - Compute a SHA-256 digest of the raw buffer (`app/crypto/hash.ts`).
   - The digest is reused for blockchain signing and downstream correlation.
2. **Metadata Extraction**
   - `extractMetadata` leverages `exif-parser` to gather EXIF tags (make/model, ISO, GPS, timestamp, etc.).
   - Missing metadata triggers lower EXIF confidence rather than fatal errors unless validation fails.
3. **Depth Analysis**
   - `scoreDepthFrame` validates depth dimensions and calculates variance, mean distance, and a confidence value (0-1) based on normalized variance.
4. **Scoring**
   - EXIF confidence is computed from the ratio of populated metadata fields with bonuses for GPS data and device matches.
   - Combined score blends EXIF (60%) and depth (40%) confidence when depth data exists.
5. **Verdict**
   - `pass`: combined score ≥ 0.8
   - `review`: combined score ≥ 0.5
   - `fail`: otherwise
   - Output payload contains the checksum, raw metadata, optional depth metrics, and the final verdict.

## Extensibility Hooks
- **Additional Sensors**: Add new scoring functions and merge the results before `resolveVerdict`.
- **Policy Rules**: Replace the static thresholds with policy objects loaded from config or persisted policy docs.
- **Async Enrichment**: If remote validation (e.g., device attestation) is needed, call it before scoring and feed the result into the metadata object.

## Error Handling
- Validation issues throw `AppError` with code `VALIDATION_ERROR`, ensuring upstream clients can differentiate user issues from server faults.
- Unexpected failures bubble up as `VERIFICATION_PIPELINE_FAILED` for centralized alerting through the logging system.
