'use strict';
/* Study Quest data: Science (MYP2 / KS3 Year 8). */
(function (root, factory) {
  const mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  else { root.SQ_DATA = root.SQ_DATA || []; root.SQ_DATA.push(mod); }
})(typeof self !== 'undefined' ? self : this, function () {
  const LINKS = {
    bitesize: { label: 'BBC Bitesize — KS3 Science', url: 'https://www.bbc.co.uk/bitesize/subjects/zng4d2p' },
    khanBio: { label: 'Khan Academy — middle school biology', url: 'https://www.khanacademy.org/science/ms-biology' },
    khanPhys: { label: 'Khan Academy — middle school physics', url: 'https://www.khanacademy.org/science/ms-physics' },
    rsc: { label: 'Royal Society of Chemistry — interactive periodic table', url: 'https://www.rsc.org/periodic-table' },
    nasa: { label: 'NASA Space Place', url: 'https://spaceplace.nasa.gov/' },
    nasaSolar: { label: 'NASA — our solar system', url: 'https://science.nasa.gov/solar-system/' },
    oak: { label: 'Oak National Academy — Year 8 science', url: 'https://www.thenational.academy/pupils/years/year-8/subjects' }
  };
  return {
    id: 'science', name: 'Science', short: 'Science', emoji: '🔬',
    tagline: 'Ecology and evolution, waves and sound, human health, the periodic table, space and electricity',
    topics: [
      {
        id: 'sci-ecology', name: 'Ecology & evolution', strand: 'Biology',
        intro: 'Food webs, adaptation and Darwin’s big idea: how living things depend on each other and change over time.',
        links: [LINKS.bitesize, LINKS.khanBio, LINKS.oak],
        cards: [
          { title: 'Food chains and webs', body: 'Every food chain starts with a <b>producer</b> — a green plant making its own food by photosynthesis. Animals that eat are <b>consumers</b>: herbivores eat plants, carnivores eat animals, omnivores eat both.<br><br>The arrows show <b>which way the energy flows</b>: grass → rabbit → fox means the rabbit eats the grass and the fox eats the rabbit. A food <b>web</b> is lots of chains tangled together.' },
          { title: 'Interdependence', body: 'Living things in an ecosystem depend on each other — that’s <b>interdependence</b>. Remove one species and the effects ripple: if rabbits vanished, foxes would go hungry (numbers fall) and the grass would grow wild.<br><br><b>Decomposers</b> (bacteria and fungi) break down dead material and recycle nutrients back into the soil.' },
          { title: 'Adaptation', body: 'An <b>adaptation</b> is a feature that helps an organism survive in its habitat. A camel’s hump stores <b>fat</b> (not water!) for energy; a polar bear’s thick blubber and white fur suit the Arctic; a cactus has spines and a waxy coat to save water.' },
          { title: 'Variation and natural selection', body: 'Individuals in a species vary — some variation is <b>inherited</b> (eye colour), some environmental (scars), some both (height).<br><br><b>Charles Darwin’s</b> theory of <b>natural selection</b>: the best-adapted individuals are more likely to <b>survive, reproduce, and pass on their genes</b>. Over many generations, species change — that’s evolution.' }
        ],
        questions: [
          { id: 'se1', type: 'mcq', q: 'Every food chain starts with…', options: ['a producer (green plant)', 'a predator', 'a herbivore', 'a decomposer'], answer: 0,
            hint: 'What can make its own food using sunlight?', explain: 'Producers make food by photosynthesis — all the energy in the chain starts with them.' },
          { id: 'se2', type: 'mcq', q: 'In a food chain, the arrows show…', options: ['the direction energy flows', 'which animal is bigger', 'which animal is faster', 'where each animal lives'], answer: 0,
            hint: 'grass → rabbit: what is being passed along?', explain: 'The arrow points from the eaten to the eater — the direction the energy travels.' },
          { id: 'se3', type: 'mcq', q: 'An animal that eats only plants is a…', options: ['herbivore', 'carnivore', 'omnivore', 'producer'], answer: 0,
            hint: '"Herb" is a clue.', explain: 'Herbivores eat plants; carnivores eat animals; omnivores eat both.' },
          { id: 'se4', type: 'mcq', q: 'In the chain grass → rabbit → fox, the fox is…', options: ['a predator', 'a producer', 'prey', 'a decomposer'], answer: 0,
            hint: 'Who hunts whom?', explain: 'The fox hunts the rabbit, so the fox is the predator and the rabbit is its prey.' },
          { id: 'se5', type: 'mcq', q: 'A camel’s hump stores…', options: ['fat', 'water', 'bone', 'air'], answer: 0,
            hint: 'It’s a common myth that it’s water.', explain: 'The hump stores fat — an energy supply for crossing the desert.' },
          { id: 'se6', type: 'mcq', q: 'Who developed the theory of evolution by natural selection?', options: ['Charles Darwin', 'Isaac Newton', 'Marie Curie', 'Albert Einstein'], answer: 0,
            hint: 'He sailed on HMS Beagle and studied finches.', explain: 'Darwin published On the Origin of Species in 1859 after studying wildlife, famously on the Galápagos Islands.' },
          { id: 'se7', type: 'mcq', q: 'In natural selection, which individuals are most likely to pass on their genes?', options: ['the best adapted to their environment', 'the biggest', 'the oldest', 'the rarest'], answer: 0,
            hint: '"Survival of the fittest" means best-fitted, not strongest.', explain: 'Those best suited to their environment survive longer and reproduce more, passing those helpful features on.' },
          { id: 'se8', type: 'mcq', q: 'Which is an example of inherited variation?', options: ['eye colour', 'a scar', 'a pierced ear', 'knowing Spanish'], answer: 0,
            hint: 'Which one is written in your genes?', explain: 'Eye colour comes from genes passed on by parents; the others come from your environment and experience.' },
          { id: 'se9', type: 'mcq', q: 'If all the rabbits in an area disappeared, the foxes would most likely…', options: ['decrease, because a food source is gone', 'increase', 'stay exactly the same', 'become herbivores'], answer: 0,
            hint: 'What do the foxes eat?', explain: 'Less prey means less food — fox numbers would fall or foxes would move away. That’s interdependence.' },
          { id: 'se10', type: 'mcq', q: 'Organisms that break down dead plants and animals are called…', options: ['decomposers', 'producers', 'predators', 'prey'], answer: 0,
            hint: 'Bacteria and fungi do this job.', explain: 'Decomposers recycle nutrients from dead material back into the ecosystem.' }
        ]
      },
      {
        id: 'sci-waves', name: 'Waves & sound', strand: 'Physics',
        intro: 'Why a guitar string’s wobble reaches your ear, what makes sounds loud or squeaky, and why space is silent.',
        links: [LINKS.bitesize, LINKS.khanPhys, LINKS.oak],
        cards: [
          { title: 'Sound is a vibration', body: 'Sound is made by <b>vibrating objects</b>, which make the air particles vibrate in a chain reaction. Sound is a <b>longitudinal wave</b> — the particles vibrate back and forth along the direction the sound travels.<br><br>No particles, no sound: sound <b>cannot travel through a vacuum</b>, which is why space is silent.' },
          { title: 'Loudness and pitch', body: 'Two numbers describe a sound wave:<br>• <b>Amplitude</b> = the size of the vibration → bigger amplitude = <b>louder</b>.<br>• <b>Frequency</b> = vibrations per second, measured in <b>hertz (Hz)</b> → higher frequency = <b>higher pitch</b> (squeakier).' },
          { title: 'How fast, how far', body: 'Sound travels at about <b>340 m/s in air</b> — fast, but light is roughly a million times faster, which is why you see lightning before you hear thunder.<br><br>Sound travels <b>fastest through solids</b> (particles packed close), slower through liquids, slowest through gases. An <b>echo</b> is sound reflecting off a hard surface.' },
          { title: 'Hearing it', body: 'Sound funnels into your ear and makes the <b>eardrum</b> vibrate first; tiny bones pass the vibration to the cochlea, which turns it into nerve signals.<br><br>Humans hear roughly <b>20 Hz to 20,000 Hz</b>. Above that is <b>ultrasound</b> — used by bats, dolphins and hospital scanners.' }
        ],
        questions: [
          { id: 'sw1', type: 'mcq', q: 'Sound is which type of wave?', options: ['longitudinal', 'transverse', 'electromagnetic', 'tidal'], answer: 0,
            hint: 'The particles vibrate along the direction of travel.', explain: 'Sound is longitudinal: particles squash together and spread out along the wave’s direction.' },
          { id: 'sw2', type: 'mcq', q: 'Sound cannot travel through…', options: ['a vacuum', 'water', 'steel', 'air'], answer: 0,
            hint: 'Sound needs particles to pass the vibration along.', explain: 'A vacuum (like space) has no particles to vibrate — so no sound.' },
          { id: 'sw3', type: 'mcq', q: 'The loudness of a sound depends on its…', options: ['amplitude', 'frequency', 'speed', 'colour'], answer: 0,
            hint: 'How BIG is the vibration?', explain: 'Bigger amplitude = bigger vibration = louder sound.' },
          { id: 'sw4', type: 'mcq', q: 'The pitch of a sound depends on its…', options: ['frequency', 'amplitude', 'echo', 'volume'], answer: 0,
            hint: 'How MANY vibrations per second?', explain: 'More vibrations per second (higher frequency) = higher pitch.' },
          { id: 'sw5', type: 'mcq', q: 'Frequency is measured in…', options: ['hertz (Hz)', 'decibels', 'metres', 'newtons'], answer: 0,
            hint: 'Named after a German physicist.', explain: 'Hertz = vibrations per second. (Decibels measure loudness.)' },
          { id: 'sw6', type: 'mcq', q: 'The typical human hearing range is…', options: ['20 Hz to 20,000 Hz', '1 Hz to 100 Hz', '20,000 Hz to 40,000 Hz', '0 Hz to 1,000,000 Hz'], answer: 0,
            hint: '20 appears twice in the answer.', explain: '20 Hz (deep rumble) up to about 20,000 Hz (and the top end shrinks as people get older).' },
          { id: 'sw7', type: 'mcq', q: 'Sound too high-pitched for humans to hear is called…', options: ['ultrasound', 'infrasound', 'supersound', 'megasound'], answer: 0,
            hint: 'Hospitals use it to scan babies.', explain: 'Ultrasound is above 20,000 Hz — bats and dolphins use it to navigate.' },
          { id: 'sw8', type: 'mcq', q: 'Roughly how fast does sound travel in air?', options: ['340 m/s', '3 m/s', '300,000 km/s', '34 m/s'], answer: 0,
            hint: 'It covers a football pitch in about a third of a second.', explain: 'About 340 metres per second. (300,000 km/s is the speed of light.)' },
          { id: 'sw9', type: 'mcq', q: 'An echo is…', options: ['sound reflecting off a surface', 'sound speeding up', 'sound changing pitch', 'light bouncing'], answer: 0,
            hint: 'Shout at a cliff…', explain: 'Hard surfaces reflect sound waves back to you — that reflection is the echo.' },
          { id: 'sw10', type: 'mcq', q: 'Sound travels fastest through…', options: ['solids', 'gases', 'a vacuum', 'liquids'], answer: 0,
            hint: 'Where are the particles packed most tightly?', explain: 'In solids the particles are closest together, so vibrations pass along quickest.' }
        ]
      },
      {
        id: 'sci-health', name: 'Human health', strand: 'Biology',
        intro: 'Balanced diets, what smoking and alcohol really do, and how your immune system fights invaders.',
        links: [LINKS.bitesize, LINKS.khanBio, LINKS.oak],
        cards: [
          { title: 'A balanced diet', body: 'Your body needs seven nutrient groups: <b>carbohydrates</b> (energy), <b>protein</b> (growth and repair), <b>fats</b> (energy store and insulation), <b>vitamins</b> and <b>minerals</b> (tiny amounts, vital jobs), <b>fibre</b> (keeps digestion moving) and <b>water</b>.<br><br>Balance means the right amounts of each — plus energy in (food) roughly matching energy out (activity).' },
          { title: 'Smoking and alcohol', body: 'Cigarette smoke carries <b>nicotine</b> (the addictive drug), <b>tar</b> (coats and damages the lungs, causes cancer) and <b>carbon monoxide</b> (hijacks red blood cells so less oxygen gets around).<br><br>Long-term alcohol misuse mainly damages the <b>liver</b> (and the brain). Both are drugs: substances that change how the body works.' },
          { title: 'Pathogens', body: 'Microorganisms that cause disease are called <b>pathogens</b> — mainly bacteria and viruses (plus some fungi and parasites). They spread by air, touch, water, food and animals.<br><br>Your skin, stomach acid and sticky mucus are the first line of defence keeping them out.' },
          { title: 'The immune system and vaccines', body: 'If pathogens get in, <b>white blood cells</b> attack: some engulf invaders, others make <b>antibodies</b> targeted at them.<br><br>A <b>vaccine</b> contains a dead or weakened version of a pathogen. Your immune system learns to recognise it, so if the real thing arrives, it’s destroyed before you get ill.' }
        ],
        questions: [
          { id: 'sh1', type: 'mcq', q: 'Which nutrient group is the body’s main quick energy source?', options: ['carbohydrates', 'protein', 'vitamins', 'fibre'], answer: 0,
            hint: 'Bread, pasta, rice…', explain: 'Carbohydrates break down into glucose — the body’s go-to fuel.' },
          { id: 'sh2', type: 'mcq', q: 'Protein is mainly needed for…', options: ['growth and repair', 'quick energy', 'keeping warm', 'better eyesight'], answer: 0,
            hint: 'Muscles are made of it.', explain: 'Protein builds and repairs cells — muscles, skin, enzymes and more.' },
          { id: 'sh3', type: 'mcq', q: 'Fibre is important because it…', options: ['keeps food moving through the gut', 'builds muscle', 'carries oxygen', 'makes bones strong'], answer: 0,
            hint: 'Think digestion.', explain: 'Fibre isn’t absorbed — it keeps the digestive system moving and healthy.' },
          { id: 'sh4', type: 'mcq', q: 'The addictive substance in cigarettes is…', options: ['nicotine', 'tar', 'carbon monoxide', 'caffeine'], answer: 0,
            hint: 'It’s the one in "nicotine patches".', explain: 'Nicotine causes the addiction; tar and carbon monoxide cause much of the damage.' },
          { id: 'sh5', type: 'mcq', q: 'Which substance in cigarette smoke coats and damages the lungs?', options: ['tar', 'nicotine', 'oxygen', 'water vapour'], answer: 0,
            hint: 'The same word as the black sticky stuff on roads.', explain: 'Tar builds up in the lungs, damages the cilia and can cause cancer.' },
          { id: 'sh6', type: 'mcq', q: 'Long-term alcohol misuse mainly damages the…', options: ['liver', 'ears', 'kneecaps', 'hair'], answer: 0,
            hint: 'It’s the organ that breaks alcohol down.', explain: 'The liver processes alcohol, and years of overload scar it (cirrhosis). The brain suffers too.' },
          { id: 'sh7', type: 'mcq', q: 'Microorganisms that cause disease are called…', options: ['pathogens', 'antibodies', 'nutrients', 'enzymes'], answer: 0,
            hint: 'Bacteria and viruses that make you ill share this name.', explain: 'Pathogen = any microorganism that causes disease.' },
          { id: 'sh8', type: 'mcq', q: 'Which cells fight infection inside your body?', options: ['white blood cells', 'red blood cells', 'skin cells', 'nerve cells'], answer: 0,
            hint: 'Red ones carry oxygen; these do battle.', explain: 'White blood cells engulf pathogens and produce antibodies against them.' },
          { id: 'sh9', type: 'mcq', q: 'A vaccine works by…', options: ['training your immune system with a weakened or dead pathogen', 'killing all bacteria in the body', 'replacing white blood cells', 'blocking food poisoning only'], answer: 0,
            hint: 'It’s a practice run for your immune system.', explain: 'After the practice run, your white blood cells recognise the real pathogen and destroy it fast.' },
          { id: 'sh10', type: 'mcq', q: 'Carbon monoxide in cigarette smoke is harmful because it…', options: ['stops red blood cells carrying as much oxygen', 'makes bones brittle', 'causes tooth decay', 'turns skin blue permanently'], answer: 0,
            hint: 'It competes with oxygen for a ride.', explain: 'Carbon monoxide binds to red blood cells in place of oxygen, so the body is starved of it.' }
        ]
      },
      {
        id: 'sci-periodic', name: 'The periodic table', strand: 'Chemistry',
        intro: 'The ultimate chemistry cheat sheet: 118 elements, organised so their patterns jump out.',
        links: [LINKS.bitesize, LINKS.rsc, LINKS.oak],
        cards: [
          { title: 'Elements, compounds, mixtures', body: 'An <b>element</b> is a substance made of only one kind of atom — the periodic table lists them all (118 so far).<br><br>A <b>compound</b> is two or more elements chemically bonded (water, H₂O). A <b>mixture</b> is substances jumbled together but not bonded (air) — mixtures can be separated easily, compounds can’t.' },
          { title: 'How the table is organised', body: 'Credit to <b>Dmitri Mendeleev</b> (1869), who spotted the pattern — and even left gaps for elements nobody had discovered yet.<br><br>Columns are <b>groups</b>: elements in a group behave similarly. Rows are <b>periods</b>. Metals sit on the <b>left and middle</b>; non-metals on the right.' },
          { title: 'Symbols', body: 'Every element has a 1–2 letter symbol: O oxygen, Na <b>sodium</b>, Fe iron, <b>Au gold</b>, Pb lead. The odd-looking ones come from Latin names (Au = aurum, gold).<br><br>First letter capital, second lowercase — always. Co is cobalt; CO is a compound (carbon monoxide)!' },
          { title: 'Famous groups', body: '<b>Group 1 — alkali metals</b> (lithium, sodium, potassium): soft metals that react violently with water, getting <b>more reactive as you go down</b> the group.<br><br><b>Group 0 — noble gases</b> (helium, neon, argon): totally <b>unreactive</b> loners, which is why helium is safe in balloons.' }
        ],
        questions: [
          { id: 'sp1', type: 'mcq', q: 'The periodic table is a list of all known…', options: ['elements', 'compounds', 'mixtures', 'molecules'], answer: 0,
            hint: 'Substances made of one kind of atom.', explain: 'Each square is one element — one kind of atom.' },
          { id: 'sp2', type: 'mcq', q: 'Who created the early periodic table in 1869?', options: ['Dmitri Mendeleev', 'Isaac Newton', 'Charles Darwin', 'Rosalind Franklin'], answer: 0,
            hint: 'A Russian chemist who left gaps for undiscovered elements.', explain: 'Mendeleev arranged the elements by their properties and famously predicted elements not yet found.' },
          { id: 'sp3', type: 'mcq', q: 'The vertical columns of the periodic table are called…', options: ['groups', 'periods', 'rows', 'families of rows'], answer: 0,
            hint: 'Elements in the same column behave similarly.', explain: 'Columns are groups; elements in a group share similar properties.' },
          { id: 'sp4', type: 'mcq', q: 'The horizontal rows are called…', options: ['periods', 'groups', 'columns', 'shells'], answer: 0,
            hint: 'The table is named after them: the PERIODic table.', explain: 'Rows are periods — that’s where the table gets its name.' },
          { id: 'sp5', type: 'mcq', q: 'What is the chemical symbol for sodium?', options: ['Na', 'So', 'S', 'Sn'], answer: 0,
            hint: 'It comes from the Latin "natrium".', explain: 'Sodium is Na (from natrium). S is sulfur and Sn is tin.' },
          { id: 'sp6', type: 'mcq', q: 'The symbol Au stands for…', options: ['gold', 'silver', 'aluminium', 'argon'], answer: 0,
            hint: 'From the Latin "aurum".', explain: 'Au = gold. Silver is Ag, aluminium is Al, argon is Ar.' },
          { id: 'sp7', type: 'mcq', q: 'Going down Group 1 (the alkali metals), the elements get…', options: ['more reactive', 'less reactive', 'heavier but identical', 'non-metallic'], answer: 0,
            hint: 'Potassium’s reaction with water is wilder than lithium’s.', explain: 'Reactivity increases down Group 1 — lithium fizzes, potassium bursts into lilac flame.' },
          { id: 'sp8', type: 'mcq', q: 'The Group 0 noble gases are famous for being…', options: ['unreactive', 'explosive', 'magnetic', 'radioactive'], answer: 0,
            hint: 'Why is helium safe in party balloons?', explain: 'Noble gases have full outer electron shells, so they barely react with anything.' },
          { id: 'sp9', type: 'mcq', q: 'Water (H₂O) is an example of…', options: ['a compound', 'an element', 'a mixture', 'an atom'], answer: 0,
            hint: 'Hydrogen and oxygen chemically bonded together.', explain: 'Two elements bonded chemically make a compound — you can’t separate water by sieving or filtering!' },
          { id: 'sp10', type: 'mcq', q: 'Air is an example of…', options: ['a mixture', 'a compound', 'an element', 'a pure substance'], answer: 0,
            hint: 'Nitrogen, oxygen, argon and CO₂ all jumbled, not bonded.', explain: 'Air’s gases aren’t chemically bonded, so it’s a mixture and can be separated.' }
        ]
      },
      {
        id: 'sci-space', name: 'Space', strand: 'Physics',
        intro: 'Why we have days, years and seasons, how far a light year really is, and your weight on the Moon.',
        links: [LINKS.nasaSolar, LINKS.nasa, LINKS.bitesize],
        cards: [
          { title: 'Our solar system', body: 'The <b>Sun is a star</b> — a gigantic ball of burning gas — orbited by <b>8 planets</b>: Mercury, Venus, Earth, Mars (rocky), then Jupiter, Saturn, Uranus, Neptune (gas and ice giants).<br><br>Memory trick: <i>My Very Easy Method Just Speeds Up Naming</i>.' },
          { title: 'Days, years and seasons', body: '<b>A day</b> = Earth spinning once on its axis (24 hours) — the side facing the Sun has daytime.<br><b>A year</b> = Earth orbiting the Sun once (365¼ days).<br><b>Seasons</b> come from Earth’s <b>tilted axis</b> (about 23.5°): when your hemisphere leans towards the Sun it’s summer — nothing to do with being closer to the Sun!' },
          { title: 'The Moon', body: 'The Moon orbits Earth in about a month, and its <b>phases</b> (new moon → crescent → full moon → back) repeat every <b>29.5 days</b>. We only ever see the half lit by the Sun — the phase depends on the angle.<br><br>The Moon’s gravity is about <b>1/6 of Earth’s</b>.' },
          { title: 'Mass, weight and light years', body: '<b>Mass</b> (kg) is how much stuff you’re made of — the same everywhere. <b>Weight</b> (newtons) is the pull of gravity on that mass — so on the Moon your mass is unchanged but your weight is about 1/6.<br><br>A <b>light year</b> is a unit of <b>distance</b>: how far light travels in a year (about 9.5 trillion km).' }
        ],
        questions: [
          { id: 'ss1', type: 'mcq', q: 'The Sun is…', options: ['a star', 'a planet', 'a moon', 'a comet'], answer: 0,
            hint: 'It makes its own light.', explain: 'The Sun is our nearest star — a giant ball of hot gas producing its own light and heat.' },
          { id: 'ss2', type: 'mcq', q: 'How many planets are in our solar system?', options: ['8', '9', '7', '12'], answer: 0,
            hint: 'Pluto was reclassified in 2006.', explain: 'Eight planets — Pluto is now classed as a dwarf planet.' },
          { id: 'ss3', type: 'mcq', q: 'Which planet is closest to the Sun?', options: ['Mercury', 'Venus', 'Mars', 'Earth'], answer: 0,
            hint: '"My Very Easy Method…" — the first word.', explain: 'Order from the Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.' },
          { id: 'ss4', type: 'mcq', q: 'Day and night happen because…', options: ['Earth spins on its axis', 'the Sun orbits Earth', 'the Moon blocks the Sun', 'Earth’s orbit is oval'], answer: 0,
            hint: 'One full spin takes 24 hours.', explain: 'As Earth rotates, your part of the world turns to face the Sun (day) and away (night).' },
          { id: 'ss5', type: 'mcq', q: 'A year is the time it takes for…', options: ['Earth to orbit the Sun', 'Earth to spin once', 'the Moon to orbit Earth', 'the Sun to spin once'], answer: 0,
            hint: 'It takes 365 and a quarter days.', explain: 'One full orbit of the Sun = one year (the quarter days add up to a leap day every 4 years).' },
          { id: 'ss6', type: 'mcq', q: 'We get seasons because…', options: ['Earth’s axis is tilted', 'Earth gets closer to the Sun in summer', 'the Sun cools down in winter', 'the Moon shades the Earth'], answer: 0,
            hint: 'The axis leans at about 23.5°.', explain: 'When your hemisphere tilts towards the Sun, sunlight hits more directly and days are longer — summer.' },
          { id: 'ss7', type: 'mcq', q: 'How long does the Moon’s full cycle of phases take?', options: ['about 29.5 days', 'exactly 7 days', 'one year', '24 hours'], answer: 0,
            hint: 'Roughly a month — "month" even comes from "moon".', explain: 'New moon to new moon takes about 29.5 days.' },
          { id: 'ss8', type: 'mcq', q: 'A light year measures…', options: ['distance', 'time', 'brightness', 'speed'], answer: 0,
            hint: 'It’s how FAR light travels in a year.', explain: 'A light year ≈ 9.5 trillion km — used because space is too big for kilometres.' },
          { id: 'ss9', type: 'mcq', q: 'Gravity on the Moon compared with Earth is about…', options: ['1/6 as strong', 'twice as strong', 'exactly the same', 'zero'], answer: 0,
            hint: 'It’s why astronauts bounce.', explain: 'The Moon has much less mass than Earth, so its gravitational pull is about a sixth as strong.' },
          { id: 'ss10', type: 'mcq', q: 'If you travelled to the Moon, your MASS would…', options: ['stay the same', 'become 1/6', 'double', 'disappear'], answer: 0,
            hint: 'Mass is how much stuff you are made of.', explain: 'Mass never changes with location — your WEIGHT (gravity’s pull on that mass) would drop to about 1/6.' }
        ]
      },
      {
        id: 'sci-electricity', name: 'Electricity', strand: 'Physics',
        intro: 'Current, voltage and resistance — and why fairy lights wired in series all die together.',
        links: [LINKS.bitesize, LINKS.khanPhys, LINKS.oak],
        cards: [
          { title: 'What current is', body: 'Electric <b>current</b> is a flow of electric charge (electrons) around a complete circuit. Break the circuit anywhere — with a switch, say — and the flow stops everywhere.<br><br>Current is measured in <b>amps (A)</b> with an <b>ammeter</b>, connected in series (in the loop).' },
          { title: 'Voltage and resistance', body: '<b>Voltage</b> (volts, V) is the push from the battery — the energy given to the charge. It’s measured with a <b>voltmeter</b> connected in parallel (across a component).<br><br><b>Resistance</b> (ohms, Ω) is how much a component opposes the flow: for the same voltage, <b>more resistance → less current</b>.' },
          { title: 'Series circuits', body: 'In a <b>series</b> circuit, everything sits in one single loop:<br>• The current is <b>the same at every point</b>.<br>• Add more bulbs and they all get <b>dimmer</b> (more resistance, shared voltage).<br>• One bulb blows → the circuit breaks → <b>all</b> go out.' },
          { title: 'Parallel circuits', body: 'In a <b>parallel</b> circuit, components sit on separate branches:<br>• The current <b>splits</b> between branches and rejoins.<br>• Each branch gets the full voltage, so bulbs stay bright.<br>• One bulb blows → the others keep going. That’s why your house is wired in parallel.<br><br>Conductors (metals) let current flow; insulators (rubber, plastic) block it.' }
        ],
        questions: [
          { id: 'sel1', type: 'mcq', q: 'Electric current is a flow of…', options: ['electric charge (electrons)', 'air', 'light', 'protons leaving atoms'], answer: 0,
            hint: 'Tiny negatively charged particles.', explain: 'Current is charge on the move — in wires, that’s electrons flowing.' },
          { id: 'sel2', type: 'mcq', q: 'Current is measured in ___ using a(n) ___.', options: ['amps, ammeter', 'volts, voltmeter', 'ohms, ohmmeter', 'watts, wattmeter'], answer: 0,
            hint: 'The unit and the meter share a name.', explain: 'Amps with an ammeter, placed in series in the circuit.' },
          { id: 'sel3', type: 'mcq', q: 'A voltmeter is connected…', options: ['in parallel, across a component', 'in series, in the loop', 'only to the battery', 'outside the circuit'], answer: 0,
            hint: 'It measures the difference ACROSS something.', explain: 'Voltmeters go in parallel across the component; ammeters go in series.' },
          { id: 'sel4', type: 'mcq', q: 'In a series circuit, the current is…', options: ['the same at every point', 'biggest near the battery', 'different in every component', 'zero in the wires'], answer: 0,
            hint: 'One loop, one flow.', explain: 'There’s only one path, so the same current flows through every part.' },
          { id: 'sel5', type: 'mcq', q: 'In a parallel circuit, the current…', options: ['splits between the branches', 'stops at the first branch', 'doubles at each branch', 'only flows one way on Sundays'], answer: 0,
            hint: 'Think of traffic at a fork in the road.', explain: 'Current divides between branches and recombines — each branch carries part of the total.' },
          { id: 'sel6', type: 'mcq', q: 'Resistance is measured in…', options: ['ohms (Ω)', 'amps (A)', 'volts (V)', 'hertz (Hz)'], answer: 0,
            hint: 'The symbol is a Greek omega.', explain: 'Ohms, symbol Ω — named after Georg Ohm.' },
          { id: 'sel7', type: 'mcq', q: 'Which of these is an electrical insulator?', options: ['rubber', 'copper', 'steel', 'graphite'], answer: 0,
            hint: 'What are plug casings made of?', explain: 'Rubber and plastic block current — that’s why wires are coated in them. The others conduct.' },
          { id: 'sel8', type: 'mcq', q: 'Adding more bulbs to a series circuit makes each bulb…', options: ['dimmer', 'brighter', 'flash', 'change colour'], answer: 0,
            hint: 'The battery’s push is now shared between more bulbs.', explain: 'More bulbs = more resistance and shared voltage, so each bulb gets less — dimmer.' },
          { id: 'sel9', type: 'mcq', q: 'A switch turns things off by…', options: ['breaking the circuit', 'speeding up the current', 'storing the electricity', 'reversing the battery'], answer: 0,
            hint: 'Current needs a complete loop.', explain: 'Opening the switch leaves a gap — no complete loop, no current.' },
          { id: 'sel10', type: 'mcq', q: 'For the same voltage, a higher resistance means…', options: ['less current flows', 'more current flows', 'the voltage disappears', 'the wires melt instantly'], answer: 0,
            hint: 'Resistance opposes the flow.', explain: 'Resistance fights the flow: same push, more opposition, smaller current.' }
        ]
      }
    ]
  };
});
