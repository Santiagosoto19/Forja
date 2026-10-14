export const MUSCLE_LABELS = {
  chest: 'Pecho',
  back: 'Espalda',
  legs: 'Piernas',
  shoulders: 'Hombros',
  arms: 'Brazos',
  core: 'Core',
}

export const GENDER_LABELS = {
  male: 'Hombre',
  female: 'Mujer',
  other: 'Otro',
}

export const EXPERIENCE_LABELS = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

export const GOAL_LABELS = {
  hypertrophy: 'Hipertrofia',
  strength: 'Fuerza',
  fat_loss: 'Pérdida de grasa',
  recomp: 'Recomposición',
  maintenance: 'Mantenimiento',
}

export const COMPOUND_EXERCISE_IDS = [
  'ex_press_banca',
  'ex_sentadilla',
  'ex_peso_muerto_rumano',
  'ex_dominadas',
  'ex_press_militar',
  'ex_remo_barra',
]

export const seedExercises = [
  { id: 'ex_press_banca', name: 'Press de banca', muscleGroup: 'chest', isCustom: false, equipment: 'barra' },
  { id: 'ex_press_inclinado', name: 'Press banca inclinado', muscleGroup: 'chest', isCustom: false, equipment: 'barra' },
  { id: 'ex_press_declinado', name: 'Press banca declinado', muscleGroup: 'chest', isCustom: false, equipment: 'barra' },
  { id: 'ex_press_mancuernas', name: 'Press con mancuernas', muscleGroup: 'chest', isCustom: false, equipment: 'mancuernas' },
  { id: 'ex_aperturas', name: 'Aperturas con mancuernas', muscleGroup: 'chest', isCustom: false, equipment: 'mancuernas' },
  { id: 'ex_cruces_polea', name: 'Cruces en polea', muscleGroup: 'chest', isCustom: false, equipment: 'polea' },
  { id: 'ex_fondos', name: 'Fondos en paralelas', muscleGroup: 'chest', isCustom: false, equipment: 'peso corporal' },
  { id: 'ex_dominadas', name: 'Dominadas', muscleGroup: 'back', isCustom: false, equipment: 'peso corporal' },
  { id: 'ex_jalon_pecho', name: 'Jalón al pecho', muscleGroup: 'back', isCustom: false, equipment: 'máquina' },
  { id: 'ex_remo_barra', name: 'Remo con barra', muscleGroup: 'back', isCustom: false, equipment: 'barra' },
  { id: 'ex_remo_mancuerna', name: 'Remo con mancuerna', muscleGroup: 'back', isCustom: false, equipment: 'mancuernas' },
  { id: 'ex_remo_polea', name: 'Remo en polea baja', muscleGroup: 'back', isCustom: false, equipment: 'polea' },
  { id: 'ex_peso_muerto', name: 'Peso muerto', muscleGroup: 'back', isCustom: false, equipment: 'barra' },
  { id: 'ex_peso_muerto_rumano', name: 'Peso muerto rumano', muscleGroup: 'legs', isCustom: false, equipment: 'barra' },
  { id: 'ex_face_pull', name: 'Face pull', muscleGroup: 'back', isCustom: false, equipment: 'polea' },
  { id: 'ex_hiperextensiones', name: 'Hiperextensiones', muscleGroup: 'back', isCustom: false, equipment: 'máquina' },
  { id: 'ex_sentadilla', name: 'Sentadilla trasera', muscleGroup: 'legs', isCustom: false, equipment: 'barra' },
  { id: 'ex_sentadilla_frontal', name: 'Sentadilla frontal', muscleGroup: 'legs', isCustom: false, equipment: 'barra' },
  { id: 'ex_prensa', name: 'Prensa de piernas', muscleGroup: 'legs', isCustom: false, equipment: 'máquina' },
  { id: 'ex_sentadilla_bulgara', name: 'Sentadilla búlgara', muscleGroup: 'legs', isCustom: false, equipment: 'mancuernas' },
  { id: 'ex_zancadas', name: 'Zancadas', muscleGroup: 'legs', isCustom: false, equipment: 'mancuernas' },
  { id: 'ex_extension_cuad', name: 'Extensión de cuádriceps', muscleGroup: 'legs', isCustom: false, equipment: 'máquina' },
  { id: 'ex_curl_femoral', name: 'Curl femoral', muscleGroup: 'legs', isCustom: false, equipment: 'máquina' },
  { id: 'ex_hip_thrust', name: 'Hip thrust', muscleGroup: 'legs', isCustom: false, equipment: 'barra' },
  { id: 'ex_gemelos', name: 'Elevación de gemelos de pie', muscleGroup: 'legs', isCustom: false, equipment: 'máquina' },
  { id: 'ex_press_militar', name: 'Press militar', muscleGroup: 'shoulders', isCustom: false, equipment: 'barra' },
  { id: 'ex_press_arnold', name: 'Press Arnold', muscleGroup: 'shoulders', isCustom: false, equipment: 'mancuernas' },
  { id: 'ex_elevaciones_laterales', name: 'Elevaciones laterales', muscleGroup: 'shoulders', isCustom: false, equipment: 'mancuernas' },
  { id: 'ex_elevaciones_frontales', name: 'Elevaciones frontales', muscleGroup: 'shoulders', isCustom: false, equipment: 'mancuernas' },
  { id: 'ex_pajaros', name: 'Pájaros (deltoides posterior)', muscleGroup: 'shoulders', isCustom: false, equipment: 'mancuernas' },
  { id: 'ex_curl_barra', name: 'Curl con barra', muscleGroup: 'arms', isCustom: false, equipment: 'barra' },
  { id: 'ex_curl_martillo', name: 'Curl martillo', muscleGroup: 'arms', isCustom: false, equipment: 'mancuernas' },
  { id: 'ex_curl_predicador', name: 'Curl predicador', muscleGroup: 'arms', isCustom: false, equipment: 'barra' },
  { id: 'ex_extension_triceps', name: 'Extensión de tríceps en polea', muscleGroup: 'arms', isCustom: false, equipment: 'polea' },
  { id: 'ex_press_frances', name: 'Press francés', muscleGroup: 'arms', isCustom: false, equipment: 'barra' },
  { id: 'ex_fondos_banco', name: 'Fondos en banco', muscleGroup: 'arms', isCustom: false, equipment: 'peso corporal' },
  { id: 'ex_plancha', name: 'Plancha', muscleGroup: 'core', isCustom: false, equipment: 'peso corporal' },
  { id: 'ex_crunch', name: 'Crunch', muscleGroup: 'core', isCustom: false, equipment: 'peso corporal' },
  { id: 'ex_elevacion_piernas', name: 'Elevación de piernas', muscleGroup: 'core', isCustom: false, equipment: 'peso corporal' },
  { id: 'ex_pallof', name: 'Pallof press', muscleGroup: 'core', isCustom: false, equipment: 'polea' },
  { id: 'ex_rueda', name: 'Rueda abdominal', muscleGroup: 'core', isCustom: false, equipment: 'rueda' },
  { id: 'ex_russian_twist', name: 'Russian twist', muscleGroup: 'core', isCustom: false, equipment: 'peso corporal' },
]
