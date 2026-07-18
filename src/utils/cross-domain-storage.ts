export function getDismissed(key: string): boolean {
  return localStorage.getItem(key) === '1' || localStorage.getItem(key) === 'true';
}

export function setDismissed(key: string): void {
  localStorage.setItem(key, '1');
}
