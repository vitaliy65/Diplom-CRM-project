export type TicketStatus = 'received' | 'in-progress' | 'ready' | 'delivered'

export interface Ticket {
  id: string
  clientName: string
  clientPhone: string
  device: string
  problem: string
  status: TicketStatus
  masterId: string | null
  masterName: string | null
  createdAt: string
  slaViolation: boolean
  comments: string[]
}

export interface Client {
  id: string
  name: string
  phone: string
  email: string
  ticketCount: number
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'master'
  active: boolean
}

export const statusLabels: Record<TicketStatus, string> = {
  'received': 'Прийнято',
  'in-progress': 'У роботі',
  'ready': 'Готово',
  'delivered': 'Видано клієнту'
}

export const roleLabels: Record<string, string> = {
  'admin': 'Адміністратор',
  'manager': 'Менеджер',
  'master': 'Майстер'
}

export const mockTickets: Ticket[] = [
  {
    id: 'T-001',
    clientName: 'Петренко Олександр',
    clientPhone: '+380 67 123 4567',
    device: 'iPhone 14 Pro',
    problem: 'Розбитий екран, не працює сенсор',
    status: 'in-progress',
    masterId: 'U-003',
    masterName: 'Ковальчук Максим',
    createdAt: '2024-01-15T10:30:00',
    slaViolation: false,
    comments: ['Замовлено оригінальний екран']
  },
  {
    id: 'T-002',
    clientName: 'Іваненко Марія',
    clientPhone: '+380 50 987 6543',
    device: 'MacBook Pro 2021',
    problem: 'Не вмикається, пролили воду',
    status: 'received',
    masterId: null,
    masterName: null,
    createdAt: '2024-01-16T14:20:00',
    slaViolation: true,
    comments: []
  },
  {
    id: 'T-003',
    clientName: 'Сидоренко Василь',
    clientPhone: '+380 63 456 7890',
    device: 'Samsung Galaxy S23',
    problem: 'Швидко розряджається батарея',
    status: 'ready',
    masterId: 'U-004',
    masterName: 'Бондар Андрій',
    createdAt: '2024-01-14T09:00:00',
    slaViolation: false,
    comments: ['Замінено батарею', 'Тестування завершено']
  },
  {
    id: 'T-004',
    clientName: 'Коваленко Наталія',
    clientPhone: '+380 97 111 2233',
    device: 'iPad Air 5',
    problem: 'Не працює зарядка',
    status: 'delivered',
    masterId: 'U-003',
    masterName: 'Ковальчук Максим',
    createdAt: '2024-01-10T11:45:00',
    slaViolation: false,
    comments: ['Замінено роз\'єм зарядки', 'Клієнт забрав']
  },
  {
    id: 'T-005',
    clientName: 'Мельник Ігор',
    clientPhone: '+380 66 333 4455',
    device: 'Xiaomi Redmi Note 12',
    problem: 'Тріснуте заднє скло',
    status: 'in-progress',
    masterId: 'U-004',
    masterName: 'Бондар Андрій',
    createdAt: '2024-01-16T08:30:00',
    slaViolation: false,
    comments: []
  },
  {
    id: 'T-006',
    clientName: 'Шевченко Оксана',
    clientPhone: '+380 93 555 6677',
    device: 'iPhone 13',
    problem: 'Не працює Face ID',
    status: 'received',
    masterId: null,
    masterName: null,
    createdAt: '2024-01-17T10:00:00',
    slaViolation: false,
    comments: []
  },
  {
    id: 'T-007',
    clientName: 'Бойко Дмитро',
    clientPhone: '+380 68 777 8899',
    device: 'OnePlus 11',
    problem: 'Проблеми з камерою',
    status: 'ready',
    masterId: 'U-003',
    masterName: 'Ковальчук Максим',
    createdAt: '2024-01-13T15:00:00',
    slaViolation: true,
    comments: ['Замінено модуль камери']
  },
  {
    id: 'T-008',
    clientName: 'Литвин Анна',
    clientPhone: '+380 99 999 0011',
    device: 'Samsung Galaxy Tab S8',
    problem: 'Екран мерехтить',
    status: 'in-progress',
    masterId: 'U-004',
    masterName: 'Бондар Андрій',
    createdAt: '2024-01-15T16:30:00',
    slaViolation: false,
    comments: ['Діагностика завершена']
  }
]

export const mockClients: Client[] = [
  { id: 'C-001', name: 'Петренко Олександр', phone: '+380 67 123 4567', email: 'petrenko@email.com', ticketCount: 3 },
  { id: 'C-002', name: 'Іваненко Марія', phone: '+380 50 987 6543', email: 'ivanenko@email.com', ticketCount: 1 },
  { id: 'C-003', name: 'Сидоренко Василь', phone: '+380 63 456 7890', email: 'sydorenko@email.com', ticketCount: 2 },
  { id: 'C-004', name: 'Коваленко Наталія', phone: '+380 97 111 2233', email: 'kovalenko@email.com', ticketCount: 5 },
  { id: 'C-005', name: 'Мельник Ігор', phone: '+380 66 333 4455', email: 'melnyk@email.com', ticketCount: 1 },
  { id: 'C-006', name: 'Шевченко Оксана', phone: '+380 93 555 6677', email: 'shevchenko@email.com', ticketCount: 4 },
  { id: 'C-007', name: 'Бойко Дмитро', phone: '+380 68 777 8899', email: 'boyko@email.com', ticketCount: 2 },
  { id: 'C-008', name: 'Литвин Анна', phone: '+380 99 999 0011', email: 'lytvyn@email.com', ticketCount: 1 },
]

export const mockUsers: User[] = [
  { id: 'U-001', name: 'Козак Олег', email: 'kozak@service.ua', role: 'admin', active: true },
  { id: 'U-002', name: 'Романюк Ірина', email: 'romaniuk@service.ua', role: 'manager', active: true },
  { id: 'U-003', name: 'Ковальчук Максим', email: 'kovalchuk@service.ua', role: 'master', active: true },
  { id: 'U-004', name: 'Бондар Андрій', email: 'bondar@service.ua', role: 'master', active: true },
  { id: 'U-005', name: 'Гриценко Світлана', email: 'grytsenko@service.ua', role: 'manager', active: false },
]

export const dashboardStats = {
  totalTickets: 127,
  openTickets: 45,
  closedTickets: 82,
  slaViolations: 8,
  avgResolutionTime: '2.5 дні',
  todayNewTickets: 12
}

export const mockMasters = mockUsers.filter(u => u.role === 'master').map(m => ({
  ...m,
  status: m.active ? 'active' : 'inactive' as const
}))

export const chartData = {
  weekly: [
    { day: 'Пн', received: 12, completed: 10 },
    { day: 'Вт', received: 15, completed: 12 },
    { day: 'Ср', received: 8, completed: 14 },
    { day: 'Чт', received: 18, completed: 11 },
    { day: 'Пт', received: 22, completed: 19 },
    { day: 'Сб', received: 9, completed: 8 },
    { day: 'Нд', received: 4, completed: 6 },
  ],
  statusDistribution: [
    { status: 'Прийнято', count: 15, fill: 'var(--status-received)' },
    { status: 'У роботі', count: 22, fill: 'var(--status-in-progress)' },
    { status: 'Готово', count: 8, fill: 'var(--status-ready)' },
  ],
  masterPerformance: [
    { name: 'Ковальчук М.', completed: 28, rating: 4.8 },
    { name: 'Бондар А.', completed: 24, rating: 4.6 },
    { name: 'Гриценко С.', completed: 18, rating: 4.9 },
  ]
}
