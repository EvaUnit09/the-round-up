export const DEMO_USER_NAMES: Record<string, string> = {
  "eNWD5U2tARfaRlxgEXN9eMK383HQxHrgFGi9RC8usR8+cIQmN5NteZXNegiH+V0W": "Noah",
  "KAIYcBh0jerRoI4V8K8ur4l4kbtDNPnszD4+pvVhRUzjxtXDEPutq4AClu82P3bE": "Danny",
  "s+jxCXwXWo5PzbM39B791pqHC2e8PntNspGv/ncONC2sJL1ebf3VT5g1lHqKoOhq": "Agapi",
};

export function demoName(userId: string): string {
  return DEMO_USER_NAMES[userId] ?? userId.slice(0, 5);
}
