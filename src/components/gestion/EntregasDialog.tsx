import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EntregaItem, NewEntregaItem } from '@/hooks/useEntregas';
import { Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
    product_name: z.string().min(1, 'El nombre del producto es obligatorio'),
    brand: z.string().optional(),
    client_name: z.string().min(1, 'El nombre del cliente es obligatorio'),
    client_phone: z.string().optional(),
    price: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
});

interface EntregasDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item?: EntregaItem | null;
    onSave: (item: NewEntregaItem) => Promise<void>;
    onAddPayment?: (itemId: string, amount: number) => Promise<void>;
    onDeletePayment?: (paymentId: string, itemId: string) => Promise<void>;
}

export function EntregasDialog({
    open,
    onOpenChange,
    item,
    onSave,
    onAddPayment,
    onDeletePayment
}: EntregasDialogProps) {
    const [newPaymentAmount, setNewPaymentAmount] = useState('');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            product_name: '',
            brand: '',
            client_name: '',
            client_phone: '',
            price: 0,
        },
    });

    useEffect(() => {
        if (open) {
            if (item) {
                form.reset({
                    product_name: item.product_name,
                    brand: item.brand || '',
                    client_name: item.client_name,
                    client_phone: item.client_phone || '',
                    price: item.price,
                });
            } else {
                form.reset({
                    product_name: '',
                    brand: '',
                    client_name: '',
                    client_phone: '',
                    price: 0,
                });
            }
            setNewPaymentAmount('');
        }
    }, [open, item, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const itemData: NewEntregaItem = {
            product_name: values.product_name,
            brand: values.brand?.toUpperCase() || null,
            client_name: values.client_name,
            client_phone: values.client_phone || null,
            price: values.price,
        };
        await onSave(itemData);
        // if (!item) onOpenChange(false); // Removed to allow adding payment immediately
    };

    const handleAddPayment = async () => {
        if (!item || !onAddPayment || !newPaymentAmount) return;
        const amount = parseFloat(newPaymentAmount);
        if (isNaN(amount) || amount <= 0) return;

        await onAddPayment(item.id, amount);
        setNewPaymentAmount('');
    };

    const remaining = item ? item.price - (item.total_paid || 0) : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{item ? 'Detalles de Entrega' : 'Nueva Entrega a Cuenta'}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Formulario de Detalles */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} id="entregas-form" className="space-y-4">
                            <FormField
                                control={form.control}
                                name="product_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Producto</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nombre del artículo" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="brand"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Marca</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Marca" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="client_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cliente</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nombre" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="client_phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Teléfono</FormLabel>
                                            <FormControl>
                                                <Input placeholder="600..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Precio Total</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {!item && (
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                                    <Button type="submit">Crear Entrega</Button>
                                </DialogFooter>
                            )}
                        </form>
                    </Form>

                    {/* Sección de Pagos (Solo si ya existe el item) */}
                    {item && (
                        <>
                            <Separator />
                            <div className="space-y-4">
                                <h3 className="font-medium text-lg">Pagos Realizados</h3>

                                <div className="bg-muted p-4 rounded-lg flex justify-between items-center text-sm font-medium">
                                    <div>
                                        <span className="block text-muted-foreground">Total Pagado</span>
                                        <span className="text-xl text-green-600">{item.total_paid?.toFixed(2)} €</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-muted-foreground">Restante</span>
                                        <span className={`text-xl ${remaining <= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {remaining.toFixed(2)} €
                                        </span>
                                    </div>
                                </div>

                                <div className="border rounded-md divide-y max-h-[200px] overflow-y-auto">
                                    {item.payments && item.payments.length > 0 ? (
                                        item.payments.map((payment) => (
                                            <div key={payment.id} className="p-3 flex justify-between items-center text-sm hover:bg-muted/50">
                                                <span>
                                                    {new Date(payment.created_at).toLocaleDateString()}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{payment.amount.toFixed(2)} €</span>
                                                    {onDeletePayment && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                            onClick={() => onDeletePayment(payment.id, item.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-muted-foreground text-sm">
                                            No hay pagos registrados
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 items-end pt-2">
                                    <div className="grid gap-1.5 flex-1">
                                        <label className="text-sm font-medium">Añadir Pago</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Cantidad..."
                                            value={newPaymentAmount}
                                            onChange={(e) => setNewPaymentAmount(e.target.value)}
                                        />
                                    </div>
                                    <Button onClick={handleAddPayment} disabled={!newPaymentAmount} className="mb-[2px]">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Añadir
                                    </Button>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
                                    <Button type="submit" form="entregas-form">Guardar Cambios</Button>
                                </DialogFooter>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
