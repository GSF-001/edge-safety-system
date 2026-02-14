export async function ingestEvent(event) {
  storeEvent(event)
  notifyUser(event)
  scheduleEscalation(event)
}
