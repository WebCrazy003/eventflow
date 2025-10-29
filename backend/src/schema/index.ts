import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar DateTime

  enum Role {
    USER
    ORGANIZER
    ADMIN
  }

  enum TicketStatus {
    CONFIRMED
    CANCELLED
    REFUNDED
  }

  type User {
    id: ID!
    name: String!
    email: String!
    roles: [Role!]!
    events: [Event!]!
    tickets: [Ticket!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Event {
    id: ID!
    title: String!
    description: String
    location: String
    startAt: DateTime!
    endAt: DateTime!
    capacity: Int!
    organizer: User!
    organizerId: ID!
    tickets: [Ticket!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Ticket {
    id: ID!
    user: User!
    userId: ID!
    event: Event!
    eventId: ID!
    type: String
    status: TicketStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
  }


  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    user: User!
  }

  type EventConnection {
    edges: [EventEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type EventEdge {
    node: Event!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type CapacityInfo {
    eventId: ID!
    capacity: Int!
    remaining: Int!
    booked: Int!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateEventInput {
    title: String!
    description: String
    location: String
    startAt: DateTime!
    endAt: DateTime!
    capacity: Int!
  }

  input UpdateEventInput {
    title: String
    description: String
    location: String
    startAt: DateTime
    endAt: DateTime
    capacity: Int
  }

  input EventFilter {
    search: String
    location: String
    startDate: DateTime
    endDate: DateTime
    organizerId: ID
  }

  input PaginationInput {
    first: Int
    after: String
    last: Int
    before: String
  }

  type Query {
    # Get current user
    me: User

    # Get events with filtering and pagination
    events(filter: EventFilter, pagination: PaginationInput): EventConnection!

    # Get single event
    event(id: ID!): Event

    # Get user's tickets
    myTickets: [Ticket!]!

    # Get event attendees (organizer/admin only)
    eventAttendees(eventId: ID!): [User!]!

    # Get all users (admin only)
    users: [User!]!
  }

  type Mutation {
    # Authentication
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    refreshToken(refreshToken: String!): AuthPayload!

    # Event management (organizer/admin only)
    createEvent(input: CreateEventInput!): Event!
    updateEvent(id: ID!, input: UpdateEventInput!): Event!
    deleteEvent(id: ID!): Boolean!

    # Ticket management
    bookTicket(eventId: ID!, type: String): Ticket!
    cancelTicket(id: ID!): Ticket!


    # User management (admin only)
    updateUserRoles(userId: ID!, roles: [Role!]!): User!
    deleteUser(userId: ID!): Boolean!
  }

  type Subscription {
    ticketBooked(eventId: ID!): Ticket!
    eventCapacityChanged(eventId: ID!): CapacityInfo!
  }

`;
