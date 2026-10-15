'use strict';
/* Study Quest data: English — Language & Literature and Creative Writing (MYP2). */
(function (root, factory) {
  const mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  else { root.SQ_DATA = root.SQ_DATA || []; root.SQ_DATA.push(mod); }
})(typeof self !== 'undefined' ? self : this, function () {
  const LINKS = {
    bitesize: { label: 'BBC Bitesize — KS3 English', url: 'https://www.bbc.co.uk/bitesize/subjects/z3kw2hv' },
    rscZone: { label: 'RSC — Shakespeare Learning Zone', url: 'https://www.rsc.org.uk/shakespeare-learning-zone' },
    folger: { label: 'Folger Shakespeare Library — the works', url: 'https://www.folger.edu/explore/shakespeares-works/' },
    poets: { label: 'Poetry Foundation — Maya Angelou', url: 'https://www.poetryfoundation.org/poets/maya-angelou' },
    oak: { label: 'Oak National Academy — Year 8 English', url: 'https://www.thenational.academy/pupils/years/year-8/subjects' }
  };
  return {
    id: 'english', name: 'English', short: 'English', emoji: '📚',
    tagline: 'Historical fiction, Shakespeare, persuasive writing, dystopian fiction, creative writing and SPaG',
    topics: [
      {
        id: 'eng-histfic', name: 'Historical fiction & The Ruby in the Smoke', strand: 'Literature',
        intro: 'Philip Pullman’s Victorian mystery — and how writers bring the past to life without boring you.',
        links: [LINKS.bitesize, LINKS.oak],
        cards: [
          { title: 'What historical fiction is', body: '<b>Historical fiction</b> plants an invented story in a <b>real period of the past</b>. The best writers research obsessively — clothes, slang, prices, smells — so the period detail feels real, then weave fictional characters (and sometimes real ones) through it.' },
          { title: 'The Ruby in the Smoke', body: 'Written by <b>Philip Pullman</b>, set in <b>London in 1872</b>. Sixteen-year-old <b>Sally Lockhart</b>, recently orphaned, is dragged into a mystery involving a cursed ruby, the opium trade and some very dangerous adults.<br><br>Its legendary opening: <i>"Her name was Sally Lockhart; and within fifteen minutes, she was going to kill a man."</i> — a hook that fires questions at you instantly.' },
          { title: 'Victorian England', body: 'The <b>Victorian era</b> = the reign of <b>Queen Victoria, 1837–1901</b>. Britain ran a vast trading empire (including the shameful opium trade with China that shadows the novel), while at home there was extreme wealth next to brutal poverty, fog-choked streets, and very few rights or careers open to women — which is what makes Sally, a girl who understands business and firearms, so unusual.' },
          { title: 'The writer’s toolkit', body: 'Spot these moves:<br>• <b>Hook</b> — an opening that demands answers.<br>• <b>Period detail</b> — small authentic touches that build the world.<br>• <b>Cliffhanger</b> — ending a chapter at the most tense moment so you keep reading.<br>• <b>Third-person narration</b> — "Sally opened the box" (first person would be "I opened the box").' }
        ],
        questions: [
          { id: 'eh1', type: 'mcq', q: 'Who wrote The Ruby in the Smoke?', options: ['Philip Pullman', 'Charles Dickens', 'Suzanne Collins', 'Michael Morpurgo'], answer: 0,
            hint: 'He also wrote His Dark Materials.', explain: 'Philip Pullman — The Ruby in the Smoke (1985) is the first Sally Lockhart mystery.' },
          { id: 'eh2', type: 'mcq', q: 'Historical fiction mixes…', options: ['an invented story with a real historical setting', 'only real people and real events', 'the future with magic', 'autobiography with poetry'], answer: 0,
            hint: 'Made-up characters, real past.', explain: 'The setting and period details are researched and real; the plot and most characters are invented.' },
          { id: 'eh3', type: 'mcq', q: 'The Ruby in the Smoke is set in…', options: ['Victorian London', 'modern New York', 'medieval France', 'ancient Rome'], answer: 0,
            hint: 'Fog, hansom cabs and the year 1872.', explain: 'The novel opens in London in October 1872, deep in the Victorian era.' },
          { id: 'eh4', type: 'mcq', q: 'Who is the novel’s heroine?', options: ['Sally Lockhart', 'Lyra Belacqua', 'Katniss Everdeen', 'Jo March'], answer: 0,
            hint: 'Her name is in the famous first sentence.', explain: 'Sally Lockhart — a sixteen-year-old orphan with a head for business and a pistol in her bag.' },
          { id: 'eh5', type: 'mcq', q: '"Her name was Sally Lockhart; and within fifteen minutes, she was going to kill a man." Why does this opening work?', options: ['it shocks the reader and raises urgent questions', 'it describes the weather in detail', 'it explains the whole plot straight away', 'it rhymes'], answer: 0,
            hint: 'What do you immediately want to know?', explain: 'It’s a classic hook: who? why? how? You have to read on to find out.' },
          { id: 'eh6', type: 'mcq', q: '"The fog pressed its yellow fingers against the glass." Which technique is this?', options: ['personification', 'alliteration', 'a statistic', 'onomatopoeia'], answer: 0,
            hint: 'Can fog really have fingers?', explain: 'Giving the fog human fingers is personification — it makes the city feel alive and menacing.' },
          { id: 'eh7', type: 'mcq', q: 'The Victorian era was the reign of…', options: ['Queen Victoria (1837–1901)', 'Queen Elizabeth I', 'King Henry VIII', 'Queen Anne'], answer: 0,
            hint: 'The clue is in the name.', explain: 'Victoria ruled from 1837 to 1901 — one of the longest reigns in British history.' },
          { id: 'eh8', type: 'mcq', q: 'Why do historical novelists research their period so carefully?', options: ['so the details feel authentic and believable', 'to make the book longer', 'because publishers demand footnotes', 'so they can copy old books'], answer: 0,
            hint: 'One wrong detail can break the spell.', explain: 'Convincing period detail makes readers trust the world; anachronisms (things from the wrong time) shatter it.' },
          { id: 'eh9', type: 'mcq', q: 'A cliffhanger is…', options: ['ending a chapter at a moment of high suspense', 'a story set on a mountain', 'a happy ending', 'a type of rhyme'], answer: 0,
            hint: 'It leaves you dangling…', explain: 'Writers end chapters mid-crisis so you simply cannot stop reading.' },
          { id: 'eh10', type: 'mcq', q: '"Sally opened the box." This is written in…', options: ['third person', 'first person', 'second person', 'future tense'], answer: 0,
            hint: 'Is the narrator "I", "you" or "she"?', explain: 'Third person uses he/she/they. First person would be "I opened the box".' }
        ]
      },
      {
        id: 'eng-shakespeare', name: 'Shakespeare’s world', strand: 'Literature',
        intro: 'The man, the Globe, and the language tricks that keep his plays alive 400 years on.',
        links: [LINKS.rscZone, LINKS.folger, LINKS.bitesize],
        cards: [
          { title: 'The man himself', body: 'William Shakespeare was born in <b>Stratford-upon-Avon in 1564</b> and died in <b>1616</b>. He wrote about <b>37 plays</b> and 154 sonnets, and acted in and co-owned his theatre company.<br><br>Seven years after his death, friends collected his plays into the <b>First Folio</b> (1623) — without it, half the plays would be lost.' },
          { title: 'The Globe', body: 'His company played at the <b>Globe</b>, an open-air theatre on the south bank of the Thames (built 1599). The cheapest ticket (a penny) bought you standing room in the yard — those fans were the <b>groundlings</b>, and they heckled, cheered and threw things.<br><br>All parts, including Juliet, were played by men and boys.' },
          { title: 'Three kinds of play', body: '• <b>Comedies</b> — confusion, disguises, weddings at the end (A Midsummer Night’s Dream).<br>• <b>Tragedies</b> — a great character’s fatal flaw, bodies at the end (Macbeth, Romeo and Juliet).<br>• <b>Histories</b> — English kings, power and war (Henry V).' },
          { title: 'His language', body: 'Much of the verse is <b>iambic pentameter</b>: ten syllables per line in a da-DUM da-DUM heartbeat rhythm — <i>"But SOFT, what LIGHT through YONder WINdow BREAKS?"</i><br><br>Old pronouns: <b>thou/thee = you</b>, thy = your, art = are. And he coined or popularised hundreds of phrases we still use: "break the ice", "wild goose chase", "in a pickle".' }
        ],
        questions: [
          { id: 'esh1', type: 'mcq', q: 'Where was Shakespeare born?', options: ['Stratford-upon-Avon', 'London', 'Oxford', 'York'], answer: 0,
            hint: 'The town is still a shrine for fans today.', explain: 'Born in Stratford-upon-Avon in 1564; he worked in London but retired back home.' },
          { id: 'esh2', type: 'mcq', q: 'Shakespeare was born in 1564 and died in…', options: ['1616', '1666', '1588', '1700'], answer: 0,
            hint: 'He died aged 52.', explain: '1616 — reportedly on or near his birthday, 23 April.' },
          { id: 'esh3', type: 'mcq', q: 'Shakespeare’s famous London theatre was called…', options: ['the Globe', 'the Palladium', 'the Colosseum', 'the Rose Garden'], answer: 0,
            hint: 'A reconstruction of it stands by the Thames today.', explain: 'The Globe, built in 1599 — open-air, roughly circular, "the wooden O".' },
          { id: 'esh4', type: 'mcq', q: 'The three main types of Shakespeare play are…', options: ['comedies, tragedies, histories', 'musicals, operas, pantomimes', 'mysteries, westerns, romances', 'myths, legends, fables'], answer: 0,
            hint: 'The First Folio sorts them this way.', explain: 'Comedies end in weddings, tragedies in deaths, histories in English kings doing battle.' },
          { id: 'esh5', type: 'mcq', q: 'A line of iambic pentameter has how many syllables?', options: ['10', '5', '14', '8'], answer: 0,
            hint: '"Penta" means five — five da-DUM pairs.', explain: 'Five iambs (da-DUM) × 2 syllables = 10 syllables per line.' },
          { id: 'esh6', type: 'mcq', q: '"Thou art" means…', options: ['you are', 'the art', 'they argue', 'that is'], answer: 0,
            hint: '"Wherefore art thou Romeo?"', explain: 'Thou = you, art = are. "Thou art brave" = "You are brave".' },
          { id: 'esh7', type: 'mcq', q: 'Romeo and Juliet is a…', options: ['tragedy', 'comedy', 'history', 'pantomime'], answer: 0,
            hint: 'How does it end for the two leads?', explain: 'It ends with the deaths of both lovers — the defining mark of a tragedy.' },
          { id: 'esh8', type: 'mcq', q: 'The 1623 collection of Shakespeare’s plays is called…', options: ['the First Folio', 'the Big Book', 'the Globe Edition', 'the King’s Scroll'], answer: 0,
            hint: '"Folio" is a paper size.', explain: 'The First Folio preserved 36 plays — 18 of which had never been printed before.' },
          { id: 'esh9', type: 'mcq', q: 'Audience members who stood in the yard of the Globe were called…', options: ['groundlings', 'yardies', 'stagehands', 'understudies'], answer: 0,
            hint: 'They stood on the ground.', explain: 'For a penny, groundlings stood right by the stage — rowdy, loud and loyal.' },
          { id: 'esh10', type: 'mcq', q: 'Which everyday phrase is credited to Shakespeare?', options: ['"break the ice"', '"LOL"', '"OK boomer"', '"see you later, alligator"'], answer: 0,
            hint: 'It’s from The Taming of the Shrew.', explain: 'He coined or popularised hundreds of phrases: "break the ice", "in a pickle", "wild goose chase"…' }
        ]
      },
      {
        id: 'eng-persuasion', name: 'Persuasion station', strand: 'Writing',
        intro: 'DAFOREST, rhetoric and Greta Thunberg: the machinery inside every speech that moves people.',
        links: [LINKS.bitesize, LINKS.oak],
        cards: [
          { title: 'DAFOREST', body: 'The persuasive writer’s toolbox:<br><b>D</b>irect address ("YOU can change this") · <b>A</b>lliteration · <b>F</b>acts · <b>O</b>pinions · <b>R</b>hetorical questions · <b>E</b>motive language · <b>S</b>tatistics · <b>T</b>riples (the rule of three: "faster, stronger, braver").' },
          { title: 'Ethos, pathos, logos', body: 'The ancient Greeks sorted persuasion into three appeals:<br>• <b>Ethos</b> — trust me, I’m credible.<br>• <b>Pathos</b> — feel this (appeals to <b>emotion</b>).<br>• <b>Logos</b> — the logic: facts, statistics, reasoning.<br><br>Great speeches blend all three.' },
          { title: 'Greta Thunberg', body: 'At 15, Greta Thunberg began a school strike for climate outside the Swedish parliament (2018), sparking Fridays for Future worldwide. Her speeches are collected in <b>No One Is Too Small to Make a Difference</b>.<br><br>Her famous <b>"How dare you"</b> speech was delivered at the <b>UN Climate Action Summit in 2019</b> — short sentences, repetition, direct address, hard statistics: DAFOREST in action.' },
          { title: 'Building a speech', body: 'A persuasive speech usually runs: <b>hook</b> (grab attention) → <b>points with evidence</b> (each point backed up and explained) → <b>counter-argument knocked down</b> (show you’ve considered the other side — it makes YOUR side stronger) → <b>call to action</b> (tell the audience exactly what to do).' }
        ],
        questions: [
          { id: 'ep1', type: 'mcq', q: '"YOU have the power to stop this." Which technique is this?', options: ['direct address', 'statistics', 'alliteration', 'simile'], answer: 0,
            hint: 'Who is the sentence talking to?', explain: 'Speaking straight to the reader as "you" is direct address — it makes the message personal.' },
          { id: 'ep2', type: 'mcq', q: 'A rhetorical question is…', options: ['a question asked for effect, not expecting an answer', 'a question with multiple answers', 'a question asked twice', 'any question in an exam'], answer: 0,
            hint: '"Do we really want to live like this?"', explain: 'It isn’t seeking information — it plants the answer in the audience’s mind.' },
          { id: 'ep3', type: 'mcq', q: '"Stop this senseless, shameful slaughter." The repeated s-sounds are…', options: ['alliteration', 'a statistic', 'a rhetorical question', 'logos'], answer: 0,
            hint: 'Listen to the first letters.', explain: 'Repeating the same starting sound is alliteration — it makes phrases punchy and memorable.' },
          { id: 'ep4', type: 'mcq', q: '"Faster, stronger, braver." Which technique is this?', options: ['the rule of three (triple)', 'a fact', 'direct address', 'a metaphor'], answer: 0,
            hint: 'Count the items.', explain: 'Ideas grouped in threes have rhythm and stick in the memory — the classic triple.' },
          { id: 'ep5', type: 'mcq', q: 'Which phrase uses emotive language?', options: ['"innocent children are suffering"', '"the data was collected in March"', '"the building is 12 metres tall"', '"the meeting starts at 9am"'], answer: 0,
            hint: 'Which one tugs at your feelings?', explain: '"Innocent" and "suffering" are chosen to stir emotion — that’s emotive language (and pathos).' },
          { id: 'ep6', type: 'mcq', q: 'Why do persuasive writers use statistics?', options: ['numbers make the argument feel factual and credible', 'they fill up space', 'they rhyme nicely', 'teachers insist on them'], answer: 0,
            hint: '"97% of scientists agree…" — how does that feel?', explain: 'Statistics are logos: hard-to-argue-with evidence that lends authority.' },
          { id: 'ep7', type: 'mcq', q: 'Pathos is the appeal to…', options: ['emotions', 'logic', 'authority', 'tradition'], answer: 0,
            hint: 'Think "sympathy" — same root.', explain: 'Pathos stirs feelings; logos argues with logic; ethos builds trust in the speaker.' },
          { id: 'ep8', type: 'mcq', q: 'Greta Thunberg’s book of speeches is called…', options: ['No One Is Too Small to Make a Difference', 'The Hunger Games', 'How Dare You: My Story', 'Small Steps, Big Planet'], answer: 0,
            hint: 'The title is itself a persuasive message.', explain: 'Her collected speeches were published as No One Is Too Small to Make a Difference (2019).' },
          { id: 'ep9', type: 'mcq', q: 'Thunberg’s "How dare you" speech was delivered at…', options: ['the UN Climate Action Summit (2019)', 'the Olympics', 'the Oscars', 'the World Cup final'], answer: 0,
            hint: 'World leaders were the audience.', explain: 'She addressed world leaders at the United Nations in New York, September 2019.' },
          { id: 'ep10', type: 'mcq', q: 'Why include a counter-argument in your own persuasive speech?', options: ['answering the other side first makes your argument stronger', 'it makes the speech longer', 'it confuses the audience', 'it’s a legal requirement'], answer: 0,
            hint: 'What happens if you ignore the obvious objection?', explain: 'Raising the opposing view and knocking it down shows confidence — and leaves opponents nothing to say.' }
        ]
      },
      {
        id: 'eng-dystopia', name: 'Dystopia decoded', strand: 'Literature',
        intro: 'The Hunger Games, 1984 and the rules of broken worlds — and why writers build them.',
        links: [LINKS.bitesize, LINKS.oak],
        cards: [
          { title: 'Utopia vs dystopia', body: 'A <b>utopia</b> is a perfect imagined world. A <b>dystopia</b> is its nightmare twin: an imagined society where things have gone badly wrong — usually for most people, while a few hold all the power.<br><br>The word comes from Greek: dys (bad) + topos (place).' },
          { title: 'The conventions', body: 'Spot a dystopia by its furniture:<br>• <b>Total control</b> by a state or leader<br>• <b>Surveillance</b> — someone is always watching<br>• <b>Propaganda</b> — information twisted into a weapon<br>• <b>Loss of individuality</b> — uniforms, numbers, districts<br>• A <b>protagonist who starts to question</b> it all.' },
          { title: 'The Hunger Games & 1984', body: '<b>The Hunger Games</b> (Suzanne Collins): the nation of <b>Panem</b> — a rich Capitol ruling 12 districts — forces children to fight in a televised death match. <b>Katniss Everdeen</b> volunteers to save her little sister <b>Prim</b>.<br><br><b>1984</b> (George Orwell, 1949): <b>Big Brother</b> watches everyone through telescreens; the state rewrites history and shrinks language into <b>Newspeak</b> so rebellious thoughts become impossible to think.' },
          { title: 'Why write dystopias?', body: 'Dystopias are <b>warnings</b>. Writers exaggerate something they fear in their own world — surveillance, reality TV, inequality, censorship — and follow it to its terrifying conclusion. The question every dystopia asks: <i>could this happen here?</i>' }
        ],
        questions: [
          { id: 'ed1', type: 'mcq', q: 'A dystopia is…', options: ['an imagined society where things have gone badly wrong', 'a perfect imagined world', 'any story set in space', 'a story with no ending'], answer: 0,
            hint: 'The opposite of paradise.', explain: 'Dystopias show nightmare societies — usually controlled, unequal and watched.' },
          { id: 'ed2', type: 'mcq', q: 'The opposite of a dystopia is a…', options: ['utopia', 'myopia', 'cornucopia', 'metropolis'], answer: 0,
            hint: 'It means "no place" or "good place" in Greek.', explain: 'A utopia is an imagined perfect world.' },
          { id: 'ed3', type: 'mcq', q: 'Who wrote The Hunger Games?', options: ['Suzanne Collins', 'George Orwell', 'Philip Pullman', 'J.K. Rowling'], answer: 0,
            hint: 'She published the trilogy from 2008.', explain: 'Suzanne Collins wrote The Hunger Games trilogy.' },
          { id: 'ed4', type: 'mcq', q: 'The Hunger Games is set in the nation of…', options: ['Panem', 'Oceania', 'Narnia', 'Gilead'], answer: 0,
            hint: 'From the Latin "panem et circenses" — bread and circuses.', explain: 'Panem: a shiny Capitol ruling twelve impoverished districts.' },
          { id: 'ed5', type: 'mcq', q: 'Katniss volunteers for the Games to…', options: ['save her sister Prim', 'win prize money', 'become famous', 'escape school'], answer: 0,
            hint: '"I volunteer as tribute!"', explain: 'When Prim’s name is drawn, Katniss takes her place — the novel’s defining act of love.' },
          { id: 'ed6', type: 'mcq', q: 'Who wrote 1984?', options: ['George Orwell', 'Charles Dickens', 'Suzanne Collins', 'Greta Thunberg'], answer: 0,
            hint: 'He also wrote Animal Farm.', explain: 'George Orwell published Nineteen Eighty-Four in 1949.' },
          { id: 'ed7', type: 'mcq', q: '"Big Brother is watching you" refers to…', options: ['constant state surveillance', 'a friendly older sibling', 'a TV talent show', 'neighbourhood watch volunteers'], answer: 0,
            hint: 'Telescreens in every room…', explain: 'In 1984 the state watches citizens everywhere — the phrase now describes any intrusive surveillance.' },
          { id: 'ed8', type: 'mcq', q: 'In 1984, Newspeak is designed to…', options: ['make rebellious thoughts impossible by shrinking language', 'help people learn faster', 'translate foreign news', 'entertain the masses'], answer: 0,
            hint: 'No word for freedom → no idea of freedom.', explain: 'Orwell’s chilling idea: control language and you control what people can even think.' },
          { id: 'ed9', type: 'mcq', q: 'Which trio of features marks a story as dystopian?', options: ['surveillance, propaganda, strict control', 'dragons, wizards, quests', 'detectives, clues, suspects', 'weddings, disguises, mistaken identity'], answer: 0,
            hint: 'Think 1984 AND The Hunger Games.', explain: 'Those are the classic dystopian conventions; the others belong to fantasy, crime and comedy.' },
          { id: 'ed10', type: 'mcq', q: 'Writers mainly create dystopias to…', options: ['warn readers about dangers they see in the real world', 'predict the future accurately', 'cheer readers up', 'sell film rights'], answer: 0,
            hint: 'A dystopia is an exaggerated mirror.', explain: 'Collins was struck by war footage and reality TV; Orwell by totalitarian states. Dystopias say: look where this leads.' }
        ]
      },
      {
        id: 'eng-creative', name: 'Creative writing toolkit', strand: 'Creative Writing',
        intro: 'Similes, show-don’t-tell, story mountains and Maya Angelou: the craft of writing people want to read.',
        links: [LINKS.poets, LINKS.bitesize, LINKS.oak],
        cards: [
          { title: 'Figurative language', body: '• <b>Simile</b> — compares using like or as: "quiet <i>as</i> a dropped call".<br>• <b>Metaphor</b> — says one thing IS another: "the classroom was a zoo".<br>• <b>Personification</b> — gives human behaviour to non-humans: "the wind howled".<br><br>Use them like chilli — a little transforms the dish; a ladleful ruins it.' },
          { title: 'Show, don’t tell', body: 'Telling: "She was scared."<br>Showing: "Her hands trembled as she reached for the door."<br><br>Showing hands the reader <b>evidence</b> — through actions, body language and the <b>five senses</b> (sight, sound, smell, touch, taste) — and lets them feel the fear themselves.' },
          { title: 'Plan, then polish', body: 'Great stories are planned: the <b>story mountain</b> climbs from opening → build-up → <b>climax</b> (the most exciting turning point) → resolution.<br><br>Then edit. Swap weak verbs for strong ones ("walked quickly" → "strode"), cut what drags, read it aloud. Writers like Dickens and Angelou rewrote relentlessly — first drafts are meant to be rough.' },
          { title: 'Poetry: Maya Angelou', body: 'A <b>stanza</b> is a poem’s paragraph — a group of lines. Poets compress big feelings into small spaces.<br><br><b>Maya Angelou</b> (1928–2014), American poet and memoirist, wrote <i>Still I Rise</i> — a defiant anthem of resilience and pride in identity: whatever is thrown at the speaker, "still, like dust, I’ll rise." You’ll also meet Alcott, Dickens, Andersen and Brontë this year — all masters of voice.' }
        ],
        questions: [
          { id: 'ec1', type: 'mcq', q: 'A simile is a comparison that uses…', options: ['like or as', 'numbers', 'rhyme only', 'capital letters'], answer: 0,
            hint: '"Brave AS a lion."', explain: 'Similes compare with "like" or "as"; metaphors drop the "like" and say it IS the thing.' },
          { id: 'ec2', type: 'mcq', q: '"The wind howled all night." Which technique is this?', options: ['personification', 'simile', 'statistic', 'direct address'], answer: 0,
            hint: 'Who usually howls?', explain: 'Howling is an animal/human act — giving it to the wind is personification.' },
          { id: 'ec3', type: 'mcq', q: 'Which of these is a metaphor?', options: ['"The classroom was a zoo."', '"The classroom was like a zoo."', '"The classroom was noisy."', '"The classroom had 30 students."'], answer: 0,
            hint: 'A metaphor doesn’t use "like".', explain: 'Saying the classroom WAS a zoo (not "like" one) is a metaphor.' },
          { id: 'ec4', type: 'mcq', q: 'Which sentence SHOWS fear rather than telling it?', options: ['"Her hands trembled as she reached for the door."', '"She was very scared."', '"She felt fear."', '"Fear is an emotion."'], answer: 0,
            hint: 'Which one gives you evidence instead of a label?', explain: 'Trembling hands let the reader deduce the fear — showing beats telling.' },
          { id: 'ec5', type: 'mcq', q: 'The five senses used in descriptive writing are…', options: ['sight, sound, smell, touch, taste', 'sight, speed, size, shape, shade', 'thought, memory, dream, hope, fear', 'colour, number, letter, word, line'], answer: 0,
            hint: 'What can your body actually sense?', explain: 'Descriptions built from all five senses pull the reader inside the scene.' },
          { id: 'ec6', type: 'mcq', q: 'A stanza is…', options: ['a group of lines in a poem, like a paragraph', 'the title of a poem', 'the poet’s signature', 'a type of rhyme'], answer: 0,
            hint: 'Poems are divided into them.', explain: 'Stanzas organise a poem the way paragraphs organise prose.' },
          { id: 'ec7', type: 'mcq', q: 'Maya Angelou’s poem Still I Rise is above all about…', options: ['resilience and pride in who you are', 'the rules of chess', 'a holiday in Spain', 'the water cycle'], answer: 0,
            hint: 'Read the title again.', explain: 'Whatever history and hatred throw at the speaker, she rises — defiant, confident, unbroken.' },
          { id: 'ec8', type: 'mcq', q: 'On a story mountain, the climax is…', options: ['the most exciting turning point of the story', 'the first sentence', 'the list of characters', 'the ending credits'], answer: 0,
            hint: 'It’s at the peak of the mountain.', explain: 'The climax is the peak — the moment of greatest tension the whole story climbs towards.' },
          { id: 'ec9', type: 'mcq', q: 'Which edit improves "The man walked quickly" most?', options: ['"The man strode."', '"The man walked quickly indeed."', '"The man was walking in a quick way."', '"The quickly man walked."'], answer: 0,
            hint: 'One strong verb beats a weak verb plus an adverb.', explain: '"Strode" carries the speed and purpose in a single muscular verb.' },
          { id: 'ec10', type: 'mcq', q: 'Why do good writers edit their work?', options: ['first drafts are rough — cutting and improving makes the writing stronger', 'to use more words', 'to make the handwriting neater', 'editing is only for spelling'], answer: 0,
            hint: 'Even Dickens rewrote.', explain: 'Editing — adding, removing, moving and substituting — is where good writing becomes great.' }
        ]
      },
      {
        id: 'eng-spag', name: 'SPaG power-up', strand: 'Writing',
        intro: 'Its vs it’s, apostrophes, semicolons and the spelling demons — fix the mistakes that cost marks.',
        links: [LINKS.bitesize, LINKS.oak],
        cards: [
          { title: 'The homophone horrors', body: '• <b>its</b> = belonging to it; <b>it’s</b> = it is / it has. Test: say "it is" — if it fits, use it’s.<br>• <b>their</b> (belonging), <b>there</b> (place), <b>they’re</b> (they are).<br>• <b>your</b> (belonging), <b>you’re</b> (you are).<br>• <b>affect</b> is usually the verb (to change something); <b>effect</b> is usually the noun (the result).' },
          { title: 'Apostrophes', body: 'Two jobs only:<br>1. <b>Omission</b> — marking missing letters: don’t, it’s.<br>2. <b>Possession</b> — the girl’s coat (one girl), the girls’ coats (several girls: apostrophe after the s).<br><br>NEVER for plurals: "apple’s 50p" is the dreaded greengrocer’s apostrophe.' },
          { title: 'Sentences and semicolons', body: '• <b>Simple</b> sentence: one clause. <b>Compound</b>: two joined by and/but/or. <b>Complex</b>: a main clause plus a subordinate clause ("Although it rained, we played on.").<br>• A <b>semicolon</b> joins two closely related complete sentences: "The sky darkened; the match went on."<br>• A <b>fragment</b> ("Running down the hill.") has no main clause — it can’t stand alone.' },
          { title: 'Speech and spelling demons', body: 'Direct speech: new speaker, new line; punctuation inside the quotes: <i>"Stop!" shouted Leo.</i><br><br>Spelling demons worth taming: <b>definitely</b> (not definately), <b>separate</b> (there’s a rat in sep-A-rate), <b>necessary</b> (one collar, two sleeves: one c, two s’s), <b>beginning</b>, <b>believe</b> (i before e).' }
        ],
        questions: [
          { id: 'esp1', type: 'mcq', q: 'Choose the correct word: "The dog wagged ___ tail."', options: ['its', 'it’s', 'its’', 'it is'], answer: 0,
            hint: 'Try saying "it is" in the gap.', explain: '"The dog wagged it is tail" makes no sense — so it’s the possessive "its", no apostrophe.' },
          { id: 'esp2', type: 'mcq', q: 'Which sentence is completely correct?', options: ['They’re going to their house over there.', 'There going to they’re house over their.', 'Their going to there house over they’re.', 'They’re going to there house over their.'], answer: 0,
            hint: 'they’re = they are; their = belonging; there = place.', explain: 'They’re (they are) going to their (belonging to them) house over there (place).' },
          { id: 'esp3', type: 'mcq', q: '"The girls’ coats" means…', options: ['coats belonging to several girls', 'a coat belonging to one girl', 'girls who are coats', 'coats called Girls'], answer: 0,
            hint: 'Where is the apostrophe — before or after the s?', explain: 'Apostrophe AFTER the s = plural owners. One girl would be "the girl’s coats".' },
          { id: 'esp4', type: 'mcq', q: 'Choose the correct word: "___ late again!"', options: ['You’re', 'Your', 'Yore', 'Yours'], answer: 0,
            hint: 'Expand it: "You are late again!"', explain: 'You’re = you are. "Your" shows belonging: your bag.' },
          { id: 'esp5', type: 'mcq', q: 'A semicolon is best used to…', options: ['join two closely related complete sentences', 'end every question', 'introduce a list of one item', 'replace all commas'], answer: 0,
            hint: 'Both sides must be able to stand alone.', explain: '"The sky darkened; the match went on." Each half is a full sentence; the semicolon shows they belong together.' },
          { id: 'esp6', type: 'mcq', q: 'Which direct speech is punctuated correctly?', options: ['"Stop!" shouted Leo.', '"Stop"! shouted Leo.', '"Stop" shouted Leo!', 'Stop! "shouted Leo."'], answer: 0,
            hint: 'The punctuation belongs with the words spoken.', explain: 'The exclamation mark goes inside the quotation marks, right after the spoken word.' },
          { id: 'esp7', type: 'mcq', q: 'Choose the correct word: "The weather will ___ our plans."', options: ['affect', 'effect', 'infect', 'defect'], answer: 0,
            hint: 'You need a verb here — an action.', explain: 'Affect is the verb (to change); effect is the noun (the result): "the effect of the weather".' },
          { id: 'esp8', type: 'mcq', q: 'A complex sentence contains…', options: ['a main clause and a subordinate clause', 'only one short clause', 'two sentences joined by "and"', 'no verbs at all'], answer: 0,
            hint: '"Although it rained, we played on."', explain: 'The subordinate clause ("Although it rained") can’t stand alone; the main clause can.' },
          { id: 'esp9', type: 'mcq', q: 'Which of these is a sentence fragment?', options: ['"Running down the hill."', '"She ran down the hill."', '"The hill was steep."', '"Down she ran."'], answer: 0,
            hint: 'Which one has no complete main clause?', explain: '"Running down the hill" has no subject-plus-main-verb — who was running? It can’t stand alone.' },
          { id: 'esp10', type: 'mcq', q: 'Which word is spelled correctly?', options: ['definitely', 'definately', 'definatly', 'deffinitely'], answer: 0,
            hint: 'The root is "finite".', explain: 'De-FINITE-ly: build it around "finite" and it never goes wrong.' }
        ]
      }
    ]
  };
});
