export function setItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export function getItem<T>(key: string): T | undefined {
  const value = localStorage.getItem(key);
  if (value === null) {
    return undefined;
  }
  return JSON.parse(value) as T;
}
