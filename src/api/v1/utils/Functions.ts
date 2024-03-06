export function parseDate(date: NativeDate | Date): string {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short"
    })
}

export function parseDateToISO(date: NativeDate | Date): string {
    return new Date(date).toISOString()
}
