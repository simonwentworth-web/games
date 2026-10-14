/*
 * Brain Bridge — mini-lessons.
 *
 * One short, friendly lesson per quiz skill. Shown before the first question
 * of an unfamiliar skill (teach-first sessions), and available from any
 * question via the "Learn it" button. Each lesson's `r` (remember) line
 * doubles as the default hint for that skill's questions.
 *
 *   t      title
 *   e      emoji
 *   steps  2-4 short teaching steps (may contain <b> tags, no user content)
 *   ex     a worked example
 *   r      the one-line golden rule (also the fallback hint)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BBLessons = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const LESSONS = {
    /* ------------------------------- maths ------------------------------ */
    'm.arith': { t: 'Quick-fire arithmetic', e: '🔢', steps: [
      '<b>Estimate first.</b> Round the numbers and guess the answer roughly, so a silly answer jumps out at you.',
      '<b>Adding and subtracting:</b> line the numbers up in columns and work right to left, carrying or borrowing.',
      '<b>Multiplying big numbers:</b> split them up. 47 × 6 is (40 × 6) + (7 × 6).',
      '<b>Dividing:</b> ask “how many times does it fit?” and use the times table you know.'
    ], ex: '47 × 6 → 40 × 6 = 240, and 7 × 6 = 42. 240 + 42 = <b>282</b>. (Estimate: about 50 × 6 = 300. Close!)', r: 'Estimate first, split big numbers into easy chunks, and check your answer looks sensible.' },
    'm.bidmas': { t: 'BIDMAS: the order of operations', e: '🎯', steps: [
      'Maths has a rule for what to do first: <b>B</b>rackets, <b>I</b>ndices (powers like 3²), <b>D</b>ivision and <b>M</b>ultiplication, then <b>A</b>ddition and <b>S</b>ubtraction.',
      'So in 3 + 4 × 5, the × happens BEFORE the +, even though it comes later in the sentence.',
      'Brackets beat everything: (3 + 4) × 5 is different because the brackets go first.'
    ], ex: '3 + 4 × 5 → do 4 × 5 = 20 first, then 3 + 20 = <b>23</b> (not 35!).', r: 'BIDMAS: Brackets, then Indices, then × and ÷, then + and −. Multiply before you add!' },
    'm.fractions': { t: 'Fractions without fear', e: '🍕', steps: [
      'The bottom number (denominator) says how many equal slices; the top (numerator) says how many you take.',
      '<b>Fraction OF an amount:</b> divide by the bottom, multiply by the top.',
      '<b>Adding fractions:</b> the bottoms must match first. Change them to a common denominator, then add the tops.',
      '<b>Simplest form:</b> divide top and bottom by the same number until you can’t any more.'
    ], ex: '3/4 of 20 → 20 ÷ 4 = 5 (one slice), then 5 × 3 = <b>15</b>.', r: 'Divide by the bottom, times by the top. To add fractions, make the bottoms match first.' },
    'm.decimals': { t: 'Decimals & percentages', e: '💯', steps: [
      '“Per cent” means “out of 100”. So 35% = 35/100 = 0.35.',
      '<b>The 10% trick:</b> find 10% by dividing by 10, then build any percentage from it. 5% is half of 10%; 1% is 10% ÷ 10.',
      'Multiplying by 10 or 100 slides the digits left; dividing slides them right. The decimal point never moves... the digits do!'
    ], ex: '35% of 80 → 10% is 8, so 30% is 24, and 5% is 4. 24 + 4 = <b>28</b>.', r: 'Find 10% by dividing by 10, then build the percentage you need from 10%, 5% and 1%.' },
    'm.ratio': { t: 'Ratio: sharing fairly', e: '⚖️', steps: [
      'A ratio like 2:3 means “for every 2 of mine, you get 3”. Think of it as <b>parts</b>.',
      'Add the ratio numbers to find the total parts (2 + 3 = 5).',
      'Divide the amount by the total parts to find ONE part, then multiply for each share.'
    ], ex: 'Share £20 in the ratio 2:3 → 5 parts, so one part = £4. Shares: <b>£8 and £12</b>.', r: 'Add the ratio numbers for total parts, find one part, then multiply.' },
    'm.number': { t: 'Factors, primes & multiples', e: '🧱', steps: [
      '<b>Multiples</b> are the times table: multiples of 4 are 4, 8, 12...',
      '<b>Factors</b> divide in exactly. Hunt them in pairs: 12 = 1×12, 2×6, 3×4.',
      'A <b>prime</b> has exactly two factors: 1 and itself (2, 3, 5, 7, 11...). 1 is NOT prime.',
      'A <b>square number</b> is a number times itself: 5² = 25.'
    ], ex: 'Factors of 18 in pairs: 1×18, 2×9, 3×6 → six factors: 1, 2, 3, 6, 9, 18.', r: 'Factors divide in exactly (hunt in pairs); multiples are the times table; a prime has exactly two factors.' },
    'm.algebra': { t: 'Algebra: mystery numbers', e: '🕵️', steps: [
      'A letter is just a <b>mystery number</b> wearing a disguise. 3x means 3 × x.',
      'To find it, <b>undo</b> what was done, in reverse order. Undo +5 with −5; undo ×3 with ÷3.',
      'Whatever you do to one side of the = sign, do to the other. Keep the scales balanced!'
    ], ex: '3x + 2 = 14 → take 2 from both sides: 3x = 12 → divide by 3: <b>x = 4</b>. Check: 3×4+2 = 14 ✓', r: 'Work backwards and undo each step: + undoes −, × undoes ÷. Do the same to both sides.' },
    'm.sequences': { t: 'Sequences: spot the jump', e: '🐸', steps: [
      'Write the <b>jump</b> between each pair of numbers. Same jump every time? That’s the rule.',
      'If the jumps change, look at the jumps themselves: do THEY grow? Double? Alternate?',
      'Sneaky ones: square numbers (1, 4, 9, 16...), doubling, or adding the two previous numbers.'
    ], ex: '5, 9, 13, 17... jumps are +4, +4, +4 → next is <b>21</b>.', r: 'Find the jump between terms first, and check it works for every jump, not just the first.' },
    'm.measure': { t: 'Measures & units', e: '📏', steps: [
      'Going from a BIG unit to a small one? There will be MORE of them, so <b>multiply</b>. Small to big? <b>Divide</b>.',
      'The magic numbers: ×10 (cm→mm), ×100 (m→cm), ×1000 (km→m, kg→g, litres→ml).',
      'Speed = distance ÷ time. Distance = speed × time. Cover the one you want in the triangle!'
    ], ex: '2.5 m to cm → big to small, so × 100 = <b>250 cm</b>.', r: 'Big unit to small unit: multiply (×10, ×100 or ×1000). Small to big: divide.' },
    'm.time': { t: 'Time: jump to the hour', e: '⏰', steps: [
      'To find how long something takes, <b>jump to the next o’clock first</b>, then add the rest.',
      '24-hour clock: afternoon times add 12. So 4:30 pm = 16:30. Morning times just get two digits: 07:05.',
      'Watch out: there are 60 minutes in an hour, not 100! 1 hour 35 min = 95 min.'
    ], ex: '8:45 to 10:20 → 8:45 to 9:00 is 15 min, then 9:00 to 10:20 is 80 min. 15 + 80 = <b>95 minutes</b>.', r: 'Jump to the next o’clock first, then add the rest. For pm times, add 12 for the 24-hour clock.' },
    'm.money': { t: 'Money maths', e: '💰', steps: [
      '£1 = 100p. To swap pounds to pence, × 100. Pence to pounds, ÷ 100. £3.40 is 340p.',
      '<b>Change:</b> count UP from the price to what you paid. Shopkeepers do this!',
      'Always check: should your answer be in pounds or pence? Write the one the question asks for.'
    ], ex: 'A comic costs £3.65, you pay £5 → 35p gets to £4, then £1 more = <b>£1.35</b> change.', r: '£1 = 100p. Count UP from the price to find change, and check which unit the question wants.' },
    'm.angles': { t: 'Angle rules', e: '📐', steps: [
      'Angles on a <b>straight line</b> add up to 180°. All the way <b>around a point</b>: 360°.',
      'Inside a <b>triangle</b>: 180°. Inside any <b>quadrilateral</b>: 360°.',
      'An isosceles triangle has two equal sides AND two equal angles. Spot the matching pair!'
    ], ex: 'A triangle has angles 65° and 48° → 180 − 65 − 48 = <b>67°</b>.', r: 'Straight line 180°, around a point 360°, triangle 180°, quadrilateral 360°.' },
    'm.area': { t: 'Perimeter, area & volume', e: '🧮', steps: [
      '<b>Perimeter</b> = the distance round the edge: ADD all the sides.',
      '<b>Area</b> = the space inside: rectangle = length × width; triangle = half of base × height.',
      '<b>Volume</b> = the space inside a 3D box: length × width × height.',
      'For a weird shape, chop it into rectangles, or take the cut-out away from the big one.'
    ], ex: 'Rectangle 7 cm by 4 cm → perimeter 2 × (7+4) = 22 cm, area 7 × 4 = <b>28 cm²</b>.', r: 'Perimeter: add the edges. Area: multiply (half it for triangles). Volume: length × width × height.' },
    'm.shapes': { t: 'Shapes & coordinates', e: '📍', steps: [
      'Coordinates: <b>along the corridor, then up the stairs</b> — (x, y), across first.',
      'Know your shapes: a hexagon has 6 sides; a cube has 6 faces, 12 edges, 8 corners (vertices).',
      'Reflecting in the x-axis flips the y sign; translating just slides, no turning.'
    ], ex: 'Point (3, 5): go 3 along, 5 up. Translate it 2 right and 1 down → <b>(5, 4)</b>.', r: 'Along the corridor, then up the stairs: coordinates are (across, up).' },
    'm.stats': { t: 'Averages & data', e: '📊', steps: [
      '<b>Mean:</b> add them all, divide by how many. <b>Mode:</b> the MOst common. <b>Median:</b> the MIDdle one (put them in order first!). <b>Range:</b> biggest − smallest.',
      'Reading a chart? Check the title, the labels and the scale BEFORE the bars.',
      'Probability is a fraction: ways it can happen ÷ total ways.'
    ], ex: 'Mean of 4, 6, 8 → 4+6+8 = 18, and 18 ÷ 3 = <b>6</b>.', r: 'Mean: add and divide. Mode: most common. Median: middle (in order). Range: biggest − smallest.' },
    'm.word': { t: 'Word problems: RUCSAC', e: '🎒', steps: [
      '<b>R</b>ead it twice. <b>U</b>nderline the numbers and the actual question.',
      '<b>C</b>hoose the operation: altogether → add or times; left over or difference → subtract; shared → divide.',
      '<b>S</b>olve it, <b>A</b>nswer the question asked (with units!), <b>C</b>heck it makes sense.',
      'Multi-step problems: do one small step at a time and jot each one down.'
    ], ex: '“3 pencils cost 45p, how much do 7 cost?” → one pencil 45 ÷ 3 = 15p, then 7 × 15 = <b>105p = £1.05</b>.', r: 'Read twice, underline the numbers and the question, pick the operation, solve step by step, check it makes sense.' },

    /* ------------------------------ english ----------------------------- */
    'e.retrieve': { t: 'Finding information', e: '🔍', steps: [
      'Retrieval questions are a treasure hunt: <b>the answer is written in the text</b>.',
      'Spot the key word in the question (a name, a number, a place) and scan the passage for it.',
      'Answer with the detail from the text, not from your imagination.'
    ], ex: 'Q: “How many steps did Martha climb?” → scan for “steps”... “the one hundred and twelve spiral steps”. Answer: 112.', r: 'The answer is written in the text. Find the key word from the question and point at the proof.' },
    'e.infer': { t: 'Inference: be a reading detective', e: '🕵️‍♀️', steps: [
      'Inference means working out what the writer <b>shows but doesn’t say</b>.',
      'Collect clues from the text + what you know about life, then make a sensible deduction.',
      'Golden move: back up your idea with a word or phrase from the passage. “I know X because it says Y.”'
    ], ex: '“Mr Okafor’s ears went pink” → nobody says he is embarrassed, but pink ears + his apology are the clues.', r: 'Use clues from the text plus common sense, and back your answer up with words from the passage.' },
    'e.vocab': { t: 'Words in context', e: '📚', steps: [
      'Don’t panic at a strange word: <b>the sentence around it is a clue machine</b>.',
      'Cover the word and read the sentence. What word would fit there?',
      'Test your guess: swap it in. Does the sentence still mean the same?'
    ], ex: '“The road would be treacherous in the storm” → a storm makes a road... dangerous. Treacherous = dangerous.', r: 'Cover the word, read the sentence, and choose the option that keeps the meaning the same.' },
    'e.language': { t: 'The writer’s tricks', e: '🎨', steps: [
      '<b>Simile:</b> compares with “like” or “as” (ears like sails). <b>Metaphor:</b> says it IS the thing (the moon was a coin). <b>Personification:</b> gives objects human actions (the houses close their eyes).',
      'Never just name the trick: say what picture or feeling it creates.',
      'Use the magic sentence: “This makes the reader imagine/feel ... because ...”'
    ], ex: '“Ears like sails” is a simile. Effect: sails are big and catch the wind, so we picture huge alert ears catching every sound.', r: 'Name the technique, then say what picture or feeling it gives the reader.' },
    'e.punct': { t: 'Punctuation power', e: '✒️', steps: [
      '<b>Apostrophes</b> do two jobs: missing letters (don’t = do not) and belonging (the dog’s bone). its = belonging; it’s = it is.',
      '<b>Speech:</b> “New speaker, new line,” said the teacher, “and punctuation goes INSIDE the speech marks.”',
      '<b>Commas</b> separate items in lists, mark off extra information, and follow a starter like “Although it was late, ...”'
    ], ex: 'The childrens coats → <b>the children’s coats</b> (children is already plural, so the apostrophe goes before the s).', r: 'its = belonging, it’s = it is; speech punctuation goes inside the speech marks; commas mark off extra information.' },
    'e.grammar': { t: 'Grammar: word jobs', e: '🧩', steps: [
      'Every word has a job: <b>noun</b> = person/place/thing, <b>verb</b> = doing or being, <b>adjective</b> describes a noun, <b>adverb</b> describes a verb (often -ly).',
      '<b>Pronouns</b> (he, she, it, they) stand in for nouns. <b>Conjunctions</b> (and, but, because, although) join ideas.',
      'A <b>subordinate clause</b> can’t stand alone: “When the bell rang,” needs the rest of the sentence.'
    ], ex: '“The enormous dragon snored loudly” → dragon = noun, enormous = adjective, snored = verb, loudly = adverb.', r: 'Noun = thing, verb = doing word, adjective describes a noun, adverb (often -ly) describes a verb.' },
    'e.spelling': { t: 'Spelling tricks', e: '🐝', steps: [
      'Say the word in <b>syllables</b>: ne-cess-ary. Find the tricky bit and attack it.',
      'Invent silly memory tricks: there’s a RAT in sepaRATe; one Collar two Sleeves in neCeSSary.',
      'Learn the classic rules: i before e except after c (receive); double the consonant when adding -ing to short words (hop → hopping).'
    ], ex: 'definitely → it has FINITE hiding in the middle: de-FINITE-ly. Never “definately”!', r: 'Break it into syllables, find the tricky bit, and use a silly memory trick to nail it.' },

    /* ------------------------- verbal reasoning ------------------------- */
    'vr.synonym': { t: 'Synonyms: same-meaning words', e: '👯', steps: [
      'A synonym means nearly the SAME thing. Big ↔ enormous.',
      'Put the tricky word in a sentence of your own, then swap each option in. Which one keeps the meaning?',
      'Watch for options that are related but not the same (angry is not the same as sad).'
    ], ex: 'Closest to <b>weary</b>? Try “The weary traveller...” → “The tired traveller” works. Weary = tired.', r: 'Swap each option into a sentence: the real synonym keeps the meaning exactly the same.' },
    'vr.antonym': { t: 'Antonyms: opposites', e: '🙃', steps: [
      'An antonym means the OPPOSITE. Hot ↔ cold.',
      '<b>The trap:</b> there is nearly always a synonym hiding in the options to catch you. Read the question again: same or opposite?',
      'Say it as a pair out loud: “brave... cowardly”. Does it feel like a tug of war?'
    ], ex: 'Opposite of <b>scarce</b>: “rare” is the trap (same meaning!). The answer is “plentiful”.', r: 'Watch the trap: one option means the SAME. You want the opposite!' },
    'vr.cloze': { t: 'The missing word', e: '🧷', steps: [
      'Read the WHOLE sentence first, skipping the gap, to get the meaning.',
      'Try every option in the gap. It must make sense AND sound right.',
      'Clues hide after the gap too, so always read to the full stop.'
    ], ex: '“The ___ kitten hid behind the sofa” → timid fits: a shy kitten hides. A “ferocious” one wouldn’t!', r: 'Read the whole sentence with each word in the gap; it must make sense AND sound right.' },
    'vr.odd': { t: 'Odd one out', e: '🦄', steps: [
      'Four of the five share a secret rule: all fruit, all ways of moving fast, all metals...',
      'Say what EACH word is or does. The rule usually jumps out.',
      'Check your rule covers exactly four. If it covers three or five, find a better rule.'
    ], ex: 'apple, banana, carrot, grape, pear → four are FRUIT. Carrot is a vegetable: odd one out.', r: 'Find the rule that links four of them; the rule-breaker is your answer.' },
    'vr.analogy': { t: 'Word analogies', e: '🔗', steps: [
      '“A is to B as C is to ?”: first say the LINK between A and B out loud.',
      'The link might be: lives in, baby of, used for, part of, opposite of...',
      'Apply exactly the same link to C. Same direction, too!'
    ], ex: 'Bird is to nest as bee is to...? Link: “lives in”. A bee lives in a <b>hive</b>.', r: 'Say the link out loud (“bird LIVES IN a nest”), then use the same link on the new word.' },
    'vr.letters': { t: 'Letter sequences', e: '🔤', steps: [
      'Write the alphabet out (you’re allowed!) and plot the letters on it.',
      'Count the jumps between letters. Steady jumps? Growing jumps? Two patterns taking turns?',
      'For letter PAIRS, track the first letters and second letters separately, they often move in different directions.'
    ], ex: 'A, C, E, G...? Jumps of +2 each time → next is <b>I</b>.', r: 'Write out the alphabet and count the jumps on your fingers.' },
    'vr.codes': { t: 'Letter codes', e: '🔐', steps: [
      'In a letter code, every letter slides the SAME number of places along the alphabet.',
      'Compare each letter with its code letter and count the gap: C→E is +2.',
      'Apply that shift to the new word, letter by letter. (Z wraps round to A!)'
    ], ex: 'If CAT = ECV (every letter +2), then DOG = <b>FQI</b>.', r: 'Compare each letter with its code letter and count the gap: the same shift works for the whole word.' },
    'vr.anagram': { t: 'Anagrams', e: '🌪️', steps: [
      'All the letters of a real word, shuffled! Write them in a circle so your brain stops reading them in order.',
      'Hunt for common endings: -ING, -TION, -OUS, -FUL, -ED. Set those aside and solve the rest.',
      'Cross off each letter as you use it so none go missing.'
    ], ex: 'RBAEV, meaning “ready to face danger” → ends in -VE? No... try B-R-A-V-E: <b>brave</b>!', r: 'Write the letters in a circle, look for common endings like -ing and -ous, and cross letters off as you use them.' },
    'vr.hidden': { t: 'Hidden words', e: '🫣', steps: [
      'A four-letter word hides across TWO words: the end of one + the start of the next.',
      'Slide along each join: “we must open” → em, mu, us, st, sto, stop... STOP!',
      'Ignore meaning; just listen to the letters.'
    ], ex: '“The camel ate the hay” → came<b>L ATE</b> → LATE.', r: 'Look where words join: the END of one word plus the START of the next.' },
    'vr.compound': { t: 'Compound words', e: '🧲', steps: [
      'One word must glue onto the front of all three to make real words.',
      'Try your word on ALL three, not just the first. It must work every time.',
      'Common gluers: sun, rain, foot, fire, snow, water, hand, light, over, under.'
    ], ex: '___ball, ___print, ___path → FOOTball, FOOTprint, FOOTpath. The word is <b>foot</b>.', r: 'Test the word in front of all three: it must make three real words.' },
    'vr.numseq': { t: 'Number sequences', e: '🔢', steps: [
      'Write the jump between each pair of numbers above the gaps.',
      'No steady jump? Check: doubling? Growing jumps (+2, +3, +4)? Square numbers? Adding the previous two?',
      'Trickiest of all: TWO sequences shuffled together. Check every other number.'
    ], ex: '2, 4, 8, 16...? Each number doubles → next is <b>32</b>.', r: 'Find the jump. If it isn’t steady, try doubling, growing jumps, squares, or two patterns taking turns.' },
    'vr.missing': { t: 'The missing three letters', e: '🧩', steps: [
      'Three letters are missing from the word in CAPITALS. The sentence tells you what the word should mean.',
      'Read the sentence first for the meaning, THEN look at the broken word.',
      'Say the capitals with a gap: “CAR...PET? CARpet!” The missing chunk is a real little word.'
    ], ex: '“We cleaned the CAR___.” → carpet! The missing word is <b>PET</b>.', r: 'Read the sentence for meaning first, then find the little word that completes the capitals.' },

    /* ----------------------- non-verbal reasoning ----------------------- */
    'nvr.seq': { t: 'Shape sequences', e: '🔷', steps: [
      'Don’t look at everything at once. Check <b>ONE feature at a time</b>: shape... shading... size... rotation.',
      'Each feature follows its own little pattern. Find each one, then combine them.',
      'Predict the next figure in your head BEFORE looking at the options.'
    ], ex: 'If the shape goes triangle, square, triangle, square... and the shading goes black, white, black, white... the next is a black triangle? No: follow EACH pattern one more step.', r: 'Check one feature at a time: shape, shading, size, turn. Each has its own pattern.' },
    'nvr.odd': { t: 'Odd one out (shapes)', e: '🔎', steps: [
      'Four figures share a secret rule. Ask: same shape? same shading? same size? same number of sides? inner shape matching?',
      'Test your rule on all five. Exactly one should break it.',
      'If stuck, count things: sides, dots, lines. Counting beats staring!'
    ], ex: 'Four shapes have a dashed outline and one is solid → the solid one is the odd one out.', r: 'Find the secret rule four figures share; the rule-breaker is your answer. Counting sides often helps!' },
    'nvr.matrix': { t: 'Complete the grid', e: '🀄', steps: [
      'Read the grid like a mini spreadsheet: each ROW shares something, each COLUMN shares something else.',
      'Example: rows share the shape, columns share the shading.',
      'The missing square must match its row’s rule AND its column’s rule at the same time.'
    ], ex: 'If the bottom row is all hexagons and the right column is all striped, the missing figure is a striped hexagon.', r: 'Rows share one feature, columns share another. The missing square obeys both.' },
    'nvr.rotate': { t: 'Rotations & reflections', e: '🪞', steps: [
      '<b>Rotation</b> = turned, like a steering wheel. The figure stays the same way round.',
      '<b>Reflection</b> = flipped, like a mirror. Left and right swap!',
      'Track ONE corner (or the red dot) with your finger and see where it ends up.'
    ], ex: 'An arrow pointing right, rotated a quarter turn clockwise, points DOWN. Its mirror image points LEFT.', r: 'Rotated = turned (same way round). Reflected = flipped like a mirror. Track one corner or the dot.' },
    'nvr.codes': { t: 'Shape codes', e: '🧬', steps: [
      'Each figure has a letter code. Each letter stands for ONE feature.',
      'Compare two figures that share a letter: what do they have in common? That’s what the letter means.',
      'Usually: first letter = shape, second = shading, third = size. Crack each letter, then build the answer.'
    ], ex: 'If AX = white circle and BX = white square, then A/B is the shape letter and X means white.', r: 'Each letter stands for one feature. Compare figures that share a letter to crack it: shape first, then shading.' },

    /* --------------------------- problem solving ------------------------ */
    'ps.logic': { t: 'Logic puzzles', e: '🧠', steps: [
      'Read the puzzle TWICE. The trick often hides in one little word.',
      'Draw it, act it out, or make a quick list or table. Seeing it beats imagining it.',
      'Work backwards from the end, or test a small simple case first.'
    ], ex: '“A snail climbs 3 m a day, slips 2 m a night, wall is 10 m” → it gains 1 m a day BUT on the last day it reaches the top before slipping!', r: 'Read it twice, draw it or act it out, and watch for the sneaky twist.' },
    'ps.timetable': { t: 'Timetables', e: '🚌', steps: [
      'Each COLUMN is one bus or train; each ROW is one stop. Run your finger down your column.',
      'Journey time = arrival − departure (remember 60 minutes per hour!).',
      'Need to arrive by a certain time? Find the LAST column that gets there in time.'
    ], ex: 'Bus leaves Clifton 9:15, reaches Temple Meads 9:47 → 15 to the half hour, 17 past → 32 minutes.', r: 'One column = one bus; run your finger down it. Count time via the next o’clock, 60 minutes per hour.' },
    'ps.chart': { t: 'Charts & tables', e: '📈', steps: [
      'Before reading any numbers: read the TITLE, the labels and the KEY.',
      'In a pictogram, one symbol can mean 2, 5 or 10 things. Check the key or the answer will be out by miles!',
      'In a two-way table, missing numbers come from the totals: row total − what you know.'
    ], ex: 'Key: 🍦 = 5 ice creams. Four symbols on Monday = 4 × 5 = 20, not 4!', r: 'Read the title and the KEY first: one symbol often stands for more than one thing.' },
    'ps.number': { t: 'Number puzzles', e: '🎲', steps: [
      '“I think of a number...” puzzles: work BACKWARDS from the answer, undoing each step.',
      'Try small numbers or sensible guesses, and improve each guess.',
      'Write down each step. Puzzle-solvers scribble!'
    ], ex: '“Double it, add 5, get 17” → backwards: 17 − 5 = 12, then 12 ÷ 2 = <b>6</b>.', r: 'Work backwards from the answer, undoing each step, or test small numbers and improve your guess.' },
    'ps.spatial': { t: 'Spatial puzzles', e: '📦', steps: [
      'Draw a ten-second sketch. Your eyes solve what your imagination can’t.',
      'Know your solids: a cube has 6 faces, 12 edges, 8 vertices.',
      'For folding and mirror puzzles, grab paper and try it for real when practising. Your hands teach your brain.'
    ], ex: 'How many 2×2 squares fit in a 3×3 grid? Sketch it: they can overlap positions → 4.', r: 'Sketch it! A ten-second drawing beats a minute of imagining.' }
  };

  return { LESSONS };
});
