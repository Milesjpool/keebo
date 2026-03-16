import type { Progress } from './types'

// Mock firebase/firestore before importing the module under test
const mockOnSnapshot = vi.fn()
const mockSetDoc = vi.fn()
const mockDoc = vi.fn(() => 'mock-ref')

vi.mock('firebase/firestore', () => ({
  doc: (...args: any[]) => mockDoc(...args),
  onSnapshot: (...args: any[]) => mockOnSnapshot(...args),
  setDoc: (...args: any[]) => mockSetDoc(...args),
}))

// Import after mocks are set up
const { subscribeToProgress, writeProgress } = await import('./sync')

describe('subscribeToProgress', () => {
  beforeEach(() => {
    mockOnSnapshot.mockReset()
    mockSetDoc.mockReset()
    mockDoc.mockReset().mockReturnValue('mock-ref')
  })

  it('calls onSnapshot with the correct doc reference', () => {
    const unsub = vi.fn()
    mockOnSnapshot.mockReturnValue(unsub)

    subscribeToProgress('user123', () => ({}), () => {})

    expect(mockDoc).toHaveBeenCalledWith({}, 'users', 'user123')
    expect(mockOnSnapshot).toHaveBeenCalledWith('mock-ref', expect.any(Function))
  })

  it('merges local and remote progress and calls onUpdate', () => {
    mockOnSnapshot.mockImplementation((_ref: any, callback: Function) => {
      callback({
        exists: () => true,
        data: () => ({ progress: { l1: { wpm: 40, elapsed: 30, accuracy: 0.9, score: 36 } } }),
      })
      return vi.fn()
    })

    const local: Progress = { l2: { wpm: 50, elapsed: 25, accuracy: 1, score: 50 } }
    const onUpdate = vi.fn()

    subscribeToProgress('user123', () => local, onUpdate)

    expect(onUpdate).toHaveBeenCalledOnce()
    const merged = onUpdate.mock.calls[0][0]
    expect(merged).toHaveProperty('l1')
    expect(merged).toHaveProperty('l2')
  })

  it('pushes merged progress on first snapshot', () => {
    mockOnSnapshot.mockImplementation((_ref: any, callback: Function) => {
      callback({ exists: () => true, data: () => ({ progress: {} }) })
      return vi.fn()
    })
    mockSetDoc.mockResolvedValue(undefined)

    subscribeToProgress('user123', () => ({}), () => {})

    expect(mockSetDoc).toHaveBeenCalledWith('mock-ref', { progress: {} }, { merge: true })
  })

  it('does not push on subsequent snapshots', () => {
    let snapshotCallback: Function
    mockOnSnapshot.mockImplementation((_ref: any, callback: Function) => {
      snapshotCallback = callback
      callback({ exists: () => true, data: () => ({ progress: {} }) })
      return vi.fn()
    })
    mockSetDoc.mockResolvedValue(undefined)

    subscribeToProgress('user123', () => ({}), () => {})
    mockSetDoc.mockClear()

    // Second snapshot
    snapshotCallback!({ exists: () => true, data: () => ({ progress: {} }) })
    expect(mockSetDoc).not.toHaveBeenCalled()
  })

  it('returns unsubscribe function from onSnapshot', () => {
    const unsub = vi.fn()
    mockOnSnapshot.mockReturnValue(unsub)

    const result = subscribeToProgress('user123', () => ({}), () => {})
    expect(result).toBe(unsub)
  })

  it('handles non-existent document (empty remote)', () => {
    mockOnSnapshot.mockImplementation((_ref: any, callback: Function) => {
      callback({ exists: () => false, data: () => ({}) })
      return vi.fn()
    })

    const local: Progress = { l1: { wpm: 50, elapsed: 25, accuracy: 1, score: 50 } }
    const onUpdate = vi.fn()

    subscribeToProgress('user123', () => local, onUpdate)

    const merged = onUpdate.mock.calls[0][0]
    expect(merged).toEqual(local)
  })
})

describe('writeProgress', () => {
  beforeEach(() => {
    mockSetDoc.mockReset().mockResolvedValue(undefined)
    mockDoc.mockReset().mockReturnValue('mock-ref')
  })

  it('calls setDoc with correct ref and data', async () => {
    const progress: Progress = { l1: { wpm: 50, elapsed: 25, accuracy: 1, score: 50 } }
    await writeProgress('user123', progress)

    expect(mockDoc).toHaveBeenCalledWith({}, 'users', 'user123')
    expect(mockSetDoc).toHaveBeenCalledWith('mock-ref', { progress }, { merge: true })
  })
})
