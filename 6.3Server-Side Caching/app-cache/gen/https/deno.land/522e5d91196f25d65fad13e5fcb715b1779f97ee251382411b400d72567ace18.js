export function parseXMessage(raw) {
  const fieldValues = {};
  let f = undefined;
  let m = 0;
  for (const data of raw[1]){
    if (m % 2 === 0) {
      f = data;
    } else if (f) {
      fieldValues[f] = data;
    }
    m++;
  }
  return {
    xid: parseXId(raw[0]),
    fieldValues: fieldValues
  };
}
export function convertMap(raw) {
  const fieldValues = new Map();
  let f = undefined;
  let m = 0;
  for (const data of raw){
    if (m % 2 === 0 && typeof data === "string") {
      f = data;
    } else if (m % 2 === 1 && f) {
      fieldValues.set(f, data);
    }
    m++;
  }
  return fieldValues;
}
export function parseXReadReply(raw) {
  const out = [];
  for (const [key, idData] of raw ?? []){
    const messages = [];
    for (const rawMsg of idData){
      messages.push(parseXMessage(rawMsg));
    }
    out.push({
      key,
      messages
    });
  }
  return out;
}
export function parseXId(raw) {
  const [ms, sn] = raw.split("-");
  return {
    unixMs: parseInt(ms),
    seqNo: parseInt(sn)
  };
}
export function parseXPendingConsumers(raws) {
  const out = [];
  for (const raw of raws){
    if (isCondArray(raw) && isString(raw[0]) && isString(raw[1])) {
      out.push({
        name: raw[0],
        pending: parseInt(raw[1])
      });
    }
  }
  return out;
}
export function parseXPendingCounts(raw) {
  const infos = [];
  for (const r of raw){
    if (isCondArray(r) && isString(r[0]) && isString(r[1]) && isNumber(r[2]) && isNumber(r[3])) {
      infos.push({
        xid: parseXId(r[0]),
        owner: r[1],
        lastDeliveredMs: r[2],
        timesDelivered: r[3]
      });
    }
  }
  return infos;
}
export function parseXGroupDetail(rawGroups) {
  const out = [];
  for (const rawGroup of rawGroups){
    if (isCondArray(rawGroup)) {
      const data = convertMap(rawGroup);
      // array of arrays
      const consDeets = data.get("consumers");
      out.push({
        name: rawstr(data.get("name") ?? null),
        lastDeliveredId: parseXId(rawstr(data.get("last-delivered-id") ?? null)),
        pelCount: rawnum(data.get("pel-count") ?? null),
        pending: parseXPendingCounts(data.get("pending")),
        consumers: parseXConsumerDetail(consDeets)
      });
    }
  }
  return out;
}
export function parseXConsumerDetail(nestedRaws) {
  const out = [];
  for (const raws of nestedRaws){
    const data = convertMap(raws);
    const pending = data.get("pending").map((p)=>{
      return {
        xid: parseXId(rawstr(p[0])),
        lastDeliveredMs: rawnum(p[1]),
        timesDelivered: rawnum(p[2])
      };
    });
    const r = {
      name: rawstr(data.get("name") ?? null),
      seenTime: rawnum(data.get("seen-time") ?? null),
      pelCount: rawnum(data.get("pel-count") ?? null),
      pending
    };
    out.push(r);
  }
  return out;
}
export function xidstr(xid) {
  if (typeof xid === "string") return xid;
  if (typeof xid === "number") return `${xid}-0`;
  if (xid instanceof Array && xid.length > 1) return `${xid[0]}-${xid[1]}`;
  if (isXId(xid)) return `${xid.unixMs}-${xid.seqNo}`;
  throw "fail";
}
export function rawnum(raw) {
  return raw ? +raw.toString() : 0;
}
export function rawstr(raw) {
  return raw ? raw.toString() : "";
}
// deno-lint-ignore no-explicit-any
export function isString(x) {
  return typeof x === "string";
}
// deno-lint-ignore no-explicit-any
export function isNumber(x) {
  return typeof x === "number";
}
export function isCondArray(x) {
  const l = x.length;
  if (l > 0 || l < 1) return true;
  else return false;
}
function isXId(xid) {
  return xid.unixMs !== undefined;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvcmVkaXNAdjAuMzEuMC9zdHJlYW0udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDb25kaXRpb25hbEFycmF5LCBSYXcsIFJlZGlzVmFsdWUgfSBmcm9tIFwiLi9wcm90b2NvbC9tb2QudHNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBYSWQge1xuICB1bml4TXM6IG51bWJlcjtcbiAgc2VxTm86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBYTWVzc2FnZSB7XG4gIHhpZDogWElkO1xuICBmaWVsZFZhbHVlczogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBYS2V5SWQge1xuICBrZXk6IHN0cmluZztcbiAgeGlkOiBYSWRJbnB1dDtcbn1cblxuZXhwb3J0IHR5cGUgWEtleUlkTGlrZSA9IFtzdHJpbmcsIFhJZElucHV0XTtcblxuZXhwb3J0IGludGVyZmFjZSBYS2V5SWRHcm91cCB7XG4gIGtleTogc3RyaW5nO1xuICB4aWQ6IFhJZEdyb3VwUmVhZDtcbn1cblxuZXhwb3J0IHR5cGUgWEtleUlkR3JvdXBMaWtlID0gW3N0cmluZywgWElkR3JvdXBSZWFkXTtcblxuZXhwb3J0IHR5cGUgWFJlYWRTdHJlYW0gPSB7IGtleTogc3RyaW5nOyBtZXNzYWdlczogWE1lc3NhZ2VbXSB9O1xuZXhwb3J0IHR5cGUgWFJlYWRSZXBseSA9IFhSZWFkU3RyZWFtW107XG5cbi8vIGJhc2ljIGRhdGEgcmV0dXJuZWQgYnkgcmVkaXNcbmV4cG9ydCB0eXBlIFhSZWFkSWREYXRhID0gW3N0cmluZywgc3RyaW5nW11dO1xuZXhwb3J0IHR5cGUgWFJlYWRTdHJlYW1SYXcgPSBbc3RyaW5nLCBYUmVhZElkRGF0YVtdXTtcbmV4cG9ydCB0eXBlIFhSZWFkUmVwbHlSYXcgPSBYUmVhZFN0cmVhbVJhd1tdO1xuXG4vKiogRmxleGlibGUgaW5wdXQgdHlwZSBmb3IgY29tbWFuZHMgd2hpY2ggcmVxdWlyZSBtZXNzYWdlXG4gKiBJRCB0byBiZSBwYXNzZWQgKHJlcHJlc2VudGVkIGluIGxvd2VyLWxldmVsIFJlZGlzIEFQSSBhc1xuICogXCIxMDAwLTBcIiBldGMpLlxuICpcbiAqIFdlIGFsc28gaW5jbHVkZSBhbiBhcnJheSBmb3JtYXQgZm9yIGVhc2Ugb2YgdXNlLCB3aGVyZVxuICogdGhlIGZpcnN0IGVsZW1lbnQgaXMgdGhlIGVwb2NoTWlsbGlzLCBzZWNvbmQgaXMgc2VxTm8uXG4gKlxuICogV2UgYWxzbyBhbGxvdyBwYXNzaW5nIGEgc2luZ2xlIG51bWJlcixcbiAqIHdoaWNoIHdpbGwgcmVwcmVzZW50IHRoZSB0aGUgZXBvY2ggTWlsbGlzIHdpdGhcbiAqIHNlcU5vIG9mIHplcm8uICAoRXNwZWNpYWxseSB1c2VmdWwgaXMgdG8gcGFzcyAwLilcbiAqL1xuZXhwb3J0IHR5cGUgWElkSW5wdXQgPSBYSWQgfCBbbnVtYmVyLCBudW1iZXJdIHwgbnVtYmVyIHwgc3RyaW5nO1xuLyoqXG4gKiBJRCBpbnB1dCB0eXBlIGZvciBYQURELCB3aGljaCBpcyBhbGxvd2VkIHRvIGluY2x1ZGUgdGhlXG4gKiBcIipcIiBvcGVyYXRvci4gKi9cbmV4cG9ydCB0eXBlIFhJZEFkZCA9IFhJZElucHV0IHwgXCIqXCI7XG4vKipcbiAqIElEIGlucHV0IHR5cGUgZm9yIFhHUk9VUFJFQUQsIHdoaWNoIGlzIGFsbG93ZWQgdG8gaW5jbHVkZVxuICogdGhlIFwiPlwiIG9wZXJhdG9yLiAgV2UgaW5jbHVkZSBhbiBhcnJheSBmb3JtYXQgZm9yIGVhc2Ugb2ZcbiAqIHVzZSwgd2hlcmUgdGhlIGZpcnN0IGVsZW1lbnQgaXMgdGhlIGVwb2NoTWlsbGlzLCBzZWNvbmRcbiAqIGlzIHNlcU5vLiAqL1xuZXhwb3J0IHR5cGUgWElkR3JvdXBSZWFkID0gWElkSW5wdXQgfCBcIj5cIjtcblxuLyoqIEFsbG93cyBzcGVjaWFsIG1heGltdW0gSUQgZm9yIFhSQU5HRSBhbmQgWFJFVlJBTkdFICovXG5leHBvcnQgdHlwZSBYSWRQb3MgPSBYSWRJbnB1dCB8IFwiK1wiO1xuLyoqIEFsbG93cyBzcGVjaWFsIG1pbmltdW0gSUQgZm9yIFhSQU5HRSBhbmQgWFJFVlJBTkdFICovXG5leHBvcnQgdHlwZSBYSWROZWcgPSBYSWRJbnB1dCB8IFwiLVwiO1xuLyoqIEFsbG93IHNwZWNpYWwgJCBJRCBmb3IgWEdST1VQIENSRUFURSAqL1xuZXhwb3J0IHR5cGUgWElkQ3JlYXRlR3JvdXAgPSBYSWRJbnB1dCB8IFwiJFwiO1xuXG5leHBvcnQgdHlwZSBYQWRkRmllbGRWYWx1ZXMgPVxuICB8IFJlY29yZDxzdHJpbmcgfCBudW1iZXIsIFJlZGlzVmFsdWU+XG4gIHwgTWFwPHN0cmluZyB8IG51bWJlciwgUmVkaXNWYWx1ZT47XG5cbmV4cG9ydCBpbnRlcmZhY2UgWFJlYWRPcHRzIHtcbiAgY291bnQ/OiBudW1iZXI7XG4gIGJsb2NrPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFhSZWFkR3JvdXBPcHRzIHtcbiAgZ3JvdXA6IHN0cmluZztcbiAgY29uc3VtZXI6IHN0cmluZztcbiAgY291bnQ/OiBudW1iZXI7XG4gIGJsb2NrPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFhNYXhsZW4ge1xuICBhcHByb3g/OiBib29sZWFuO1xuICBlbGVtZW50czogbnVtYmVyO1xufVxuXG5leHBvcnQgdHlwZSBYQ2xhaW1SZXBseSA9IFhDbGFpbU1lc3NhZ2VzIHwgWENsYWltSnVzdFhJZDtcbmV4cG9ydCBpbnRlcmZhY2UgWENsYWltTWVzc2FnZXMge1xuICBraW5kOiBcIm1lc3NhZ2VzXCI7XG4gIG1lc3NhZ2VzOiBYTWVzc2FnZVtdO1xufVxuZXhwb3J0IGludGVyZmFjZSBYQ2xhaW1KdXN0WElkIHtcbiAga2luZDogXCJqdXN0eGlkXCI7XG4gIHhpZHM6IFhJZFtdO1xufVxuXG4vKipcbiAqIEBwYXJhbSBjb3VudCBMaW1pdCBvbiB0aGUgbnVtYmVyIG9mIG1lc3NhZ2VzIHRvIHJldHVybiBwZXIgY2FsbC5cbiAqIEBwYXJhbSBzdGFydElkIElEIGZvciB0aGUgZmlyc3QgcGVuZGluZyByZWNvcmQuXG4gKiBAcGFyYW0gZW5kSWQgIElEIGZvciB0aGUgZmluYWwgcGVuZGluZyByZWNvcmQuXG4gKiBAcGFyYW0gY29uc3VtZXJzICBFdmVyeSBjb25zdW1lciBpbiB0aGUgY29uc3VtZXIgZ3JvdXBcbiAqIHdpdGggYXQgbGVhc3Qgb25lIHBlbmRpbmcgbWVzc2FnZSwgYW5kIHRoZSBudW1iZXIgb2ZcbiAqIHBlbmRpbmcgbWVzc2FnZXMgaXQgaGFzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFhQZW5kaW5nUmVwbHkge1xuICBjb3VudDogbnVtYmVyO1xuICBzdGFydElkOiBYSWQ7XG4gIGVuZElkOiBYSWQ7XG4gIGNvbnN1bWVyczogWFBlbmRpbmdDb25zdW1lcltdO1xufVxuZXhwb3J0IGludGVyZmFjZSBYUGVuZGluZ0NvbnN1bWVyIHtcbiAgbmFtZTogc3RyaW5nO1xuICBwZW5kaW5nOiBudW1iZXI7XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHBlbmRpbmcgbWVzc2FnZSBwYXJzZWQgZnJvbSB4cGVuZGluZy5cbiAqXG4gKiBAcGFyYW0gaWQgVGhlIElEIG9mIHRoZSBtZXNzYWdlXG4gKiBAcGFyYW0gY29uc3VtZXIgVGhlIG5hbWUgb2YgdGhlIGNvbnN1bWVyIHRoYXQgZmV0Y2hlZCB0aGUgbWVzc2FnZVxuICogIGFuZCBoYXMgc3RpbGwgdG8gYWNrbm93bGVkZ2UgaXQuIFdlIGNhbGwgaXQgdGhlXG4gKiAgY3VycmVudCBvd25lciBvZiB0aGUgbWVzc2FnZS5cbiAqIEBwYXJhbSBsYXN0RGVsaXZlcmVkTXMgVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdGhhdCBlbGFwc2VkIHNpbmNlIHRoZVxuICogIGxhc3QgdGltZSB0aGlzIG1lc3NhZ2Ugd2FzIGRlbGl2ZXJlZCB0byB0aGlzIGNvbnN1bWVyLlxuICogQHBhcmFtIHRpbWVzRGVsaXZlcmVkIFRoZSBudW1iZXIgb2YgdGltZXMgdGhpcyBtZXNzYWdlIHdhcyBkZWxpdmVyZWQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgWFBlbmRpbmdDb3VudCB7XG4gIHhpZDogWElkO1xuICBvd25lcjogc3RyaW5nO1xuICBsYXN0RGVsaXZlcmVkTXM6IG51bWJlcjtcbiAgdGltZXNEZWxpdmVyZWQ6IG51bWJlcjtcbn1cbi8qKiBVc2VkIGluIHRoZSBYUEVORElORyBjb21tYW5kLCBhbGwgdGhyZWUgb2YgdGhlc2VcbiAqIGFyZ3MgbXVzdCBiZSBzcGVjaWZpZWQgaWYgX2FueV8gYXJlIHNwZWNpZmllZC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdGFydEVuZENvdW50IHtcbiAgc3RhcnQ6IG51bWJlciB8IFwiLVwiO1xuICBlbmQ6IG51bWJlciB8IFwiK1wiO1xuICBjb3VudDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFhJbmZvU3RyZWFtUmVwbHkge1xuICBsZW5ndGg6IG51bWJlcjtcbiAgcmFkaXhUcmVlS2V5czogbnVtYmVyO1xuICByYWRpeFRyZWVOb2RlczogbnVtYmVyO1xuICBncm91cHM6IG51bWJlcjtcbiAgbGFzdEdlbmVyYXRlZElkOiBYSWQ7XG4gIGZpcnN0RW50cnk6IFhNZXNzYWdlO1xuICBsYXN0RW50cnk6IFhNZXNzYWdlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFhJbmZvU3RyZWFtRnVsbFJlcGx5IHtcbiAgbGVuZ3RoOiBudW1iZXI7XG4gIHJhZGl4VHJlZUtleXM6IG51bWJlcjtcbiAgcmFkaXhUcmVlTm9kZXM6IG51bWJlcjtcbiAgbGFzdEdlbmVyYXRlZElkOiBYSWQ7XG4gIGVudHJpZXM6IFhNZXNzYWdlW107XG4gIGdyb3VwczogWEdyb3VwRGV0YWlsW107XG59XG5cbi8qKlxuICogQ2hpbGQgb2YgdGhlIHJldHVybiB0eXBlIGZvciB4aW5mb19zdHJlYW1fZnVsbFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFhHcm91cERldGFpbCB7XG4gIG5hbWU6IHN0cmluZztcbiAgbGFzdERlbGl2ZXJlZElkOiBYSWQ7XG4gIHBlbENvdW50OiBudW1iZXI7XG4gIHBlbmRpbmc6IFhQZW5kaW5nQ291bnRbXTtcbiAgY29uc3VtZXJzOiBYQ29uc3VtZXJEZXRhaWxbXTtcbn1cbi8qKiBDaGlsZCBvZiBYSU5GTyBTVFJFQU1TIEZVTEwgcmVzcG9uc2UgKi9cbmV4cG9ydCBpbnRlcmZhY2UgWENvbnN1bWVyRGV0YWlsIHtcbiAgbmFtZTogc3RyaW5nO1xuICBzZWVuVGltZTogbnVtYmVyO1xuICBwZWxDb3VudDogbnVtYmVyO1xuICBwZW5kaW5nOiB7IHhpZDogWElkOyBsYXN0RGVsaXZlcmVkTXM6IG51bWJlcjsgdGltZXNEZWxpdmVyZWQ6IG51bWJlciB9W107XG59XG5cbmV4cG9ydCB0eXBlIFhJbmZvQ29uc3VtZXJzUmVwbHkgPSBYSW5mb0NvbnN1bWVyW107XG4vKipcbiAqIEEgY29uc3VtZXIgcGFyc2VkIGZyb20geGluZm8gY29tbWFuZC5cbiAqXG4gKiBAcGFyYW0gbmFtZSBOYW1lIG9mIHRoZSBjb25zdW1lciBncm91cC5cbiAqIEBwYXJhbSBwZW5kaW5nIE51bWJlciBvZiBwZW5kaW5nIG1lc3NhZ2VzIGZvciB0aGlzIHNwZWNpZmljIGNvbnN1bWVyLlxuICogQHBhcmFtIGlkbGUgVGhpcyBjb25zdW1lcidzIGlkbGUgdGltZSBpbiBtaWxsaXNlY29uZHMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgWEluZm9Db25zdW1lciB7XG4gIG5hbWU6IHN0cmluZztcbiAgcGVuZGluZzogbnVtYmVyO1xuICBpZGxlOiBudW1iZXI7XG59XG5cbi8qKiBSZXNwb25zZSB0byBYSU5GTyBHUk9VUFMgPGtleT4gKi9cbmV4cG9ydCB0eXBlIFhJbmZvR3JvdXBzUmVwbHkgPSBYSW5mb0dyb3VwW107XG5leHBvcnQgaW50ZXJmYWNlIFhJbmZvR3JvdXAge1xuICBuYW1lOiBzdHJpbmc7XG4gIGNvbnN1bWVyczogbnVtYmVyO1xuICBwZW5kaW5nOiBudW1iZXI7XG4gIGxhc3REZWxpdmVyZWRJZDogWElkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFhDbGFpbU9wdHMge1xuICBncm91cDogc3RyaW5nO1xuICBjb25zdW1lcjogc3RyaW5nO1xuICBtaW5JZGxlVGltZTogbnVtYmVyO1xuICBpZGxlPzogbnVtYmVyO1xuICB0aW1lPzogbnVtYmVyO1xuICByZXRyeUNvdW50PzogbnVtYmVyO1xuICBmb3JjZT86IGJvb2xlYW47XG4gIGp1c3RYSWQ/OiBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VYTWVzc2FnZShyYXc6IFhSZWFkSWREYXRhKTogWE1lc3NhZ2Uge1xuICBjb25zdCBmaWVsZFZhbHVlczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuICBsZXQgZjogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIGxldCBtID0gMDtcbiAgZm9yIChjb25zdCBkYXRhIG9mIHJhd1sxXSkge1xuICAgIGlmIChtICUgMiA9PT0gMCkge1xuICAgICAgZiA9IGRhdGE7XG4gICAgfSBlbHNlIGlmIChmKSB7XG4gICAgICBmaWVsZFZhbHVlc1tmXSA9IGRhdGE7XG4gICAgfVxuICAgIG0rKztcbiAgfVxuXG4gIHJldHVybiB7IHhpZDogcGFyc2VYSWQocmF3WzBdKSwgZmllbGRWYWx1ZXM6IGZpZWxkVmFsdWVzIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0TWFwKHJhdzogQ29uZGl0aW9uYWxBcnJheSk6IE1hcDxzdHJpbmcsIFJhdz4ge1xuICBjb25zdCBmaWVsZFZhbHVlczogTWFwPHN0cmluZywgUmF3PiA9IG5ldyBNYXAoKTtcbiAgbGV0IGY6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICBsZXQgbSA9IDA7XG4gIGZvciAoY29uc3QgZGF0YSBvZiByYXcpIHtcbiAgICBpZiAobSAlIDIgPT09IDAgJiYgdHlwZW9mIGRhdGEgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGYgPSBkYXRhO1xuICAgIH0gZWxzZSBpZiAobSAlIDIgPT09IDEgJiYgZikge1xuICAgICAgZmllbGRWYWx1ZXMuc2V0KGYsIGRhdGEpO1xuICAgIH1cbiAgICBtKys7XG4gIH1cblxuICByZXR1cm4gZmllbGRWYWx1ZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVhSZWFkUmVwbHkocmF3OiBYUmVhZFJlcGx5UmF3KTogWFJlYWRSZXBseSB7XG4gIGNvbnN0IG91dDogWFJlYWRTdHJlYW1bXSA9IFtdO1xuICBmb3IgKGNvbnN0IFtrZXksIGlkRGF0YV0gb2YgcmF3ID8/IFtdKSB7XG4gICAgY29uc3QgbWVzc2FnZXMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IHJhd01zZyBvZiBpZERhdGEpIHtcbiAgICAgIG1lc3NhZ2VzLnB1c2gocGFyc2VYTWVzc2FnZShyYXdNc2cpKTtcbiAgICB9XG4gICAgb3V0LnB1c2goeyBrZXksIG1lc3NhZ2VzIH0pO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlWElkKHJhdzogc3RyaW5nKTogWElkIHtcbiAgY29uc3QgW21zLCBzbl0gPSByYXcuc3BsaXQoXCItXCIpO1xuICByZXR1cm4geyB1bml4TXM6IHBhcnNlSW50KG1zKSwgc2VxTm86IHBhcnNlSW50KHNuKSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VYUGVuZGluZ0NvbnN1bWVycyhcbiAgcmF3czogQ29uZGl0aW9uYWxBcnJheSxcbik6IFhQZW5kaW5nQ29uc3VtZXJbXSB7XG4gIGNvbnN0IG91dDogWFBlbmRpbmdDb25zdW1lcltdID0gW107XG5cbiAgZm9yIChjb25zdCByYXcgb2YgcmF3cykge1xuICAgIGlmIChpc0NvbmRBcnJheShyYXcpICYmIGlzU3RyaW5nKHJhd1swXSkgJiYgaXNTdHJpbmcocmF3WzFdKSkge1xuICAgICAgb3V0LnB1c2goeyBuYW1lOiByYXdbMF0sIHBlbmRpbmc6IHBhcnNlSW50KHJhd1sxXSkgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlWFBlbmRpbmdDb3VudHMocmF3OiBDb25kaXRpb25hbEFycmF5KTogWFBlbmRpbmdDb3VudFtdIHtcbiAgY29uc3QgaW5mb3M6IFhQZW5kaW5nQ291bnRbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHIgb2YgcmF3KSB7XG4gICAgaWYgKFxuICAgICAgaXNDb25kQXJyYXkocikgJiZcbiAgICAgIGlzU3RyaW5nKHJbMF0pICYmXG4gICAgICBpc1N0cmluZyhyWzFdKSAmJlxuICAgICAgaXNOdW1iZXIoclsyXSkgJiZcbiAgICAgIGlzTnVtYmVyKHJbM10pXG4gICAgKSB7XG4gICAgICBpbmZvcy5wdXNoKHtcbiAgICAgICAgeGlkOiBwYXJzZVhJZChyWzBdKSxcbiAgICAgICAgb3duZXI6IHJbMV0sXG4gICAgICAgIGxhc3REZWxpdmVyZWRNczogclsyXSxcbiAgICAgICAgdGltZXNEZWxpdmVyZWQ6IHJbM10sXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaW5mb3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVhHcm91cERldGFpbChyYXdHcm91cHM6IENvbmRpdGlvbmFsQXJyYXkpOiBYR3JvdXBEZXRhaWxbXSB7XG4gIGNvbnN0IG91dCA9IFtdO1xuXG4gIGZvciAoY29uc3QgcmF3R3JvdXAgb2YgcmF3R3JvdXBzKSB7XG4gICAgaWYgKGlzQ29uZEFycmF5KHJhd0dyb3VwKSkge1xuICAgICAgY29uc3QgZGF0YSA9IGNvbnZlcnRNYXAocmF3R3JvdXApO1xuXG4gICAgICAvLyBhcnJheSBvZiBhcnJheXNcbiAgICAgIGNvbnN0IGNvbnNEZWV0cyA9IGRhdGEuZ2V0KFwiY29uc3VtZXJzXCIpIGFzIENvbmRpdGlvbmFsQXJyYXlbXTtcblxuICAgICAgb3V0LnB1c2goe1xuICAgICAgICBuYW1lOiByYXdzdHIoZGF0YS5nZXQoXCJuYW1lXCIpID8/IG51bGwpLFxuICAgICAgICBsYXN0RGVsaXZlcmVkSWQ6IHBhcnNlWElkKFxuICAgICAgICAgIHJhd3N0cihkYXRhLmdldChcImxhc3QtZGVsaXZlcmVkLWlkXCIpID8/IG51bGwpLFxuICAgICAgICApLFxuICAgICAgICBwZWxDb3VudDogcmF3bnVtKGRhdGEuZ2V0KFwicGVsLWNvdW50XCIpID8/IG51bGwpLFxuICAgICAgICBwZW5kaW5nOiBwYXJzZVhQZW5kaW5nQ291bnRzKGRhdGEuZ2V0KFwicGVuZGluZ1wiKSBhcyBDb25kaXRpb25hbEFycmF5KSxcbiAgICAgICAgY29uc3VtZXJzOiBwYXJzZVhDb25zdW1lckRldGFpbChjb25zRGVldHMpLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlWENvbnN1bWVyRGV0YWlsKG5lc3RlZFJhd3M6IFJhd1tdW10pOiBYQ29uc3VtZXJEZXRhaWxbXSB7XG4gIGNvbnN0IG91dDogWENvbnN1bWVyRGV0YWlsW10gPSBbXTtcblxuICBmb3IgKGNvbnN0IHJhd3Mgb2YgbmVzdGVkUmF3cykge1xuICAgIGNvbnN0IGRhdGEgPSBjb252ZXJ0TWFwKHJhd3MpO1xuXG4gICAgY29uc3QgcGVuZGluZyA9IChkYXRhLmdldChcInBlbmRpbmdcIikgYXMgW3N0cmluZywgbnVtYmVyLCBudW1iZXJdW10pLm1hcChcbiAgICAgIChwKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeGlkOiBwYXJzZVhJZChyYXdzdHIocFswXSkpLFxuICAgICAgICAgIGxhc3REZWxpdmVyZWRNczogcmF3bnVtKHBbMV0pLFxuICAgICAgICAgIHRpbWVzRGVsaXZlcmVkOiByYXdudW0ocFsyXSksXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICk7XG5cbiAgICBjb25zdCByID0ge1xuICAgICAgbmFtZTogcmF3c3RyKGRhdGEuZ2V0KFwibmFtZVwiKSA/PyBudWxsKSxcbiAgICAgIHNlZW5UaW1lOiByYXdudW0oZGF0YS5nZXQoXCJzZWVuLXRpbWVcIikgPz8gbnVsbCksXG4gICAgICBwZWxDb3VudDogcmF3bnVtKGRhdGEuZ2V0KFwicGVsLWNvdW50XCIpID8/IG51bGwpLFxuICAgICAgcGVuZGluZyxcbiAgICB9O1xuXG4gICAgb3V0LnB1c2gocik7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24geGlkc3RyKFxuICB4aWQ6IFhJZEFkZCB8IFhJZE5lZyB8IFhJZFBvcyB8IFhJZENyZWF0ZUdyb3VwIHwgWElkR3JvdXBSZWFkLFxuKSB7XG4gIGlmICh0eXBlb2YgeGlkID09PSBcInN0cmluZ1wiKSByZXR1cm4geGlkO1xuICBpZiAodHlwZW9mIHhpZCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIGAke3hpZH0tMGA7XG4gIGlmICh4aWQgaW5zdGFuY2VvZiBBcnJheSAmJiB4aWQubGVuZ3RoID4gMSkgcmV0dXJuIGAke3hpZFswXX0tJHt4aWRbMV19YDtcbiAgaWYgKGlzWElkKHhpZCkpIHJldHVybiBgJHt4aWQudW5peE1zfS0ke3hpZC5zZXFOb31gO1xuICB0aHJvdyBcImZhaWxcIjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJhd251bShyYXc6IFJhdyk6IG51bWJlciB7XG4gIHJldHVybiByYXcgPyArcmF3LnRvU3RyaW5nKCkgOiAwO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJhd3N0cihyYXc6IFJhdyk6IHN0cmluZyB7XG4gIHJldHVybiByYXcgPyByYXcudG9TdHJpbmcoKSA6IFwiXCI7XG59XG4vLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuZXhwb3J0IGZ1bmN0aW9uIGlzU3RyaW5nKHg6IGFueSk6IHggaXMgc3RyaW5nIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSBcInN0cmluZ1wiO1xufVxuXG4vLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuZXhwb3J0IGZ1bmN0aW9uIGlzTnVtYmVyKHg6IGFueSk6IHggaXMgbnVtYmVyIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSBcIm51bWJlclwiO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb25kQXJyYXkoeDogUmF3KTogeCBpcyBDb25kaXRpb25hbEFycmF5IHtcbiAgY29uc3QgbCA9ICh4IGFzIENvbmRpdGlvbmFsQXJyYXkpLmxlbmd0aDtcbiAgaWYgKGwgPiAwIHx8IGwgPCAxKSByZXR1cm4gdHJ1ZTtcbiAgZWxzZSByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGlzWElkKHhpZDogWElkQWRkKTogeGlkIGlzIFhJZCB7XG4gIHJldHVybiAoeGlkIGFzIFhJZCkudW5peE1zICE9PSB1bmRlZmluZWQ7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBbU5BLE9BQU8sU0FBUyxjQUFjLEdBQWdCO0VBQzVDLE1BQU0sY0FBc0MsQ0FBQztFQUM3QyxJQUFJLElBQXdCO0VBRTVCLElBQUksSUFBSTtFQUNSLEtBQUssTUFBTSxRQUFRLEdBQUcsQ0FBQyxFQUFFLENBQUU7SUFDekIsSUFBSSxJQUFJLE1BQU0sR0FBRztNQUNmLElBQUk7SUFDTixPQUFPLElBQUksR0FBRztNQUNaLFdBQVcsQ0FBQyxFQUFFLEdBQUc7SUFDbkI7SUFDQTtFQUNGO0VBRUEsT0FBTztJQUFFLEtBQUssU0FBUyxHQUFHLENBQUMsRUFBRTtJQUFHLGFBQWE7RUFBWTtBQUMzRDtBQUVBLE9BQU8sU0FBUyxXQUFXLEdBQXFCO0VBQzlDLE1BQU0sY0FBZ0MsSUFBSTtFQUMxQyxJQUFJLElBQXdCO0VBRTVCLElBQUksSUFBSTtFQUNSLEtBQUssTUFBTSxRQUFRLElBQUs7SUFDdEIsSUFBSSxJQUFJLE1BQU0sS0FBSyxPQUFPLFNBQVMsVUFBVTtNQUMzQyxJQUFJO0lBQ04sT0FBTyxJQUFJLElBQUksTUFBTSxLQUFLLEdBQUc7TUFDM0IsWUFBWSxHQUFHLENBQUMsR0FBRztJQUNyQjtJQUNBO0VBQ0Y7RUFFQSxPQUFPO0FBQ1Q7QUFFQSxPQUFPLFNBQVMsZ0JBQWdCLEdBQWtCO0VBQ2hELE1BQU0sTUFBcUIsRUFBRTtFQUM3QixLQUFLLE1BQU0sQ0FBQyxLQUFLLE9BQU8sSUFBSSxPQUFPLEVBQUUsQ0FBRTtJQUNyQyxNQUFN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