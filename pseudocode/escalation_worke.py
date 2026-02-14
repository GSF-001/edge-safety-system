export async function escalate(event) {
  if (!event.acknowledged) {
    notifyContacts(event)
    callBodyguards(event)
  }
}
