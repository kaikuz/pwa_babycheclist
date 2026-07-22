-- Camino a casa · migración 007: nombre e iconos de las tipologías de medicación
--
-- Re-ejecutable. Ajusta 'medicacion' para que su nombre coincida con la
-- ilustración ("Análisis / vacunas") e intercambia los emojis, que estaban
-- cruzados:
--   medicacion (análisis / vacunas) -> jeringuilla 💉
--   inicio_medicacion (medicación)  -> pastilla 💊

update event_types
  set name = 'Análisis / vacunas',
      icon = '💉'
  where id = 'medicacion';

update event_types
  set icon = '💊'
  where id = 'inicio_medicacion';
