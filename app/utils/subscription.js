import { EventEmitter } from 'events'
import { decode } from '@msgpack/msgpack'
import { v4 as uuid } from 'uuid'

function decodeData(data) {
  try {
    if (typeof data === 'string') {
      return JSON.parse(data)
    } else {
      const rawData = new Uint8Array(data)
      return decode(rawData)
    }
  } catch (e) {
    return {}
  }
}

class Subscription extends EventEmitter {
  constructor(options) {
    super()

    this.sid = options.sid
    this.socket = options.socket
  }

  unsubscribe() {
    const request = {
      id: uuid(),
      version: '1.0',
      path: this.path,
      type: 'unsubscribe',
      sid: this.sid
    }
    this.socket.send(JSON.stringify(request))
  }
}

/**
 * Appcelerator Daemon web client for subscriptions to services
 */
class SubscriptionClient extends EventEmitter {
  constructor() {
    super()

    this.subscriptionResolvers = {}
    this.subscriptions = {}
    this.sendQueue = []
    this.connected = false
    this.initializeSocket()
  }

  initializeSocket() {
    this.socket = new WebSocket('ws://localhost:1732')
    this.socket.binaryType = 'arraybuffer'
    this.socket.addEventListener('open', () => {
      this.connected = true
      this.emit('connect')
      this.sendQueue.forEach(send => send())
    })
    this.socket.addEventListener('close', () => {
      this.connected = false
      this.emit('close')
    })
    this.socket.addEventListener('error', e => {
      this.connected = false
      this.emit('error', e)
    })
    this.socket.addEventListener('message', event => {
      const data = decodeData(event.data)
      if (data.type === 'subscribe') {
        const resolveSubscription = this.subscriptionResolvers[data.id]
        if (resolveSubscription) {
          const subscription = new Subscription({
            sid: data.sid,
            socket: this.socket
          })
          this.subscriptions[data.sid] = subscription
          resolveSubscription(null, subscription)
        }
      } else if (data.type === 'unsubscribe') {
        delete this.subscriptions[data.sid]
      } else if (data.type === 'event') {
        const targetSubscription = this.subscriptions[data.sid]
        if (targetSubscription) {
          targetSubscription.emit('message', data.message)
        }
      } else if (data.type === 'error') {
        const resolveSubscription = this.subscriptionResolvers[data.id]
        if (data.status === 404) {
          resolveSubscription(new Error('No such subscription endpoint'))
        } else {
          resolveSubscription(new Error(data.message))
        }
      }
    })
  }

  subscribe(path) {
    const request = {
      id: uuid(),
      version: '1.0',
      path,
      type: 'subscribe'
    }
    this._send(request)

    return new Promise((resolve, reject) => {
      this.subscriptionResolvers[request.id] = (error, subscription) => {
        if (error) {
          return reject(error)
        }

        subscription.path = path
        resolve(subscription)
      }
    })
  }

  _send(request) {
    const payload = JSON.stringify(request)
    if (this.connected) {
      this.socket.send(payload)
    } else {
      this.sendQueue.push(() => this.socket.send(payload))
    }
  }
}

export const client = new SubscriptionClient()
