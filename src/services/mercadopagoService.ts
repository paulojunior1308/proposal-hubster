import { db } from '@/config/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

interface MercadoPagoConfig {
  accessToken: string;
  publicKey: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const mercadopagoService = {
  async saveConfig(userId: string, accessToken: string, publicKey: string) {
    try {
      const configRef = doc(db, 'mercadopago_config', userId);
      
      const config: MercadoPagoConfig = {
        accessToken,
        publicKey,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(configRef, config);
      return true;
    } catch (error) {
      console.error('Erro ao salvar configuração do Mercado Pago:', error);
      throw error;
    }
  },

  async getConfig(userId: string) {
    try {
      const configRef = doc(db, 'mercadopago_config', userId);
      const configDoc = await getDoc(configRef);

      if (configDoc.exists()) {
        return configDoc.data() as MercadoPagoConfig;
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar configuração do Mercado Pago:', error);
      throw error;
    }
  },

  async updateConfig(userId: string, accessToken: string, publicKey: string) {
    try {
      const configRef = doc(db, 'mercadopago_config', userId);
      
      await updateDoc(configRef, {
        accessToken,
        publicKey,
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar configuração do Mercado Pago:', error);
      throw error;
    }
  }
}; 