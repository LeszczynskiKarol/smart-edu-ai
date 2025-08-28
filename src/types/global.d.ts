// src/types/global.d.ts

export {};

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    ttq?: {
      load: (pixelId: string, options?: any) => void;
      page: () => void;
      track: (event: string, params?: any) => void;
      identify: (params: {
        email?: string;
        phone_number?: string;
        external_id?: string;
      }) => void;
      methods: string[];
      setAndDefer: (target: any, method: string) => void;
      instance: (pixelId: string) => any;
    };
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              type?: 'standard' | 'icon';
              text?:
                | 'signin_with'
                | 'signup_with'
                | 'continue_with'
                | 'signup_with';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
    heap?: {
      identify: (userId: string) => void;
      track: (eventName: string, properties?: Record<string, any>) => void;
      addUserProperties: (properties: Record<string, any>) => void;
      resetIdentity: () => void;
      load: (envId: string, config?: Record<string, any>) => void;
    };
    clarity?: {
      (method: string, ...args: any[]): void;
      identify: (userId: string, properties?: Record<string, any>) => void;
      set: (key: string, value: string) => void;
      upgrade: (amount: number) => void;
      consent: () => void;
    };
  }
}
