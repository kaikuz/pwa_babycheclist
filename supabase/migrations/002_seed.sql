-- Canastilla · migración 002: secciones e ítems de serie

insert into sections (id, name, emoji, sort) values
  ('hosp',  'Hospital',              '🏥', 1),
  ('dorm',  'Habitación y descanso', '🛏️', 2),
  ('alim',  'Alimentación',          '🍼', 3),
  ('hig',   'Higiene y baño',        '🛁', 4),
  ('pan',   'Pañales y ropa',        '🧷', 5),
  ('paseo', 'Paseo y coche',         '🚼', 6),
  ('casa',  'Estar por casa',        '🏠', 7);

-- 🏥 Hospital
insert into items (section_id, name, essential, products, sort) values
  ('hosp', 'Documentación (DNI, tarjeta sanitaria, cartilla, plan de parto)', true, '[]', 1),
  ('hosp', '2-3 camisones/pijamas de lactancia', true,
    '[{"n":"Pijama lactancia algodón (pack)","p":"20-35 €","u":"https://www.amazon.es/s?k=pijama+lactancia+hospital"}]', 2),
  ('hosp', 'Compresas postparto', true,
    '[{"n":"Chelino Postparto","p":"3-5 €/paq","u":"https://www.amazon.es/s?k=chelino+postparto"},{"n":"Indasec noche","p":"4-6 €/paq","u":"https://www.amazon.es/s?k=compresas+postparto+noche"}]', 3),
  ('hosp', 'Sujetadores de lactancia + discos', true,
    '[{"n":"Carriwell sin costuras","p":"20-30 €","u":"https://www.amazon.es/s?k=carriwell+sujetador+lactancia"},{"n":"Discos Lansinoh (x60)","p":"8-11 €","u":"https://www.amazon.es/s?k=discos+lactancia+lansinoh"}]', 4),
  ('hosp', 'Neceser, chanclas, toalla, ropa cómoda de vuelta', true, '[]', 5),
  ('hosp', '4-5 bodies + 4-5 pijamas talla RN', true,
    '[{"n":"Pack bodies algodón (Prénatal/H&M)","p":"12-20 €","u":"https://www.amazon.es/s?k=pack+bodies+recien+nacido+algodon"}]', 6),
  ('hosp', 'Gorrito, manoplas, calcetines, arrullo', true, '[]', 7),
  ('hosp', 'Muselinas (2-3)', true,
    '[{"n":"Aden + Anais (pack 4)","p":"40-50 €","u":"https://www.amazon.es/s?k=aden+anais+muselinas+pack+4"},{"n":"Lictin pack económico","p":"15-20 €","u":"https://www.amazon.es/s?k=muselinas+bebe+algodon+pack"}]', 8),
  ('hosp', 'Crema de pezones + pezoneras', false,
    '[{"n":"Lansinoh Lanolina HPA","p":"9-12 €","u":"https://www.amazon.es/s?k=lansinoh+lanolina+hpa"},{"n":"Pezoneras Medela Contact","p":"10-14 €","u":"https://www.amazon.es/s?k=pezoneras+medela+contact"}]', 9),
  ('hosp', 'Cojín de lactancia', false,
    '[{"n":"Boppy","p":"35-50 €","u":"https://www.amazon.es/s?k=cojin+lactancia+boppy"},{"n":"Doomoo Buddy","p":"45-60 €","u":"https://www.amazon.es/s?k=doomoo+buddy+cojin"}]', 10);

