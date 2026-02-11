# Event Flow

1. Signal captured on device (watch / sensor)
2. Edge agent preprocesses and classifies event
3. User is notified locally first
4. Backend ingest stores immutable event
5. Escalation triggered if no acknowledgement
6. Forensic bundle generated for critical cases
