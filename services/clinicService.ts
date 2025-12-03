import { Dentista, Paciente, Cita, ValidationResult } from '../types';

// Mock Data Initialization
const MOCK_DENTISTAS: Dentista[] = [
  { id: '1', nombre: 'Dr. Juan Pérez', especialidad: 'Odontología General', email: 'juan.perez@clinica.com' },
  { id: '2', nombre: 'Dra. Ana López', especialidad: 'Ortodoncia', email: 'ana.lopez@clinica.com' },
  { id: '3', nombre: 'Dr. Roberto Gómez', especialidad: 'Cirugía Maxilofacial', email: 'roberto.gomez@clinica.com' },
];

const MOCK_PACIENTES: Paciente[] = [
  { id: '1', nombre: 'Carlos García', fechaNacimiento: '1985-04-12', telefono: '555-1234', email: 'carlos@mail.com', abonado: true },
  { id: '2', nombre: 'María Rodríguez', fechaNacimiento: '1992-08-23', telefono: '555-5678', abonado: false },
];

const MOCK_CITAS: Cita[] = [
  { id: '1', dentistaId: '1', pacienteId: '1', fechaHora: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), motivo: 'Limpieza anual' }
];

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Local Storage Helpers ---
const loadData = <T,>(key: string, defaultData: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultData;
};

const saveData = <T,>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- Service Class ---
class ClinicService {
  private dentistas: Dentista[];
  private pacientes: Paciente[];
  private citas: Cita[];

  constructor() {
    this.dentistas = loadData('dentistas', MOCK_DENTISTAS);
    this.pacientes = loadData('pacientes', MOCK_PACIENTES);
    this.citas = loadData('citas', MOCK_CITAS);
  }

  // --- Dentistas ---
  async getDentistas(): Promise<Dentista[]> {
    await delay(200);
    return [...this.dentistas].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  async saveDentista(dentista: Dentista): Promise<Dentista> {
    await delay(300);
    if (!dentista.id) {
      dentista.id = crypto.randomUUID();
      this.dentistas.push(dentista);
    } else {
      this.dentistas = this.dentistas.map(d => d.id === dentista.id ? dentista : d);
    }
    saveData('dentistas', this.dentistas);
    return dentista;
  }

  async deleteDentista(id: string): Promise<ValidationResult> {
    await delay(300);
    const hasFutureAppointments = this.citas.some(c => c.dentistaId === id && new Date(c.fechaHora) > new Date());
    if (hasFutureAppointments) {
      return { isValid: false, error: 'No se puede eliminar: El dentista tiene citas futuras asignadas.' };
    }
    this.dentistas = this.dentistas.filter(d => d.id !== id);
    // Cleanup past appointments optional, but keeping referential integrity usually implies keeping history or cascading. 
    // For this requirements, we strictly check future appointments.
    saveData('dentistas', this.dentistas);
    return { isValid: true };
  }

  // --- Pacientes ---
  async getPacientes(): Promise<Paciente[]> {
    await delay(200);
    return [...this.pacientes].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  async savePaciente(paciente: Paciente): Promise<Paciente> {
    await delay(300);
    if (!paciente.id) {
      paciente.id = crypto.randomUUID();
      this.pacientes.push(paciente);
    } else {
      this.pacientes = this.pacientes.map(p => p.id === paciente.id ? paciente : p);
    }
    saveData('pacientes', this.pacientes);
    return paciente;
  }

  async deletePaciente(id: string): Promise<ValidationResult> {
    await delay(300);
    const hasFutureAppointments = this.citas.some(c => c.pacienteId === id && new Date(c.fechaHora) > new Date());
    if (hasFutureAppointments) {
      return { isValid: false, error: 'No se puede eliminar: El paciente tiene citas futuras programadas.' };
    }
    this.pacientes = this.pacientes.filter(p => p.id !== id);
    saveData('pacientes', this.pacientes);
    return { isValid: true };
  }

  // --- Citas ---
  async getCitas(): Promise<Cita[]> {
    await delay(200);
    return [...this.citas].sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
  }

  async getCitasByDentista(dentistaId: string): Promise<Cita[]> {
    await delay(200);
    return this.citas
      .filter(c => c.dentistaId === dentistaId)
      .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
  }

  // HU-14: Validación de Regla de Negocio
  async validateAvailability(dentistaId: string, fechaHoraIso: string, excludeCitaId?: string): Promise<ValidationResult> {
    const newStart = new Date(fechaHoraIso).getTime();
    const durationMs = 2 * 60 * 60 * 1000; // 2 hours in ms
    const newEnd = newStart + durationMs;

    // Filter appointments for the same dentist, excluding the one being edited (if any)
    const dentistaCitas = this.citas.filter(c => c.dentistaId === dentistaId && c.id !== excludeCitaId);

    for (const cita of dentistaCitas) {
      const existingStart = new Date(cita.fechaHora).getTime();
      const existingEnd = existingStart + durationMs;

      // Check overlap: (StartA < EndB) and (EndA > StartB)
      if (newStart < existingEnd && newEnd > existingStart) {
        return { 
          isValid: false, 
          error: `Conflicto de horario. El dentista ya tiene una cita de ${new Date(existingStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} a ${new Date(existingEnd).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.` 
        };
      }
    }
    return { isValid: true };
  }

  async saveCita(cita: Cita): Promise<ValidationResult> {
    await delay(300);
    
    // Validate Dentista Exists
    if (!this.dentistas.find(d => d.id === cita.dentistaId)) {
        return { isValid: false, error: 'El dentista seleccionado no existe.' };
    }
    // Validate Paciente Exists
    if (!this.pacientes.find(p => p.id === cita.pacienteId)) {
        return { isValid: false, error: 'El paciente seleccionado no existe.' };
    }

    // Business Rule: Availability
    const availability = await this.validateAvailability(cita.dentistaId, cita.fechaHora, cita.id);
    if (!availability.isValid) {
      return availability;
    }

    if (!cita.id) {
      cita.id = crypto.randomUUID();
      this.citas.push(cita);
    } else {
      this.citas = this.citas.map(c => c.id === cita.id ? cita : c);
    }
    saveData('citas', this.citas);
    return { isValid: true };
  }

  async deleteCita(id: string): Promise<void> {
    await delay(300);
    this.citas = this.citas.filter(c => c.id !== id);
    saveData('citas', this.citas);
  }
}

export const clinicService = new ClinicService();