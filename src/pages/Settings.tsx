import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { mercadopagoService } from '@/services/mercadopagoService';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [accessToken, setAccessToken] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadConfig();
    }
  }, [user]);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const config = await mercadopagoService.getConfig(user!.uid);
      
      if (config) {
        setAccessToken(config.accessToken);
        setPublicKey(config.publicKey);
      }
    } catch (error) {
      toast.error('Erro ao carregar configurações do Mercado Pago');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (!accessToken || !publicKey) {
        toast.error('Preencha todos os campos');
        return;
      }

      const config = await mercadopagoService.getConfig(user!.uid);
      
      if (config) {
        await mercadopagoService.updateConfig(user!.uid, accessToken, publicKey);
      } else {
        await mercadopagoService.saveConfig(user!.uid, accessToken, publicKey);
      }

      toast.success('Configurações do Mercado Pago salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações do Mercado Pago');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-hubster-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-3xl mx-auto space-y-8 page-transition">
            <div>
              <h1 className="text-3xl font-bold">Configurações</h1>
              <p className="text-muted-foreground">Gerencie as configurações do seu sistema</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Integração com Mercado Pago</CardTitle>
                <CardDescription>
                  Configure suas credenciais do Mercado Pago para receber pagamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Access Token</label>
                  <Input
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="Digite seu Access Token"
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Encontre seu Access Token em: Mercado Pago {'>'} Desenvolvedores {'>'} Credenciais
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Public Key</label>
                  <Input
                    type="password"
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)}
                    placeholder="Digite sua Public Key"
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Encontre sua Public Key em: Mercado Pago {'>'} Desenvolvedores {'>'} Credenciais
                  </p>
                </div>

                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Configurações'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings; 