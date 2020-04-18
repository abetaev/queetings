/**
 * single conversation with somebody
 */
export interface Connection {
  /**
   * unique identifier within meeting/network
   */
  readonly id: string
  /**
   * shared stream
   * TODO(1): support multiple streams
   */
  readonly stream: MediaStream
  /**
   * send arbitrary data
   */
  send(data: string): void

  /**
   * free resources network connection
   */
  close(): void
}

/**
 * network
 */
export interface Network {
  /**
   * unique identifier of this particular meeting
   */
  readonly id: string
  /**
   * shared stream
   * TODO(1): support multiple streams
   */
  readonly stream: MediaStream
  /**
   * established connections within this network
   */
  readonly connections: { [id: string]: Connection }

  /**
   * accept invitation
   */
  accept(invitation: URL): void

  /**
   * invite into network
   */
  invite(handler: InvitationHandler): void

  /**
   * quit network
   */
  quit(): void
}
export type InvitationHandler = (invitation: URL) => void

/**
 * possible events:
 * 
 *  1. conversation added:
 *     `network[conversationId] !== undefined && data === undefined`
 *  2. conversation removed:
 *     `network[conversationId] === undefined`
 *  3. data message received:
 *     `data !== undefined`
 */
export interface NetworkEvent {
  /**
   * network where even occured
   */
  readonly network?: Network
  /**
   * id of related connection
   */
  readonly connectionId?: string
  /**
   * arbitrary text data
   */
  readonly data?: string
}

export type NetworkEventHandler = (event: NetworkEvent) => void