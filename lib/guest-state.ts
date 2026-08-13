import type { AppState } from './types';
import { addDays, getDefaultState, todayISO } from './cycle';

/**
 * In-memory demo data for logged-out browsing.
 * Never persisted to localStorage or Firestore.
 */
export function getGuestPlaceholderState(): AppState {
  const today = todayISO();
  const start = addDays(today, -10);

  return {
    ...getDefaultState(),
    anchorDate: start,
    cycleStartDate: start,
    profile: {
      name: '访客（演示）',
      age: '28',
      height: '175',
    },
    weightLog: {
      [addDays(today, -9)]: '78.5',
      [addDays(today, -6)]: '78.2',
      [addDays(today, -3)]: '77.9',
      [addDays(today, -1)]: '77.8',
    },
    trainingLog: {
      [addDays(today, -4)]: {
        completed: 'yes',
        notes: '演示：练胸已完成',
      },
      [addDays(today, -3)]: {
        completed: 'yes',
        notes: '演示：练背已完成',
      },
      [addDays(today, -2)]: {
        completed: 'no',
        notes: '演示：休息日',
      },
    },
  };
}
