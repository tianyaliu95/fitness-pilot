import type {
  AppState,
  TrainingLog,
  TrainingLogEntry,
  TrainingStatus,
} from './types';
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

export function getRecordedTrainings(
  trainingLog: TrainingLog,
  state: AppState
): RecordedTraining[] {
  return Object.entries(trainingLog)
    .filter(([, entry]) => isRecordedEntry(entry))
    .map(([date, entry]) => {
      const day = buildDayInfo(date, state);
      return {
        date,
        entry,
        plannedWorkout: day.workout,
        label: day.label,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getTrainingStats(trainingLog: TrainingLog): TrainingStats {
  const entries = Object.entries(trainingLog).filter(([, e]) => isRecordedEntry(e));
  const totalRecorded = entries.length;
  const completedCount = entries.filter(([, e]) => isCompletedYes(e)).length;
  const missedCount = entries.filter(([, e]) => isCompletedNo(e)).length;
  const withNotesCount = entries.filter(([, e]) => e.notes.trim().length > 0).length;

  const completionRate =
    totalRecorded > 0 ? Math.round((completedCount / totalRecorded) * 100) : null;

  const sortedDates = entries.map(([d]) => d).sort((a, b) => b.localeCompare(a));
  const recent7 = sortedDates.slice(0, 7);
  const recent7Completed = recent7.filter((d) =>
    isCompletedYes(trainingLog[d])
  ).length;
  const recent7Total = recent7.length;
  const recent7Rate =
    recent7Total > 0 ? Math.round((recent7Completed / recent7Total) * 100) : null;

  let currentCompleteStreak = 0;
  for (const date of sortedDates) {
    if (isCompletedYes(trainingLog[date])) {
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
