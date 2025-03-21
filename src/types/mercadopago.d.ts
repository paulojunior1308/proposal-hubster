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

interface MercadoPagoBricks {
  create: (type: string, elementId: string, settings: any) => Promise<any>;
}

interface MercadoPago {
  bricks: () => MercadoPagoBricks;
}

interface Window {
  MercadoPago: new (publicKey: string) => MercadoPago;
  checkoutBrickController: any;
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

declare class MercadoPago {
  constructor(publicKey: string, config?: MercadoPagoConfig);
  checkout(config: MercadoPagoCheckoutConfig): void;
} 