import { useState } from 'react';
import { Encargo, useOrders } from '@/hooks/useOrders';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { OrderDialog } from './OrderDialog';

export function OrdersList() {
    const { orders, loading, createOrder, updateOrder } = useOrders();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Encargo | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'ordered' | 'picked_up'>('all');

    const filteredOrders = orders.filter((order) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
            order.product_name.toLowerCase().includes(search) ||
            (order.brand && order.brand.toLowerCase().includes(search)) ||
            order.client_name.toLowerCase().includes(search);

        if (!matchesSearch) return false;

        if (filter === 'all') return true;
        if (filter === 'pending') return !order.is_ordered && !order.is_picked_up;
        if (filter === 'ordered') return order.is_ordered && !order.is_picked_up;
        if (filter === 'picked_up') return order.is_picked_up;

        return true;
    });

    const handleCreate = () => {
        setSelectedOrder(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (order: Encargo) => {
        setSelectedOrder(order);
        setIsDialogOpen(true);
    };

    const handleSave = async (data: any) => {
        if (selectedOrder) {
            await updateOrder(selectedOrder.id, data);
        } else {
            await createOrder(data);
        }
    };

    const getRowBackground = (order: Encargo) => {
        if (order.is_picked_up) return 'bg-blue-100 hover:bg-blue-200';
        if (order.is_ordered) return 'bg-yellow-100 hover:bg-yellow-200';
        return 'hover:bg-muted/50';
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
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                    className="h-8 px-3 text-xs shrink-0"
                >
                    Todos
                </Button>
                <Button
                    variant={filter === 'pending' ? 'default' : 'outline'}
                    onClick={() => setFilter('pending')}
                    className="h-8 px-3 text-xs shrink-0"
                >
                    Pendientes
                </Button>
                <Button
                    variant={filter === 'ordered' ? 'default' : 'outline'}
                    onClick={() => setFilter('ordered')}
                    className={`h-8 px-3 text-xs shrink-0 ${filter === 'ordered' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}`}
                >
                    Pedidos
                </Button>
                <Button
                    variant={filter === 'picked_up' ? 'default' : 'outline'}
                    onClick={() => setFilter('picked_up')}
                    className={`h-8 px-3 text-xs shrink-0 ${filter === 'picked_up' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}`}
                >
                    Recogidos
                </Button>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar encargo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Encargo
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Estado</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead>Marca</TableHead>
                            <TableHead>Cliente</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    No hay encargos encontrados
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders.map((order) => (
                                <TableRow
                                    key={order.id}
                                    className={`cursor-pointer text-xs md:text-sm ${getRowBackground(order)}`}
                                    onClick={() => handleEdit(order)}
                                >
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <div className="flex gap-2">
                                            <Checkbox
                                                checked={order.is_ordered}
                                                onCheckedChange={(checked) =>
                                                    updateOrder(order.id, { is_ordered: !!checked })
                                                }
                                                title="Pedido"
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4"
                                            />
                                            <Checkbox
                                                checked={order.is_picked_up}
                                                onCheckedChange={(checked) =>
                                                    updateOrder(order.id, { is_picked_up: !!checked })
                                                }
                                                title="Recogido"
                                                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 h-4 w-4"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{order.product_name}</TableCell>
                                    <TableCell>{order.brand || '-'}</TableCell>
                                    <TableCell>{order.client_name}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <OrderDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                order={selectedOrder}
                onSave={handleSave}
            />
        </div>
    );
}
