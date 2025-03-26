import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  Copy, 
  Edit, 
  Trash2, 
  Filter,
  Palette,
  FileText,
  LayoutTemplate
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const templateCards = [
  {
    id: 'tpl-001',
    title: 'Website Corporativo',
    description: 'Template completo para sites empresariais',
    thumbnail: 'bg-hubster-primary/30',
    tags: ['website', 'corporativo'],
    category: 'proposal'
  },
  {
    id: 'tpl-002',
    title: 'E-commerce Padrão',
    description: 'Modelo para lojas virtuais completas',
    thumbnail: 'bg-hubster-secondary/30',
    tags: ['ecommerce', 'loja'],
    category: 'proposal'
  },
  {
    id: 'tpl-003',
    title: 'Landing Page Eventos',
    description: 'Template para páginas de captura de eventos',
    thumbnail: 'bg-green-500/30',
    tags: ['landing', 'eventos'],
    category: 'proposal'
  },
  {
    id: 'tpl-004',
    title: 'Site Institucional',
    description: 'Layout para apresentação institucional',
    thumbnail: 'bg-amber-500/30',
    tags: ['website', 'institucional'],
    category: 'website'
  },
  {
    id: 'tpl-005',
    title: 'One Page Portfolio',
    description: 'Modelo de site one-page para profissionais',
    thumbnail: 'bg-blue-500/30',
    tags: ['portfolio', 'one-page'],
    category: 'website'
  },
  {
    id: 'tpl-006',
    title: 'Blog Minimalista',
    description: 'Layout clean para blogs e sites de conteúdo',
    thumbnail: 'bg-purple-500/30',
    tags: ['blog', 'minimalista'],
    category: 'website'
  },
  {
    id: 'tpl-007',
    title: 'Proposta Detalhada',
    description: 'Modelo completo com orçamentos detalhados',
    thumbnail: 'bg-hubster-primary/30',
    tags: ['detalhada', 'orçamento'],
    category: 'proposal'
  },
  {
    id: 'tpl-008',
    title: 'Proposta Rápida',
    description: 'Template simplificado para propostas rápidas',
    thumbnail: 'bg-hubster-secondary/30',
    tags: ['rápida', 'simples'],
    category: 'proposal'
  },
];

const Templates = () => {
  const [activeTab, setActiveTab] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredTemplates = templateCards.filter(template => {
    const matchesSearch = 
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = 
      activeTab === 'all' || 
      (activeTab === 'proposals' && template.category === 'proposal') ||
      (activeTab === 'websites' && template.category === 'website');
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto space-y-8 page-transition">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Templates</h1>
                <p className="text-muted-foreground">Biblioteca de modelos para reutilização</p>
              </div>
              <Button className="bg-hubster-secondary hover:bg-hubster-secondary/90">
                <Plus className="mr-2 h-4 w-4" /> Novo Template
              </Button>
            </div>
            
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="proposals">Propostas</TabsTrigger>
                  <TabsTrigger value="websites">Sites</TabsTrigger>
                </TabsList>
                
                <div className="flex flex-1 sm:max-w-md gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar templates..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTemplates.map((template) => (
                    <Card key={template.id} className="overflow-hidden card-hover">
                      <div className={cn("h-40 flex items-center justify-center", template.thumbnail)}>
                        {template.category === 'proposal' ? (
                          <FileText className="h-10 w-10 text-foreground/50" />
                        ) : (
                          <LayoutTemplate className="h-10 w-10 text-foreground/50" />
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{template.title}</CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                          </div>
                          {template.category === 'proposal' ? (
                            <div className="px-2 py-1 bg-hubster-primary/10 text-hubster-primary rounded text-xs font-medium">
                              Proposta
                            </div>
                          ) : (
                            <div className="px-2 py-1 bg-hubster-secondary/10 text-hubster-secondary rounded text-xs font-medium">
                              Site
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex flex-wrap gap-2">
                          {template.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm" className="flex items-center">
                          <Copy className="h-3 w-3 mr-1" />
                          Usar
                        </Button>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                {filteredTemplates.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <Palette className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Nenhum template encontrado</p>
                    <p className="text-muted-foreground mt-1">Tente ajustar sua busca ou criar um novo template</p>
                    <Button className="mt-4 bg-hubster-secondary hover:bg-hubster-secondary/90">
                      <Plus className="mr-2 h-4 w-4" /> Criar Template
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="proposals" className="mt-0">
                {/* Similar content but filtered for proposals */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* Filtered cards would render here */}
                </div>
              </TabsContent>
              
              <TabsContent value="websites" className="mt-0">
                {/* Similar content but filtered for websites */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* Filtered cards would render here */}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Templates;
