import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

export interface EntregaItem {
  id: string;
  created_at: string;
  user_id: string;
  product_name: string;
  brand: string | null;
  client_name: string;
  client_phone: string | null;
  price: number;
  is_finished: boolean;
  payments?: EntregaPayment[];
  total_paid?: number;
}

export interface EntregaPayment {
  id: string;
  created_at: string;
  entregas_item_id: string;
  amount: number;
}

export interface NewEntregaItem {
  product_name: string;
  brand: string | null;
  client_name: string;
  client_phone: string | null;
  price: number;
}

export function useEntregas() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<EntregaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      setLoading(true);
      // Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from('entregas_items' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      // Fetch all payments for these items (could be optimized with a join or view, but safe for now)
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('entregas_payments' as any)
        .select('*');

      if (paymentsError) throw paymentsError;

      // Combine data
      const itemsWithPayments = (itemsData as unknown as EntregaItem[]).map(item => {
        const itemPayments = (paymentsData as unknown as EntregaPayment[]).filter(p => p.entregas_item_id === item.id);
        const totalPaid = itemPayments.reduce((sum, p) => sum + p.amount, 0);
        return {
          ...item,
          payments: itemPayments,
          total_paid: totalPaid
        };
      });

      setItems(itemsWithPayments);
    } catch (error: any) {
      console.error('Error fetching entregas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las entregas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (item: NewEntregaItem) => {
    try {
      const { data, error } = await supabase
        .from('entregas_items' as any)
        .insert([{ ...item, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;

      const newItem: EntregaItem = { ...data, payments: [], total_paid: 0 };
      setItems(prev => [newItem, ...prev]);

      toast({
        title: 'Entrega creada',
        description: 'Producto añadido correctamente',
      });
      return { data: newItem, error: null };
    } catch (error: any) {
      console.error('Error creating item:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la entrega',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const updateItem = async (id: string, updates: Partial<EntregaItem>) => {
    try {
      const { error } = await supabase
        .from('entregas_items' as any)
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      toast({
        title: 'Actualizado',
        description: 'Cambios guardados',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar',
        variant: 'destructive',
      });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from('entregas_items' as any).delete().eq('id', id);
      if (error) throw error;
      setItems(prev => prev.filter(i => i.id !== id));
      toast({ title: 'Eliminado', description: 'Entrega eliminada' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    }
  }

  const addPayment = async (itemId: string, amount: number) => {
    try {
      const { data, error } = await supabase
        .from('entregas_payments' as any)
        .insert([{ entregas_item_id: itemId, amount }])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setItems(prev => prev.map(item => {
        if (item.id === itemId) {
          const newPayments = [...(item.payments || []), data as EntregaPayment];
          return {
            ...item,
            payments: newPayments,
            total_paid: (item.total_paid || 0) + amount
          };
        }
        return item;
      }));

      toast({
        title: 'Pago añadido',
        description: `Se han añadido ${amount}€`,
      });
      return { data, error: null };
    } catch (error: any) {
      console.error('Error adding payment:', error);
      toast({
        title: 'Error',
        description: 'No se pudo registrar el pago',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const deletePayment = async (paymentId: string, itemId: string) => {
    try {
      const { error } = await supabase
        .from('entregas_payments' as any)
        .delete()
        .eq('id', paymentId);

      if (error) throw error;

      setItems(prev => prev.map(item => {
        if (item.id === itemId) {
          const deletedPayment = item.payments?.find(p => p.id === paymentId);
          const amount = deletedPayment?.amount || 0;
          return {
            ...item,
            payments: item.payments?.filter(p => p.id !== paymentId) || [],
            total_paid: (item.total_paid || 0) - amount
          };
        }
        return item;
      }));

      toast({ title: 'Pago eliminado', description: 'El pago ha sido eliminado' });

    } catch (error) {
      toast({ title: 'Error', variant: 'destructive', description: 'Fallo al eliminar pago' });
    }
  }

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user]);

  return {
    items,
    loading,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    addPayment,
    deletePayment
  };
}
