import type { Group, Lesson, Progress } from '../services/types'

export const testGroups: Group[] = [
  {
    id: 'g1',
    title: 'Home Row',
    flatStart: 0,
    lessons: [
      { id: 'l1', subtitle: 'jkl;', lines: ['jjj kkk', 'lll ;;;'], flatIdx: 0, title: 'Home Row · jkl;', allowFingerHints: true },
      { id: 'l2', subtitle: 'asdf', lines: ['aaa sss', 'ddd fff'], flatIdx: 1, title: 'Home Row · asdf', allowFingerHints: true },
    ],
  },
  {
    id: 'g2',
    title: 'Top Row',
    flatStart: 2,
    lessons: [
      { id: 'l3', subtitle: 'qwer', lines: ['qqq www', 'eee rrr'], flatIdx: 2, title: 'Top Row · qwer', allowFingerHints: true },
      { id: 'l4', subtitle: 'tyui', lines: ['ttt yyy'], flatIdx: 3, title: 'Top Row · tyui', allowFingerHints: true },
    ],
  },
]

export const testFlatLessons: Lesson[] = testGroups.flatMap(g => g.lessons)

export const testProgress: Progress = {
  l1: { wpm: 45, elapsed: 30, accuracy: 0.95, score: 42.75 },
}

export const fullGroupProgress: Progress = {
  l1: { wpm: 55, elapsed: 25, accuracy: 0.98, score: 53.9 },
  l2: { wpm: 60, elapsed: 22, accuracy: 1, score: 60 },
}
