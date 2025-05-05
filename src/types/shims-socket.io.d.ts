declare module 'socket.io-client' {
  export function io(url: string, opts?: any): Socket;
  export interface Socket {
    connected: boolean;
    disconnect(): void;
    connect(): void;
    removeAllListeners(event?: string): Socket;
    on(event: string, fn: Function): Socket;
    off(event: string): Socket;
    emit(event: string, ...args: any[]): Socket;
  }
} 