-- 🛏️ Habitación y descanso
insert into items (section_id, name, essential, products, sort) values
  ('dorm', 'Minicuna de colecho', true,
    '[{"n":"Chicco Next2Me Magic EVO","p":"230-270 €","u":"https://www.amazon.es/s?k=chicco+next2me+magic+evo"},{"n":"Maxi-Cosi Iora","p":"150-200 €","u":"https://www.amazon.es/s?k=maxi+cosi+iora"}]', 1),
  ('dorm', 'Colchón firme transpirable + protector', true,
    '[{"n":"Aerosleep minicuna","p":"90-130 €","u":"https://www.amazon.es/s?k=aerosleep+colchon+minicuna"},{"n":"Ecus Kids Care","p":"70-100 €","u":"https://www.amazon.es/s?k=ecus+kids+colchon+minicuna"}]', 2),
  ('dorm', '2-3 sábanas bajeras (a medida del colchón)', true,
    '[{"n":"Set Chicco Next2Me 50×83","p":"15-22 €","u":"https://www.amazon.es/s?k=sabanas+next2me+50x83"}]', 3),
  ('dorm', 'Saco de dormir (TOG por estación)', true,
    '[{"n":"Tommee Tippee Grobag","p":"25-40 €","u":"https://www.amazon.es/s?k=tommee+tippee+grobag+saco+dormir"}]', 4),
  ('dorm', 'Cambiador + colchoneta lavable', true,
    '[{"n":"Colchoneta Cambrass/Olmitos","p":"20-35 €","u":"https://www.amazon.es/s?k=colchoneta+cambiador+bebe"}]', 5),
  ('dorm', 'Vigilabebés', true,
    '[{"n":"Miniland Digimonitor 5\" HD (monitor propio)","p":"180-220 €","u":"https://www.amazon.es/s?k=miniland+digimonitor+5+hd"},{"n":"Nanit Pro (app + análisis sueño)","p":"280-330 €","u":"https://www.amazon.es/s?k=nanit+pro+camara+bebe"}]', 6),
  ('dorm', 'Cubo de pañales antiolor', true,
    '[{"n":"Tommee Tippee Sangenic","p":"25-35 €","u":"https://www.amazon.es/s?k=tommee+tippee+sangenic"}]', 7),
  ('dorm', 'Termómetro de habitación + luz nocturna', true,
    '[{"n":"Termohigrómetro digital","p":"10-15 €","u":"https://www.amazon.es/s?k=termometro+higrometro+habitacion+bebe"}]', 8),
  ('dorm', 'Cuna grande (a partir de ~6 meses)', false,
    '[{"n":"Micuna / Cunas Ros","p":"200-400 €","u":"https://www.amazon.es/s?k=cuna+micuna+60x120"},{"n":"Ikea Sundvik","p":"~130 €","u":"https://www.ikea.com/es/es/search/?q=sundvik%20cuna"}]', 9),
  ('dorm', 'Sillón/mecedora de lactancia', false, '[]', 10),
  ('dorm', 'Humidificador', false,
    '[{"n":"Miniland Humidifier","p":"50-70 €","u":"https://www.amazon.es/s?k=miniland+humidificador+bebe"}]', 11);

-- 🍼 Alimentación
insert into items (section_id, name, essential, products, sort) values
  ('alim', 'Biberones anticólico + tetinas 0/1 (si biberón o mixta)', true,
    '[{"n":"MAM Easy Start (set)","p":"25-35 €","u":"https://www.amazon.es/s?k=mam+easy+start+anticolico+set"},{"n":"Philips Avent Natural Response","p":"10-15 €/ud","u":"https://www.amazon.es/s?k=philips+avent+natural+response+biberon"}]', 1),
  ('alim', 'Esterilizador + cepillo de biberones', true,
    '[{"n":"Philips Avent eléctrico","p":"55-70 €","u":"https://www.amazon.es/s?k=philips+avent+esterilizador+electrico"},{"n":"Bolsas microondas Medela","p":"12-16 €","u":"https://www.amazon.es/s?k=medela+bolsas+esterilizacion+microondas"}]', 2),
  ('alim', 'Baberos + muselinas para eructos', true, '[]', 3),
  ('alim', 'Sacaleches', false,
    '[{"n":"Medela Freestyle Hands-free","p":"330-380 €","u":"https://www.amazon.es/s?k=medela+freestyle+hands+free"},{"n":"Medela Swing Maxi (doble)","p":"150-180 €","u":"https://www.amazon.es/s?k=medela+swing+maxi"}]', 4),
  ('alim', 'Calientabiberones', false,
    '[{"n":"Philips Avent","p":"35-50 €","u":"https://www.amazon.es/s?k=philips+avent+calientabiberones"}]', 5),
  ('alim', 'Bolsas de congelación de leche', false,
    '[{"n":"Lansinoh (x50)","p":"10-14 €","u":"https://www.amazon.es/s?k=lansinoh+bolsas+leche+materna"}]', 6);

