/**
 * backend_ingest.js
 * -----------------------------------
 * Backend ingest layer for Edge Safety System
 * Purpose:
 * - Receive edge incident signals
 * - Validate consent & intent
 * - Decide escalation path
 * - Keep data minimal & ephemeral
 *
 * Conceptual / Architectural Reference
 */

import { validatePayload } from "./utils/validator.js"
import { shouldEscalate } from "./algorithms/escalation.js"
import { notifyContacts } from "./services/notify.js"
import { triggerEmergency } from "./services/emergency.js"

/**
 * Main ingest entry
 * Called by edge devices (mobile / wearable / local agent)
 */
export async function ingestIncident(req, res) {
  try {
    const payload = req.body

    // 1. Basic schema & integrity validation
    if (!validatePayload(payload)) {
      return res.status(400).json({ error: "invalid_payload" })
    }

    const {
      incident_id,
      signal_type,
      confidence,
      consent,
      acknowledged,
      timestamp,
      metadata
    } = payload

    // 2. Consent gate (hard stop)
    if (!consent || consent !== true) {
      return res.status(403).json({ status: "blocked_no_consent" })
    }

    // 3. Ignore acknowledged events
    if (acknowledged === true) {
      return res.status(200).json({ status: "acknowledged_no_action" })
    }

    // 4. Decision logic (deterministic & explainable)
    const escalationDecision = shouldEscalate({
      signal_type,
      confidence,
      metadata
    })

    // 5. Escalation paths
    if (escalationDecision.level === "notify") {
      await notifyContacts(incident_id)
    }

    if (escalationDecision.level === "emergency") {
      await notifyContacts(incident_id)
      await triggerEmergency(incident_id)
    }

    // 6. Minimal response, no sensitive echo
    return res.status(200).json({
      status: "processed",
      escalation: escalationDecision.level
    })

  } catch (err) {
    console.error("INGEST_ERROR", err)
    return res.status(500).json({ error: "internal_error" })
  }
}
