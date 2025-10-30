import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EventCard from '@/components/EventCard.vue'

describe('EventCard', () => {
  it('renders title and location', () => {
    const wrapper = mount(EventCard, {
      props: {
        event: {
          id: 'e1',
          title: 'Sample Event',
          description: 'Desc',
          location: 'NYC',
          startAt: new Date().toISOString(),
          endAt: new Date(Date.now() + 3600000).toISOString(),
          capacity: 10,
          organizer: { id: 'u1', name: 'Org' },
          tickets: [],
          images: [],
        },
        showImage: true,
        showLocation: true,
        showCapacity: true,
        showOrganizer: true,
      },
    })

    expect(wrapper.text()).toContain('Sample Event')
    expect(wrapper.text()).toContain('NYC')
  })
})
