-- Camino a casa · migración 005: registrar qué producto se consiguió
--
-- Aditiva y re-ejecutable. Al marcar un ítem que tiene productos
-- recomendados, la app guarda cuál de ellos se compró (o null si fue
-- "otro" / el ítem no tiene productos). Los checks existentes quedan
-- como están, con product = null.

alter table item_checks add column if not exists product text;
