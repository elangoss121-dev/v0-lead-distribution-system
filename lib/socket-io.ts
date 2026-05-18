import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'

let io: SocketIOServer | null = null

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO server not initialized')
  }
  return io
}

export function initializeIO(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? undefined : '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket: Socket) => {
    console.log(`[v0] Client connected: ${socket.id}`)

    socket.on('subscribe-provider', (providerId: string) => {
      socket.join(`provider:${providerId}`)
      console.log(`[v0] Socket ${socket.id} subscribed to provider ${providerId}`)
    })

    socket.on('disconnect', () => {
      console.log(`[v0] Client disconnected: ${socket.id}`)
    })
  })

  return io
}

export function broadcastLeadAssignment(providerId: string, leadData: any) {
  const io = getIO()
  io.to(`provider:${providerId}`).emit('lead_assigned', leadData)
}
