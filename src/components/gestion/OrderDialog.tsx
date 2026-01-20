import { useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Encargo, NewEncargo } from '@/hooks/useOrders';

const formSchema = z.object({
    product_name: z.string().min(1, 'El nombre del producto es obligatorio'),
    brand: z.string().optional(),
    client_name: z.string().min(1, 'El nombre del cliente es obligatorio'),
    client_phone: z.string().optional(),
    price: z.coerce.number().min(0).optional(),
    deposit: z.coerce.number().min(0).default(0),
    observations: z.string().optional(),
    is_ordered: z.boolean().default(false),
    is_picked_up: z.boolean().default(false),
});

interface OrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order?: Encargo | null;
    onSave: (order: NewEncargo) => Promise<void>;
}

export function OrderDialog({ open, onOpenChange, order, onSave }: OrderDialogProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            product_name: '',
            brand: '',
            client_name: '',
            client_phone: '',
            price: 0,
            deposit: 0,
            observations: '',
            is_ordered: false,
            is_picked_up: false,
        },
    });

    useEffect(() => {
        if (open) {
            if (order) {
                form.reset({
                    product_name: order.product_name,
                    brand: order.brand || '',
                    client_name: order.client_name,
                    client_phone: order.client_phone || '',
                    price: order.price || 0,
                    deposit: order.deposit || 0,
                    observations: order.observations || '',
                    is_ordered: order.is_ordered,
                    is_picked_up: order.is_picked_up,
                });
            } else {
                form.reset({
                    product_name: '',
                    brand: '',
                    client_name: '',
                    client_phone: '',
                    price: 0,
                    deposit: 0,
                    observations: '',
                    is_ordered: false,
                    is_picked_up: false,
                });
            }
        }
    }, [open, order, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const encargoData: NewEncargo = {
            product_name: values.product_name,
            brand: values.brand?.toUpperCase() || null,
            client_name: values.client_name,
            client_phone: values.client_phone || null,
            price: values.price || null,
            deposit: values.deposit,
            observations: values.observations || null,
            is_ordered: values.is_ordered,
            is_picked_up: values.is_picked_up,
        };
        await onSave(encargoData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{order ? 'Editar Encargo' : 'Nuevo Encargo'}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {order && (
                            <div className="text-sm text-muted-foreground mb-4">
                                Fecha: {new Date(order.created_at).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                }).replace(/\//g, '-')}
                            </div>
                        )}
                        <FormField
                            control={form.control}
                            name="product_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Producto *</FormLabel>
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
                                        <Input placeholder="Marca o modelo" {...field} />
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
                                        <FormLabel>Cliente *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nombre del cliente" {...field} />
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

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Precio</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="deposit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Entrega a cuenta</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="observations"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Observaciones</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Detalles adicionales..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-6 pt-2">
                            <FormField
                                control={form.control}
                                name="is_ordered"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Pedido
                                            </FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_picked_up"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Recogido
                                            </FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
