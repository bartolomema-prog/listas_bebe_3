import { useState } from 'react';
import { EntregaItem, useEntregas } from '@/hooks/useEntregas';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Search, Loader2, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { EntregasDialog } from './EntregasDialog';

export function EntregasList() {
    const { items, loading, createItem, updateItem, deleteItem, addPayment, deletePayment } = useEntregas();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<EntregaItem | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const filteredItems = items.filter((item) => {
        const search = searchTerm.toLowerCase();
        return (
            item.product_name.toLowerCase().includes(search) ||
            (item.brand && item.brand.toLowerCase().includes(search)) ||
            item.client_name.toLowerCase().includes(search)
        );
    });

    const handleCreate = () => {
        setSelectedItem(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (item: EntregaItem) => {
        setSelectedItem(item);
        setIsDialogOpen(true);
    };

    const handleSave = async (data: any) => {
        if (selectedItem) {
            await updateItem(selectedItem.id, data);
        } else {
            const { data: newItem } = await createItem(data);
            if (newItem) {
                setSelectedItem(newItem);
                // Do not close dialog, so user can add payment
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar entrega..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Entrega
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Marca</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead className="text-right">Precio</TableHead>
                            <TableHead className="text-right">Pagado</TableHead>
                            <TableHead className="text-right">Restante</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No hay entregas encontradas
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredItems.map((item) => {
                                const remaining = item.price - (item.total_paid || 0);
                                return (
                                    <TableRow
                                        key={item.id}
                                        className="cursor-pointer hover:bg-muted/50 text-xs md:text-sm"
                                        onClick={() => handleEdit(item)}
                                    >
                                        <TableCell className="font-medium">{item.product_name}</TableCell>
                                        <TableCell>{item.brand || '-'}</TableCell>
                                        <TableCell>{item.client_name}</TableCell>
                                        <TableCell className="text-right">{item.price.toFixed(2)} €</TableCell>
                                        <TableCell className="text-right text-green-600 font-medium">
                                            {item.total_paid?.toFixed(2)} €
                                        </TableCell>
                                        <TableCell className={`text-right font-medium ${remaining <= 0.01 ? 'text-green-600' : 'text-red-500'}`}>
                                            {remaining <= 0.01 ? 'Pagado' : `${remaining.toFixed(2)} €`}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm('¿Estás seguro de que quieres eliminar esta entrega? Esta acción no se puede deshacer.')) {
                                                        deleteItem(item.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <EntregasDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                item={selectedItem}
                onSave={handleSave}
                onAddPayment={addPayment}
                onDeletePayment={deletePayment}
            />
        </div>
    );
}
