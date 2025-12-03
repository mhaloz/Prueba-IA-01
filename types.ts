export interface Dentista {
  id: string;
  nombre: string;
  especialidad: string;
  email: string;
}

export interface Paciente {
  id: string;
  nombre: string;
  fechaNacimiento: string; // YYYY-MM-DD
  telefono: string;
  email?: string;
  abonado: boolean;
}

export interface Cita {
  id: string;
  fechaHora: string; // ISO String
  motivo: string;
  dentistaId: string;
  pacienteId: string;
}

export enum Especialidad {
  GENERAL = 'Odontología General',
  ORTODONCIA = 'Ortodoncia',
  ENDODONCIA = 'Endodoncia',
  CIRUGIA = 'Cirugía Maxilofacial',
  PEDIATRIA = 'Odontopediatría'
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}