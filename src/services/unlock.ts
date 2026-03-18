import type { Group, Lesson, Progress } from './types'

export function lastUnlockedGroup(groups: Group[], progress: Progress): number {
  let last = 0
  for (let i = 0; i < groups.length; i++) {
    const locked =
      i > 0 &&
      !(groups[i - 1].lessons[groups[i - 1].lessons.length - 1].id in progress)
    if (!locked) last = i
    else break
  }
  return last
}

export function lastUnlockedLesson(
  group: Group,
  flatLessons: Lesson[],
  progress: Progress,
): number {
  for (let i = 0; i < group.lessons.length; i++) {
    const fi = group.lessons[i].flatIdx
    if (fi > 0 && !(flatLessons[fi - 1].id in progress)) return Math.max(0, i - 1)
  }
  return group.lessons.length - 1
}
