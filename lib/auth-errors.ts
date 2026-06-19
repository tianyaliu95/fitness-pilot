import { FirebaseError } from 'firebase/app';

export function formatAuthError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/configuration-not-found':
        return 'Google 登录尚未在 Firebase 开启。请到 Firebase Console → Authentication → Sign-in method → Google → Enable，保存后刷新页面重试。';
      case 'auth/operation-not-allowed':
        return '该登录方式未启用。请在 Firebase Console 的 Authentication 中开启 Google 或 Email/Password。';
      case 'auth/unauthorized-domain':
        return '当前网站域名未授权。请到 Firebase Console → Authentication → Settings → Authorized domains 添加当前域名（本地开发用 localhost）。';
      case 'auth/popup-closed-by-user':
        return '登录窗口已关闭，请再试一次。';
      case 'auth/popup-blocked':
        return '浏览器阻止了弹窗，已改为页面跳转登录。';
      case 'auth/cancelled-popup-request':
        return '已有登录窗口在进行中，请稍候或刷新页面后重试。';
      case 'auth/network-request-failed':
        return '网络错误，请检查网络连接后重试。';
      case 'auth/invalid-email':
        return '邮箱格式不正确。';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return '邮箱或密码错误。';
      case 'auth/email-already-in-use':
        return '该邮箱已注册，请直接登录。';
      case 'auth/weak-password':
        return '密码太弱，请至少使用 6 位字符。';
      default:
        return err.message || '登录失败，请重试。';
    }
  }

  if (err instanceof Error) return err.message;
  return '登录失败，请重试。';
}
