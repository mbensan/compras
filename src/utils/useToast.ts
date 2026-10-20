import { reactive } from 'vue';

export interface ToastState {
  message: string;
  kind: 'success' | 'error' | 'info';
}

export const toast = reactive<ToastState>({ message: '', kind: 'info' });
let timer: ReturnType<typeof setTimeout> | undefined;

export function showToast(message: string, kind: ToastState['kind'] = 'success', ms = 5000): void {
  toast.message = message;
  toast.kind = kind;
  clearTimeout(timer);
  timer = setTimeout(() => (toast.message = ''), ms);
}
