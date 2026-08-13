// Build-time feature flags.
//
// These gate UI that is finished and deployed but not yet ready to be shown to
// users. The code stays in the bundle - only its entry points are hidden - so
// enabling a feature is a one-line change rather than a re-implementation.

// Practice sentences. The backend (POST /sentences, GET /sentences) is live in
// prod, and this UI has been running on staging since 2024, but it is held back
// until the feature is ready to announce. Setting this to true restores the
// Practice sentences section on the profile and the /sentences route.
export const SENTENCES_ENABLED = false
