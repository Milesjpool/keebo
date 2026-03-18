export interface RawLesson { id: string; subtitle: string; lines: string[]; allowFingerHints?: boolean }
export interface RawGroup  { id: string; title: string; lessons: RawLesson[] }
export interface Lesson extends RawLesson { flatIdx: number; title: string }
export interface Group  extends Omit<RawGroup, 'lessons'> { flatStart: number; lessons: Lesson[] }

export interface ProgressRecord { wpm: number; elapsed: number; accuracy: number; score: number; difficulty?: Difficulty }
export type Progress = Record<string, ProgressRecord>

export interface Stats { wpm: number; elapsed: number; accuracy?: number; difficulty?: Difficulty }

export type Screen = 'groups' | 'lessons' | 'typing' | 'complete'
export interface ParsedUrl { screen: Screen; groupIdx: number; flatIdx: number }

export type Medal = 'bronze' | 'silver' | 'gold'
export type Difficulty = 'easy' | 'medium' | 'hard'
