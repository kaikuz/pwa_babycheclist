-- Camino a casa · migración 006: ajustes en las tipologías de eventos
--
-- Aditiva y segura de re-ejecutar. Dos cambios:
--   1. Renombra 'medicacion' de "Medicación / vacunas" a "Análisis / medicación"
--      (su ilustración pasa a analisis-vacunas.PNG en el cliente).
--   2. Añade la tipología nueva "Inicio medicación" (id 'inicio_medicacion'),
--      para marcar el día en que empieza una medicación/pauta.

update event_types
  set name = 'Análisis / medicación'
  where id = 'medicacion';

insert into event_types (id, name, color, icon) values
  ('inicio_medicacion', 'Inicio medicación', '#9B84C4', '💉')
on conflict (id) do update
  set name = excluded.name,
      color = excluded.color,
      icon = excluded.icon;
