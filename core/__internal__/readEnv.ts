export function readEnv<T>(key: string, defaultValue: T): T {
  const value = Deno.env.get(key);

  if (value === undefined) {
    return defaultValue;
  }

  if (Array.isArray(defaultValue)) {
    return value.split(/,\s*/).map((item) => item.trim()).filter((item) =>
      item.length > 0
    ) as T;
  }

  switch (typeof defaultValue) {
    case "number":
      return Number(value) as T;
    case "boolean":
      return Boolean(value) as T;
    default:
      return value as T;
  }
}