-- 🛁 Higiene y baño
insert into items (section_id, name, essential, products, sort) values
  ('hig', 'Bañera para bebé', true,
    '[{"n":"Shnuggle (con asiento)","p":"30-45 €","u":"https://www.amazon.es/s?k=shnuggle+ba%C3%B1era+bebe"},{"n":"Stokke Flexi Bath (plegable)","p":"40-55 €","u":"https://www.amazon.es/s?k=stokke+flexi+bath"}]', 1),
  ('hig', '2 toallas con capucha + esponja suave', true, '[]', 2),
  ('hig', 'Gel-champú neutro', true,
    '[{"n":"Mustela gel dermolimpiador","p":"8-12 €","u":"https://www.amazon.es/s?k=mustela+gel+dermolimpiador"},{"n":"Weleda Caléndula","p":"9-13 €","u":"https://www.amazon.es/s?k=weleda+calendula+gel+bebe"}]', 3),
  ('hig', 'Crema para el culito (pasta al agua)', true,
    '[{"n":"Mustela pasta al agua","p":"8-11 €","u":"https://www.amazon.es/s?k=mustela+pasta+al+agua+123"},{"n":"Eryplast Lutsine","p":"7-10 €","u":"https://www.amazon.es/s?k=eryplast+pasta+al+agua"}]', 4),
  ('hig', 'Suero fisiológico monodosis + gasas + algodón', true, '[]', 5),
  ('hig', 'Termómetro corporal', true,
    '[{"n":"Braun ThermoScan 7 (oído)","p":"55-70 €","u":"https://www.amazon.es/s?k=braun+thermoscan+7"},{"n":"Braun No Touch (frente)","p":"45-60 €","u":"https://www.amazon.es/s?k=braun+no+touch+termometro"}]', 6),
  ('hig', 'Aspirador nasal', true,
    '[{"n":"Nosefrida (manual)","p":"12-16 €","u":"https://www.amazon.es/s?k=nosefrida+aspirador+nasal"},{"n":"Nosiboo Pro (eléctrico)","p":"140-160 €","u":"https://www.amazon.es/s?k=nosiboo+pro+aspirador+nasal"}]', 7),
  ('hig', 'Cortaúñas/tijeras punta redonda + cepillo', true,
    '[{"n":"Set Chicco/Suavinex","p":"8-15 €","u":"https://www.amazon.es/s?k=set+higiene+bebe+tijeras+cepillo"}]', 8),
  ('hig', 'Termómetro de baño', true,
    '[{"n":"Chicco patito","p":"8-12 €","u":"https://www.amazon.es/s?k=chicco+termometro+ba%C3%B1o+patito"}]', 9);

-- 🧷 Pañales y ropa
insert into items (section_id, name, essential, products, sort) values
  ('pan', 'Pañales talla 1 (sin acumular)', true,
    '[{"n":"Dodot Sensitive T1","p":"25-35 €/caja","u":"https://www.amazon.es/s?k=dodot+sensitive+talla+1"},{"n":"Bambo Nature T1 (eco)","p":"20-28 €","u":"https://www.amazon.es/s?k=bambo+nature+talla+1"}]', 1),
  ('pan', 'Toallitas / algodón + agua', true,
    '[{"n":"WaterWipes (pack)","p":"18-25 €","u":"https://www.amazon.es/s?k=waterwipes+pack"},{"n":"Dodot Aqua Pure","p":"15-22 €","u":"https://www.amazon.es/s?k=dodot+aqua+pure+toallitas"}]', 2),
  ('pan', '6-8 bodies + 6-8 pijamas (0-1 y 1-3 m)', true,
    '[{"n":"Packs Prénatal/Zara/H&M","p":"12-25 €/pack","u":"https://www.amazon.es/s?k=pack+bodies+bebe+1-3+meses"}]', 3),
  ('pan', 'Calcetines, gorritos, chaqueta/saco de temporada', true, '[]', 4),
  ('pan', 'Cambiador portátil para la bolsa', true,
    '[{"n":"Cambiador plegable","p":"12-20 €","u":"https://www.amazon.es/s?k=cambiador+portatil+bebe"}]', 5);

