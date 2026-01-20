import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/components/ui/use-toast';

export interface Encargo {
    id: string;
    created_at: string;
    product_name: string;
    brand: string | null;
    client_name: string;
    client_phone: string | null;
    price: number | null;
    deposit: number;
    observations: string | null;
    is_ordered: boolean;
    is_picked_up: boolean;
    user_id: string;
}

export type NewEncargo = Omit<Encargo, 'id' | 'created_at' | 'user_id'>;

export function useOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Encargo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else {
            setOrders([]);
            setLoading(false);
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('encargos' as any)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders((data as unknown as Encargo[]) || []);
        } catch (error: any) {
            console.error('Error fetching orders:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron cargar los encargos',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const createOrder = async (order: NewEncargo) => {
        try {
            const { data, error } = await supabase
                .from('encargos' as any)
                .insert([{ ...order, user_id: user?.id }])
                .select()
                .single();

            if (error) throw error;

            setOrders((prev) => [(data as unknown as Encargo), ...prev]);
            toast({
                title: 'Encargo creado',
                description: 'El encargo se ha guardado correctamente',
            });
            return { data, error: null };
        } catch (error: any) {
            console.error('Error creating order:', error);
            toast({
                title: 'Error',
                description: 'No se pudo crear el encargo',
                variant: 'destructive',
            });
            return { data: null, error };
        }
    };

    const updateOrder = async (id: string, updates: Partial<Encargo>) => {
        try {
            const { data, error } = await supabase
                .from('encargos' as any)
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            setOrders((prev) => prev.map((o) => (o.id === id ? (data as unknown as Encargo) : o)));
            toast({
                title: 'Encargo actualizado',
                description: 'Los cambios se han guardado correctamente',
            });
            return { data, error: null };
        } catch (error: any) {
            console.error('Error updating order:', error);
            toast({
                title: 'Error',
                description: 'No se pudo actualizar el encargo',
                variant: 'destructive',
            });
            return { data: null, error };
        }
    };

    const deleteOrder = async (id: string) => {
        try {
            const { error } = await supabase
                .from('encargos' as any)
                .delete()
                .eq('id', id);

            if (error) throw error;

            setOrders((prev) => prev.filter((o) => o.id !== id));
            toast({
                title: 'Encargo eliminado',
                description: 'El encargo se ha eliminado correctamente',
            });
            return { error: null };
        } catch (error: any) {
            console.error('Error deleting order:', error);
            toast({
                title: 'Error',
                description: 'No se pudo eliminar el encargo',
                variant: 'destructive',
            });
            return { error };
        }
    };

    return {
        orders,
        loading,
        fetchOrders,
        createOrder,
        updateOrder,
        deleteOrder,
    };
}
