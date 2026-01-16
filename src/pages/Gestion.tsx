import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/shopping/Header';
import { Package, Truck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Gestion() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/auth');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return <div className="flex justify-center p-8">Cargando...</div>;
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-6 max-w-4xl">
                <div className="mb-6">
                    <Button variant="ghost" className="mb-4 pl-0 hover:pl-2 transition-all" onClick={() => navigate('/')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                    <h1 className="text-2xl font-bold">Gestión</h1>
                </div>

                <Tabs defaultValue="encargos" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="encargos" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Encargos
                        </TabsTrigger>
                        <TabsTrigger value="entregas" className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Entregas a cuenta
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="encargos">
                        <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">Encargos</h2>
                            <p className="text-muted-foreground">Aquí aparecerá el listado de encargos.</p>
                            {/* Content for Encargos will go here */}
                        </div>
                    </TabsContent>

                    <TabsContent value="entregas">
                        <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">Entregas a cuenta</h2>
                            <p className="text-muted-foreground">Aquí aparecerá el listado de entregas a cuenta.</p>
                            {/* Content for Entregas a cuenta will go here */}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
