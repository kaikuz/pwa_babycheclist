-- Canastilla · migración 003: embarazo de alto riesgo
-- (preeclampsia, tratamiento con heparina), parto previsto a principios
-- de octubre en Madrid.
--
-- Solo añade e IMPORTANTE: es aditiva. No modifica 002_seed.sql, no borra
-- ni renombra ids de sections/items, y no toca item_checks: los checks ya
-- guardados por cualquiera de los dos siguen siendo válidos porque están
-- enlazados por item_id (uuid), no por nombre.
--
-- Segura de re-ejecutar: si algo de esto ya se aplicó (por ejemplo, tras un
-- reintento), no duplica filas ni vuelve a desplazar el sort de secciones.

-- ---------------------------------------------------------------------------
-- 1. Nueva sección "Salud de mamá", primera en el orden (sort 0)
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from sections where id = 'mama') then
    -- hueco al principio: todas las secciones existentes bajan un puesto
    update sections set sort = sort + 1;

    insert into sections (id, name, emoji, sort) values
      ('mama', 'Salud de mamá', '🩺', 0);

    insert into items (section_id, name, essential, products, sort) values
      ('mama', 'Tensiómetro de brazo validado clínicamente (seguimiento de la tensión en casa)', true,
        '[{"n":"Omron M3 Comfort","p":"50-70 €","u":"https://www.amazon.es/s?k=omron+m3+comfort+tensiometro"},{"n":"Omron M7 Intelli IT","p":"80-110 €","u":"https://www.amazon.es/s?k=omron+m7+intelli+it"}]', 1),
      ('mama', 'Contenedor rígido para agujas de heparina (pregunta en tu farmacia o centro de salud)', true, '[]', 2),
      ('mama', 'Cuaderno o app para apuntar tomas de tensión y citas médicas', false, '[]', 3);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Documentación de la maleta: añade informe de hematología y pauta de
--    heparina (con hora de la última dosis)
-- ---------------------------------------------------------------------------

update items
set name = 'Documentación: DNI, tarjeta sanitaria, cartilla del embarazo, plan de parto, informe de hematología y pauta de heparina (con hora de la última dosis)'
where section_id = 'hosp'
  and name = 'Documentación (DNI, tarjeta sanitaria, cartilla, plan de parto)';

-- ---------------------------------------------------------------------------
-- 3. Ropa ajustada a un nacimiento de octubre en Madrid
-- ---------------------------------------------------------------------------

-- No existe un ítem separado de "conjunto de salida"; el más parecido (y el
-- que ya menciona el arrullo) es este de la sección hospital.
update items
set name = 'Conjunto de salida + arrullo o saquito de entretiempo (nacimiento en octubre)'
where section_id = 'hosp'
  and name = 'Gorrito, manoplas, calcetines, arrullo';

update items
set name = 'Calcetines, gorritos y chaqueta de entretiempo; ropa de invierno en tallas 1-3 y 3-6 meses'
where section_id = 'pan'
  and name = 'Calcetines, gorritos, chaqueta/saco de temporada';

update items
set name = 'Saco de invierno para silla/carrito (nov-ene) + plástico de lluvia'
where section_id = 'paseo'
  and name = 'Saco de silla/carrito + plástico de lluvia + parasol';

-- mantiene sus products actuales (Tommee Tippee Grobag), solo cambia el nombre
update items
set name = 'Saco de dormir: TOG 1-2 para octubre; TOG 2.5 para invierno'
where section_id = 'dorm'
  and name = 'Saco de dormir (TOG por estación)';
