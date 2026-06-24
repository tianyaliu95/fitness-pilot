import type {
  AppState,
  TrainingLog,
  TrainingLogEntry,
  TrainingStatus,
} from './types';
import { addDays, isOnOrAfterCycleStart, todayISO } from './cycle';
import { buildDayInfo } from './day-info';

export interface RecordedTraining {
  date: string;
  entry: TrainingLogEntry;
  plannedWorkout: string;
  label: string;
}

export interface TrainingStats {
  totalRecorded: number;
  completedCount: number;
  missedCount: number;
  completionRate: number | null;
  withNotesCount: number;
  recent7Completed: number;
  recent7Total: number;
  recent7Rate: number | null;
  currentCompleteStreak: number;
}

export function parseTrainingStatus(value: unknown): TrainingStatus {
  if (value === 'yes' || value === true) return 'yes';
  if (value === 'no' || value === false) return 'no';
  return 'unknown';
}

export function hasCompletionChoice(
  entry: TrainingLogEntry | undefined
): entry is TrainingLogEntry {
  if (!entry) return false;
  return entry.completed === 'yes' || entry.completed === 'no';
}

export function isCompletedYes(entry: TrainingLogEntry | undefined): boolean {
  return entry?.completed === 'yes';
}

export function isCompletedNo(entry: TrainingLogEntry | undefined): boolean {
  return entry?.completed === 'no';
}

/** Entry has 是/否 marked (excludes unknown / reset). */
export function isRecordedEntry(
  entry: TrainingLogEntry | undefined
): entry is TrainingLogEntry {
  return hasCompletionChoice(entry);
}

/** Migrate legacy booleans and drop empty unknown-only rows. */
export function normalizeTrainingLog(raw: TrainingLog | undefined): TrainingLog {
  if (!raw) return {};
  const result: TrainingLog = {};

  for (const [date, value] of Object.entries(raw)) {
    if (!value || typeof value !== 'object') continue;
    const legacy = value as TrainingLogEntry & { completedAsPlanned?: boolean };
    const completed = parseTrainingStatus(
      legacy.completed ?? legacy.completedAsPlanned
    );
    const notes = legacy.notes ?? '';

    result[date] = { completed, notes };
  }

  return result;
}

function eachDateInclusive(from: string, to: string): string[] {
  if (!from || from > to) return [];
  const dates: string[] = [];
  let cur = from;
  while (cur <= to) {
    dates.push(cur);
    cur = addDays(cur, 1);
  }
  return dates;
}

function collectListedEntries(
  trainingLog: TrainingLog,
  state: AppState
): Array<{ date: string; entry: TrainingLogEntry }> {
  const today = todayISO();
  const rangeStart = state.cycleStartDate || state.anchorDate;
  const dates = new Set<string>(Object.keys(trainingLog));

  if (rangeStart) {
    for (const date of eachDateInclusive(rangeStart, today)) {
      if (isOnOrAfterCycleStart(date, state.cycleStartDate)) {
        dates.add(date);
      }
    }
  }

  return [...dates]
    .map((date) => ({
      date,
      entry: trainingLog[date] ?? { completed: 'unknown' as TrainingStatus, notes: '' },
    }))
    .filter(({ date }) => {
      const day = buildDayInfo(date, state);
      return trainingLog[date] !== undefined || day.isCycleActive;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getListedTrainings(
  trainingLog: TrainingLog,
  state: AppState
): RecordedTraining[] {
  return collectListedEntries(trainingLog, state).map(({ date, entry }) => {
    const day = buildDayInfo(date, state);
    return {
      date,
      entry,
      plannedWorkout: day.workout,
      label: day.label,
    };
  });
}

/** @deprecated Use getListedTrainings */
export function getRecordedTrainings(
  trainingLog: TrainingLog,
  state: AppState
): RecordedTraining[] {
  return getListedTrainings(trainingLog, state).filter((r) =>
    isRecordedEntry(r.entry)
  );
}

export function getTrainingStats(trainingLog: TrainingLog, state: AppState): TrainingStats {
  const listed = collectListedEntries(trainingLog, state);
  const markedEntries = listed.filter(({ entry }) => isRecordedEntry(entry));
  const totalRecorded = listed.length;
  const completedCount = markedEntries.filter(({ entry }) => isCompletedYes(entry)).length;
  const missedCount = markedEntries.filter(({ entry }) => isCompletedNo(entry)).length;
  const withNotesCount = listed.filter(({ entry }) => entry.notes.trim().length > 0).length;

  const completionRate =
    markedEntries.length > 0
      ? Math.round((completedCount / markedEntries.length) * 100)
      : null;

  const sortedDates = listed.map(({ date }) => date);
  const recent7 = sortedDates.slice(0, 7);
  const recent7Marked = recent7.filter((d) => {
    const entry = trainingLog[d] ?? { completed: 'unknown' as TrainingStatus, notes: '' };
    return isRecordedEntry(entry);
  });
  const recent7Completed = recent7Marked.filter((d) =>
    isCompletedYes(trainingLog[d] ?? { completed: 'unknown', notes: '' })
  ).length;
  const recent7Total = recent7Marked.length;
  const recent7Rate =
    recent7Total > 0 ? Math.round((recent7Completed / recent7Total) * 100) : null;

  let currentCompleteStreak = 0;
  for (const { date, entry } of listed) {
    if (isCompletedYes(entry)) {
      currentCompleteStreak++;
    } else {
      break;
    }
  }

  return {
    totalRecorded,
    completedCount,
    missedCount,
    completionRate,
    withNotesCount,
    recent7Completed,
    recent7Total,
    recent7Rate,
    currentCompleteStreak,
  };
}
