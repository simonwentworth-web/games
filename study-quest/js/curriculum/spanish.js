'use strict';
/* Study Quest data: Spanish (MYP2 — personal info, family, school, food, health, holidays). */
(function (root, factory) {
  const mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  else { root.SQ_DATA = root.SQ_DATA || []; root.SQ_DATA.push(mod); }
})(typeof self !== 'undefined' ? self : this, function () {
  const LINKS = {
    bitesize: { label: 'BBC Bitesize — KS3 Spanish', url: 'https://www.bbc.co.uk/bitesize/subjects/zfckjxs' },
    spanishdict: { label: 'SpanishDict — dictionary & grammar', url: 'https://www.spanishdict.com/' },
    languagesonline: { label: 'Languages Online — Spanish practice', url: 'https://www.languagesonline.org.uk/' },
    oak: { label: 'Oak National Academy — Year 8 Spanish', url: 'https://www.thenational.academy/pupils/years/year-8/subjects' }
  };
  return {
    id: 'spanish', name: 'Spanish', short: 'Spanish', emoji: '🇪🇸',
    tagline: 'Personal information, family, school, food, health, holidays and travel',
    topics: [
      {
        id: 'spa-me', name: 'Todo sobre mí', strand: 'Personal information & family',
        intro: 'Introduce yourself and your family — names, ages, where you live — and dodge the classic ser/tener trap.',
        links: [LINKS.bitesize, LINKS.spanishdict, LINKS.languagesonline],
        cards: [
          { title: 'Introducing yourself', body: '<b>¡Hola! Me llamo Eli.</b> — Hi! My name is Eli. (Literally "I call myself Eli".)<br><b>Tengo doce años.</b> — I am 12 years old.<br><b>Vivo en Bristol.</b> — I live in Bristol.<br><br>Three sentences and you’ve made a Spanish friend.' },
          { title: 'The ser vs tener trap', body: 'Spanish uses <b>tener (to have)</b> for age: <b>Tengo doce años</b> = literally "I have 12 years". Saying "soy doce años" is the classic English-speaker error!<br><br><b>Ser (to be)</b> is for descriptions: <b>soy alto</b> (I’m tall), <b>es divertido</b> (he’s funny).' },
          { title: 'La familia', body: '<b>la madre</b> mother · <b>el padre</b> father · <b>el hermano / la hermana</b> brother / sister · <b>el abuelo / la abuela</b> grandfather / grandmother · <b>el tío / la tía</b> uncle / aunt · <b>el primo / la prima</b> cousin (m/f)<br><br>"My" = <b>mi</b> (mis for plurals): mi hermana, mis abuelos.' },
          { title: 'Numbers & agreement', body: 'Key numbers: <b>doce</b> 12 · <b>trece</b> 13 · <b>catorce</b> 14 · <b>quince</b> 15 · <b>veinte</b> 20 · <b>treinta</b> 30.<br><br>Adjectives agree: <b>mi primo es alto</b> (male cousin, tall) but <b>mi prima es alta</b>. Describing words change their ending to match who they describe.' }
        ],
        questions: [
          { id: 'sm1', type: 'mcq', q: 'What does "Me llamo Eli" mean?', options: ['My name is Eli', 'I love Eli', 'Call me later, Eli', 'Eli is my friend'], answer: 0,
            hint: 'It literally means "I call myself…".', explain: 'Me llamo = my name is (literally "I call myself").' },
          { id: 'sm2', type: 'input', q: 'How do you say "I am 12 years old" in Spanish?', accept: ['tengo doce años', 'tengo 12 años', 'yo tengo doce años', 'yo tengo 12 años'], placeholder: 'Escribe en español…',
            hint: 'Spanish "has" years rather than "being" them — use tener.', explain: 'Tengo doce años — literally "I have 12 years". Never "soy doce años"!' },
          { id: 'sm3', type: 'mcq', q: '"Mi hermana" means…', options: ['my sister', 'my brother', 'my mother', 'my cousin'], answer: 0,
            hint: 'The -a ending is a clue to gender.', explain: 'Hermana = sister; hermano = brother.' },
          { id: 'sm4', type: 'mcq', q: '"El abuelo" is your…', options: ['grandfather', 'grandmother', 'uncle', 'little brother'], answer: 0,
            hint: 'Grandparent — and the "el" tells you which one.', explain: 'El abuelo = grandfather; la abuela = grandmother.' },
          { id: 'sm5', type: 'input', q: 'Write "my mother" in Spanish.', accept: ['mi madre', 'mi mamá', 'mi mama'], placeholder: 'Escribe en español…',
            hint: 'Two words — "my" + "mother".', explain: 'Mi madre (or mi mamá, more informal).' },
          { id: 'sm6', type: 'mcq', q: '"Vivo en Bristol" means…', options: ['I live in Bristol', 'I love Bristol', 'I am visiting Bristol', 'Long live Bristol'], answer: 0,
            hint: 'Vivir = to live.', explain: 'Vivo = I live (from vivir). Vivo en… = I live in…' },
          { id: 'sm7', type: 'mcq', q: 'Which sentence uses the correct verb for age?', options: ['Tengo once años.', 'Soy once años.', 'Estoy once años.', 'Hago once años.'], answer: 0,
            hint: 'Age takes "to have" in Spanish.', explain: 'Tener for age: tengo once años = I’m 11. "Soy once años" is the classic error.' },
          { id: 'sm8', type: 'input', q: 'What number is "quince"?', accept: ['#15', 'fifteen'], placeholder: 'Number',
            hint: 'Between catorce and dieciséis.', explain: 'Quince = 15.' },
          { id: 'sm9', type: 'mcq', q: '"Mi primo es alto" means…', options: ['My (male) cousin is tall', 'My (female) cousin is tall', 'My uncle is old', 'My cousin is nice'], answer: 0,
            hint: 'primo/prima — and alto describes height.', explain: 'Primo = male cousin, alto = tall (masculine). A female cousin would be "mi prima es alta".' },
          { id: 'sm10', type: 'mcq', q: '"Soy" (I am) comes from which verb?', options: ['ser', 'tener', 'ir', 'comer'], answer: 0,
            hint: 'The verb "to be" used for descriptions.', explain: 'Soy is from ser (to be): soy inglés, soy alto, soy divertido.' }
        ]
      },
      {
        id: 'spa-school', name: 'El insti', strand: 'School',
        intro: 'School subjects and strong opinions — because in Spanish you never just "quite like" anything.',
        links: [LINKS.bitesize, LINKS.languagesonline, LINKS.oak],
        cards: [
          { title: 'Las asignaturas', body: '<b>las matemáticas</b> maths · <b>las ciencias</b> science · <b>el inglés</b> English · <b>el español</b> Spanish · <b>la historia</b> history · <b>la geografía</b> geography · <b>el dibujo</b> art · <b>la educación física</b> PE · <b>la informática</b> computing · <b>la música</b> music' },
          { title: 'Opinions — the power scale', body: 'From love to hate:<br><b>me encanta</b> I love it → <b>me gusta</b> I like it → <b>no me gusta</b> I don’t like it → <b>odio</b> I hate it<br><br>Add <b>mucho</b> (a lot) or <b>nada</b> (at all): no me gusta <b>nada</b> = I really don’t like it.' },
          { title: 'Because…', body: 'Opinions need reasons! <b>porque es…</b> (because it is…):<br><b>divertido</b> fun · <b>interesante</b> interesting · <b>fácil</b> easy · <b>difícil</b> difficult · <b>aburrido</b> boring · <b>útil</b> useful<br><br><i>Me gusta la historia porque es interesante.</i>' },
          { title: 'Time at school', body: '<b>¿Qué hora es?</b> — What time is it?<br><b>Son las dos</b> — it’s 2 o’clock. <b>Es la una</b> — it’s 1 o’clock (the only "es").<br><b>el recreo</b> — break time (everyone’s favourite "subject").' }
        ],
        questions: [
          { id: 'ses1', type: 'mcq', q: '"Las matemáticas" is…', options: ['maths', 'music', 'media studies', 'martial arts'], answer: 0,
            hint: 'It looks like its English cousin.', explain: 'Las matemáticas = maths (always plural in Spanish!).' },
          { id: 'ses2', type: 'mcq', q: '"El dibujo" is which subject?', options: ['art', 'drama', 'DT', 'dance'], answer: 0,
            hint: 'Dibujar means "to draw".', explain: 'El dibujo = drawing/art.' },
          { id: 'ses3', type: 'input', q: 'Write "science" in Spanish (with or without "las").', accept: ['las ciencias', 'ciencias', 'la ciencia', 'ciencia'], placeholder: 'Escribe en español…',
            hint: 'It sounds a little like "sciences".', explain: 'Las ciencias — usually plural, like "the sciences".' },
          { id: 'ses4', type: 'mcq', q: '"Me gusta la historia porque es interesante" means…', options: ['I like history because it’s interesting', 'I hate history because it’s hard', 'History is my worst subject', 'I have history on Tuesdays'], answer: 0,
            hint: 'me gusta = I like; porque = because.', explain: 'Me gusta (I like) + la historia + porque es interesante (because it is interesting).' },
          { id: 'ses5', type: 'mcq', q: '"Odio" means…', options: ['I hate', 'I love', 'I study', 'I forget'], answer: 0,
            hint: 'It’s the strongest negative opinion.', explain: 'Odio = I hate. Odio los lunes = I hate Mondays.' },
          { id: 'ses6', type: 'mcq', q: '"Aburrido" means…', options: ['boring', 'exciting', 'easy', 'loud'], answer: 0,
            hint: 'The opposite of divertido.', explain: 'Aburrido = boring. Es aburrido = it’s boring.' },
          { id: 'ses7', type: 'input', q: '"Me encanta el español" means "I ___ Spanish."', accept: ['love', 'i love', 'love it'], placeholder: 'One English word',
            hint: 'Stronger than "like".', explain: 'Me encanta = I love it. Encanta is related to "enchant".' },
          { id: 'ses8', type: 'mcq', q: '"La educación física" is…', options: ['PE', 'physics', 'philosophy', 'food tech'], answer: 0,
            hint: 'Physical education…', explain: 'La educación física (la EF) = PE.' },
          { id: 'ses9', type: 'mcq', q: 'The opposite of "fácil" (easy) is…', options: ['difícil', 'divertido', 'pequeño', 'rápido'], answer: 0,
            hint: 'It looks like "difficult".', explain: 'Fácil = easy; difícil = difficult.' },
          { id: 'ses10', type: 'mcq', q: '"¿Qué hora es?" means…', options: ['What time is it?', 'What is your name?', 'How are you?', 'Where is the clock?'], answer: 0,
            hint: 'Hora is like "hour".', explain: '¿Qué hora es? = What time is it? Son las dos = it’s two o’clock.' }
        ]
      },
      {
        id: 'spa-food', name: '¡Qué rico!', strand: 'Food',
        intro: 'Meals, foods and how to order in a café — plus the mystery of gusta vs gustan, solved.',
        links: [LINKS.bitesize, LINKS.spanishdict, LINKS.languagesonline],
        cards: [
          { title: 'Las comidas (the meals)', body: '<b>el desayuno</b> breakfast · <b>la comida / el almuerzo</b> lunch · <b>la cena</b> dinner · <b>la merienda</b> afternoon snack<br><br>Desayunar, comer, cenar — each meal even gets its own verb.' },
          { title: 'La comida (the food)', body: '<b>el pan</b> bread · <b>la leche</b> milk · <b>el agua</b> water · <b>el pollo</b> chicken · <b>el pescado</b> fish · <b>las verduras</b> vegetables · <b>la fruta</b> fruit · <b>las fresas</b> strawberries · <b>el queso</b> cheese · <b>los huevos</b> eggs' },
          { title: 'Gusta or gustan?', body: 'Me gusta really means "it pleases me" — so the verb matches the FOOD, not you:<br>• One thing: <b>me gusta el queso</b> (cheese pleases me)<br>• Plural things: <b>me gustan las fresas</b> (strawberries please me)<br><br>And for emphasis: <b>no me gusta nada el pescado</b> — I really don’t like fish at all.' },
          { title: 'At the café', body: 'Order like a pro:<br><b>Quisiera una pizza, por favor.</b> — I would like a pizza, please (super polite).<br><b>Para mí, el pollo.</b> — For me, the chicken.<br><b>La cuenta, por favor.</b> — The bill, please.<br><b>¡Qué rico!</b> — How delicious!' }
        ],
        questions: [
          { id: 'sf1', type: 'mcq', q: '"El desayuno" is…', options: ['breakfast', 'dinner', 'dessert', 'a snack'], answer: 0,
            hint: 'The first meal of the day.', explain: 'El desayuno = breakfast (des-ayuno = "un-fasting", just like break-fast!).' },
          { id: 'sf2', type: 'mcq', q: '"La cena" is…', options: ['dinner (the evening meal)', 'breakfast', 'lunch', 'a drink'], answer: 0,
            hint: 'The last meal of the day.', explain: 'La cena = the evening meal.' },
          { id: 'sf3', type: 'input', q: 'Write "water" in Spanish (with or without "el").', accept: ['el agua', 'agua'], placeholder: 'Escribe en español…',
            hint: 'You might know it from "aquarium".', explain: 'El agua = water.' },
          { id: 'sf4', type: 'mcq', q: '"El pollo" is…', options: ['chicken', 'fish', 'pork', 'octopus'], answer: 0,
            hint: 'It clucks.', explain: 'El pollo = chicken. (El pescado = fish.)' },
          { id: 'sf5', type: 'mcq', q: '"Las verduras" are…', options: ['vegetables', 'sweets', 'sausages', 'green shoes'], answer: 0,
            hint: 'Verde means green…', explain: 'Las verduras = vegetables (from verde, green).' },
          { id: 'sf6', type: 'mcq', q: 'Why is it "me gustAN las fresas" and not "me gusta"?', options: ['because "las fresas" is plural — the verb matches the food', 'because strawberries are red', 'because it sounds nicer', 'it’s a mistake — gusta is correct'], answer: 0,
            hint: 'Gustar literally means "to please".', explain: 'Me gustan = "they please me". Plural food → gustan; singular food → gusta.' },
          { id: 'sf7', type: 'mcq', q: 'The politest way to order a pizza is…', options: ['Quisiera una pizza, por favor.', '¡Pizza! ¡Ahora!', 'Dame pizza.', 'Yo pizza.'], answer: 0,
            hint: 'Quisiera = "I would like…".', explain: 'Quisiera + por favor is the gold standard of polite ordering.' },
          { id: 'sf8', type: 'mcq', q: '"La cuenta, por favor" means…', options: ['The bill, please', 'The menu, please', 'More bread, please', 'A table, please'], answer: 0,
            hint: 'You say it at the END of the meal.', explain: 'La cuenta = the bill. Essential holiday Spanish!' },
          { id: 'sf9', type: 'input', q: 'What does "la leche" mean?', accept: ['milk', 'the milk'], placeholder: 'In English',
            hint: 'It goes on cereal.', explain: 'La leche = milk.' },
          { id: 'sf10', type: 'mcq', q: '"No me gusta nada el pescado" means…', options: ['I really don’t like fish at all', 'I quite like fish', 'There is no fish left', 'Fish doesn’t like me'], answer: 0,
            hint: '"Nada" turbo-charges the negative.', explain: 'No me gusta nada = I don’t like it AT ALL.' }
        ]
      },
      {
        id: 'spa-health', name: 'Me duele…', strand: 'Health & the body',
        intro: 'Body parts, aches and pains, and the healthy habits vocabulary — el médico will be impressed.',
        links: [LINKS.bitesize, LINKS.spanishdict, LINKS.oak],
        cards: [
          { title: 'El cuerpo (the body)', body: '<b>la cabeza</b> head · <b>el estómago</b> stomach · <b>la garganta</b> throat · <b>la pierna</b> leg · <b>el brazo</b> arm · <b>la mano</b> hand · <b>el pie</b> foot · <b>la espalda</b> back · <b>los dientes</b> teeth' },
          { title: 'Saying what hurts', body: 'Like gustar, <b>doler</b> (to hurt) matches the body part:<br>• <b>Me duele la cabeza.</b> — My head hurts (one thing: duele).<br>• <b>Me duelen los pies.</b> — My feet hurt (plural: duelen).<br><br><b>Estoy enfermo/enferma.</b> — I’m ill.' },
          { title: 'Healthy habits', body: '<b>Como sano.</b> — I eat healthily.<br><b>Bebo mucha agua.</b> — I drink lots of water.<br><b>Hago ejercicio todos los días.</b> — I do exercise every day.<br><b>Duermo ocho horas.</b> — I sleep eight hours.<br><br>Hago deporte = I do sport. (Hacer = to do/make.)' },
          { title: 'At the doctor’s', body: '<b>¿Qué te pasa?</b> — What’s wrong?<br><b>Tengo fiebre.</b> — I have a fever.<br><b>¡Descansa!</b> — Rest!<br><b>Bebe mucha agua.</b> — Drink lots of water.<br><br>Commands like descansa and bebe are the doctor’s advice forms.' }
        ],
        questions: [
          { id: 'sph1', type: 'mcq', q: '"La cabeza" is…', options: ['the head', 'the arm', 'the knee', 'the hair'], answer: 0,
            hint: 'It’s what aches after too much homework.', explain: 'La cabeza = head. Me duele la cabeza = I have a headache.' },
          { id: 'sph2', type: 'mcq', q: '"Me duele el estómago" means…', options: ['My stomach hurts', 'I am hungry', 'I love my stomach', 'My arm hurts'], answer: 0,
            hint: 'Doler = to hurt.', explain: 'Me duele + body part = my ___ hurts.' },
          { id: 'sph3', type: 'input', q: 'Write "leg" in Spanish (with or without "la").', accept: ['la pierna', 'pierna'], placeholder: 'Escribe en español…',
            hint: 'It starts with "pier-".', explain: 'La pierna = leg.' },
          { id: 'sph4', type: 'mcq', q: '"La garganta" is…', options: ['the throat', 'the garage', 'the ear', 'the chin'], answer: 0,
            hint: 'It’s sore when you lose your voice.', explain: 'La garganta = throat. Me duele la garganta = I have a sore throat.' },
          { id: 'sph5', type: 'mcq', q: '"Estoy enfermo" means…', options: ['I am ill', 'I am tired', 'I am angry', 'I am a nurse'], answer: 0,
            hint: 'You’d say it to skip PE.', explain: 'Estoy enfermo (boys) / enferma (girls) = I’m ill.' },
          { id: 'sph6', type: 'mcq', q: 'Why is it "me duelEN los pies"?', options: ['feet are plural, so the verb is plural', 'feet are far from the head', 'duelen is just more polite', 'it rhymes'], answer: 0,
            hint: 'Same pattern as gusta/gustan.', explain: 'Doler matches the body part: one thing duele, plural things duelen.' },
          { id: 'sph7', type: 'mcq', q: '"Bebo mucha agua" means…', options: ['I drink lots of water', 'I need a bath', 'I love swimming', 'I spilled the water'], answer: 0,
            hint: 'Beber = to drink.', explain: 'Bebo = I drink. A classic healthy-living sentence.' },
          { id: 'sph8', type: 'mcq', q: '"Hago ejercicio todos los días" means…', options: ['I exercise every day', 'I do my homework daily', 'I eat eggs every day', 'I never exercise'], answer: 0,
            hint: 'Hacer = to do; todos los días = every day.', explain: 'Hago ejercicio = I do exercise; todos los días = every day.' },
          { id: 'sph9', type: 'input', q: 'What does "el brazo" mean?', accept: ['arm', 'the arm'], placeholder: 'In English',
            hint: 'You throw a ball with it.', explain: 'El brazo = arm.' },
          { id: 'sph10', type: 'mcq', q: 'The doctor says "¡Descansa!" — what’s the advice?', options: ['Rest!', 'Run!', 'Dance!', 'Pay the bill!'], answer: 0,
            hint: 'From descansar — think of what you do on a "descanso" (break).', explain: 'Descansa = rest! (A command from descansar, to rest.)' }
        ]
      },
      {
        id: 'spa-travel', name: '¡Buen viaje!', strand: 'Holidays & travel',
        intro: 'Countries, transport, weather and holiday activities — plus a first taste of the past tense.',
        links: [LINKS.bitesize, LINKS.languagesonline, LINKS.oak],
        cards: [
          { title: 'Going places', body: '<b>Voy a España.</b> — I’m going to Spain. (Ir = to go.)<br><br>Countries: <b>Inglaterra</b> England · <b>Francia</b> France · <b>Escocia</b> Scotland · <b>Estados Unidos</b> USA · <b>Gales</b> Wales' },
          { title: 'El transporte', body: 'How you travel takes <b>en</b>:<br><b>en avión</b> by plane · <b>en tren</b> by train · <b>en coche</b> by car · <b>en barco</b> by boat · <b>en autobús</b> by bus<br><br>…except on foot: <b>a pie</b>.' },
          { title: '¿Qué tiempo hace? (weather)', body: '<b>Hace sol</b> — it’s sunny · <b>Hace calor</b> — it’s hot · <b>Hace frío</b> — it’s cold · <b>Llueve</b> — it’s raining · <b>Nieva</b> — it’s snowing<br><br>Seasons: <b>el verano</b> summer · <b>el invierno</b> winter · <b>la primavera</b> spring · <b>el otoño</b> autumn' },
          { title: 'Holiday activities — now and then', body: 'Present: <b>Tomo el sol</b> (I sunbathe) · <b>Nado en el mar</b> (I swim in the sea) · <b>Visito monumentos</b> (I visit the sights).<br><br>Past (the preterite — a sneak preview): <b>Fui a Francia</b> = I WENT to France. Fui is the past of ir — one little word that unlocks talking about last summer.' }
        ],
        questions: [
          { id: 'st1', type: 'mcq', q: '"Voy a España" means…', options: ['I’m going to Spain', 'I went to Spain', 'I live in Spain', 'Spain is great'], answer: 0,
            hint: 'Voy = I go (present).', explain: 'Voy (from ir, to go) + a España = I’m going to Spain.' },
          { id: 'st2', type: 'mcq', q: '"En avión" means travelling by…', options: ['plane', 'bird', 'boat', 'bike'], answer: 0,
            hint: 'The fastest way to Spain.', explain: 'El avión = plane; en avión = by plane.' },
          { id: 'st3', type: 'input', q: 'Write "by train" in Spanish.', accept: ['en tren', 'por tren', 'tren'], placeholder: 'Escribe en español…',
            hint: 'Transport takes "en" + the vehicle.', explain: 'En tren = by train.' },
          { id: 'st4', type: 'mcq', q: '"Hace sol" means…', options: ['it’s sunny', 'it’s snowing', 'it’s late', 'it’s salty'], answer: 0,
            hint: 'El sol = the sun.', explain: 'Hace sol = it’s sunny (literally "it makes sun").' },
          { id: 'st5', type: 'mcq', q: '"Llueve" means…', options: ['it’s raining', 'it’s sunny', 'it’s windy', 'it’s foggy'], answer: 0,
            hint: 'The double-l word — bring an umbrella.', explain: 'Llueve = it’s raining (from llover, to rain).' },
          { id: 'st6', type: 'mcq', q: '"Fui a Francia" means…', options: ['I went to France', 'I am going to France', 'I will go to France', 'I am French'], answer: 0,
            hint: 'Fui is the PAST tense of ir.', explain: 'Fui = I went — the preterite of ir. Past, not future!' },
          { id: 'st7', type: 'mcq', q: '"Tomo el sol en la playa" means…', options: ['I sunbathe on the beach', 'I drink juice on the beach', 'I take photos of the sun', 'I play volleyball'], answer: 0,
            hint: 'Tomar el sol = literally "to take the sun".', explain: 'Tomo el sol = I sunbathe; la playa = the beach.' },
          { id: 'st8', type: 'input', q: 'What country is "Inglaterra"?', accept: ['england', 'inglaterra is england'], placeholder: 'In English',
            hint: '"Ingla-terra" = land of the…', explain: 'Inglaterra = England (literally "Angle-land" — same as the English word!).' },
          { id: 'st9', type: 'mcq', q: '"Visito monumentos" means…', options: ['I visit the sights/monuments', 'I climb mountains', 'I watch films', 'I buy souvenirs'], answer: 0,
            hint: 'Visitar = to visit.', explain: 'Visito monumentos = I visit monuments/sights — classic tourist Spanish.' },
          { id: 'st10', type: 'mcq', q: '"El verano" is…', options: ['summer', 'winter', 'spring', 'autumn'], answer: 0,
            hint: 'The holiday season.', explain: 'El verano = summer; el invierno = winter.' }
        ]
      }
    ]
  };
});
