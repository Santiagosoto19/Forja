export const seedRoutine = {
  id: 'routine_ppl',
  name: 'PPL 3 días',
  days: [
    {
      id: 'day_push',
      name: 'Empuje (Push)',
      order: 1,
      exercises: [
        { id: 're_push_1', exerciseId: 'ex_press_banca', sets: 4, repMin: 6, repMax: 10, restSeconds: 120, notes: 'Controla el descenso. Deja 1-2 reps en reserva.', order: 1 },
        { id: 're_push_2', exerciseId: 'ex_press_inclinado', sets: 3, repMin: 8, repMax: 12, restSeconds: 90, notes: 'Banco a 30°. Pecho alto.', order: 2 },
        { id: 're_push_3', exerciseId: 'ex_press_militar', sets: 3, repMin: 6, repMax: 10, restSeconds: 120, notes: 'Core firme, no arquees la lumbar.', order: 3 },
        { id: 're_push_4', exerciseId: 'ex_elevaciones_laterales', sets: 3, repMin: 12, repMax: 15, restSeconds: 60, notes: 'Codos suaves, sin impulso.', order: 4 },
        { id: 're_push_5', exerciseId: 'ex_fondos', sets: 3, repMin: 6, repMax: 12, restSeconds: 90, notes: 'Inclinación ligera hacia adelante para pecho.', order: 5 },
        { id: 're_push_6', exerciseId: 'ex_extension_triceps', sets: 3, repMin: 10, repMax: 15, restSeconds: 60, notes: 'Codos pegados al torso.', order: 6 },
      ],
    },
    {
      id: 'day_pull',
      name: 'Tirón (Pull)',
      order: 2,
      exercises: [
        { id: 're_pull_1', exerciseId: 'ex_dominadas', sets: 4, repMin: 6, repMax: 10, restSeconds: 120, notes: 'Si no llegas, usa banda o jalón.', order: 1 },
        { id: 're_pull_2', exerciseId: 'ex_remo_barra', sets: 4, repMin: 6, repMax: 10, restSeconds: 120, notes: 'Tira con los codos, pecho orgulloso.', order: 2 },
        { id: 're_pull_3', exerciseId: 'ex_jalon_pecho', sets: 3, repMin: 8, repMax: 12, restSeconds: 90, notes: 'Lleva la barra a la parte alta del pecho.', order: 3 },
        { id: 're_pull_4', exerciseId: 'ex_face_pull', sets: 3, repMin: 12, repMax: 15, restSeconds: 60, notes: 'Rota hacia afuera al final del movimiento.', order: 4 },
        { id: 're_pull_5', exerciseId: 'ex_curl_barra', sets: 3, repMin: 8, repMax: 12, restSeconds: 75, notes: 'Sin balancear el torso.', order: 5 },
        { id: 're_pull_6', exerciseId: 'ex_curl_martillo', sets: 3, repMin: 10, repMax: 12, restSeconds: 60, notes: 'Agarre neutro, controlado.', order: 6 },
      ],
    },
    {
      id: 'day_legs',
      name: 'Piernas (Legs)',
      order: 3,
      exercises: [
        { id: 're_legs_1', exerciseId: 'ex_sentadilla', sets: 4, repMin: 5, repMax: 8, restSeconds: 180, notes: 'Profundidad cómoda, rodillas al ritmo de los pies.', order: 1 },
        { id: 're_legs_2', exerciseId: 'ex_peso_muerto_rumano', sets: 3, repMin: 6, repMax: 10, restSeconds: 150, notes: 'Cadera atrás, espalda neutra.', order: 2 },
        { id: 're_legs_3', exerciseId: 'ex_prensa', sets: 3, repMin: 8, repMax: 12, restSeconds: 120, notes: 'No bloquees las rodillas arriba.', order: 3 },
        { id: 're_legs_4', exerciseId: 'ex_sentadilla_bulgara', sets: 3, repMin: 8, repMax: 12, restSeconds: 90, notes: 'Por pierna. Torso ligeramente inclinado.', order: 4 },
        { id: 're_legs_5', exerciseId: 'ex_extension_cuad', sets: 3, repMin: 10, repMax: 15, restSeconds: 60, notes: 'Pausa de 1 s arriba.', order: 5 },
        { id: 're_legs_6', exerciseId: 'ex_gemelos', sets: 4, repMin: 10, repMax: 15, restSeconds: 60, notes: 'Recorrido completo, pausa abajo.', order: 6 },
        { id: 're_legs_7', exerciseId: 'ex_plancha', sets: 3, repMin: 8, repMax: 12, restSeconds: 45, notes: '30-60 segundos. Cadera alineada.', order: 7 },
      ],
    },
  ],
}
