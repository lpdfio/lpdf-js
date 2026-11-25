// What the engine says of a license key. Apart from the Node engine, so that the browser entry's declarations
// don't reach those of the engine.

/** How a license key stands with this build of the engine. */
export type LicenseStatus =
  | 'licensed'
  | 'no_key'
  | 'expired'
  | 'version_mismatch'
  | 'wrong_product'
  | 'unknown_key'
  | 'bad_signature'
  | 'malformed';

/**
 * What the engine makes of a license key — see `checkLicenseKey` of the engine.
 *
 * Everything but `status` is present only once the key's signature verified, so an expired or
 * wrong-version key still names its license while an unreadable one says nothing further: an
 * unverified token's contents are its author's claims, not facts.
 */
export interface LicenseCheck {
  status: LicenseStatus;
  /** Which Codesense product the key was issued for. */
  product?: string;
  /** `community`, `professional` or `enterprise`. */
  tier?: string;
  /** When the key stops validating, ISO 8601 UTC. Absent on a version-locked key. */
  expires?: string;
  /** The license number, as the customer reads it: `L-7K3M9Q`. */
  license?: string;
  /** Which key this is on its license — 1, 2, 3 in issue order. */
  key?: number;
}
