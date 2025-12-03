import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Users, Calendar, LayoutDashboard, Stethoscope, Plus, Edit2, Trash2, Phone, Mail, User, Clock, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { clinicService } from './services/clinicService';
import { Dentista, Paciente, Cita, Especialidad } from './types';
import { Button, Input, Select, Card, Modal } from './components/UI';

// --- Components Helpers ---

const Navigation = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dentists', label: 'Dentistas', icon: Stethoscope },
    { path: '/patients', label: 'Pacientes', icon: Users },
    { path: '/appointments', label: 'Citas', icon: Calendar },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-100 min-h-screen flex flex-col fixed left-0 top-0 h-full overflow-y-auto z-10 hidden md:flex">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <div className="bg-blue-500 p-1.5 rounded-lg">
            <Stethoscope size={20} className="text-white" />
          </div>
          DentalCare
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-500 text-center">v1.0.0 &copy; 2024</div>
      </div>
    </div>
  );
};

const MobileNav = () => {
    const location = useLocation();
    const navItems = [
      { path: '/', label: 'Dash', icon: LayoutDashboard },
      { path: '/dentists', label: 'Dentistas', icon: Stethoscope },
      { path: '/patients', label: 'Pacientes', icon: Users },
      { path: '/appointments', label: 'Citas', icon: Calendar },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around p-2 shadow-lg">
             {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link 
                        key={item.path} 
                        to={item.path}
                        className={`flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
                    >
                        <item.icon size={20} />
                        <span className="text-[10px] mt-1">{item.label}</span>
                    </Link>
                )
             })}
        </div>
    )
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-slate-50 md:pl-64 pb-20 md:pb-0">
    <Navigation />
    <MobileNav />
    <main className="max-w-7xl mx-auto p-4 md:p-8">
      {children}
    </main>
  </div>
);

// --- Pages ---

// 1. Dashboard
const Dashboard = () => {
  const [stats, setStats] = useState<{ dentistas: number, pacientes: number, citas: number }>({ dentistas: 0, pacientes: 0, citas: 0 });
  const [appointmentsBySpec, setAppointmentsBySpec] = useState<{name: string, value: number}[]>([]);

  useEffect(() => {
    Promise.all([
      clinicService.getDentistas(),
      clinicService.getPacientes(),
      clinicService.getCitas()
    ]).then(([d, p, c]) => {
      setStats({ dentistas: d.length, pacientes: p.length, citas: c.length });
      
      // Calculate pie chart data
      const counts: Record<string, number> = {};
      c.forEach(cita => {
        const doc = d.find(doc => doc.id === cita.dentistaId);
        if (doc) {
            counts[doc.especialidad] = (counts[doc.especialidad] || 0) + 1;
        }
      });
      setAppointmentsBySpec(Object.entries(counts).map(([name, value]) => ({ name, value })));
    });
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <Stethoscope size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Dentistas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.dentistas}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Pacientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pacientes}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Citas Programadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.citas}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Citas por Especialidad">
             <div className="h-64 w-full">
                {appointmentsBySpec.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={appointmentsBySpec}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {appointmentsBySpec.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        Sin datos suficientes
                    </div>
                )}
             </div>
          </Card>
          <Card title="Acciones Rápidas">
             <div className="grid grid-cols-1 gap-4">
                <Link to="/appointments">
                    <Button className="w-full justify-start" variant="secondary">
                        <Plus size={16} className="mr-2"/> Nueva Cita
                    </Button>
                </Link>
                <Link to="/patients">
                     <Button className="w-full justify-start" variant="secondary">
                        <Users size={16} className="mr-2"/> Registrar Paciente
                    </Button>
                </Link>
             </div>
          </Card>
      </div>
    </div>
  );
};

// 2. Dentists Page
const Dentists = () => {
  const [dentistas, setDentistas] = useState<Dentista[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDentist, setEditingDentist] = useState<Dentista | null>(null);
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Detail View State
  const [viewingDentist, setViewingDentist] = useState<Dentista | null>(null);
  const [dentistAppointments, setDentistAppointments] = useState<Cita[]>([]);
  const [patientsMap, setPatientsMap] = useState<Record<string, string>>({});

  const fetchDentists = async () => {
    const data = await clinicService.getDentistas();
    setDentistas(data);
  };

  useEffect(() => {
    fetchDentists();
    clinicService.getPacientes().then(pts => {
        const map: Record<string, string> = {};
        pts.forEach(p => map[p.id] = p.nombre);
        setPatientsMap(map);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newDentist: Dentista = {
      id: editingDentist?.id || '',
      nombre: formData.get('nombre') as string,
      especialidad: formData.get('especialidad') as string,
      email: formData.get('email') as string,
    };

    // Validations (HU-01, HU-03)
    if (!newDentist.nombre || !newDentist.especialidad || !newDentist.email) {
      setFormError('Todos los campos son obligatorios.');
      setIsLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newDentist.email)) {
      setFormError('Formato de email inválido.');
      setIsLoading(false);
      return;
    }

    await clinicService.saveDentista(newDentist);
    setIsLoading(false);
    setIsModalOpen(false);
    setEditingDentist(null);
    fetchDentists();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este dentista?')) return;
    const result = await clinicService.deleteDentista(id);
    if (!result.isValid) {
      alert(result.error);
    } else {
      fetchDentists();
    }
  };

  const openEdit = (dentist: Dentista) => {
    setEditingDentist(dentist);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingDentist(null);
    setIsModalOpen(true);
  };

  const openDetail = async (dentist: Dentista) => {
      setViewingDentist(dentist);
      const appts = await clinicService.getCitasByDentista(dentist.id);
      setDentistAppointments(appts);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Dentistas</h2>
        <Button onClick={openCreate}><Plus size={16} className="mr-2" /> Nuevo Dentista</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dentistas.map((dentist) => (
          <Card key={dentist.id} className="hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <User size={24} className="text-blue-600" />
              </div>
              <div className="flex space-x-2">
                 <button onClick={() => openDetail(dentist)} className="text-gray-400 hover:text-blue-600" title="Ver Agenda">
                  <Calendar size={18} />
                </button>
                <button onClick={() => openEdit(dentist)} className="text-gray-400 hover:text-blue-600">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(dentist.id)} className="text-gray-400 hover:text-red-600">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{dentist.nombre}</h3>
            <p className="text-blue-600 text-sm font-medium mb-2">{dentist.especialidad}</p>
            <div className="flex items-center text-gray-500 text-sm">
              <Mail size={14} className="mr-2" /> {dentist.email}
            </div>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDentist ? 'Editar Dentista' : 'Nuevo Dentista'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input name="nombre" label="Nombre Completo" defaultValue={editingDentist?.nombre} placeholder="Dr. Ejemplo" />
          <Select name="especialidad" label="Especialidad" defaultValue={editingDentist?.especialidad || ''}>
             <option value="" disabled>Seleccione...</option>
             {Object.values(Especialidad).map(e => <option key={e} value={e}>{e}</option>)}
          </Select>
          <Input name="email" label="Email" type="email" defaultValue={editingDentist?.email} placeholder="ejemplo@clinica.com" />
          
          {formError && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{formError}</div>}
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isLoading}>Guardar</Button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal (HU-05) */}
      <Modal isOpen={!!viewingDentist} onClose={() => setViewingDentist(null)} title={`Agenda: ${viewingDentist?.nombre}`}>
         <div className="space-y-4 max-h-[60vh] overflow-y-auto">
             {dentistAppointments.length === 0 ? (
                 <p className="text-gray-500 text-center py-4">No hay citas programadas.</p>
             ) : (
                 <ul className="divide-y divide-gray-100">
                     {dentistAppointments.map(app => {
                         const date = new Date(app.fechaHora);
                         return (
                            <li key={app.id} className="py-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">{patientsMap[app.pacienteId] || 'Paciente desconocido'}</p>
                                        <p className="text-xs text-gray-500">{app.motivo}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-blue-600">
                                            {date.toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>
                            </li>
                         )
                     })}
                 </ul>
             )}
         </div>
         <div className="flex justify-end pt-4">
             <Button variant="secondary" onClick={() => setViewingDentist(null)}>Cerrar</Button>
         </div>
      </Modal>
    </div>
  );
};

// 3. Patients Page
const Patients = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Paciente | null>(null);
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchPatients = async () => {
    const data = await clinicService.getPacientes();
    setPacientes(data);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newPatient: Paciente = {
      id: editingPatient?.id || '',
      nombre: formData.get('nombre') as string,
      fechaNacimiento: formData.get('fechaNacimiento') as string,
      telefono: formData.get('telefono') as string,
      email: formData.get('email') as string,
      abonado: formData.get('abonado') === 'on',
    };

    // Validations (HU-06, HU-08)
    if (!newPatient.nombre || !newPatient.fechaNacimiento || !newPatient.telefono) {
      setFormError('Nombre, fecha de nacimiento y teléfono son obligatorios.');
      setIsLoading(false);
      return;
    }
    const phoneRegex = /^[0-9+\-\s()]{7,}$/; // Basic loose validation
    if (!phoneRegex.test(newPatient.telefono)) {
        setFormError('Formato de teléfono inválido.');
        setIsLoading(false);
        return;
    }
    if (newPatient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newPatient.email)) {
        setFormError('Formato de email inválido.');
        setIsLoading(false);
        return;
    }

    await clinicService.savePaciente(newPatient);
    setIsLoading(false);
    setIsModalOpen(false);
    setEditingPatient(null);
    fetchPatients();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar paciente?')) return;
    const result = await clinicService.deletePaciente(id);
    if (!result.isValid) alert(result.error);
    else fetchPatients();
  };

  const openEdit = (p: Paciente) => { setEditingPatient(p); setIsModalOpen(true); };
  const openCreate = () => { setEditingPatient(null); setIsModalOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Pacientes</h2>
        <Button onClick={openCreate}><Plus size={16} className="mr-2" /> Nuevo Paciente</Button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {pacientes.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{patient.nombre}</div>
                    <div className="text-xs text-gray-500">Nac: {patient.fechaNacimiento}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center"><Phone size={12} className="mr-1"/> {patient.telefono}</div>
                    {patient.email && <div className="text-sm text-gray-500 flex items-center"><Mail size={12} className="mr-1"/> {patient.email}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    {patient.abonado ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Abonado</span>
                    ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Estándar</span>
                    )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openEdit(patient)} className="text-blue-600 hover:text-blue-900 mr-4">Editar</button>
                    <button onClick={() => handleDelete(patient.id)} className="text-red-600 hover:text-red-900">Borrar</button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input name="nombre" label="Nombre Completo" defaultValue={editingPatient?.nombre} required />
          <Input name="fechaNacimiento" label="Fecha de Nacimiento" type="date" defaultValue={editingPatient?.fechaNacimiento} required />
          <Input name="telefono" label="Teléfono" type="tel" defaultValue={editingPatient?.telefono} required />
          <Input name="email" label="Email (Opcional)" type="email" defaultValue={editingPatient?.email} />
          
          <div className="flex items-center mt-4">
            <input id="abonado" name="abonado" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" defaultChecked={editingPatient?.abonado} />
            <label htmlFor="abonado" className="ml-2 block text-sm text-gray-900">Es abonado</label>
          </div>

          {formError && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{formError}</div>}
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isLoading}>Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// 4. Appointments Page
const Appointments = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [dentistas, setDentistas] = useState<Dentista[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCita, setEditingCita] = useState<Cita | null>(null);
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
      const [c, d, p] = await Promise.all([
          clinicService.getCitas(),
          clinicService.getDentistas(),
          clinicService.getPacientes()
      ]);
      setCitas(c);
      setDentistas(d);
      setPacientes(p);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Parse datetime-local to ISO
    const dateLocal = formData.get('fechaHora') as string;
    const isoDate = new Date(dateLocal).toISOString();

    const newCita: Cita = {
      id: editingCita?.id || '',
      dentistaId: formData.get('dentistaId') as string,
      pacienteId: formData.get('pacienteId') as string,
      fechaHora: isoDate,
      motivo: formData.get('motivo') as string,
    };

    // Validations (HU-10, HU-12)
    if (!newCita.dentistaId || !newCita.pacienteId || !dateLocal || !newCita.motivo) {
        setFormError('Todos los campos son obligatorios.');
        setIsLoading(false);
        return;
    }

    // Backend Logic Check (HU-14)
    const result = await clinicService.saveCita(newCita);
    if (!result.isValid) {
        setFormError(result.error || 'Error desconocido.');
        setIsLoading(false);
        return;
    }

    setIsLoading(false);
    setIsModalOpen(false);
    setEditingCita(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
      if(confirm("¿Está seguro de que desea eliminar esta cita?")) { // HU-13
          await clinicService.deleteCita(id);
          fetchData();
      }
  }

  const openCreate = () => { setEditingCita(null); setIsModalOpen(true); };
  const openEdit = (c: Cita) => { setEditingCita(c); setIsModalOpen(true); };

  // Helper to format ISO to datetime-local value
  const toLocalISO = (isoString?: string) => {
      if (!isoString) return '';
      const date = new Date(isoString);
      // Adjust to local timezone for input
      const offset = date.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
      return localISOTime;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Agenda de Citas</h2>
        <Button onClick={openCreate}><Plus size={16} className="mr-2" /> Nueva Cita</Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
          {citas.map(cita => {
              const d = dentistas.find(doc => doc.id === cita.dentistaId);
              const p = pacientes.find(pat => pat.id === cita.pacienteId);
              const date = new Date(cita.fechaHora);

              return (
                  <Card key={cita.id} className="hover:border-blue-300 transition-colors">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                          <div className="flex items-start gap-4">
                              <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-center min-w-[80px]">
                                  <div className="text-xl font-bold">{date.getDate()}</div>
                                  <div className="text-xs uppercase">{date.toLocaleString('es-ES', { month: 'short' })}</div>
                                  <div className="text-sm font-mono mt-1">{date.getHours()}:{String(date.getMinutes()).padStart(2, '0')}</div>
                              </div>
                              <div>
                                  <h3 className="font-bold text-gray-900">{p?.nombre || 'Paciente desconocido'}</h3>
                                  <p className="text-sm text-gray-600 flex items-center gap-1">
                                      <Stethoscope size={14}/> {d?.nombre || 'Dentista desconocido'}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1 italic">"{cita.motivo}"</p>
                              </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                              <Button variant="secondary" onClick={() => openEdit(cita)} className="text-xs px-3 py-1">Reprogramar</Button>
                              <Button variant="ghost" onClick={() => handleDelete(cita.id)} className="text-xs px-3 py-1 text-red-600 hover:bg-red-50">Cancelar</Button>
                          </div>
                      </div>
                  </Card>
              )
          })}
          {citas.length === 0 && <div className="text-center py-10 text-gray-500">No hay citas programadas.</div>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCita ? 'Editar Cita' : 'Programar Cita'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Select name="dentistaId" label="Dentista" defaultValue={editingCita?.dentistaId || ''} required>
             <option value="" disabled>Seleccione dentista...</option>
             {dentistas.map(d => <option key={d.id} value={d.id}>{d.nombre} ({d.especialidad})</option>)}
          </Select>
          <Select name="pacienteId" label="Paciente" defaultValue={editingCita?.pacienteId || ''} required>
             <option value="" disabled>Seleccione paciente...</option>
             {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </Select>
          
          <Input 
            name="fechaHora" 
            label="Fecha y Hora" 
            type="datetime-local" 
            defaultValue={toLocalISO(editingCita?.fechaHora)} 
            required 
          />
          <p className="text-xs text-gray-500 flex items-center"><Clock size={12} className="mr-1"/> Duración estimada: 2 horas</p>

          <Input name="motivo" label="Motivo de la visita" defaultValue={editingCita?.motivo} placeholder="Ej: Revisión general, dolor muela..." required />

          {formError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start">
                  <AlertTriangle className="text-red-500 mr-2 flex-shrink-0" size={20} />
                  <p className="text-sm text-red-700">{formError}</p>
              </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isLoading}>Guardar Cita</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// --- App Root ---

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dentists" element={<Dentists />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/appointments" element={<Appointments />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;