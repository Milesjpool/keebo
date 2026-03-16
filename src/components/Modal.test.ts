import { render, fireEvent } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
import Modal from './Modal.svelte'

function renderModal(overrides = {}) {
  return render(Modal, {
    props: {
      title: 'Test Modal',
      labelId: 'test-label',
      onClose: vi.fn(),
      children: createRawSnippet(() => ({
        render: () => '<p>modal content</p>',
      })),
      ...overrides,
    },
  })
}

describe('Modal', () => {
  it('renders title', () => {
    renderModal()
    expect(document.body.textContent).toContain('Test Modal')
  })

  it('renders children content', () => {
    renderModal()
    expect(document.body.textContent).toContain('modal content')
  })

  it('has dialog role', () => {
    renderModal()
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
  })

  it('sets aria-labelledby', () => {
    renderModal()
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog?.getAttribute('aria-labelledby')).toBe('test-label')
  })

  it('clicking backdrop calls onClose', async () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    const backdrop = document.querySelector('.backdrop')
    await fireEvent.click(backdrop!)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('clicking inside modal does not call onClose', async () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    const modal = document.querySelector('.modal')
    await fireEvent.click(modal!)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('shows close button when closeable is true (default)', () => {
    renderModal()
    expect(document.body.textContent).toContain('×')
  })

  it('hides close button when closeable is false', () => {
    renderModal({ closeable: false })
    const closeBtn = document.querySelector('.btn-close')
    expect(closeBtn).toBeNull()
  })
})
