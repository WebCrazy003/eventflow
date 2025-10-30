import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Input from '@/components/Input.vue'

describe('Input', () => {
  it('emits update:modelValue on input', async () => {
    const wrapper = mount(Input, {
      props: { modelValue: '', label: 'Name', placeholder: 'Enter name' },
    })

    const el = wrapper.get('input')
    await el.setValue('Alice')

    const updates = wrapper.emitted('update:modelValue')
    expect(updates?.[0]?.[0]).toBe('Alice')
  })
})


