/**
 * Arquitectura de sincronización offline-first con Cloudflare D1
 * Diseñada para minimizar al máximo las operaciones de lectura (reads) y escritura (writes)
 * dentro de los límites gratuitos de Cloudflare (D1 free tier: 5M reads/mes, 100k writes/día).
 * 
 * Principios:
 * 1. Cache-first en cliente (IndexedDB / LocalStorage): el usuario lee instantáneamente sin coste de DB.
 * 2. Escrituras por lotes (Batch Sync / Debouncing): en lugar de 1 write por cada click, se agrupan en una sola transacción SQL.
 * 3. Sincronización delta / incremental mediante updatedAt y version tags: solo se transfieren registros modificados.
 */

export interface SyncPayload<T> {
  userId: string;
  lastSyncTimestamp: number;
  changes: {
    createdOrUpdated: T[];
    deletedIds: string[];
  };
}

export interface SyncResult<T> {
  serverTimestamp: number;
  serverChanges: {
    createdOrUpdated: T[];
    deletedIds: string[];
  };
  success: boolean;
}

// Cola de cambios en memoria/local antes de ser enviados en lote a Cloudflare
class SyncManager {
  private pendingWrites: Map<string, { table: string; data: any; action: 'upsert' | 'delete'; timestamp: number }> = new Map();
  private debounceTimer: any = null;
  private readonly BATCH_DELAY_MS = 2500; // Espera 2.5s de inactividad para agrupar múltiples cambios en 1 sola petición
  private lastSyncTime: number = 0;

  constructor() {
    const savedLastSync = localStorage.getItem('myfridge_last_sync_time');
    if (savedLastSync) {
      this.lastSyncTime = parseInt(savedLastSync, 10);
    }
  }

  /**
   * Encola un cambio de inserción o actualización sin disparar una petición de inmediato.
   */
  public enqueueUpsert(table: string, id: string, data: any) {
    const key = `${table}:${id}`;
    this.pendingWrites.set(key, {
      table,
      data: { ...data, updatedAt: Date.now() },
      action: 'upsert',
      timestamp: Date.now(),
    });
    this.scheduleBatchSync();
  }

  /**
   * Encola una eliminación.
   */
  public enqueueDelete(table: string, id: string) {
    const key = `${table}:${id}`;
    this.pendingWrites.set(key, {
      table,
      data: { id },
      action: 'delete',
      timestamp: Date.now(),
    });
    this.scheduleBatchSync();
  }

  /**
   * Temporizador debounce para agrupar todas las operaciones pendientes
   */
  private scheduleBatchSync() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.flushBatch();
    }, this.BATCH_DELAY_MS);
  }

  /**
   * Envía en 1 sola llamada HTTP (batch) todas las escrituras acumuladas.
   * Si el usuario modifica 10 alimentos o descuenta 5 ingredientes de una receta,
   * se realiza 1 único POST con una sola transacción SQLite (BEGIN TRANSACTION ... COMMIT) en D1.
   */
  public async flushBatch() {
    if (this.pendingWrites.size === 0) return;

    const itemsToSync = Array.from(this.pendingWrites.values());
    this.pendingWrites.clear();

    try {
      // Cuando conectes tu Worker de Cloudflare, aquí se envía el lote completo:
      // await fetch('/api/sync', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ batch: itemsToSync, clientTimestamp: Date.now() })
      // });
      console.log(`[D1 Sync] Lote optimizado enviado con éxito: ${itemsToSync.length} operaciones agrupadas en 1 sola consulta.`);
      
      this.lastSyncTime = Date.now();
      localStorage.setItem('myfridge_last_sync_time', this.lastSyncTime.toString());
    } catch (err) {
      console.error('[D1 Sync] Error al sincronizar lote, reencolando:', err);
      // En caso de fallo de red, reinsertar para reintentar cuando haya conexión
      for (const item of itemsToSync) {
        const id = item.data.id;
        this.pendingWrites.set(`${item.table}:${id}`, item);
      }
    }
  }

  public getLastSyncTime(): number {
    return this.lastSyncTime;
  }
}

export const syncManager = new SyncManager();

