import { gql } from '@apollo/client/core'

// Auth queries and mutations
export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      user {
        id
        name
        email
        roles
      }
    }
  }
`

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user {
        id
        name
        email
        roles
      }
    }
  }
`

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      roles
      events {
        id
        title
        startAt
        endAt
        capacity
      }
      tickets {
        id
        status
        event {
          id
          title
          startAt
          endAt
        }
      }
    }
  }
`

// Event queries and mutations
export const EVENTS_QUERY = gql`
  query Events($filter: EventFilter, $pagination: PaginationInput) {
    events(filter: $filter, pagination: $pagination) {
      edges {
        node {
          id
          title
          description
          location
          startAt
          endAt
          capacity
          images {
            id
            url
            alt
          }
          organizer {
            id
            name
          }
          tickets {
            id
            status
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`

export const EVENT_QUERY = gql`
  query Event($id: ID!) {
    event(id: $id) {
      id
      title
      description
      location
      startAt
      endAt
      capacity
      images {
        id
        url
        alt
      }
      organizer {
        id
        name
        email
      }
      tickets {
        id
        status
        type
        user {
          id
          name
        }
      }
    }
  }
`

export const CREATE_EVENT_MUTATION = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
      title
      description
      location
      startAt
      endAt
      capacity
      organizer {
        id
        name
      }
    }
  }
`

export const UPDATE_EVENT_MUTATION = gql`
  mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {
    updateEvent(id: $id, input: $input) {
      id
      title
      description
      location
      startAt
      endAt
      capacity
    }
  }
`

export const DELETE_EVENT_MUTATION = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`

// Ticket queries and mutations
export const MY_TICKETS_QUERY = gql`
  query MyTickets {
    myTickets {
      id
      status
      type
      createdAt
      event {
        id
        title
        description
        location
        startAt
        endAt
        images {
          id
          url
          alt
        }
        organizer {
          id
          name
        }
      }
    }
  }
`

export const BOOK_TICKET_MUTATION = gql`
  mutation BookTicket($eventId: ID!, $type: String) {
    bookTicket(eventId: $eventId, type: $type) {
      id
      status
      type
      event {
        id
        title
        capacity
        tickets {
          id
          status
        }
      }
    }
  }
`

export const CANCEL_TICKET_MUTATION = gql`
  mutation CancelTicket($id: ID!) {
    cancelTicket(id: $id) {
      id
      status
      event {
        id
        title
        capacity
        tickets {
          id
          status
        }
      }
    }
  }
`

// Subscriptions
export const TICKET_BOOKED_SUBSCRIPTION = gql`
  subscription TicketBooked($eventId: ID!) {
    ticketBooked(eventId: $eventId) {
      id
      status
      type
      user {
        id
        name
      }
      event {
        id
        title
        capacity
        tickets {
          id
          status
        }
      }
    }
  }
`

export const EVENT_CAPACITY_CHANGED_SUBSCRIPTION = gql`
  subscription EventCapacityChanged($eventId: ID!) {
    eventCapacityChanged(eventId: $eventId) {
      eventId
      capacity
      remaining
      booked
    }
  }
`

// User management queries and mutations
export const USERS_QUERY = gql`
  query Users {
    users {
      id
      name
      email
      roles
      createdAt
      events {
        id
        title
      }
      tickets {
        id
        status
      }
    }
  }
`

export const UPDATE_USER_ROLES_MUTATION = gql`
  mutation UpdateUserRoles($userId: ID!, $roles: [Role!]!) {
    updateUserRoles(userId: $userId, roles: $roles) {
      id
      name
      email
      roles
    }
  }
`

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($userId: ID!) {
    deleteUser(userId: $userId)
  }
`
