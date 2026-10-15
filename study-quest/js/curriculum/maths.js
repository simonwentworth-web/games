'use strict';
/* Study Quest data: Mathematics (MYP2 / KS3 Year 8). */
(function (root, factory) {
  const mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  else { root.SQ_DATA = root.SQ_DATA || []; root.SQ_DATA.push(mod); }
})(typeof self !== 'undefined' ? self : this, function () {
  const LINKS = {
    bitesize: { label: 'BBC Bitesize — KS3 Maths', url: 'https://www.bbc.co.uk/bitesize/subjects/zqhs34j' },
    corbett: { label: 'Corbettmaths — videos & practice', url: 'https://corbettmaths.com/' },
    khan: { label: 'Khan Academy — 8th grade maths', url: 'https://www.khanacademy.org/math/cc-eighth-grade-math' },
    nrich: { label: 'NRICH — maths puzzles (Cambridge)', url: 'https://nrich.maths.org/' },
    oak: { label: 'Oak National Academy — Year 8', url: 'https://www.thenational.academy/pupils/years/year-8/subjects' }
  };
  return {
    id: 'maths', name: 'Mathematics', short: 'Maths', emoji: '📐',
    tagline: 'Number, fractions, percentages, algebra, graphs, geometry, statistics and probability',
    topics: [
      {
        id: 'maths-number', name: 'Number power', strand: 'Number',
        intro: 'Negative numbers, BIDMAS, powers, roots and rounding — the tools every other maths topic is built on.',
        links: [LINKS.bitesize, LINKS.corbett, LINKS.khan],
        cards: [
          { title: 'Negative numbers', body: 'Picture a number line with 0 in the middle. <b>Adding moves right, subtracting moves left.</b> So 4 − 9 slides you 9 steps left of 4, landing on −5.<br><br>Golden rules for × and ÷: <b>same signs → positive</b>, <b>different signs → negative</b>. So −6 × −3 = 18, but −6 × 3 = −18.' },
          { title: 'BIDMAS: the order of operations', body: 'Maths has a fixed order so everyone gets the same answer: <b>B</b>rackets, <b>I</b>ndices (powers), <b>D</b>ivision and <b>M</b>ultiplication, then <b>A</b>ddition and <b>S</b>ubtraction.<br><br>So 3 + 4 × 2 is <b>not</b> 14. Multiplication first: 4 × 2 = 8, then 3 + 8 = <b>11</b>.' },
          { title: 'Powers and roots', body: 'A power means repeated multiplication: 2³ = 2 × 2 × 2 = 8 (say "2 cubed"). 5² = 25 ("5 squared").<br><br>A square root undoes a square: √25 = 5, because 5 × 5 = 25. Knowing square numbers up to 12² = 144 makes roots instant.' },
          { title: 'Rounding and estimating', body: 'To round 7.46 to 1 decimal place, look at the <b>next</b> digit (6). 5 or more rounds up → 7.5.<br><br>Estimating = round first, then calculate: 19.7 × 5.1 ≈ 20 × 5 = 100. Brilliant for spotting when a calculator answer is clearly wrong.' }
        ],
        questions: [
          { id: 'mn1', type: 'mcq', q: 'What is −5 + 8?', options: ['3', '−3', '13', '−13'], answer: 0,
            hint: 'Start at −5 on the number line and move 8 steps right.', explain: 'From −5, moving 8 right passes 0 and lands on 3.' },
          { id: 'mn2', type: 'input', q: 'Work out 4 − 9.', accept: ['#-5'], placeholder: 'Your answer',
            hint: 'You are taking away more than you have — the answer dips below zero.', explain: '4 − 9 = −5: nine steps left of 4 on the number line.' },
          { id: 'mn3', type: 'mcq', q: 'What is −6 × −3?', options: ['18', '−18', '−9', '9'], answer: 0,
            hint: 'Two negatives multiplied together…', explain: 'Same signs give a positive: −6 × −3 = 18.' },
          { id: 'mn4', type: 'mcq', q: 'What is 3 + 4 × 2?', options: ['11', '14', '24', '10'], answer: 0,
            hint: 'BIDMAS: which operation comes first?', explain: 'Multiplication before addition: 4 × 2 = 8, then 3 + 8 = 11.' },
          { id: 'mn5', type: 'input', q: 'Work out (10 − 4) × 3.', accept: ['#18'], placeholder: 'Your answer',
            hint: 'Brackets first!', explain: 'Brackets first: 10 − 4 = 6, then 6 × 3 = 18.' },
          { id: 'mn6', type: 'mcq', q: 'What is 2³ (two cubed)?', options: ['8', '6', '9', '16'], answer: 0,
            hint: 'It means 2 × 2 × 2, not 2 × 3.', explain: '2 × 2 × 2 = 8. A power counts how many 2s are multiplied.' },
          { id: 'mn7', type: 'input', q: 'What is √81?', accept: ['#9'], placeholder: 'Your answer',
            hint: 'Which number times itself makes 81?', explain: '9 × 9 = 81, so √81 = 9.' },
          { id: 'mn8', type: 'mcq', q: 'Round 7.46 to 1 decimal place.', options: ['7.5', '7.4', '7', '7.46'], answer: 0,
            hint: 'Look at the second decimal digit to decide up or down.', explain: 'The next digit is 6 (5 or more), so the 4 rounds up: 7.5.' },
          { id: 'mn9', type: 'mcq', q: 'Which of these is a prime number?', options: ['29', '21', '27', '33'], answer: 0,
            hint: 'A prime has exactly two factors: 1 and itself. Try dividing each by 3.', explain: '21 = 3×7, 27 = 3×9 and 33 = 3×11, but 29 divides only by 1 and 29.' },
          { id: 'mn10', type: 'mcq', q: 'Estimate 19.7 × 5.1 by rounding each number first.', options: ['about 100', 'about 50', 'about 200', 'about 25'], answer: 0,
            hint: 'Round to the nearest whole ten and whole number.', explain: '19.7 ≈ 20 and 5.1 ≈ 5, so the answer is close to 20 × 5 = 100 (the exact answer is 100.47).' }
        ]
      },
      {
        id: 'maths-fdp', name: 'Fractions & percentages', strand: 'Number',
        intro: 'Switch smoothly between fractions, decimals and percentages, and find percentages of amounts like a pro.',
        links: [LINKS.bitesize, LINKS.corbett, LINKS.khan],
        cards: [
          { title: 'Simplifying fractions', body: 'Divide top and bottom by the same number until you can’t any more. 12/18: both divide by 6 → <b>2/3</b>.<br><br>To add fractions, make the bottoms (denominators) match first: 1/2 + 1/4 = 2/4 + 1/4 = <b>3/4</b>.' },
          { title: 'The FDP family', body: 'Fractions, decimals and percentages are three outfits for the same number:<br><b>1/2 = 0.5 = 50%</b> &nbsp;·&nbsp; <b>1/4 = 0.25 = 25%</b> &nbsp;·&nbsp; <b>3/4 = 0.75 = 75%</b> &nbsp;·&nbsp; <b>1/5 = 0.2 = 20%</b> &nbsp;·&nbsp; <b>1/10 = 0.1 = 10%</b><br><br>Fraction → decimal: divide top by bottom. Decimal → percent: multiply by 100.' },
          { title: 'Fraction or percentage of an amount', body: 'Fraction of an amount: <b>divide by the bottom, multiply by the top</b>. 3/5 of 40 → 40 ÷ 5 = 8, then 8 × 3 = 24.<br><br>The 10% trick: 10% = divide by 10. Then build: 35% of 200 → 10% is 20, so 30% is 60, and 5% (half of 10%) is 10 → <b>70</b>.' },
          { title: 'Percentage increase and decrease', body: 'Increase £80 by 25%: find 25% (£20) and <b>add it on</b> → £100.<br>Decrease £60 by 10%: find 10% (£6) and <b>take it off</b> → £54.<br><br>Shops, sales and savings all run on this — it’s real-life maths.' }
        ],
        questions: [
          { id: 'mf1', type: 'mcq', q: 'Simplify 12/18 fully.', options: ['2/3', '3/4', '6/9', '1/2'], answer: 0,
            hint: 'What is the biggest number that divides into both 12 and 18?', explain: 'Divide top and bottom by 6: 12/18 = 2/3. (6/9 is equivalent but not fully simplified.)' },
          { id: 'mf2', type: 'mcq', q: 'What is 3/4 as a percentage?', options: ['75%', '34%', '43%', '80%'], answer: 0,
            hint: '1/4 is 25%…', explain: '1/4 = 25%, so 3/4 = 3 × 25% = 75%.' },
          { id: 'mf3', type: 'mcq', q: 'What is 0.2 as a fraction in its simplest form?', options: ['1/5', '2/10', '1/2', '1/20'], answer: 0,
            hint: '0.2 is 2 tenths — can that be simplified?', explain: '0.2 = 2/10, which simplifies to 1/5.' },
          { id: 'mf4', type: 'input', q: 'What is 3/5 of 40?', accept: ['#24'], placeholder: 'Your answer',
            hint: 'Divide by the bottom (5), multiply by the top (3).', explain: '40 ÷ 5 = 8, then 8 × 3 = 24.' },
          { id: 'mf5', type: 'input', q: 'What is 10% of £260?', accept: ['#26'], placeholder: '£',
            hint: '10% means divide by 10.', explain: '£260 ÷ 10 = £26.' },
          { id: 'mf6', type: 'input', q: 'What is 35% of 200?', accept: ['#70'], placeholder: 'Your answer',
            hint: 'Find 10% first (20), then build up 30% + 5%.', explain: '10% is 20, so 30% is 60; 5% is 10. 60 + 10 = 70.' },
          { id: 'mf7', type: 'mcq', q: 'Which is the largest?', options: ['5/8', '0.6', '55%', '0.59'], answer: 0,
            hint: 'Turn them all into decimals to compare.', explain: '5/8 = 0.625, which beats 0.6, 0.59 and 0.55.' },
          { id: 'mf8', type: 'input', q: 'A game costs £80. The price rises by 25%. What is the new price?', accept: ['#100'], placeholder: '£',
            hint: 'Find 25% of 80, then add it on.', explain: '25% of £80 is £20, so the new price is £80 + £20 = £100.' },
          { id: 'mf9', type: 'input', q: 'A £60 hoodie is reduced by 10% in a sale. What does it cost now?', accept: ['#54'], placeholder: '£',
            hint: 'Find 10%, then subtract it.', explain: '10% of £60 is £6, so the sale price is £60 − £6 = £54.' },
          { id: 'mf10', type: 'mcq', q: 'What is 1/2 + 1/4?', options: ['3/4', '2/6', '1/8', '2/4'], answer: 0,
            hint: 'Change 1/2 into quarters first.', explain: '1/2 = 2/4, and 2/4 + 1/4 = 3/4. Never add tops and bottoms separately!' }
        ]
      },
      {
        id: 'maths-algebra', name: 'Algebra unlocked', strand: 'Algebra',
        intro: 'Letters standing in for numbers: simplify expressions, expand brackets and solve equations with the balance method.',
        links: [LINKS.bitesize, LINKS.corbett, LINKS.khan],
        cards: [
          { title: 'Collecting like terms', body: 'In algebra, 3a means 3 × a. <b>Like terms</b> share the same letter, so they can be combined: 3a + 5a = 8a.<br><br>Different letters stay apart: 4x + 3y − x = <b>3x + 3y</b> (only the x-terms combine).' },
          { title: 'Substitution', body: 'Substituting = swapping a letter for its number. If a = 5, then 3a + 2 = 3 × 5 + 2 = <b>17</b>.<br><br>Watch the hidden multiplication: 3a is 3 × a, never "35".' },
          { title: 'Expanding brackets', body: 'Multiply <b>everything</b> inside the bracket by what’s outside:<br>3(x + 4) = 3x + 12<br>5(2a − 3) = 10a − 15<br><br>The classic mistake is forgetting the second term — the outside number touches both.' },
          { title: 'Solving equations: keep the balance', body: 'An equation is a set of scales. <b>Whatever you do to one side, do to the other.</b><br><br>2x + 5 = 17 → subtract 5 from both sides: 2x = 12 → divide both sides by 2: <b>x = 6</b>. Check by substituting back: 2×6 + 5 = 17 ✓' }
        ],
        questions: [
          { id: 'ma1', type: 'mcq', q: 'Simplify 3a + 5a.', options: ['8a', '15a', '8', 'a8'], answer: 0,
            hint: 'Three of something plus five of the same thing…', explain: '3a and 5a are like terms: 3a + 5a = 8a.' },
          { id: 'ma2', type: 'mcq', q: 'Simplify 4x + 3y − x.', options: ['3x + 3y', '7xy', '6xy', '4x + 2y'], answer: 0,
            hint: 'Only combine terms with the same letter.', explain: '4x − x = 3x; the 3y has no partner, so the answer is 3x + 3y.' },
          { id: 'ma3', type: 'input', q: 'If a = 5, what is 3a + 2?', accept: ['#17'], placeholder: 'Your answer',
            hint: '3a means 3 × a.', explain: '3 × 5 + 2 = 15 + 2 = 17.' },
          { id: 'ma4', type: 'input', q: 'If x = 4 and y = 3, what is 2x + y?', accept: ['#11'], placeholder: 'Your answer',
            hint: 'Swap the letters for their numbers, then BIDMAS.', explain: '2 × 4 + 3 = 8 + 3 = 11.' },
          { id: 'ma5', type: 'mcq', q: 'Expand 3(x + 4).', options: ['3x + 12', '3x + 4', 'x + 12', '3x + 7'], answer: 0,
            hint: 'The 3 multiplies both things inside the bracket.', explain: '3 × x = 3x and 3 × 4 = 12, giving 3x + 12.' },
          { id: 'ma6', type: 'mcq', q: 'Expand 5(2a − 3).', options: ['10a − 15', '10a − 3', '7a − 8', '10a + 15'], answer: 0,
            hint: 'Multiply 5 by 2a, then 5 by −3.', explain: '5 × 2a = 10a and 5 × (−3) = −15, so 10a − 15.' },
          { id: 'ma7', type: 'input', q: 'Solve x + 7 = 15.', accept: ['#8'], placeholder: 'x =',
            hint: 'Subtract 7 from both sides.', explain: 'x = 15 − 7 = 8.' },
          { id: 'ma8', type: 'input', q: 'Solve 3x = 24.', accept: ['#8'], placeholder: 'x =',
            hint: '3x means 3 × x, so divide both sides by 3.', explain: 'x = 24 ÷ 3 = 8.' },
          { id: 'ma9', type: 'input', q: 'Solve 2x + 5 = 17.', accept: ['#6'], placeholder: 'x =',
            hint: 'Undo the +5 first, then the ×2.', explain: '2x = 12, so x = 6. Check: 2×6 + 5 = 17 ✓' },
          { id: 'ma10', type: 'input', q: 'A sequence has nth term 3n + 1. What is the 4th term?', accept: ['#13'], placeholder: 'Your answer',
            hint: 'Substitute n = 4.', explain: '3 × 4 + 1 = 13. The sequence runs 4, 7, 10, 13, …' }
        ]
      },
      {
        id: 'maths-graphs', name: 'Graphs & coordinates', strand: 'Algebra',
        intro: 'Plot points, read straight-line graphs, and decode gradients, intercepts and real-life travel graphs.',
        links: [LINKS.bitesize, LINKS.khan, LINKS.nrich],
        cards: [
          { title: 'Coordinates', body: 'A point is written (x, y): <b>along the corridor, then up the stairs</b>. (3, −2) means 3 right, 2 down.<br><br>The axes cross at the <b>origin</b> (0, 0) and split the grid into four quadrants.' },
          { title: 'Lines with simple equations', body: '<b>y = 2</b> is a horizontal line through 2 on the y-axis (every point has y-coordinate 2).<br><b>x = 2</b> is vertical.<br><b>y = x</b> is the diagonal through (1,1), (2,2), (3,3)…' },
          { title: 'y = mx + c', body: 'Straight lines follow y = mx + c:<br>• <b>m is the gradient</b> — how steep it is (how much y rises per step right).<br>• <b>c is the y-intercept</b> — where it crosses the y-axis.<br><br>So y = 3x + 5 has gradient 3 and crosses the y-axis at (0, 5).' },
          { title: 'Real-life graphs', body: 'On a <b>distance–time graph</b>: a rising line = moving away, a <b>flat line = stopped</b>, and a <b>steeper line = faster</b>. Reading stories from graphs is a proper exam skill — and useful for reading your game stats, too.' }
        ],
        questions: [
          { id: 'mg1', type: 'mcq', q: 'Which describes the point (3, −2)?', options: ['3 right, 2 down', '3 left, 2 up', '2 right, 3 down', '3 up, 2 right'], answer: 0,
            hint: 'x comes first: along before up (or down).', explain: 'x = 3 means 3 right; y = −2 means 2 down.' },
          { id: 'mg2', type: 'mcq', q: 'Which axis runs horizontally (left–right)?', options: ['the x-axis', 'the y-axis', 'the z-axis', 'the origin'], answer: 0,
            hint: '"Along the corridor" first…', explain: 'The x-axis is horizontal; the y-axis is vertical.' },
          { id: 'mg3', type: 'input', q: 'For the line y = 2x + 1, what is y when x = 3?', accept: ['#7'], placeholder: 'y =',
            hint: 'Substitute x = 3 into the equation.', explain: 'y = 2 × 3 + 1 = 7.' },
          { id: 'mg4', type: 'mcq', q: 'What is the gradient of y = 4x − 2?', options: ['4', '−2', '2', 'x'], answer: 0,
            hint: 'In y = mx + c, the gradient is the number multiplying x.', explain: 'm = 4: the line climbs 4 for every 1 step right.' },
          { id: 'mg5', type: 'mcq', q: 'Where does y = 3x + 5 cross the y-axis?', options: ['(0, 5)', '(5, 0)', '(0, 3)', '(3, 5)'], answer: 0,
            hint: 'The crossing happens when x = 0.', explain: 'When x = 0, y = 5 — the "+ c" part is the y-intercept.' },
          { id: 'mg6', type: 'mcq', q: 'Which of these is a horizontal line?', options: ['y = 2', 'x = 2', 'y = x', 'y = 2x'], answer: 0,
            hint: 'Horizontal means every point is at the same height.', explain: 'y = 2 keeps y fixed at 2 everywhere — a flat line. x = 2 is vertical.' },
          { id: 'mg7', type: 'input', q: 'On the line y = x − 3, what is y when x = 10?', accept: ['#7'], placeholder: 'y =',
            hint: 'Just subtract.', explain: 'y = 10 − 3 = 7.' },
          { id: 'mg8', type: 'mcq', q: 'On a distance–time graph, a flat (horizontal) section means…', options: ['not moving', 'moving at a steady speed', 'speeding up', 'moving backwards'], answer: 0,
            hint: 'Time passes but the distance doesn’t change.', explain: 'Distance stays the same while time passes — the object has stopped.' },
          { id: 'mg9', type: 'mcq', q: 'On a distance–time graph, a steeper line means…', options: ['travelling faster', 'travelling slower', 'stopping', 'turning around'], answer: 0,
            hint: 'More distance covered in the same time…', explain: 'Steeper = more distance per unit of time = faster.' },
          { id: 'mg10', type: 'mcq', q: 'What is the point (0, 0) called?', options: ['the origin', 'the intercept', 'the vertex', 'the gradient'], answer: 0,
            hint: 'It’s where everything starts.', explain: 'The axes cross at the origin, (0, 0).' }
        ]
      },
      {
        id: 'maths-geometry', name: 'Geometry toolkit', strand: 'Geometry',
        intro: 'Angle facts, triangle rules, and the areas and perimeters of the shapes that turn up everywhere.',
        links: [LINKS.bitesize, LINKS.corbett, LINKS.nrich],
        cards: [
          { title: 'Angle facts to memorise', body: '• Angles on a <b>straight line</b> add to <b>180°</b>.<br>• Angles around a <b>point</b> add to <b>360°</b>.<br>• <b>Vertically opposite</b> angles (the X made by two crossing lines) are <b>equal</b>.' },
          { title: 'Triangles and quadrilaterals', body: 'Angles inside a <b>triangle</b> add to <b>180°</b>; inside any <b>quadrilateral</b>, <b>360°</b>.<br><br>Triangle types: <b>equilateral</b> (3 equal sides), <b>isosceles</b> (2 equal sides and 2 equal base angles), <b>scalene</b> (all different), <b>right-angled</b> (one 90° corner).' },
          { title: 'Area and perimeter', body: '<b>Perimeter</b> = distance around the edge (add the sides).<br><b>Area</b> = space inside, in square units:<br>• Rectangle: length × width<br>• Triangle: ½ × base × height<br>• Parallelogram: base × height' },
          { title: 'Circle words', body: 'The <b>radius</b> runs from the centre to the edge. The <b>diameter</b> crosses the whole circle through the centre — so it’s <b>twice the radius</b>. The distance all the way round is the <b>circumference</b>.' }
        ],
        questions: [
          { id: 'mge1', type: 'input', q: 'Two angles sit on a straight line. One is 115°. What is the other?', accept: ['#65'], placeholder: 'degrees',
            hint: 'They must add to 180°.', explain: '180 − 115 = 65°.' },
          { id: 'mge2', type: 'input', q: 'A triangle has angles of 65° and 48°. What is the third angle?', accept: ['#67'], placeholder: 'degrees',
            hint: 'All three add to 180°.', explain: '65 + 48 = 113, and 180 − 113 = 67°.' },
          { id: 'mge3', type: 'mcq', q: 'Vertically opposite angles are always…', options: ['equal', 'adding to 180°', 'adding to 90°', 'right angles'], answer: 0,
            hint: 'Think of the X shape where two lines cross.', explain: 'When two straight lines cross, the opposite angles of the X match exactly.' },
          { id: 'mge4', type: 'mcq', q: 'An isosceles triangle has…', options: ['two equal sides and two equal angles', 'three equal sides', 'no equal sides', 'four equal sides'], answer: 0,
            hint: '"Iso-" hints at "same" — but not all three.', explain: 'Two equal sides, and the two base angles match. Three equal sides would be equilateral.' },
          { id: 'mge5', type: 'input', q: 'What is the area of a rectangle 8 cm long and 5 cm wide?', accept: ['#40'], placeholder: 'cm²',
            hint: 'Length × width.', explain: '8 × 5 = 40 cm².' },
          { id: 'mge6', type: 'input', q: 'What is the area of a triangle with base 10 cm and height 6 cm?', accept: ['#30'], placeholder: 'cm²',
            hint: 'Half of base × height.', explain: '½ × 10 × 6 = 30 cm².' },
          { id: 'mge7', type: 'input', q: 'What is the perimeter of a rectangle 7 cm by 4 cm?', accept: ['#22'], placeholder: 'cm',
            hint: 'Add all four sides.', explain: '7 + 4 + 7 + 4 = 22 cm.' },
          { id: 'mge8', type: 'mcq', q: 'The diameter of a circle is…', options: ['twice the radius', 'half the radius', 'the distance round the edge', 'the same as the radius'], answer: 0,
            hint: 'It goes all the way across, through the centre.', explain: 'Centre to edge is the radius; edge to edge through the centre is two radii.' },
          { id: 'mge9', type: 'mcq', q: 'The angles inside any quadrilateral add up to…', options: ['360°', '180°', '270°', '540°'], answer: 0,
            hint: 'Split it into two triangles.', explain: 'A quadrilateral splits into two triangles: 2 × 180° = 360°.' },
          { id: 'mge10', type: 'input', q: 'What is the area of a parallelogram with base 6 cm and height 4 cm?', accept: ['#24'], placeholder: 'cm²',
            hint: 'Base × perpendicular height (no halving).', explain: '6 × 4 = 24 cm². Only triangles get the ½.' }
        ]
      },
      {
        id: 'maths-stats', name: 'Stats & probability', strand: 'Statistics',
        intro: 'Mean, median, mode and range, plus the 0-to-1 scale that measures how likely things are.',
        links: [LINKS.bitesize, LINKS.corbett, LINKS.khan],
        cards: [
          { title: 'The three averages (and range)', body: '• <b>Mean</b>: add them all, divide by how many.<br>• <b>Median</b>: the middle value once sorted.<br>• <b>Mode</b>: the most common value.<br>• <b>Range</b>: biggest − smallest (a measure of spread, not an average).' },
          { title: 'Choosing the right average', body: 'The <b>mean uses every value</b>, so one giant value drags it around — if a billionaire walks into the room, the mean salary rockets but the median barely moves. Use the <b>median</b> when the data has extreme values; the <b>mode</b> for the most popular choice.' },
          { title: 'The probability scale', body: 'Probability lives between <b>0 (impossible)</b> and <b>1 (certain)</b>. A fair coin landing heads: 1/2. You can write probabilities as fractions, decimals or percentages.<br><br>P(event) = favourable outcomes ÷ total outcomes.' },
          { title: 'Working probabilities out', body: 'A bag has 3 red and 2 blue marbles. P(red) = 3/5, because 3 of the 5 equally likely marbles are red.<br><br>Probabilities of "it happens" and "it doesn’t" always add to 1: if P(rain) = 0.3, then P(no rain) = 0.7.' }
        ],
        questions: [
          { id: 'ms1', type: 'input', q: 'Find the mean of 4, 7, 7 and 10.', accept: ['#7'], placeholder: 'Your answer',
            hint: 'Add all four, divide by 4.', explain: '4 + 7 + 7 + 10 = 28, and 28 ÷ 4 = 7.' },
          { id: 'ms2', type: 'input', q: 'Find the median of 3, 9, 5, 7, 11.', accept: ['#7'], placeholder: 'Your answer',
            hint: 'Sort them first, then pick the middle.', explain: 'Sorted: 3, 5, 7, 9, 11 — the middle value is 7.' },
          { id: 'ms3', type: 'mcq', q: 'What is the mode of 2, 4, 4, 5, 7?', options: ['4', '5', '2', '7'], answer: 0,
            hint: 'MOde = MOst common.', explain: '4 appears twice; everything else appears once.' },
          { id: 'ms4', type: 'input', q: 'Find the range of 12, 3, 8, 15.', accept: ['#12'], placeholder: 'Your answer',
            hint: 'Biggest minus smallest.', explain: '15 − 3 = 12.' },
          { id: 'ms5', type: 'mcq', q: 'What is the probability of an impossible event?', options: ['0', '1', '0.5', '−1'], answer: 0,
            hint: 'Bottom of the scale.', explain: 'Impossible = 0. Certain = 1. Nothing sits outside that range.' },
          { id: 'ms6', type: 'mcq', q: 'What is the probability a fair coin lands on heads?', options: ['1/2', '1/4', '1', '2'], answer: 0,
            hint: 'Two equally likely outcomes.', explain: 'One favourable outcome out of two: 1/2 (or 0.5, or 50%).' },
          { id: 'ms7', type: 'mcq', q: 'You roll a fair six-sided dice. What is P(rolling a 4)?', options: ['1/6', '1/4', '4/6', '1/2'], answer: 0,
            hint: 'How many faces, and how many show a 4?', explain: 'One face out of six equally likely faces: 1/6.' },
          { id: 'ms8', type: 'mcq', q: 'A bag holds 3 red and 2 blue marbles. What is P(red)?', options: ['3/5', '2/5', '3/2', '1/3'], answer: 0,
            hint: 'Favourable over total.', explain: '3 reds out of 5 marbles in total: 3/5.' },
          { id: 'ms9', type: 'mcq', q: 'If P(rain tomorrow) = 0.3, what is P(no rain)?', options: ['0.7', '0.3', '0.5', '1.3'], answer: 0,
            hint: 'The two options must add to 1.', explain: '1 − 0.3 = 0.7.' },
          { id: 'ms10', type: 'mcq', q: 'Which average is most affected by one extremely large value?', options: ['the mean', 'the median', 'the mode', 'the range stays the same'], answer: 0,
            hint: 'Which one uses every value in its calculation?', explain: 'The mean adds every value in, so a single giant value drags it upwards; the median just takes the middle.' }
        ]
      }
    ]
  };
});
