import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { HistoryItem, MonitoredPackage } from '../types/tracking.types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface StorageData {
  historico: HistoryItem[];
  monitorados: Record<string, MonitoredPackage>;
}

export class StorageService {
  private static readonly DATA_DIR = path.resolve(__dirname, '../../data');
  private static readonly FILE_PATH = path.resolve(this.DATA_DIR, 'storage.json');
  private static data: StorageData = { historico: [], monitorados: {} };
  private static isInitialized = false;

  private static ensureInit() {
    if (this.isInitialized) return;

    try {
      if (!fs.existsSync(this.DATA_DIR)) {
        fs.mkdirSync(this.DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(this.FILE_PATH)) {
        const raw = fs.readFileSync(this.FILE_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        if (!Array.isArray(this.data.historico)) this.data.historico = [];
        if (!this.data.monitorados || typeof this.data.monitorados !== 'object') this.data.monitorados = {};
      } else {
        this.save();
      }
    } catch {
      this.data = { historico: [], monitorados: {} };
    }

    this.isInitialized = true;
  }

  private static save() {
    try {
      if (!fs.existsSync(this.DATA_DIR)) {
        fs.mkdirSync(this.DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(this.FILE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Erro ao salvar storage:', err);
    }
  }

  // --- Histórico ---

  public static addHistorico(item: HistoryItem) {
    this.ensureInit();
    // Remove if already exists to push to front
    this.data.historico = this.data.historico.filter((h) => h.codigo !== item.codigo);
    this.data.historico.unshift(item);

    // Limit history to 100 items
    if (this.data.historico.length > 100) {
      this.data.historico = this.data.historico.slice(0, 100);
    }

    this.save();
  }

  public static getHistorico(): HistoryItem[] {
    this.ensureInit();
    return this.data.historico;
  }

  public static clearHistorico() {
    this.ensureInit();
    this.data.historico = [];
    this.save();
  }

  // --- Pacotes Monitorados ---

  public static addOrUpdateMonitorado(pkg: MonitoredPackage) {
    this.ensureInit();
    this.data.monitorados[pkg.codigo] = pkg;
    this.save();
  }

  public static getMonitorados(): MonitoredPackage[] {
    this.ensureInit();
    return Object.values(this.data.monitorados);
  }

  public static getMonitorado(codigo: string): MonitoredPackage | undefined {
    this.ensureInit();
    return this.data.monitorados[codigo.toUpperCase().trim()];
  }

  public static removeMonitorado(codigo: string): boolean {
    this.ensureInit();
    const key = codigo.toUpperCase().trim();
    if (this.data.monitorados[key]) {
      delete this.data.monitorados[key];
      this.save();
      return true;
    }
    return false;
  }
}
