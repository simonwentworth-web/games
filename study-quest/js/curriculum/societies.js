'use strict';
/* Study Quest data: Individuals & Societies (MYP2 — geography and history). */
(function (root, factory) {
  const mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  else { root.SQ_DATA = root.SQ_DATA || []; root.SQ_DATA.push(mod); }
})(typeof self !== 'undefined' ? self : this, function () {
  const LINKS = {
    geo: { label: 'BBC Bitesize — KS3 Geography', url: 'https://www.bbc.co.uk/bitesize/subjects/zrw76sg' },
    hist: { label: 'BBC Bitesize — KS3 History', url: 'https://www.bbc.co.uk/bitesize/subjects/zk26n39' },
    ig: { label: 'Internet Geography', url: 'https://www.internetgeography.net/' },
    slavery: { label: 'International Slavery Museum, Liverpool', url: 'https://www.liverpoolmuseums.org.uk/international-slavery-museum' },
    archives: { label: 'The National Archives — education', url: 'https://www.nationalarchives.gov.uk/education/' },
    oak: { label: 'Oak National Academy — Year 8', url: 'https://www.thenational.academy/pupils/years/year-8/subjects' }
  };
  return {
    id: 'societies', name: 'Individuals & Societies', short: 'I&S', emoji: '🌍',
    tagline: 'Rivers and flooding, exploration and the slave trade, natural environments and sustainability',
    topics: [
      {
        id: 'soc-rivers', name: 'Rivers & flooding', strand: 'Geography',
        intro: 'From raindrop to river mouth: how rivers carve the land, and why floods happen — and get worse.',
        links: [LINKS.geo, LINKS.ig, LINKS.oak],
        cards: [
          { title: 'The water cycle', body: 'Water loops endlessly: the sun <b>evaporates</b> it from seas and lakes → vapour cools and <b>condenses</b> into clouds → falls as <b>precipitation</b> (rain, snow, hail) → flows back to the sea through rivers. A river’s whole catchment area is its <b>drainage basin</b>.' },
          { title: 'A river’s journey', body: 'A river starts at its <b>source</b> (often high ground) and ends at its <b>mouth</b>, where it meets the sea.<br><br><b>Upper course</b>: steep, fast, V-shaped valleys and waterfalls. <b>Middle course</b>: wider, with sweeping bends called <b>meanders</b>. <b>Lower course</b>: wide, flat floodplain — and when a meander loop gets cut off, it leaves an <b>oxbow lake</b>.' },
          { title: 'Erosion, transportation, deposition', body: 'Rivers are landscape machines:<br>• <b>Erosion</b> — wearing away rock and soil.<br>• <b>Transportation</b> — carrying the material downstream.<br>• <b>Deposition</b> — dropping it where the river slows.<br><br>Fast water on the outside of a meander erodes; slow water on the inside deposits — that’s how the bends grow.' },
          { title: 'Floods: causes and defences', body: 'Floods happen when a river gets more water than its channel can hold: long heavy rain, already-saturated ground, melting snow — made worse by <b>urbanisation</b> (concrete can’t soak up water) and <b>deforestation</b> (no trees to intercept rain).<br><br>Defences: <b>hard engineering</b> (dams, embankments/levees, flood walls) and <b>soft engineering</b> (planting trees, flood-plain zoning, warning systems).' }
        ],
        questions: [
          { id: 'ir1', type: 'mcq', q: 'In the water cycle, liquid water turning into vapour is called…', options: ['evaporation', 'condensation', 'precipitation', 'deposition'], answer: 0,
            hint: 'The sun powers it.', explain: 'Evaporation: the sun’s heat turns surface water into vapour, which later condenses into clouds.' },
          { id: 'ir2', type: 'mcq', q: 'A river begins at its…', options: ['source', 'mouth', 'meander', 'delta'], answer: 0,
            hint: 'Often a spring high in the hills.', explain: 'The source is the start; the river flows downhill from there.' },
          { id: 'ir3', type: 'mcq', q: 'The point where a river meets the sea is its…', options: ['mouth', 'source', 'head', 'spring'], answer: 0,
            hint: 'Rivers "speak" to the sea here.', explain: 'The mouth is the river’s end, where it empties into the sea or a lake.' },
          { id: 'ir4', type: 'mcq', q: 'The wearing away of land by a river is called…', options: ['erosion', 'deposition', 'evaporation', 'irrigation'], answer: 0,
            hint: 'The same word describes cliffs crumbling.', explain: 'Erosion wears away the banks and bed; the material is then transported downstream.' },
          { id: 'ir5', type: 'mcq', q: 'When a river slows down and drops the material it is carrying, that is…', options: ['deposition', 'erosion', 'condensation', 'saturation'], answer: 0,
            hint: 'The river "deposits" it, like money in a bank.', explain: 'Deposition happens where the river loses energy — inside bends and near the mouth.' },
          { id: 'ir6', type: 'mcq', q: 'A large bend in a river is called a…', options: ['meander', 'moraine', 'tributary', 'delta'], answer: 0,
            hint: 'To "meander" is to wander.', explain: 'Meanders form in the middle and lower course as erosion and deposition work opposite sides of the bend.' },
          { id: 'ir7', type: 'mcq', q: 'An oxbow lake forms when…', options: ['a meander loop is cut off from the river', 'a volcano erupts', 'the sea floods a valley', 'a dam bursts'], answer: 0,
            hint: 'Picture a horseshoe left behind.', explain: 'The river erodes through the neck of a meander, takes the short cut, and the abandoned loop becomes an oxbow lake.' },
          { id: 'ir8', type: 'mcq', q: 'Which human activity INCREASES flood risk?', options: ['covering ground with concrete (urbanisation)', 'planting trees', 'building flood warning systems', 'zoning floodplains as parks'], answer: 0,
            hint: 'What happens to rain that can’t soak in?', explain: 'Concrete and tarmac stop water soaking into the ground, so it races into rivers all at once.' },
          { id: 'ir9', type: 'mcq', q: 'Planting trees reduces flooding because trees…', options: ['intercept rainfall and soak up water', 'scare the rain away', 'make rivers deeper', 'block the river channel'], answer: 0,
            hint: 'Think of leaves and roots as sponges.', explain: 'Leaves catch rain and roots drink it, slowing the water’s journey to the river — classic soft engineering.' },
          { id: 'ir10', type: 'mcq', q: 'Which of these is HARD engineering against floods?', options: ['building a dam', 'planting trees', 'issuing flood warnings', 'letting fields flood on purpose'], answer: 0,
            hint: 'Hard = big concrete structures.', explain: 'Dams, levees and flood walls are hard engineering: expensive, effective, and they change the river itself.' }
        ]
      },
      {
        id: 'soc-slavery', name: 'Exploration & the slave trade', strand: 'History',
        intro: 'How the age of exploration led to the transatlantic slave trade — and the people who fought to end it.',
        links: [LINKS.hist, LINKS.slavery, LINKS.archives],
        cards: [
          { title: 'The age of exploration', body: 'From the 1400s, European nations sent ships to find new trade routes to Asia’s spices and silks. In <b>1492 Christopher Columbus</b> crossed the Atlantic and reached the Americas (while looking for Asia!). Motives are often summed up as <b>gold, God and glory</b> — wealth, spreading religion, and fame. Exploration brought new knowledge — and, for the peoples of the Americas and Africa, conquest and catastrophe.' },
          { title: 'The triangular trade', body: 'A three-leg trade route grew across the Atlantic:<br>1. <b>Europe → West Africa</b>: manufactured goods (cloth, guns, metal) traded for captured people.<br>2. <b>Africa → the Americas</b>: the <b>Middle Passage</b> — enslaved Africans shipped across the Atlantic.<br>3. <b>The Americas → Europe</b>: sugar, cotton and tobacco grown by enslaved labour.<br><br>Around <b>12 million</b> Africans were transported. Ports like Bristol and Liverpool grew rich on it.' },
          { title: 'The Middle Passage and resistance', body: 'Conditions on the ships were horrific: people chained below deck, packed with no room to stand, with disease rife — many did not survive the crossing. On the plantations, enslaved people were treated as property, not people.<br><br>They resisted constantly: revolts on ships and plantations, escape, working slowly, and keeping languages, music and beliefs alive.' },
          { title: 'Abolition', body: 'The fight to end slavery took decades:<br>• <b>Olaudah Equiano</b> — survived enslavement, bought his freedom, and his best-selling 1789 autobiography showed Britain the trade’s horror first-hand.<br>• <b>William Wilberforce</b> — the MP who campaigned in Parliament year after year.<br><br>Britain abolished the <b>slave trade in 1807</b> and <b>slavery itself across most of the Empire in 1833</b>. In the USA, slavery lasted until 1865.' }
        ],
        questions: [
          { id: 'is1', type: 'mcq', q: 'In which year did Columbus first cross the Atlantic?', options: ['1492', '1066', '1592', '1776'], answer: 0,
            hint: '"In fourteen hundred and ninety-two…"', explain: '1492 — he reached the Caribbean while searching for a westward route to Asia.' },
          { id: 'is2', type: 'mcq', q: 'The triangular trade connected…', options: ['Europe, West Africa and the Americas', 'Europe, China and Australia', 'Africa, India and Japan', 'Britain, France and Spain only'], answer: 0,
            hint: 'Three corners of the Atlantic.', explain: 'Goods to Africa, enslaved people to the Americas, plantation produce back to Europe.' },
          { id: 'is3', type: 'mcq', q: 'The "Middle Passage" was…', options: ['the voyage carrying enslaved Africans across the Atlantic', 'a corridor in a castle', 'a mountain route through the Alps', 'the journey home to Europe'], answer: 0,
            hint: 'It was the second leg of the triangle.', explain: 'The Atlantic crossing from Africa to the Americas — weeks of horrific conditions below deck.' },
          { id: 'is4', type: 'mcq', q: 'On the final leg, ships carried what from the Americas to Europe?', options: ['sugar, cotton and tobacco', 'gold coins only', 'spices from India', 'wool and coal'], answer: 0,
            hint: 'Plantation crops.', explain: 'Crops grown by enslaved labour — sugar, cotton, tobacco — made merchants and ports rich.' },
          { id: 'is5', type: 'mcq', q: 'Roughly how many Africans were transported across the Atlantic?', options: ['about 12 million', 'about 10,000', 'about 100,000', 'about 500'], answer: 0,
            hint: 'It’s in the millions — one of history’s greatest crimes.', explain: 'Around 12 million people were enslaved and transported; many did not survive the crossing.' },
          { id: 'is6', type: 'mcq', q: 'Who was Olaudah Equiano?', options: ['a formerly enslaved man whose autobiography boosted the abolition campaign', 'a Royal Navy admiral', 'a plantation owner', 'a Spanish explorer'], answer: 0,
            hint: 'He told his own story in a best-selling book (1789).', explain: 'Equiano survived enslavement, bought his freedom, and his book showed readers the trade’s cruelty first-hand.' },
          { id: 'is7', type: 'mcq', q: 'William Wilberforce campaigned against the slave trade as…', options: ['a Member of Parliament', 'a ship’s captain', 'a king', 'a newspaper cartoonist'], answer: 0,
            hint: 'His battlefield was the House of Commons.', explain: 'Wilberforce introduced abolition bills in Parliament again and again until the 1807 act passed.' },
          { id: 'is8', type: 'mcq', q: 'Britain abolished the slave TRADE in…', options: ['1807', '1833', '1492', '1901'], answer: 0,
            hint: 'The earlier of the two abolition dates.', explain: '1807 ended Britain’s trade in enslaved people; slavery itself continued until 1833.' },
          { id: 'is9', type: 'mcq', q: 'Slavery was abolished across most of the British Empire in…', options: ['1833', '1807', '1865', '1914'], answer: 0,
            hint: 'A generation after the trade was banned.', explain: 'The Slavery Abolition Act 1833. (The USA abolished slavery in 1865.)' },
          { id: 'is10', type: 'mcq', q: 'How did enslaved people resist?', options: ['revolts, escape and deliberate slow working — all of these', 'only by writing letters', 'they did not resist', 'by voting'], answer: 0,
            hint: 'Resistance took many forms, big and small.', explain: 'From ship revolts and uprisings to escape and everyday defiance — and keeping cultures alive was resistance too.' }
        ]
      },
      {
        id: 'soc-sustain', name: 'Environments & sustainability', strand: 'Geography',
        intro: 'Biomes, deforestation and what "sustainable" actually means — the geography of keeping the planet livable.',
        links: [LINKS.geo, LINKS.ig, LINKS.oak],
        cards: [
          { title: 'Biomes', body: 'A <b>biome</b> is a huge region defined by its climate and the plants and animals suited to it: tropical rainforest, desert, tundra, grassland, deciduous forest…<br><br><b>Tropical rainforests</b> — hot and wet all year, home to over half of all land species — grow in layers: forest floor → understorey → canopy → <b>emergent layer</b> (the tallest trees poking above the rest).' },
          { title: 'Deforestation', body: 'Rainforest is cleared for <b>cattle ranching, farming (soy, palm oil), logging and mining</b>. The costs: habitats and species lost, soil washes away, indigenous peoples displaced — and less forest to absorb carbon dioxide.<br><br>About the area of a football pitch of rainforest is lost every few seconds.' },
          { title: 'Climate and the greenhouse effect', body: 'Burning fossil fuels releases <b>carbon dioxide</b>, a greenhouse gas that traps heat in the atmosphere. As global temperature rises: ice sheets melt, <b>sea levels rise</b>, and extreme weather (heatwaves, floods, droughts) becomes more common.<br><br>Your <b>carbon footprint</b> = the total greenhouse gases your lifestyle releases.' },
          { title: 'Sustainability', body: 'The classic definition: <b>meeting the needs of the present without compromising the ability of future generations to meet theirs</b>.<br><br>In practice: renewable energy (solar, wind, hydro), the <b>3 Rs — reduce, reuse, recycle</b> (in that order!), sustainable forestry, and smarter cities and transport.' }
        ],
        questions: [
          { id: 'isu1', type: 'mcq', q: 'A biome is…', options: ['a large region with a particular climate, plants and animals', 'a kind of dome for plants', 'a single forest', 'a weather forecast'], answer: 0,
            hint: 'Rainforest, desert and tundra are examples.', explain: 'Biomes are the planet’s big life zones, shaped by temperature and rainfall.' },
          { id: 'isu2', type: 'mcq', q: 'Hot, wet all year and bursting with species — which biome?', options: ['tropical rainforest', 'desert', 'tundra', 'grassland'], answer: 0,
            hint: 'Found along the Equator.', explain: 'Tropical rainforests hold more than half of the world’s land species on a small share of its surface.' },
          { id: 'isu3', type: 'mcq', q: 'The tallest layer of the rainforest is the…', options: ['emergent layer', 'forest floor', 'understorey', 'basement'], answer: 0,
            hint: 'These trees "emerge" above everything else.', explain: 'Emergent trees tower above the canopy, up to 60+ metres tall.' },
          { id: 'isu4', type: 'mcq', q: 'A major cause of rainforest deforestation is…', options: ['clearing land for cattle and crops like palm oil', 'too many tourists on footpaths', 'birds nesting', 'heavy rainfall'], answer: 0,
            hint: 'Follow the money — what is the land used for next?', explain: 'Cattle ranching, soy and palm-oil farming, logging and mining drive most clearance.' },
          { id: 'isu5', type: 'mcq', q: 'Sustainability means…', options: ['meeting today’s needs without wrecking future generations’ chances', 'using everything up as fast as possible', 'banning all technology', 'only eating vegetables'], answer: 0,
            hint: 'Think of borrowing the planet from your grandchildren.', explain: 'The Brundtland definition: development that meets present needs without compromising the future’s.' },
          { id: 'isu6', type: 'mcq', q: 'Which of these is a renewable energy source?', options: ['solar power', 'coal', 'oil', 'natural gas'], answer: 0,
            hint: 'Which one never runs out?', explain: 'Solar (plus wind, hydro, tidal, geothermal) renews itself; fossil fuels don’t.' },
          { id: 'isu7', type: 'mcq', q: 'The main greenhouse gas released by burning fossil fuels is…', options: ['carbon dioxide', 'oxygen', 'helium', 'nitrogen'], answer: 0,
            hint: 'Its formula is CO₂.', explain: 'Carbon dioxide (CO₂) traps heat in the atmosphere — the driver of human-caused climate change.' },
          { id: 'isu8', type: 'mcq', q: 'A likely effect of rising global temperatures is…', options: ['melting ice sheets and rising sea levels', 'shorter summers everywhere', 'fewer storms of every kind', 'more polar bears'], answer: 0,
            hint: 'What happens to coastal cities as ice melts?', explain: 'Melting land ice and expanding warm oceans raise sea levels, threatening low-lying coasts.' },
          { id: 'isu9', type: 'mcq', q: 'The 3 Rs of sustainability are…', options: ['reduce, reuse, recycle', 'run, rest, repeat', 'read, write, reason', 'remove, replace, rebuild'], answer: 0,
            hint: 'They’re in order of impact.', explain: 'Reduce first (use less), then reuse, then recycle — recycling is the backup plan, not the first move.' },
          { id: 'isu10', type: 'mcq', q: 'Your carbon footprint is…', options: ['the total greenhouse gases your activities release', 'the mud you tread into the house', 'the size of your shoes', 'a type of fossil'], answer: 0,
            hint: 'Flights, food, heating, gadgets — they all add to it.', explain: 'It measures the climate impact of your lifestyle — and it can be shrunk with smarter choices.' }
        ]
      }
    ]
  };
});
