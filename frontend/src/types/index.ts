export enum Role {
  USER = 'USER',
  ORGANIZER = 'ORGANIZER',
  ADMIN = 'ADMIN',
}

export enum TicketStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface User {
  id: string
  name: string
  email: string
  roles: Role[]
  events?: Event[]
  tickets?: Ticket[]
  createdAt: string
  updatedAt: string
}

export interface EventImage {
  id?: string
  url: string
  alt?: string
  filename?: string
  path?: string
}

export interface Event {
  id: string
  title: string
  description?: string
  location?: string
  startAt: string
  endAt: string
  capacity: number
  organizer: User
  organizerId: string
  images?: EventImage[]
  tickets?: Ticket[]
  createdAt: string
  updatedAt: string
}

export interface Ticket {
  id: string
  user: User
  userId: string
  event: Event
  eventId: string
  type?: string
  status: TicketStatus
  createdAt: string
  updatedAt: string
}

export interface AuthPayload {
  accessToken: string
  refreshToken: string
  user: User
}

export interface EventConnection {
  edges: EventEdge[]
  pageInfo: PageInfo
  totalCount: number
}

export interface EventEdge {
  node: Event
  cursor: string
}

export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor?: string
  endCursor?: string
}

export interface CapacityInfo {
  eventId: string
  capacity: number
  remaining: number
  booked: number
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface CreateEventInput {
  title: string
  description?: string
  location?: string
  startAt: string
  endAt: string
  capacity: number
}

export interface UpdateEventInput {
  title?: string
  description?: string
  location?: string
  startAt?: string
  endAt?: string
  capacity?: number
}

export interface EventFilter {
  search?: string
  location?: string
  startDate?: string
  endDate?: string
  organizerId?: string
}

export interface PaginationInput {
  first?: number
  after?: string
  last?: number
  before?: string
}