-- 🚼 Paseo y coche
insert into items (section_id, name, essential, products, sort) values
  ('paseo', 'Silla de coche i-Size (grupo 0+) — imprescindible para el alta', true,
    '[{"n":"Cybex Cloud T i-Size","p":"300-380 € (+base ~200 €)","u":"https://www.amazon.es/s?k=cybex+cloud+t+i-size"},{"n":"Maxi-Cosi Pebble 360","p":"250-330 €","u":"https://www.amazon.es/s?k=maxi+cosi+pebble+360"}]', 1),
  ('paseo', 'Cochecito (capazo + silla)', true,
    '[{"n":"Bugaboo Fox 5 (top todoterreno)","p":"1.100-1.300 €","u":"https://www.amazon.es/s?k=bugaboo+fox+5"},{"n":"Cybex Balios S Lux (calidad-precio)","p":"500-650 €","u":"https://www.amazon.es/s?k=cybex+balios+s+lux"}]', 2),
  ('paseo', 'Bolsa/mochila de pañales con cambiador', true,
    '[{"n":"Skip Hop","p":"70-90 €","u":"https://www.amazon.es/s?k=skip+hop+mochila+pa%C3%B1ales"}]', 3),
  ('paseo', 'Saco de silla/carrito + plástico de lluvia + parasol', true, '[]', 4),
  ('paseo', 'Carrito urbano compacto (2º carrito / viajes)', false,
    '[{"n":"Babyzen Yoyo 3","p":"450-550 €","u":"https://www.amazon.es/s?k=babyzen+yoyo+3"},{"n":"Joolz Aer+","p":"~450 €","u":"https://www.amazon.es/s?k=joolz+aer+plus"}]', 5),
  ('paseo', 'Portabebés', false,
    '[{"n":"Boba Wrap (fular RN)","p":"40-50 €","u":"https://www.amazon.es/s?k=boba+wrap+fular"},{"n":"Ergobaby Omni Breeze (mochila)","p":"180-200 €","u":"https://www.amazon.es/s?k=ergobaby+omni+breeze"}]', 6);

-- 🏠 Estar por casa
insert into items (section_id, name, essential, products, sort) values
  ('casa', 'Hamaca / gandulita', true,
    '[{"n":"BabyBjörn Balance Soft","p":"180-200 €","u":"https://www.amazon.es/s?k=babybjorn+balance+soft+hamaca"},{"n":"Ingenuity (económica)","p":"50-70 €","u":"https://www.amazon.es/s?k=ingenuity+hamaca+bebe"}]', 1),
  ('casa', 'Manta o alfombra para el suelo', true, '[]', 2),
  ('casa', 'Ruido blanco portátil', false,
    '[{"n":"Rockit Zed / Yogasleep Hushh","p":"25-35 €","u":"https://www.amazon.es/s?k=yogasleep+hushh+ruido+blanco"}]', 3),
  ('casa', 'Gimnasio de actividades (desde ~1 mes)', false,
    '[{"n":"Tiny Love Gymini","p":"50-60 €","u":"https://www.amazon.es/s?k=tiny+love+gymini"}]', 4),
  ('casa', 'Doudou / mordedor de apego', false,
    '[{"n":"Sophie la girafe","p":"20-25 €","u":"https://www.amazon.es/s?k=sophie+la+girafe"}]', 5);
