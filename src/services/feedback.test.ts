const mockAddDoc = vi.fn()
const mockCollection = vi.fn(() => 'mock-collection')
const mockServerTimestamp = vi.fn(() => 'TIMESTAMP')

vi.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  serverTimestamp: () => mockServerTimestamp(),
}))

const { submitFeedback } = await import('./feedback')

describe('submitFeedback', () => {
  beforeEach(() => {
    mockAddDoc.mockReset().mockResolvedValue(undefined)
    mockCollection.mockReset().mockReturnValue('mock-collection')
    mockServerTimestamp.mockReset().mockReturnValue('TIMESTAMP')
  })

  it('calls addDoc on feedback collection', async () => {
    await submitFeedback({ text: 'great app' })

    expect(mockCollection).toHaveBeenCalledWith({}, 'feedback')
    expect(mockAddDoc).toHaveBeenCalledWith('mock-collection', expect.objectContaining({
      text: 'great app',
    }))
  })

  it('includes createdAt timestamp', async () => {
    await submitFeedback({ text: 'test' })

    const data = mockAddDoc.mock.calls[0][1]
    expect(data.createdAt).toBe('TIMESTAMP')
  })

  it('strips undefined fields', async () => {
    await submitFeedback({ text: 'test', userId: undefined, email: undefined })

    const data = mockAddDoc.mock.calls[0][1]
    expect(Object.keys(data)).not.toContain('userId')
    expect(Object.keys(data)).not.toContain('email')
  })

  it('includes all provided fields', async () => {
    await submitFeedback({
      text: 'bug report',
      userId: 'u1',
      email: 'test@test.com',
      screen: 'typing',
      lessonId: 'l1',
      groupIdx: 0,
      flatIdx: 2,
    })

    const data = mockAddDoc.mock.calls[0][1]
    expect(data.text).toBe('bug report')
    expect(data.userId).toBe('u1')
    expect(data.email).toBe('test@test.com')
    expect(data.screen).toBe('typing')
    expect(data.lessonId).toBe('l1')
    expect(data.groupIdx).toBe(0)
    expect(data.flatIdx).toBe(2)
  })
})
