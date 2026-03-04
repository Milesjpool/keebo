<script>
  import lessons from './lessons.json'
  import LessonList from './lib/LessonList.svelte'
  import TypingView from './lib/TypingView.svelte'
  import LessonComplete from './lib/LessonComplete.svelte'

  let screen = $state('list')
  let currentIndex = $state(0)
  let progress = $state(new Array(lessons.length).fill(false))

  function startLesson(index) {
    currentIndex = index
    screen = 'typing'
  }

  function completeLesson() {
    progress[currentIndex] = true
    screen = 'complete'
  }

  function nextLesson() {
    const next = currentIndex + 1
    if (next < lessons.length) {
      currentIndex = next
      screen = 'typing'
    } else {
      screen = 'list'
    }
  }

  function goBack() {
    screen = 'list'
  }
</script>

{#if screen === 'list'}
  <LessonList {lessons} {progress} onSelect={startLesson} />
{:else if screen === 'typing'}
  <TypingView lesson={lessons[currentIndex]} onComplete={completeLesson} onBack={goBack} />
{:else if screen === 'complete'}
  <LessonComplete
    lesson={lessons[currentIndex]}
    hasNext={currentIndex < lessons.length - 1}
    onNext={nextLesson}
    onBack={goBack}
  />
{/if}
