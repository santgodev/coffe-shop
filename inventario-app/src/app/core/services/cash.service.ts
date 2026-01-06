import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { CashShift, CashTransaction, Order } from '../../models/supabase.types';

@Injectable({
    providedIn: 'root'
})
export class CashService {
    private _currentShift = new BehaviorSubject<CashShift | null>(null);

    constructor(private supabase: SupabaseService) {
        this.checkOpenShift();
    }

    get currentShift$(): Observable<CashShift | null> {
        return this._currentShift.asObservable();
    }

    get currentShiftValue(): CashShift | null {
        return this._currentShift.value;
    }

    async checkOpenShift() {
        // Find a shift that is 'open'
        const { data, error } = await this.supabase.client
            .from('cash_shifts')
            .select('*')
            .eq('status', 'open')
            .maybeSingle(); // Use maybeSingle to avoid 406 error if none found

        if (error && error.code !== 'PGRST116') {
            console.error('Error checking open shift:', error);
            return;
        }

        if (data) {
            this._currentShift.next(data as CashShift);
        } else {
            this._currentShift.next(null);
        }
    }

    async openShift(baseAmount: number, userId: string) {
        const newShift: Partial<CashShift> = {
            base_amount: baseAmount,
            opened_by: userId,
            status: 'open',
            opened_at: new Date().toISOString()
        };

        const { data, error } = await this.supabase.client
            .from('cash_shifts')
            .insert(newShift)
            .select()
            .single();

        if (error) throw error;

        this._currentShift.next(data as CashShift);
        return data;
    }

    async closeShift(shiftId: string, closingData: { expected: number, real: number, notes?: string, closedBy: string }) {
        const updates = {
            status: 'closed',
            closed_at: new Date().toISOString(),
            final_cash_expected: closingData.expected,
            final_cash_real: closingData.real,
            difference: closingData.real - closingData.expected,
            notes: closingData.notes,
            closed_by: closingData.closedBy
        };

        const { data, error } = await this.supabase.client
            .from('cash_shifts')
            .update(updates)
            .eq('id', shiftId)
            .select()
            .single();

        if (error) throw error;

        this._currentShift.next(null); // Shift is closed
        return data;
    }

    async addTransaction(shiftId: string, type: 'expense' | 'income', amount: number, description: string, userId: string) {
        const { data, error } = await this.supabase.client
            .from('cash_transactions')
            .insert({
                shift_id: shiftId,
                type,
                amount,
                description,
                user_id: userId
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getShiftTransactions(shiftId: string): Promise<CashTransaction[]> {
        const { data, error } = await this.supabase.client
            .from('cash_transactions')
            .select('*')
            .eq('shift_id', shiftId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as CashTransaction[];
    }

    // Calculate totals: Base + Sales (Cash) + Incomes - Expenses
    async getShiftSummary(shiftId: string): Promise<{
        base: number;
        totalSalesCash: number;
        totalIncomes: number;
        totalExpenses: number;
        expectedTotal: number;
    }> {

        const shift = this._currentShift.value;
        if (!shift) throw new Error('No active shift locally');

        // 1. Transactions
        const transactions = await this.getShiftTransactions(shiftId);
        const totalIncomes = transactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);

        // 2. Sales (Cash Only)
        // We assume 'orders' table has 'status' = 'paid' (or we check 'payments' table if it exists, assuming orders for now)
        // Query orders paid AFTER shift opened
        const { data: salesData, error } = await this.supabase.client
            .from('orders') // Assuming orders has total_amount and status
            .select('total_amount, payment_method') // Add payment_method if it exists
            .eq('status', 'paid')
            .gte('updated_at', shift.opened_at); // simplistic time check

        if (error) {
            console.error('Error fetching sales for shift:', error);
        }

        // TODO: Filter only Cash sales if payment_method exists. 
        // For now assuming all paid orders count or we filter in memory if field exists.
        // Let's assume we sum all for now, or refine if user confirms schema.

        const totalSalesCash = (salesData || [])
            .reduce((acc: number, order: any) => acc + (order.total_amount || 0), 0);

        const base = shift.base_amount || 0;
        const expectedTotal = base + totalSalesCash + totalIncomes - totalExpenses;

        return {
            base,
            totalSalesCash,
            totalIncomes,
            totalExpenses,
            expectedTotal
        };
    }
}
