// API contract between the React frontend and the Databricks Apps backend.
// Share this file with the backend team: both sides build to these shapes.
// JSDoc only — no runtime code. VS Code uses it for autocomplete.

/** @typedef {"valid" | "outdated" | "conflicting"} SituationStatus */
/** @typedef {"teams" | "email" | "ticket"} SourceType */

/**
 * Opaque reference to where the original information lives.
 * Never build queries from it in the browser; pass `key` to GET /api/sources/{key}.
 * Key format: "<sourceType>:<documentId>[:seq-<n>]", e.g. "teams:thread-trn042:seq-8"
 * @typedef {Object} Pointer
 * @property {"delta" | "lakebase" | "vector_index"} store
 * @property {string} catalog
 * @property {string} schema
 * @property {string} table
 * @property {string} key
 * @property {SourceType} sourceType
 */

/**
 * POST /api/situations/search  (request body)
 * @typedef {Object} SearchRequest
 * @property {string} description  incomplete situation description
 * @property {string} [entity]     e.g. "TRN-042"
 * @property {string} [at]         ISO time, point-in-time view; backend defaults to now
 * @property {number} [limit]
 */

/**
 * One ranked result. Scores are computed in the backend; the UI only displays and sorts.
 * The backend sends relevancy, recency and score on a 0..1000 scale.
 * client.js divides them by 1000, so inside the frontend they are 0..1.
 * @typedef {Object} SituationHit
 * @property {string} id
 * @property {string} summary
 * @property {string[]} categories
 * @property {string[]} entities
 * @property {number} relevancy  0..1 in the UI (backend: 0..1000)
 * @property {number} recency    0..1 in the UI (backend: 0..1000)
 * @property {number} score      combined, default sort; 0..1 in the UI (backend: 0..1000)
 * @property {SituationStatus} status
 * @property {string[]} [why]    what matched, e.g. ["entity: TRN-042"]
 */

/**
 * POST /api/situations/search  (response)
 * @typedef {Object} SearchResponse
 * @property {SearchRequest} query
 * @property {SituationHit[]} results
 */

/**
 * @typedef {Object} Problem
 * @property {string} id
 * @property {string[]} symptoms
 * @property {Pointer[]} pointers
 */

/**
 * @typedef {Object} Solution
 * @property {string} id
 * @property {string} action
 * @property {string} author
 * @property {string} validFrom          ISO
 * @property {string | null} validTo     null = still believed true
 * @property {string | null} supersededBy
 * @property {string[]} conflictsWith
 * @property {Pointer[]} pointers
 */

/**
 * GET /api/situations/{id}
 * @typedef {SituationHit & { problems: Problem[], solutions: Solution[] }} SituationDetail
 */

/**
 * @typedef {Object} SourceMessage
 * @property {number} seq
 * @property {string} author
 * @property {string} [role]
 * @property {string} time
 * @property {string} text
 * @property {boolean} highlighted  message the problem/solution was extracted from
 */

/**
 * GET /api/sources/{key}
 * @typedef {Object} SourceDocument
 * @property {string} key
 * @property {SourceType} sourceType
 * @property {string} title       thread name or email subject
 * @property {string} capturedAt  ISO
 * @property {SourceMessage[]} messages
 */

/**
 * GET /api/categories  (returns Category[])
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} label
 * @property {string} description
 * @property {string | null} parentId
 * @property {number} situationCount
 */

/**
 * POST /api/ingest
 * @typedef {Object} IngestRequest
 * @property {SourceType} sourceType
 * @property {string} content  raw email text or Teams JSON as a string
 */

/**
 * @typedef {Object} IngestResponse
 * @property {string} sourceKey
 * @property {SituationDetail[]} situations
 * @property {string[]} newCategories
 */

/** @typedef {"score" | "relevancy" | "recency"} SortKey */

export {};
