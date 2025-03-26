interface MercadoPagoConfig {
  locale: string;
}

interface MercadoPagoCheckoutConfig {
  preference: {
    id: string;
  };
  render: {
    container: string;
    label: string;
  };
}

interface MercadoPagoCheckout {
  Preference: {
    createPreference(options: unknown): Promise<void>;
  };
}

interface MercadoPagoPreferenceOptions {
  initialization: {
    preferenceId: string;
  };
  customization?: {
    visual?: {
      hidePaymentButton?: boolean;
      backgroundColor?: string;
    };
  };
}

interface MercadoPagoBricksOptions {
  initialization: {
    preferenceId: string;
  };
}

interface MercadoPagoBricks {
  create: (
    type: 'wallet' | 'payment' | 'cardPayment',
    elementId: string,
    options: MercadoPagoBricksOptions
  ) => Promise<void>;
}

interface MercadoPago {
  bricks: () => MercadoPagoBricks;
}

interface Window {
  MercadoPago: {
    new (publicKey: string, options?: { locale: string }): MercadoPagoInstance;
  };
  checkoutBrickController: unknown;
}

interface CheckoutSettings {
  initialization: {
    amount: number;
  };
  callbacks: {
    onReady: () => void;
    onSubmit: (data: { formData: any }) => void;
    onError: (error: any) => void;
  };
}

interface MercadoPagoInstance {
  checkout: {
    Preference: {
      createPreference(options: MercadoPagoPreferenceOptions): Promise<void>;
    };
  };
  bricks: () => MercadoPagoBricks;
}

declare class MercadoPago {
  constructor(publicKey: string, config?: MercadoPagoConfig);
  checkout(config: MercadoPagoCheckoutConfig): void;
}

declare global {
  interface Window {
    MercadoPago: {
      new (publicKey: string, options?: { locale: string }): MercadoPagoInstance;
    };
    checkoutBrickController: unknown;
  }
}

export type {
  MercadoPagoPreferenceOptions,
  MercadoPagoBricksOptions,
  MercadoPagoBricks,
  MercadoPagoInstance
};

export {}; 
export {}; 