import { FirebaseError } from 'firebase/app';

export function formatCloudError(err: unknown): string {
  if (err instanceof FirebaseError && err.code === 'permission-denied') {
    return 'Firestore 权限不足。请到 Firebase Console → Firestore → Rules，粘贴项目里的 firestore.rules 内容并 Publish。';
  }

  if (err instanceof Error) return err.message;
  return '云端保存失败';
}
