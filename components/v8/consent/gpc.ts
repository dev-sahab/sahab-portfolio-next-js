/** Global Privacy Control: a browser opt-out signal honoured under several US state laws (e.g. California). */
export function gpcEnabled() {
  if (typeof navigator === 'undefined') return false
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
}
