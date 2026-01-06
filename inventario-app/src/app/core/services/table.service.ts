import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Table, TableSession, TableStatus } from '../../models/supabase.types';
import { RealtimeChannel } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private _tables = new BehaviorSubject<Table[]>([]);
  private tableSubscription: RealtimeChannel | null = null;

  // Configuration for ideal times (could be fetched from DB settings)
  public readonly IDEAL_ATTENTION_TIME = 60 * 60 * 1000; // 1 hour in ms

  constructor(private supabase: SupabaseService) {
    this.loadTables();
    this.subscribeToTableChanges();
  }

  get tables$(): Observable<Table[]> {
    return this._tables.asObservable();
  }

  async loadTables() {
    // Initial Fetch
    const { data, error } = await this.supabase.client
      .from('tables')
      .select('*')
      .order('number');

    if (data) {
      console.log('Tables loaded from DB:', data);
      this._tables.next(data as Table[]);
    } else if (error) {
      console.error('Error loading tables:', error);
    }
  }

  subscribeToTableChanges() {
    if (this.tableSubscription) return;

    this.tableSubscription = this.supabase.client
      .channel('public:tables')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, (payload: any) => {
        console.log('Table update received:', payload);
        this.handleRealtimeUpdate(payload);
      })
      .subscribe();
  }

  private handleRealtimeUpdate(payload: any) {
    const currentTables = this._tables.value;
    if (payload.eventType === 'INSERT') {
      this._tables.next([...currentTables, payload.new as Table]);
    } else if (payload.eventType === 'UPDATE') {
      const updated = currentTables.map(t => t.id === payload.new.id ? { ...t, ...payload.new } : t);
      this._tables.next(updated as Table[]);
    } else if (payload.eventType === 'DELETE') {
      this._tables.next(currentTables.filter(t => t.id !== payload.old.id));
    }
  }

  // --- Logic for Table Management ---

  async occupyTable(tableId: string, waiterId: string | null = null, clientCount: number) {
    // If no waiterId provided, try to get current user
    if (!waiterId) {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (user) {
        waiterId = user.id;
      }
    }

    // 1. Create a new Session
    const sessionPayload: any = {
      table_id: tableId,
      client_count: clientCount,
      status: 'active'
    };
    if (waiterId) {
      sessionPayload.waiter_id = waiterId;
    }

    const { data: session, error: sessionError } = await this.supabase.client
      .from('table_sessions')
      .insert(sessionPayload)
      .select()
      .single();

    if (sessionError || !session) throw sessionError;

    // 2. Update Table Status
    const { data: updatedTable, error: tableError } = await this.supabase.client
      .from('tables')
      .update({
        status: 'occupied',
        current_session_id: session.id
      })
      .eq('id', tableId)
      .select()
      .single();

    if (tableError) throw tableError;

    // Manually update local state
    const currentTables = this._tables.value;
    const updatedList = currentTables.map(t => t.id === tableId ? { ...t, ...updatedTable } : t);
    this._tables.next(updatedList as Table[]);
  }

  async freeTable(tableId: string, sessionId?: string) {
    // 1. Close Session if exists
    if (sessionId) {
      await this.supabase.client
        .from('table_sessions')
        .update({
          end_time: new Date().toISOString(),
          status: 'closed'
        })
        .eq('id', sessionId);
    }

    // 2. Update Table Status
    const { data, error } = await this.supabase.client
      .from('tables')
      .update({
        status: 'free',
        current_session_id: null
      })
      .eq('id', tableId)
      .select()
      .single();

    if (error) throw error;

    // Manually update local state to ensure UI reflects change immediately
    const currentTables = this._tables.value;
    const updatedTables = currentTables.map(t => t.id === tableId ? { ...t, ...data } : t);
    this._tables.next(updatedTables as Table[]);
  }

  async updateTable(id: string, updates: Partial<Table>) {
    const { data, error } = await this.supabase.client
      .from('tables')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Optimistic / Immediate Update
    const current = this._tables.value;
    const updatedList = current.map(t => t.id === id ? { ...t, ...updates } : t);
    this._tables.next(updatedList as Table[]);

    return data as Table;
  }

  async deleteTable(id: string) {
    const { error } = await this.supabase.client
      .from('tables')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Alias for compatibility or specific logic
  async openTable(tableId: string, waiterId?: string | null) {
    // Default client count to 1 if not specified
    return this.occupyTable(tableId, waiterId || null, 1);
  }

  async closeTable(tableId: string) {
    return this.freeTable(tableId);
  }

  async changeStatus(tableId: string, status: TableStatus) {
    await this.supabase.client
      .from('tables')
      .update({ status })
      .eq('id', tableId);
  }

  async createTable(table: Partial<Table>) {
    // Generate QR URL (Using window.location for dynamic origin)
    // Note: ID isn't known until insert, but we can generate a UUID client-side or update after.
    // Simpler: Insert first, then update with QR if ID is needed, OR just use the ID we might have generated (but Supabase generates IDs).
    // Better: Allow Supabase to gen ID, then update QR.

    // 1. Insert Table
    const { data, error } = await this.supabase.client
      .from('tables')
      .insert(table)
      .select()
      .single();

    if (error) throw error;

    // 2. Generate and Update QR
    if (data) {
      const origin = window.location.origin;
      const qrUrl = `${origin}/client/menu/${data.id}`;

      await this.supabase.client
        .from('tables')
        .update({ qr_code: qrUrl })
        .eq('id', data.id);

      data.qr_code = qrUrl; // Update local return
    }

    // Update local state
    const currentTables = this._tables.value;
    this._tables.next([...currentTables, data as Table]);

    return data as Table;
  }

  getElapsedTime(startTime: string): number {
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    return now - start;
  }
}
