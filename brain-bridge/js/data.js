/*
 * Brain Bridge — content for the BGS & QEH 11+ trainer.
 *
 * Everything hand-written lives here: what each school's assessment looks like,
 * the reading passages and their questions, the grammar/punctuation bank, the
 * graded vocabulary used by the verbal-reasoning generators, the word puzzles,
 * the problem-solving bank, creative-writing prompts, the interview question
 * bank with its answer frameworks, and the praise / badge copy.
 *
 * Question objects share one shape (see generators.js for the procedural ones):
 *   { id, skill, level, format: 'mc' | 'typed', prompt, options?, answer,
 *     accept?, keywords?, model?, explain, hint? }
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BBData = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Schools                                                             */
  /* ------------------------------------------------------------------ */

  const SCHOOLS = {
    bgs: {
      id: 'bgs',
      name: 'Bristol Grammar School',
      short: 'BGS',
      emoji: '🏛️',
      colour: '#1f4e9a',
      examDate: '2027-01-23',
      examDateLabel: 'January 2027 (the school confirms the exact Saturday to applicants)',
      style: 'bgs',
      summary:
        'BGS sets its own paper-based exam in January of Year 6. It is a written exam: you answer on paper, show working in maths and write at length in English. It rewards clear thinking, careful reading and imaginative writing.',
      papers: [
        { name: 'English: creative writing', minutes: 45, format: 'Extended writing on paper', notes: 'One task. Marked for imagination and creativity, form and purpose, organisation and cohesion, sentence structure, and spelling, punctuation and grammar.' },
        { name: 'English: comprehension', minutes: 20, format: 'Passage with questions (short written answers and some multiple choice)', notes: 'Retrieval, inference, vocabulary in context and the writer’s techniques.' },
        { name: 'Mathematics', minutes: 20, format: 'Written answers, working shown', notes: 'Number, fractions, decimals and percentages, measurement, geometry, simple algebra and statistics. Quick and accurate arithmetic matters.' },
        { name: 'Problem solving', minutes: 30, format: 'Written puzzles and multi-step problems', notes: 'Logic puzzles, patterns, working backwards, reading charts and tables, spatial puzzles. Unfamiliar problems where method counts.' }
      ],
      interview: {
        who: 'A member of BGS staff (one to one, friendly)',
        when: 'Usually after the application, around the time of the exam',
        topics: ['Your hobbies and interests', 'What you enjoy at your current school', 'A book you have read recently', 'Something you are proud of', 'Why you would like to come to BGS'],
        tips: [
          'They want to meet the real you, so talk about things you genuinely love.',
          'Use the Say, Show, Share framework: say your answer, show an example, share why it matters to you.',
          'Have one BGS-specific reason ready (something you saw on the open day or a club you would join).'
        ]
      },
      facts: [
        'Founded in 1532, making it one of the oldest schools in Bristol.',
        'A co-educational day school for ages 4 to 18 in Clifton, next to the University of Bristol.',
        'The Great Hall, a Victorian hall opened in 1879, is at the heart of the school.',
        'Sport is played at the school’s Failand playing fields outside the city.',
        'Known for music, drama and a huge range of clubs and societies.',
        'School motto: Ex Spinis Uvas, “from thorns, grapes”: good things come from hard work.'
      ],
      links: [
        { label: 'BGS admissions', url: 'https://www.bristolgrammarschool.co.uk/' },
        { label: 'The Exam Coach: free BGS-style papers', url: 'https://www.theexamcoach.tv/11-plus-practice-papers-and-answers/bristol-grammar-school' },
        { label: 'Exam Papers Plus: BGS 11+ overview', url: 'https://exampapersplus.co.uk/advice/11-plus-year-6/bristol-grammar-school-11-plus-entrance-exam-information-key-details/' }
      ]
    },
    qeh: {
      id: 'qeh',
      name: "Queen Elizabeth's Hospital",
      short: 'QEH',
      emoji: '⚔️',
      colour: '#8a1538',
      examDate: '2027-01-09',
      examDateLabel: 'Saturday 9 January 2027 (second sitting Saturday 16 January 2027)',
      style: 'qeh',
      summary:
        'QEH uses an online, adaptive, multiple-choice assessment built by Atom Learning, sat on school computers. The questions get harder when you answer well, so expect some you cannot do. It is 1 hour 35 minutes in short timed sections, so pace matters.',
      papers: [
        { name: 'English', minutes: 20, format: 'Multiple choice, online', notes: 'Spelling, punctuation, grammar and vocabulary.' },
        { name: 'Comprehension', minutes: 20, format: 'Multiple choice, online', notes: 'Passages, plus “creative comprehension”: maps, timetables, charts and diagrams.' },
        { name: 'Mathematics', minutes: 20, format: 'Multiple choice, online', notes: 'Arithmetic and problem solving, some with charts and diagrams.' },
        { name: 'Non-verbal reasoning', minutes: 10, format: 'Multiple choice, online', notes: 'Shape sequences, odd one out, matrices, rotations and codes.' },
        { name: 'Verbal reasoning', minutes: 10, format: 'Multiple choice, online', notes: 'Vocabulary, word meanings from context, letter and word patterns.' },
        { name: 'Problem solving', minutes: 15, format: 'Multiple choice, online', notes: 'Puzzles and interactive diagrams followed by a question.' }
      ],
      interview: {
        who: 'The Head and the Head of Year',
        when: 'On the taster morning, before the entrance exam',
        topics: ['Your hobbies and interests', 'Your school work and favourite subjects', 'What you read', 'How you treat other people', 'Why QEH'],
        tips: [
          'It is a conversation, not a test. Smile, look at the person speaking and listen to the whole question.',
          'The school motto is “Whilst we have time, let us do good”, so a story about helping someone goes down well.',
          'Have one QEH-specific reason ready, for example something from the taster morning.'
        ]
      },
      facts: [
        'Founded in 1590 by the Bristol merchant John Carr; it is known as “the City School”.',
        'A boys’ day school for ages 7 to 18, with a co-educational Sixth Form.',
        'Based at Berkeley Place in Clifton, with playing fields at Failand.',
        'A historic “bluecoat” school: the traditional blue coat uniform is still worn on special occasions.',
        'Strong in drama (it has its own theatre), music and sport, especially rugby.',
        'School motto: Dum Tempus Habemus Operemur Bonum, “whilst we have time, let us do good”.'
      ],
      links: [
        { label: 'QEH senior admissions', url: 'https://qehbristol.co.uk/admissions/senior-admissions/' },
        { label: 'Atom Learning familiarisation test for QEH', url: 'https://app.atomlearning.com/public/taster/qeh-senior-school' },
        { label: 'The Exam Coach: QEH exam overview', url: 'https://www.theexamcoach.tv/11-plus-practice-papers-and-answers/queen-elizabeths-hospital' }
      ]
    }
  };

  /* ------------------------------------------------------------------ */
  /* Skills                                                              */
  /* ------------------------------------------------------------------ */

  const SUBJECTS = {
    maths: { label: 'Maths', emoji: '🔢', colour: '#2f80ed' },
    english: { label: 'English', emoji: '📖', colour: '#eb5757' },
    vr: { label: 'Verbal reasoning', emoji: '🔤', colour: '#9b51e0' },
    nvr: { label: 'Non-verbal reasoning', emoji: '🔷', colour: '#27ae60' },
    ps: { label: 'Problem solving', emoji: '🧩', colour: '#f2994a' },
    writing: { label: 'Creative writing', emoji: '✍️', colour: '#e84393' },
    interview: { label: 'Interview', emoji: '🎤', colour: '#00a8a8' }
  };

  // Every skill the adaptive engine tracks. `gen` names the generator or bank.
  const SKILLS = [
    { id: 'm.arith', subject: 'maths', label: 'Arithmetic', gen: 'arith' },
    { id: 'm.bidmas', subject: 'maths', label: 'Order of operations', gen: 'bidmas' },
    { id: 'm.fractions', subject: 'maths', label: 'Fractions', gen: 'fractions' },
    { id: 'm.decimals', subject: 'maths', label: 'Decimals & percentages', gen: 'decimals' },
    { id: 'm.ratio', subject: 'maths', label: 'Ratio & proportion', gen: 'ratio' },
    { id: 'm.number', subject: 'maths', label: 'Factors, primes & multiples', gen: 'number' },
    { id: 'm.algebra', subject: 'maths', label: 'Algebra', gen: 'algebra' },
    { id: 'm.sequences', subject: 'maths', label: 'Sequences', gen: 'sequences' },
    { id: 'm.measure', subject: 'maths', label: 'Measures & units', gen: 'measure' },
    { id: 'm.time', subject: 'maths', label: 'Time', gen: 'time' },
    { id: 'm.money', subject: 'maths', label: 'Money', gen: 'money' },
    { id: 'm.angles', subject: 'maths', label: 'Angles', gen: 'angles' },
    { id: 'm.area', subject: 'maths', label: 'Perimeter, area & volume', gen: 'area' },
    { id: 'm.shapes', subject: 'maths', label: 'Shapes & coordinates', gen: 'shapes' },
    { id: 'm.stats', subject: 'maths', label: 'Averages & data', gen: 'stats' },
    { id: 'm.word', subject: 'maths', label: 'Word problems', gen: 'word' },

    { id: 'e.retrieve', subject: 'english', label: 'Finding information', gen: 'passage' },
    { id: 'e.infer', subject: 'english', label: 'Inference', gen: 'passage' },
    { id: 'e.vocab', subject: 'english', label: 'Words in context', gen: 'passage' },
    { id: 'e.language', subject: 'english', label: "Writer's techniques", gen: 'passage' },
    { id: 'e.punct', subject: 'english', label: 'Punctuation', gen: 'spag' },
    { id: 'e.grammar', subject: 'english', label: 'Grammar', gen: 'spag' },
    { id: 'e.spelling', subject: 'english', label: 'Spelling', gen: 'spag' },

    { id: 'vr.synonym', subject: 'vr', label: 'Synonyms', gen: 'synonym' },
    { id: 'vr.antonym', subject: 'vr', label: 'Antonyms', gen: 'antonym' },
    { id: 'vr.cloze', subject: 'vr', label: 'Missing word', gen: 'cloze' },
    { id: 'vr.odd', subject: 'vr', label: 'Odd one out', gen: 'oddword' },
    { id: 'vr.analogy', subject: 'vr', label: 'Word analogies', gen: 'analogy' },
    { id: 'vr.letters', subject: 'vr', label: 'Letter sequences', gen: 'letterseq' },
    { id: 'vr.codes', subject: 'vr', label: 'Letter codes', gen: 'lettercode' },
    { id: 'vr.anagram', subject: 'vr', label: 'Anagrams', gen: 'anagram' },
    { id: 'vr.hidden', subject: 'vr', label: 'Hidden words', gen: 'hidden' },
    { id: 'vr.compound', subject: 'vr', label: 'Compound words', gen: 'compound' },
    { id: 'vr.numseq', subject: 'vr', label: 'Number sequences', gen: 'numseq' },
    { id: 'vr.missing', subject: 'vr', label: 'Missing three-letter word', gen: 'missing' },

    { id: 'nvr.seq', subject: 'nvr', label: 'What comes next', gen: 'nvrseq' },
    { id: 'nvr.odd', subject: 'nvr', label: 'Odd one out', gen: 'nvrodd' },
    { id: 'nvr.matrix', subject: 'nvr', label: 'Complete the grid', gen: 'nvrmatrix' },
    { id: 'nvr.rotate', subject: 'nvr', label: 'Rotations & reflections', gen: 'nvrrotate' },
    { id: 'nvr.codes', subject: 'nvr', label: 'Shape codes', gen: 'nvrcode' },

    { id: 'ps.logic', subject: 'ps', label: 'Logic puzzles', gen: 'puzzle' },
    { id: 'ps.timetable', subject: 'ps', label: 'Timetables', gen: 'timetable' },
    { id: 'ps.chart', subject: 'ps', label: 'Charts & tables', gen: 'chart' },
    { id: 'ps.number', subject: 'ps', label: 'Number puzzles', gen: 'puzzle' },
    { id: 'ps.spatial', subject: 'ps', label: 'Spatial puzzles', gen: 'puzzle' },

    { id: 'w.story', subject: 'writing', label: 'Story writing', gen: 'writing' },
    { id: 'w.describe', subject: 'writing', label: 'Descriptive writing', gen: 'writing' },
    { id: 'w.nonfiction', subject: 'writing', label: 'Letters, diaries & articles', gen: 'writing' },

    { id: 'iv.you', subject: 'interview', label: 'About you', gen: 'interview' },
    { id: 'iv.school', subject: 'interview', label: 'School & learning', gen: 'interview' },
    { id: 'iv.reading', subject: 'interview', label: 'Reading & interests', gen: 'interview' },
    { id: 'iv.character', subject: 'interview', label: 'Character & teamwork', gen: 'interview' },
    { id: 'iv.thinking', subject: 'interview', label: 'Thinking questions', gen: 'interview' },
    { id: 'iv.why', subject: 'interview', label: 'Why this school', gen: 'interview' }
  ];

  /* ------------------------------------------------------------------ */
  /* Interview frameworks and question bank                              */
  /* ------------------------------------------------------------------ */

  const INTERVIEW_FRAMEWORKS = {
    sss: {
      id: 'sss',
      name: 'Say, Show, Share',
      emoji: '🗣️',
      steps: [
        ['Say', 'Answer the question in one clear sentence.'],
        ['Show', 'Give a real example: a time, a place, a name, a detail.'],
        ['Share', 'Say why it matters to you, or what you learnt.']
      ],
      example: '“My favourite subject is science (Say). Last term we grew crystals from salt water and mine grew into a spike as long as my finger (Show). I love it because you get to ask a question and then find out the answer for yourself (Share).”'
    },
    star: {
      id: 'star',
      name: 'STAR stories',
      emoji: '⭐',
      steps: [
        ['Situation', 'Where were you and what was happening?'],
        ['Task', 'What needed doing or what went wrong?'],
        ['Action', 'What did YOU do?'],
        ['Result', 'How did it end, and what did you learn?']
      ],
      example: '“At cricket club (Situation) our keeper was ill, so we had nobody for the final (Task). I offered to do it even though I had never kept wicket (Action). We lost, but I took a catch and now I play keeper every week (Result).”'
    },
    sides: {
      id: 'sides',
      name: 'Two sides, then decide',
      emoji: '⚖️',
      steps: [
        ['One side', 'Give a reason someone might say yes.'],
        ['Other side', 'Give a reason someone might say no.'],
        ['Decide', 'Say what YOU think and why. It is fine to be unsure.']
      ],
      example: '“Some people would say rules should never be broken because they keep everyone safe. Others would say that if a rule is unfair, breaking it can be brave. I think it depends: I would break a rule to help someone who was hurt, but not just because I felt like it.”'
    },
    aloud: {
      id: 'aloud',
      name: 'Think out loud',
      emoji: '💭',
      steps: [
        ['Repeat', 'Say the question back in your own words to buy thinking time.'],
        ['Chunk', 'Break it into smaller parts and tackle one at a time.'],
        ['Guess well', 'Give your best answer and explain how you got there. Being wrong but logical is fine.']
      ],
      example: '“How many tennis balls fit in this room? Well, the room is about 5 metres by 4 metres by 3 metres... a tennis ball is about 7 cm... so about 14 balls along a metre... I would estimate around 150,000.”'
    }
  };

  // ingredients: things a strong answer tends to include (used for feedback).
  const INTERVIEW_QUESTIONS = [
    // About you
    { id: 'iv1', skill: 'iv.you', fw: 'sss', q: 'Tell me a bit about yourself.', tip: 'Pick three things: something you love, something you are good at, something about your family or friends.', ingredients: ['love', 'enjoy', 'family', 'friend', 'school', 'favourite'] },
    { id: 'iv2', skill: 'iv.you', fw: 'sss', q: 'What are you most proud of?', tip: 'It does not have to be a trophy. Learning to do something hard counts.', ingredients: ['proud', 'because', 'hard', 'practis', 'learn'] },
    { id: 'iv3', skill: 'iv.you', fw: 'sss', q: 'What would your best friend say about you?', tip: 'Mention a strength and back it up with something you actually did.', ingredients: ['kind', 'funny', 'loyal', 'because', 'always', 'help'] },
    { id: 'iv4', skill: 'iv.you', fw: 'star', q: 'Tell me about a time something went wrong and what you did.', tip: 'Interviewers love honesty. Focus on what you did next, not the disaster.', ingredients: ['went wrong', 'mistake', 'so i', 'decided', 'next time', 'learn'] },
    { id: 'iv5', skill: 'iv.you', fw: 'sss', q: 'What do you do at the weekend?', tip: 'Be specific: not “stuff”, but the actual club, game, place or person.', ingredients: ['saturday', 'sunday', 'club', 'play', 'go to', 'family'] },
    { id: 'iv6', skill: 'iv.you', fw: 'sss', q: 'If you could learn any new skill, what would it be and why?', tip: 'Choose something and give a reason that shows curiosity.', ingredients: ['would', 'because', 'learn', 'want'] },
    { id: 'iv7', skill: 'iv.you', fw: 'sss', q: 'What is something you find difficult, and how do you deal with it?', tip: 'Everyone finds something hard. Show that you keep trying.', ingredients: ['difficult', 'hard', 'keep', 'practis', 'ask', 'try'] },
    { id: 'iv8', skill: 'iv.you', fw: 'sss', q: 'What makes you laugh?', tip: 'Relax and be yourself. A short real example is perfect.', ingredients: ['funny', 'laugh', 'when'] },

    // School and learning
    { id: 'iv10', skill: 'iv.school', fw: 'sss', q: 'What is your favourite subject and why?', tip: 'Describe one lesson you loved, in detail.', ingredients: ['favourite', 'because', 'lesson', 'we', 'learn'] },
    { id: 'iv11', skill: 'iv.school', fw: 'sss', q: 'Which subject do you find hardest? What do you do about it?', tip: 'Honesty plus effort. “I find spelling hard, so I keep a list of tricky words.”', ingredients: ['hard', 'practis', 'ask', 'try', 'help', 'better'] },
    { id: 'iv12', skill: 'iv.school', fw: 'sss', q: 'Tell me about your current school.', tip: 'Something you enjoy, something you are involved in, and a teacher or lesson you will remember.', ingredients: ['school', 'teacher', 'enjoy', 'club', 'lesson'] },
    { id: 'iv13', skill: 'iv.school', fw: 'sss', q: 'What have you learnt recently that surprised you?', tip: 'A fact from any lesson, book or documentary. Explain why it surprised you.', ingredients: ['learn', 'surpris', 'did not know', 'because', 'fact'] },
    { id: 'iv14', skill: 'iv.school', fw: 'sss', q: 'How do you organise yourself for homework?', tip: 'Describe your routine: when, where, what you do if you get stuck.', ingredients: ['homework', 'after', 'before', 'list', 'stuck', 'ask'] },
    { id: 'iv15', skill: 'iv.school', fw: 'sss', q: 'If you could change one thing about your school, what would it be?', tip: 'Be positive and constructive. Suggest an improvement, not a complaint.', ingredients: ['would', 'because', 'better', 'more'] },
    { id: 'iv16', skill: 'iv.school', fw: 'sss', q: 'What do you do when you get stuck on a piece of work?', tip: 'Show a method: read it again, try a different way, then ask.', ingredients: ['read', 'again', 'try', 'ask', 'different', 'break'] },

    // Reading and interests
    { id: 'iv20', skill: 'iv.reading', fw: 'sss', q: 'What are you reading at the moment?', tip: 'Title, author, what is happening, and what you think of it. Have two books ready.', ingredients: ['by', 'character', 'because', 'about', 'favourite', 'author'] },
    { id: 'iv21', skill: 'iv.reading', fw: 'sss', q: 'Tell me about a book you would recommend to me, and why.', tip: 'Describe the best bit without spoiling it. Say who would enjoy it.', ingredients: ['recommend', 'because', 'character', 'exciting', 'funny', 'author'] },
    { id: 'iv22', skill: 'iv.reading', fw: 'sss', q: 'What are your hobbies outside school?', tip: 'Pick two and go deep rather than listing ten.', ingredients: ['hobby', 'club', 'every', 'week', 'because', 'love'] },
    { id: 'iv23', skill: 'iv.reading', fw: 'sss', q: 'Do you play any sports or instruments?', tip: 'Say how long you have done it, what level, and what you enjoy about it.', ingredients: ['play', 'since', 'years', 'grade', 'team', 'practis'] },
    { id: 'iv24', skill: 'iv.reading', fw: 'sss', q: 'Tell me about something in the news that interested you recently.', tip: 'Prepare one story in advance. Say what happened and what you think about it.', ingredients: ['news', 'happened', 'think', 'because', 'interesting'] },
    { id: 'iv25', skill: 'iv.reading', fw: 'sss', q: 'If you had a free afternoon with no screens, what would you do?', tip: 'Show you have interests beyond games and TV.', ingredients: ['would', 'go', 'make', 'build', 'read', 'play'] },
    { id: 'iv26', skill: 'iv.reading', fw: 'sss', q: 'Which character from a book or film is most like you?', tip: 'Choose a character and give two ways you are similar.', ingredients: ['like', 'because', 'both', 'brave', 'curious', 'funny'] },

    // Character and teamwork
    { id: 'iv30', skill: 'iv.character', fw: 'star', q: 'Tell me about a time you worked as part of a team.', tip: 'Use STAR. What was YOUR role?', ingredients: ['team', 'we', 'my job', 'together', 'result', 'won', 'finished'] },
    { id: 'iv31', skill: 'iv.character', fw: 'star', q: 'Tell me about a time you helped someone.', tip: 'Small kindnesses count. QEH’s motto is about doing good.', ingredients: ['help', 'friend', 'noticed', 'so i', 'felt'] },
    { id: 'iv32', skill: 'iv.character', fw: 'sss', q: 'What would you do if you saw someone being left out at break time?', tip: 'Say what you would do, then what you would say to them.', ingredients: ['would', 'ask', 'join', 'invite', 'talk', 'tell'] },
    { id: 'iv33', skill: 'iv.character', fw: 'star', q: 'Have you ever had to be brave?', tip: 'Brave can be speaking up, performing, trying something new or admitting a mistake.', ingredients: ['brave', 'nervous', 'scared', 'but', 'did it', 'glad'] },
    { id: 'iv34', skill: 'iv.character', fw: 'sss', q: 'What does being a good friend mean?', tip: 'Give two qualities and an example of each from your life.', ingredients: ['friend', 'kind', 'honest', 'listen', 'there for', 'for example'] },
    { id: 'iv35', skill: 'iv.character', fw: 'sss', q: 'How would you contribute to life at this school?', tip: 'Clubs, teams, music, drama, helping younger pupils. Be concrete.', ingredients: ['join', 'club', 'team', 'help', 'would', 'play'] },
    { id: 'iv36', skill: 'iv.character', fw: 'star', q: 'Tell me about a time you disagreed with someone. What happened?', tip: 'Show that you can listen and find a fair solution.', ingredients: ['disagree', 'listen', 'compromise', 'agreed', 'fair', 'in the end'] },

    // Thinking questions
    { id: 'iv40', skill: 'iv.thinking', fw: 'sides', q: 'Should rules ever be broken?', tip: 'Give both sides, then decide.', ingredients: ['some people', 'but', 'on the other hand', 'i think', 'because', 'depends'] },
    { id: 'iv41', skill: 'iv.thinking', fw: 'aloud', q: 'How would you describe a mobile phone to someone from Victorian times?', tip: 'Compare it with things they knew: letters, telegraph, a photograph, a library.', ingredients: ['like', 'imagine', 'letter', 'book', 'talk', 'picture'] },
    { id: 'iv42', skill: 'iv.thinking', fw: 'sides', q: 'Is it better to be clever or kind?', tip: 'There is no right answer. Show you can see both and explain your view.', ingredients: ['clever', 'kind', 'both', 'but', 'i think', 'because'] },
    { id: 'iv43', skill: 'iv.thinking', fw: 'aloud', q: 'If you borrowed a million pounds, would you be a millionaire?', tip: 'Think out loud. What does the word millionaire really mean?', ingredients: ['owe', 'pay back', 'really', 'because', 'technically'] },
    { id: 'iv44', skill: 'iv.thinking', fw: 'sides', q: 'Should everyone be paid the same amount of money for their job?', tip: 'Fairness versus effort and training. Pick a side at the end.', ingredients: ['fair', 'but', 'harder', 'train', 'i think', 'because'] },
    { id: 'iv45', skill: 'iv.thinking', fw: 'aloud', q: 'Roughly how many pencils do you think are in this school? How would you work it out?', tip: 'Estimate step by step: pupils, pencils each, classrooms.', ingredients: ['about', 'pupils', 'each', 'times', 'roughly', 'estimate'] },
    { id: 'iv46', skill: 'iv.thinking', fw: 'sides', q: 'If you could change one law, what would it be?', tip: 'Choose something you care about and explain who it would help.', ingredients: ['would', 'because', 'help', 'people', 'fair'] },
    { id: 'iv47', skill: 'iv.thinking', fw: 'aloud', q: 'What is the most useful invention of all time, and why?', tip: 'Pick one, say what life was like before it, and who it helps now.', ingredients: ['invention', 'before', 'without', 'because', 'everyone'] },
    { id: 'iv48', skill: 'iv.thinking', fw: 'sides', q: 'Is it ever right to tell a lie?', tip: 'Think about white lies and about protecting someone. Decide.', ingredients: ['lie', 'sometimes', 'but', 'protect', 'i think', 'because'] },
    { id: 'iv49', skill: 'iv.thinking', fw: 'aloud', q: 'If you were headteacher for a day, what would you do?', tip: 'One fun idea and one sensible idea.', ingredients: ['would', 'because', 'everyone', 'day', 'make'] },

    // Why this school
    { id: 'iv50', skill: 'iv.why', fw: 'sss', q: 'Why would you like to come to this school?', tip: 'One fact about the school, one thing you saw or heard, one personal reason.', ingredients: ['open day', 'taster', 'saw', 'because', 'club', 'would', 'teacher'] },
    { id: 'iv51', skill: 'iv.why', fw: 'sss', q: 'What are you most looking forward to at senior school?', tip: 'New subjects, clubs, trips, making friends. Be specific to this school if you can.', ingredients: ['looking forward', 'club', 'subject', 'because', 'new'] },
    { id: 'iv52', skill: 'iv.why', fw: 'sss', q: 'What do you know about our school?', tip: 'Two facts and something you noticed on your visit. Keep it natural, not a speech.', ingredients: ['founded', 'motto', 'saw', 'visit', 'clifton', 'hall', 'theatre', 'failand'] },
    { id: 'iv53', skill: 'iv.why', fw: 'sss', q: 'Which clubs would you join here?', tip: 'Name two and say why they suit you.', ingredients: ['join', 'club', 'because', 'already', 'love'] },
    { id: 'iv54', skill: 'iv.why', fw: 'sss', q: 'Is there anything worrying you about moving to a new school?', tip: 'It is fine to say yes. Then say how you would handle it.', ingredients: ['worried', 'nervous', 'but', 'would', 'ask', 'friends'] },
    { id: 'iv55', skill: 'iv.why', fw: 'sss', q: 'Do you have any questions for us?', tip: 'Always have one ready. Ask about clubs, trips, a subject or what Year 7s enjoy most.', ingredients: ['?', 'what', 'how', 'do you', 'could you'] }
  ];

  const INTERVIEW_RAPID = [
    'What is your favourite word?',
    'Sum up your family in three words.',
    'Would you rather be able to fly or be invisible? Why?',
    'What is the best thing about being ten?',
    'Name something you have changed your mind about.',
    'Which animal are you most like?',
    'What would you put in a time capsule?',
    'What question would you ask a famous scientist?',
    'What is your favourite word in another language?',
    'Which is better: summer or winter?',
    'What skill should every eleven-year-old have?',
    'If you wrote a book, what would it be called?'
  ];

  /* ------------------------------------------------------------------ */
  /* Reading passages                                                    */
  /* ------------------------------------------------------------------ */
  // Each question works in both exam styles: `options` (QEH, multiple choice,
  // `answer` is the index of the right option) and `typed` (BGS, short written
  // answer marked by keyword groups, with a model answer to compare against).

  const PASSAGES = [
    {
      id: 'p-lighthouse',
      title: 'The Lighthouse at Gull Point',
      kind: 'Fiction',
      level: 2,
      intro: 'Martha, aged eleven, lives with her father in a lighthouse on a lonely stretch of coast.',
      text: [
        'The storm had been building all afternoon. By the time Martha climbed the one hundred and twelve spiral steps to the lamp room, the wind was hurling rain against the glass like handfuls of gravel. Far below, the sea heaved and spat, its grey back streaked with foam.',
        'Her father had gone to the village at noon and had not returned. He had promised to be back before dark, but the road along the cliff would be treacherous now, and Martha knew better than to hope. The lamp must be lit. That was the rule at Gull Point, storm or no storm, father or no father.',
        'She struck a match. It fluttered, flared, and died. The second did the same. On the third attempt she cupped the tiny flame in her hands as though it were a frightened bird and touched it to the wick. For a moment nothing happened. Then the great lamp bloomed into life, and the lens began its slow, patient turn, sweeping a blade of light across the furious water.',
        'Martha let out a breath she had not known she was holding.',
        'Somewhere out there, she thought, a ship might be looking for exactly this. A fishing boat, perhaps, with a crew of frightened men peering through the spray. Or a cargo vessel, heavy and slow, feeling its way along the coast. They would see the light and know where the rocks lay. They would live because a girl of eleven had refused to give up on a damp box of matches.',
        'She pressed her forehead against the cold glass and stared into the dark. Nothing. Only rain and the roar of the wind. And then, faint as a whisper, a bell. It rang once, twice, and was swallowed by the storm.',
        'Martha did not know whether it came from a ship or from the church on the headland, warning the village to stay indoors. But she chose to believe it was a ship, and that it had seen her light, and that it was ringing to say thank you.'
      ],
      questions: [
        { id: 'p1q1', skill: 'e.retrieve', level: 1, q: 'How many steps did Martha climb to reach the lamp room?', options: ['112', '121', '102', '120'], answer: 0, typed: { accept: ['112', 'one hundred and twelve'], model: 'One hundred and twelve.' }, explain: 'Paragraph 1 says she climbed “the one hundred and twelve spiral steps”.' },
        { id: 'p1q2', skill: 'e.retrieve', level: 1, q: 'Where had Martha’s father gone?', options: ['To the village', 'To the church', 'To a ship', 'To the cliff top'], answer: 0, typed: { keywords: [['village']], model: 'He had gone to the village at noon.' }, explain: 'Paragraph 2: “Her father had gone to the village at noon”.' },
        { id: 'p1q3', skill: 'e.vocab', level: 2, q: 'In paragraph 2, what does the word “treacherous” mean?', options: ['Dangerous', 'Long', 'Muddy', 'Dark'], answer: 0, typed: { keywords: [['danger', 'unsafe', 'risky', 'perilous', 'hazard']], model: 'Dangerous or unsafe.' }, explain: 'A treacherous road is a dangerous one. The clue is that it stops her hoping her father will return.' },
        { id: 'p1q4', skill: 'e.infer', level: 2, q: 'Why did Martha “know better than to hope” that her father would return?', options: ['She realised the storm would make the cliff road too dangerous to travel', 'She thought her father had forgotten about her', 'She knew her father preferred the village', 'She believed the lighthouse was about to fall down'], answer: 0, typed: { keywords: [['storm', 'road', 'cliff', 'treacherous', 'dangerous', 'weather']], model: 'Because the storm had made the cliff road too dangerous, so she realised he would not be able to get back.' }, explain: 'The sentence before explains it: “the road along the cliff would be treacherous now”. She is being realistic, not giving up on him.' },
        { id: 'p1q5', skill: 'e.language', level: 2, q: '“She cupped the tiny flame in her hands as though it were a frightened bird.” What technique is this and what does it show?', options: ['A simile, showing how gently and carefully she protects the small flame', 'A metaphor, showing the match is alive', 'Alliteration, showing the sound of the wind', 'Personification, showing the bird is scared'], answer: 0, typed: { keywords: [['simile'], ['gentle', 'careful', 'protect', 'delicate', 'precious', 'fragile']], need: 2, model: 'It is a simile. It shows how gently and carefully she protects the flame, as if it were something small, alive and easily frightened away.' }, explain: '“As though it were” signals a simile. Comparing the flame to a frightened bird shows how fragile it is and how carefully she treats it.' },
        { id: 'p1q6', skill: 'e.language', level: 2, q: 'Which word in paragraph 1 makes the sea sound like an angry creature?', options: ['spat', 'grey', 'foam', 'below'], answer: 0, typed: { accept: ['spat', 'heaved', 'heaved and spat'], model: '“Spat” (or “heaved”): the sea is described as if it were an angry animal spitting.' }, explain: '“The sea heaved and spat” gives the sea the actions of a furious animal. This is personification.' },
        { id: 'p1q7', skill: 'e.infer', level: 3, q: 'Why does Martha choose to believe the bell came from a ship?', options: ['It makes her feel that her effort with the lamp was worthwhile', 'She can see the ship clearly through the window', 'Her father told her a ship would come', 'The church bell had been broken for years'], answer: 0, typed: { keywords: [['worth', 'thank', 'proud', 'matter', 'saved', 'hope', 'comfort', 'effort', 'point']], model: 'Because it would mean her light had saved someone, so all her effort was worthwhile. It comforts her to think the ship was saying thank you.' }, explain: 'She cannot know where the bell came from. Choosing the ship lets her feel that lighting the lamp saved lives and that someone was grateful.' },
        { id: 'p1q8', skill: 'e.retrieve', level: 2, q: 'Put these events in the order they happen in the story.', options: ['Father leaves for the village; the match dies twice; the lamp lights; Martha hears a bell', 'The match dies twice; father leaves; the lamp lights; Martha hears a bell', 'Martha hears a bell; father leaves; the match dies twice; the lamp lights', 'Father leaves; the lamp lights; the match dies twice; Martha hears a bell'], answer: 0, typed: { accept: ['father leaves, match dies twice, lamp lights, bell', 'father leaves for the village; the match dies twice; the lamp lights; martha hears a bell'], model: 'Father leaves for the village at noon; the first two matches die; the lamp lights; Martha hears the bell.' }, explain: 'Father left at noon (before the story starts), then two matches fail, the third lights the lamp, and only at the end does she hear the bell.' }
      ]
    },
    {
      id: 'p-trophy',
      title: 'The Case of the Missing Trophy',
      kind: 'Fiction',
      level: 1,
      intro: 'It is Monday morning at Hillside Primary School.',
      text: [
        'Nobody at Hillside Primary could remember a Monday as dramatic as this one. The glass cabinet outside the hall, which had held the Inter-Schools Football Trophy since Friday’s victory, stood empty. The little velvet cushion where the cup had rested still bore a round dent, like a pillow after someone has got up.',
        '“It was there at half past eight,” insisted Mr Okafor, the caretaker, scratching his beard. “I polished the glass myself.”',
        'Priya Sharma, aged ten and three-quarters, detective by appointment (she had made herself a badge), examined the scene. The cabinet was locked. There was no broken glass. On the floor, however, lay a single muddy bootprint, far too large to belong to any pupil.',
        '“The key,” she said. “Who has the key?”',
        '“Only me,” said Mr Okafor, “and Mrs Bellamy.” Mrs Bellamy was the headteacher, and the idea of her creeping about stealing trophies was so ridiculous that Priya’s best friend Tom laughed out loud.',
        'Priya did not laugh. She was looking at the noticeboard, where a bright yellow poster announced: Trophy to be engraved Monday morning. Collected by Fenwick’s Engravers, 8.45 a.m.',
        '“Tom,” she said slowly, “what time did the bell go this morning?”',
        '“Quarter to nine,” said Tom. “Why?”',
        'Priya pointed at the bootprint, then at the poster, then at the rain streaming down the windows. “Mr Okafor polished the glass at half past eight. At quarter to nine, an engraver with large, muddy boots arrived, unlocked the cabinet with the key Mrs Bellamy lent him, and took the trophy away to have our name put on it. Nobody stole anything. It is at the engraver’s, being made even more magnificent.”',
        'There was a long pause. Mr Okafor’s ears went pink. “I may,” he admitted, “have forgotten to read the noticeboard.”',
        'Tom groaned. “So there is no mystery at all?”',
        '“There is always a mystery,” said Priya, polishing her badge. “This one just happened to be solved by reading.”'
      ],
      questions: [
        { id: 'p2q1', skill: 'e.retrieve', level: 1, q: 'What had been kept in the glass cabinet?', options: ['A football trophy', 'A velvet cushion', 'A set of keys', 'A yellow poster'], answer: 0, typed: { keywords: [['trophy', 'cup']], model: 'The Inter-Schools Football Trophy.' }, explain: 'Paragraph 1 tells us the cabinet “had held the Inter-Schools Football Trophy”.' },
        { id: 'p2q2', skill: 'e.retrieve', level: 1, q: 'At what time did Mr Okafor polish the glass?', options: ['Half past eight', 'Quarter to nine', 'Nine o’clock', 'Eight o’clock'], answer: 0, typed: { accept: ['8:30', '8.30', 'half past eight', '08:30', '8:30 am', '8.30am', '8:30am', 'half past 8'], model: 'At half past eight.' }, explain: 'He says, “It was there at half past eight... I polished the glass myself.”' },
        { id: 'p2q3', skill: 'e.vocab', level: 1, q: 'In paragraph 2, what does “insisted” mean?', options: ['Said firmly', 'Whispered quietly', 'Asked politely', 'Joked'], answer: 0, typed: { keywords: [['firm', 'strong', 'certain', 'sure', 'definite', 'stated', 'declare']], model: 'Said firmly, as if he was certain and wanted to be believed.' }, explain: 'To insist is to say something firmly because you are sure of it.' },
        { id: 'p2q4', skill: 'e.infer', level: 2, q: 'Why did Tom laugh at the idea of Mrs Bellamy taking the trophy?', options: ['Because a headteacher stealing from her own school seemed ridiculous', 'Because Mrs Bellamy was his favourite teacher', 'Because he knew where the trophy really was', 'Because Priya had told a joke'], answer: 0, typed: { keywords: [['ridiculous', 'silly', 'unlikely', 'headteacher', 'head teacher', 'would never', 'absurd', 'funny']], model: 'Because the idea of the headteacher creeping around stealing the school’s own trophy was so ridiculous.' }, explain: 'The text says the idea “was so ridiculous that... Tom laughed out loud”.' },
        { id: 'p2q5', skill: 'e.infer', level: 2, q: 'Which clue told Priya that the person who took the trophy was an adult?', options: ['The bootprint was far too large to be a pupil’s', 'The glass was broken', 'The cabinet was unlocked', 'The poster was yellow'], answer: 0, typed: { keywords: [['boot', 'footprint', 'print', 'large', 'big', 'too large']], model: 'The muddy bootprint on the floor was far too large to belong to any pupil.' }, explain: 'Paragraph 3: “a single muddy bootprint, far too large to belong to any pupil”.' },
        { id: 'p2q6', skill: 'e.language', level: 2, q: '“Like a pillow after someone has got up.” What does this simile tell us about the cushion?', options: ['It still showed the dent where the trophy had been', 'It was soft and comfortable to sleep on', 'Somebody had been sleeping in the cabinet', 'It had been stolen along with the trophy'], answer: 0, typed: { keywords: [['dent', 'shape', 'mark', 'where the', 'been', 'imprint', 'hollow']], model: 'It still had a round dent showing where the trophy had been resting, just as a pillow keeps the shape of a head.' }, explain: 'The simile compares the dent in the cushion to the hollow left in a pillow. It shows the trophy was there very recently.' },
        { id: 'p2q7', skill: 'e.infer', level: 2, q: 'Why did Mr Okafor’s ears go pink?', options: ['He was embarrassed that he had forgotten to read the noticeboard', 'He was angry with the engraver', 'The hall was very hot', 'He was about to sneeze'], answer: 0, typed: { keywords: [['embarrass', 'ashamed', 'silly', 'forgot', 'awkward']], model: 'He was embarrassed because he had forgotten to read the noticeboard and had caused a fuss over nothing.' }, explain: 'Going pink is a sign of embarrassment. He admits straight afterwards that he forgot the notice.' },
        { id: 'p2q8', skill: 'e.infer', level: 3, q: 'What does Priya mean when she says the mystery was “solved by reading”?', options: ['Reading the poster carefully gave her the answer, so careful reading is a detective’s best tool', 'She read a detective book that had the same plot', 'Tom should read more books', 'Mysteries are only found in books'], answer: 0, typed: { keywords: [['poster', 'notice', 'read'], ['careful', 'pay attention', 'notice', 'important', 'clue', 'answer']], need: 2, model: 'She means that the answer was on the poster all along. Reading carefully and noticing details solved the case, which is what a good detective does.' }, explain: 'She is making a gentle point: the clue was written on the noticeboard, and reading it properly solved everything.' }
      ]
    },
    {
      id: 'p-bridge',
      title: 'The Bridge That Was Almost Never Built',
      kind: 'Non-fiction',
      level: 2,
      intro: 'An information text about a famous Bristol landmark.',
      text: [
        'If you stand on the Downs in Bristol and look west, you will see one of the most famous bridges in the world. The Clifton Suspension Bridge hangs across the Avon Gorge, 75 metres above the river, held up by enormous chains slung between two stone towers. It looks as if it has always been there. In fact, it very nearly was not built at all.',
        'The story begins in 1754, when a Bristol wine merchant named William Vick left £1,000 in his will, with instructions that it should be saved until it had grown to £10,000 and then spent on a stone bridge across the gorge. By 1829 there was enough money to hold a competition for the best design. Among the entries was one from a young engineer, just 23 years old, called Isambard Kingdom Brunel. The judges rejected him. Brunel, who was not easily discouraged, argued his case so persuasively that a second competition was held, and in 1831 his design was chosen.',
        'Then the trouble started. Riots broke out in Bristol, money ran short, and work stopped with only the two towers standing. For years they loomed over the gorge like a pair of unfinished chimneys. Brunel went on to build railways, tunnels and the largest ship in the world, but he never saw his bridge completed. He died in 1859.',
        'His fellow engineers decided the bridge should be finished as a memorial to him. Using chains from another of Brunel’s bridges, which was being pulled down in London, they completed the work, and on 8 December 1864 the Clifton Suspension Bridge finally opened. Its main span measures 214 metres.',
        'Today around four million vehicles cross it each year, far more than Brunel could have imagined in the age of the horse and cart. At night the chains are lit with thousands of tiny lights, and the bridge that was almost never built shines across the gorge like a necklace.'
      ],
      questions: [
        { id: 'p3q1', skill: 'e.retrieve', level: 1, q: 'How high above the river is the bridge?', options: ['75 metres', '214 metres', '1,000 metres', '23 metres'], answer: 0, typed: { accept: ['75', '75 metres', '75m', '75 m', 'seventy-five metres', 'seventy five metres'], model: '75 metres.' }, explain: 'Paragraph 1: “75 metres above the river”. 214 metres is the length of the main span.' },
        { id: 'p3q2', skill: 'e.retrieve', level: 1, q: 'Who left money in his will to pay for a bridge?', options: ['William Vick', 'Isambard Kingdom Brunel', 'The Mayor of Bristol', 'A London engineer'], answer: 0, typed: { keywords: [['vick']], model: 'William Vick, a Bristol wine merchant.' }, explain: 'Paragraph 2 names “a Bristol wine merchant named William Vick”.' },
        { id: 'p3q3', skill: 'e.retrieve', level: 2, q: 'How old was Brunel when he entered the first competition?', options: ['23', '29', '31', '54'], answer: 0, typed: { accept: ['23', 'twenty-three', 'twenty three'], model: '23 years old.' }, explain: '“a young engineer, just 23 years old”.' },
        { id: 'p3q4', skill: 'e.vocab', level: 2, q: 'What does “persuasively” mean in paragraph 2?', options: ['Convincingly', 'Angrily', 'Quietly', 'Repeatedly'], answer: 0, typed: { keywords: [['convinc', 'persuad', 'argue well', 'talked them', 'made them', 'won them']], model: 'Convincingly: he argued so well that he changed the judges’ minds.' }, explain: 'Persuasively means in a convincing way. The result, a second competition, shows that his argument worked.' },
        { id: 'p3q5', skill: 'e.infer', level: 2, q: 'Give two reasons why the bridge “very nearly was not built at all”.', options: ['Money ran short and riots broke out, so work stopped', 'Brunel refused to design it and the judges lost the plans', 'The river was too wide and the chains were too heavy', 'Nobody in Bristol wanted a bridge'], answer: 0, typed: { keywords: [['money', 'riot', 'stopped', 'short'], ['died', 'riot', 'money', 'rejected', 'work stopped']], need: 2, model: 'Money ran short and riots broke out, so work stopped with only the towers built. Brunel also died before it was finished, so others had to complete it.' }, explain: 'Paragraph 3 gives the problems: riots, money running short and work stopping. Brunel’s death in 1859 meant it was finished by others as a memorial.' },
        { id: 'p3q6', skill: 'e.language', level: 2, q: 'The towers “loomed over the gorge like a pair of unfinished chimneys”. What does this simile suggest?', options: ['The towers looked incomplete and slightly ugly, standing uselessly', 'The towers were used for burning coal', 'The towers were small and easy to miss', 'The gorge was full of smoke'], answer: 0, typed: { keywords: [['unfinished', 'incomplete', 'useless', 'ugly', 'abandoned', 'stuck', 'pointless', 'out of place']], model: 'It suggests the towers looked incomplete and a bit ugly, standing there for years with no purpose, like chimneys with no house.' }, explain: 'Chimneys without a building are odd and useless. “Loomed” adds a sense that they were large and slightly threatening.' },
        { id: 'p3q7', skill: 'e.retrieve', level: 2, q: 'Where did the chains used to finish the bridge come from?', options: ['Another Brunel bridge that was being pulled down in London', 'A factory in Bristol', 'The largest ship in the world', 'A railway tunnel'], answer: 0, typed: { keywords: [['london', 'another', 'pulled down', 'brunel']], model: 'From another of Brunel’s bridges, which was being pulled down in London.' }, explain: 'Paragraph 4 explains the chains were reused from a London bridge of Brunel’s.' },
        { id: 'p3q8', skill: 'e.language', level: 3, q: 'Why do you think the writer ends with the image of a “necklace”?', options: ['To show the lit bridge is beautiful and precious, ending on a positive note after all the problems', 'To tell the reader that jewellery is sold on the bridge', 'To explain how heavy the chains are', 'Because the bridge is shaped like a circle'], answer: 0, typed: { keywords: [['beautiful', 'precious', 'jewel', 'pretty', 'sparkl', 'positive', 'happy', 'valuable', 'lights']], model: 'A necklace is beautiful and precious, so the image shows how lovely the lit bridge looks and ends the text on a happy note after all the setbacks.' }, explain: 'The lights along the chains look like jewels. Ending on something beautiful contrasts with the troubles described earlier.' },
        { id: 'p3q9', skill: 'e.infer', level: 2, q: 'Which of these statements is an opinion rather than a fact?', options: ['It is one of the most famous bridges in the world', 'The bridge opened on 8 December 1864', 'Brunel died in 1859', 'The main span is 214 metres'], answer: 0, typed: { keywords: [['famous']], model: '“One of the most famous bridges in the world” is an opinion; the dates and measurements are facts.' }, explain: 'Dates and measurements can be checked, so they are facts. “Most famous” is a judgement, so it is an opinion.' }
      ]
    },
    {
      id: 'p-octopus',
      title: 'Eight Arms and Three Hearts',
      kind: 'Non-fiction',
      level: 3,
      intro: 'A science article about one of the strangest animals in the sea.',
      text: [
        'Imagine an animal with three hearts, blue blood and no bones at all; an animal that can taste with its arms, change colour in less than a second and squeeze its whole body through a hole the size of a coin. You are imagining an octopus.',
        'Octopuses belong to a group of sea creatures called cephalopods, a name that means “head-foot”, because their eight arms appear to sprout directly from their heads. Each arm carries two rows of suckers, and every sucker is packed with sensors that can feel and taste whatever they touch. Scientists have discovered that each arm contains its own cluster of nerve cells, so an arm can keep exploring a crevice even while the octopus’s brain is busy with something else.',
        'Two of the three hearts pump blood through the gills, where it collects oxygen. The third heart pushes blood around the rest of the body. Curiously, this main heart stops beating when the octopus swims, which may explain why octopuses prefer to crawl: swimming simply tires them out.',
        'The animal’s most famous trick is disguise. Its skin is covered in tiny sacs of colour called chromatophores. By stretching or squeezing these sacs, an octopus can turn from speckled brown to ghostly white to vivid orange, matching sand, coral or rock. Some species even change the texture of their skin, raising bumps and ridges so that they look like a lump of weed-covered stone.',
        'Octopuses are also remarkably clever. In aquariums they have been seen unscrewing jars to reach the crab inside, squirting water at lights they dislike, and slipping out of their tanks at night to raid neighbouring ones. One famous escape artist, named Inky, left his tank in New Zealand, crossed the floor and vanished down a drainpipe that led to the sea.',
        'Sadly, for all their brilliance, most octopuses live for only one or two years. Perhaps that is why they are in such a hurry to learn.'
      ],
      questions: [
        { id: 'p4q1', skill: 'e.retrieve', level: 1, q: 'How many hearts does an octopus have?', options: ['Three', 'Two', 'Eight', 'One'], answer: 0, typed: { accept: ['3', 'three'], model: 'Three.' }, explain: 'The first sentence says “an animal with three hearts”.' },
        { id: 'p4q2', skill: 'e.retrieve', level: 2, q: 'What does the word “cephalopod” mean?', options: ['Head-foot', 'Eight arms', 'Sea monster', 'Colour changer'], answer: 0, typed: { keywords: [['head-foot', 'head foot', 'headfoot']], model: 'It means “head-foot”, because the arms seem to grow straight out of the head.' }, explain: 'Paragraph 2 explains the name means “head-foot”.' },
        { id: 'p4q3', skill: 'e.vocab', level: 2, q: 'In paragraph 2, what is a “crevice”?', options: ['A narrow crack or gap', 'A deep ocean', 'A type of fish', 'A kind of nerve cell'], answer: 0, typed: { keywords: [['crack', 'gap', 'narrow', 'hole', 'split', 'opening']], model: 'A narrow crack or gap, for example in a rock.' }, explain: 'A crevice is a narrow opening. The arm can keep feeling inside it.' },
        { id: 'p4q4', skill: 'e.infer', level: 2, q: 'Why do octopuses prefer to crawl rather than swim?', options: ['Their main heart stops when they swim, so swimming tires them out', 'They have no bones, so they cannot swim', 'Crawling helps them taste the sea floor', 'Swimming makes them change colour'], answer: 0, typed: { keywords: [['heart'], ['tire', 'exhaust', 'stops', 'tiring']], need: 2, model: 'Because the main heart stops beating when they swim, so swimming tires them out.' }, explain: 'Paragraph 3 links the stopping heart with the octopus getting tired.' },
        { id: 'p4q5', skill: 'e.retrieve', level: 2, q: 'What are chromatophores?', options: ['Tiny sacs of colour in the skin', 'Rows of suckers on the arms', 'Clusters of nerve cells', 'Bumps and ridges on a rock'], answer: 0, typed: { keywords: [['sac', 'colour', 'skin', 'cell']], model: 'Tiny sacs of colour in the octopus’s skin, which it stretches or squeezes to change colour.' }, explain: 'Paragraph 4: “tiny sacs of colour called chromatophores”.' },
        { id: 'p4q6', skill: 'e.infer', level: 3, q: 'Explain how an arm can keep exploring while the octopus’s brain is busy.', options: ['Each arm has its own cluster of nerve cells, so it can work partly on its own', 'The arms are controlled by the three hearts', 'The suckers can see in the dark', 'The brain is in the arms, not the head'], answer: 0, typed: { keywords: [['nerve', 'own brain', 'own cluster', 'itself', 'independent', 'on its own']], model: 'Each arm contains its own cluster of nerve cells, so it can act partly on its own without waiting for the brain.' }, explain: 'The arms have their own nerve clusters, which lets them act independently.' },
        { id: 'p4q7', skill: 'e.language', level: 3, q: 'The writer calls Inky an “escape artist”. What does this phrase suggest?', options: ['That Inky was skilful and clever at escaping, like a performer', 'That Inky could paint pictures', 'That Inky was caught and put back', 'That Inky was dangerous'], answer: 0, typed: { keywords: [['skil', 'clever', 'expert', 'performer', 'talent', 'good at', 'houdini', 'magician']], model: 'It suggests Inky was skilled and clever at escaping, as if escaping were a performance or talent, like a magician.' }, explain: 'An escape artist is a performer such as Houdini. The phrase makes Inky’s escape sound like a clever, deliberate trick.' },
        { id: 'p4q8', skill: 'e.language', level: 2, q: 'What is the purpose of the first paragraph?', options: ['To grab the reader’s attention with surprising facts before revealing the animal', 'To explain what chromatophores are', 'To describe where octopuses live', 'To warn the reader that octopuses are dangerous'], answer: 0, typed: { keywords: [['attention', 'hook', 'interest', 'surpris', 'curious', 'grab', 'intrigu', 'guess']], model: 'It hooks the reader with a list of surprising facts and makes them curious before revealing the animal at the end.' }, explain: 'Holding back the word “octopus” until the last sentence makes the reader curious. This is a hook.' },
        { id: 'p4q9', skill: 'e.infer', level: 3, q: 'What does the writer suggest in the final sentence?', options: ['That octopuses may learn quickly because their lives are short', 'That octopuses are always rushing around', 'That octopuses are not very clever after all', 'That scientists should hurry up'], answer: 0, typed: { keywords: [['short', 'little time', 'quick', 'fast', 'hurry', 'live', 'years']], model: 'The writer suggests that because octopuses live such short lives, they may need to learn quickly and make the most of their time.' }, explain: '“In such a hurry to learn” connects their cleverness to their short lifespan.' }
      ]
    },
    {
      id: 'p-fox',
      title: 'The Fox at Midnight',
      kind: 'Poem',
      level: 2,
      intro: 'A poem about a visitor to a sleeping town.',
      poem: true,
      text: [
        'The street lamps hum their orange hymn,\nThe houses close their eyes;\nAnd down the hill, on silent feet,\nA russet shadow flies.',
        'He pauses by the dustbin lids,\nA thief in velvet gloves,\nAnd samples, with a connoisseur’s nose,\nThe leftovers he loves.',
        'The moon, a coin dropped in a well,\nSpills silver on his back;\nHe turns, he listens, ears like sails,\nThen melts into the black.',
        'By morning only clues remain:\nA paw-print in the frost,\nA scatter of chicken bones, a smell,\nA dustbin lid, now lost.',
        'The town wakes up and grumbles, “Fox!”\nAnd scrubs the step, and sighs,\nNot knowing that a king passed by\nBeneath the orange skies.'
      ],
      questions: [
        { id: 'p5q1', skill: 'e.vocab', level: 2, q: 'What colour is a “russet” shadow?', options: ['Reddish-brown', 'Pale grey', 'Deep black', 'Bright white'], answer: 0, typed: { keywords: [['red', 'brown', 'orange', 'rust', 'ginger']], model: 'Reddish-brown, the colour of a fox.' }, explain: 'Russet is a reddish-brown colour, which is a clue that the shadow is a fox.' },
        { id: 'p5q2', skill: 'e.language', level: 2, q: '“The houses close their eyes.” Which technique is this and what does it mean?', options: ['Personification: the lights go out as people go to sleep', 'Simile: the houses look like faces', 'Alliteration: the sound of the letter h', 'Rhyme: eyes rhymes with flies'], answer: 0, typed: { keywords: [['personif'], ['lights', 'sleep', 'curtains', 'dark', 'bed']], need: 2, model: 'Personification. The houses are given a human action, closing their eyes, to show the lights going out and curtains closing as everyone goes to sleep.' }, explain: 'Houses cannot really close their eyes. Giving them a human action is personification.' },
        { id: 'p5q3', skill: 'e.language', level: 2, q: 'What does the metaphor “a thief in velvet gloves” suggest about the fox?', options: ['He is sneaky but also graceful and quiet', 'He wears clothes stolen from a shop', 'He is clumsy and noisy', 'He is cold and needs gloves'], answer: 0, typed: { keywords: [['sneak', 'steal', 'thief', 'crafty', 'sly'], ['quiet', 'graceful', 'soft', 'silent', 'elegant', 'smooth', 'gentle']], need: 2, model: 'It suggests he is a sneaky thief, stealing food, but also graceful, soft and silent, like someone wearing velvet gloves.' }, explain: 'A thief steals; velvet is soft and silent. Together they show a sneaky but elegant animal.' },
        { id: 'p5q4', skill: 'e.language', level: 3, q: '“The moon, a coin dropped in a well.” Why is this an effective metaphor?', options: ['The moon looks small, round and silver, and far away as if at the bottom of a well', 'The moon is worth a lot of money', 'The fox has found a coin', 'The well is full of water'], answer: 0, typed: { keywords: [['round', 'silver', 'shiny', 'small', 'far', 'distant', 'bright', 'circle']], model: 'Like a coin, the moon is small, round and silvery, and it seems far away and faint, as if it had fallen to the bottom of a deep well.' }, explain: 'A coin is round and silver like the moon; dropping it in a well makes it seem distant and faint in the dark sky.' },
        { id: 'p5q5', skill: 'e.language', level: 2, q: '“Ears like sails.” What does this simile tell us?', options: ['His ears are large and catch sounds as sails catch the wind', 'His ears are made of cloth', 'He is sailing across the sea', 'His ears are wet'], answer: 0, typed: { keywords: [['big', 'large', 'catch', 'listen', 'sound', 'wind', 'alert', 'pricked', 'up']], model: 'His ears are large and pricked up, catching every sound just as sails catch the wind.' }, explain: 'Sails are large and catch the wind; the fox’s ears are large and catch sound. The simile shows how alert he is.' },
        { id: 'p5q6', skill: 'e.infer', level: 2, q: 'How do the townspeople feel about the fox? Which words show this?', options: ['Annoyed: they grumble, scrub and sigh', 'Delighted: they call him a king', 'Frightened: they hide indoors', 'Curious: they follow his paw-prints'], answer: 0, typed: { keywords: [['annoy', 'cross', 'angry', 'irritat', 'fed up', 'grumpy'], ['grumble', 'scrub', 'sigh']], need: 2, model: 'They are annoyed. “Grumbles”, “scrubs” and “sighs” all show they see him as a nuisance who makes a mess.' }, explain: 'Grumbling and sighing are what people do when they are fed up. They see only the mess.' },
        { id: 'p5q7', skill: 'e.infer', level: 3, q: 'How does the poet feel about the fox, and how do you know?', options: ['Admiring: the poet calls him a king and a connoisseur', 'Angry: the poet lists the mess he leaves', 'Afraid: the poet says he melts into the black', 'Bored: the poet says only clues remain'], answer: 0, typed: { keywords: [['admir', 'respect', 'like', 'love', 'impress', 'fond', 'awe'], ['king', 'connoisseur', 'velvet', 'graceful']], need: 2, model: 'The poet admires the fox. Calling him “a king” and a “connoisseur”, and describing him with velvet and silver, shows respect for his grace and cleverness.' }, explain: 'The poet’s word choices are grand and admiring, in contrast to the grumbling townspeople.' },
        { id: 'p5q8', skill: 'e.language', level: 2, q: 'Which lines rhyme in each verse?', options: ['The second and fourth lines', 'The first and second lines', 'All four lines', 'The first and third lines'], answer: 0, typed: { keywords: [['second and fourth', '2nd and 4th', 'lines 2 and 4', 'two and four', 'abcb']], model: 'The second and fourth lines of each verse rhyme (eyes/flies, gloves/loves). The pattern is ABCB.' }, explain: 'Look at the line endings: eyes/flies, gloves/loves, back/black. Lines two and four rhyme.' },
        { id: 'p5q9', skill: 'e.retrieve', level: 1, q: 'Name two clues the fox leaves behind.', options: ['A paw-print and chicken bones', 'A velvet glove and a coin', 'A sail and a lamp', 'A key and a letter'], answer: 0, typed: { keywords: [['paw', 'bone', 'smell', 'lid']], model: 'A paw-print in the frost, chicken bones, a smell, and a lost dustbin lid.' }, explain: 'Verse four lists the clues: paw-print, chicken bones, a smell and a missing dustbin lid.' }
      ]
    },
    {
      id: 'p-antarctica',
      title: 'A Letter from the Ice',
      kind: 'Letter',
      level: 2,
      intro: 'A scientist writes to her nephew from a research station in Antarctica.',
      text: [
        'Halley Research Station, Antarctica. 14th February.',
        'Dear Sam,',
        'You asked me what it is like to live at the bottom of the world, so here is my honest answer: cold, bright and strangely noisy.',
        'Cold you expected. Today it is minus 28 degrees, which is warm for here, and the wind makes it feel much colder. If I take off my glove to use a camera, my fingers stop working in under a minute, so I have learnt to do everything in thick mittens, including typing this letter (please forgive the mistakes).',
        'Bright you might not have expected. It is summer in Antarctica, which means the sun never sets. It circles the sky all day and all night, and we have to tape black card over the windows of our sleeping pods or nobody would ever sleep. The snow reflects so much light that without goggles you can damage your eyes in an afternoon. The whole continent is a mirror.',
        'And noisy? That surprised me too. I imagined silence, but the ice groans and cracks as it moves, the wind howls through the stilts the station stands on, and the penguins, which nest about two kilometres away, make a racket like a thousand rusty gates. Our station sits on a floating ice shelf, so the ground beneath me is drifting out to sea at about one metre a day. Do not worry; it is a very big shelf.',
        'My job is to measure the air. Every six hours I launch a balloon the size of a car. It carries a tiny box of instruments up to thirty kilometres and sends back readings about temperature and ozone. The data goes to scientists all over the world who are studying how the climate is changing. It is slow, careful work, and some days I would give anything for a hot bath and a proper pizza, but then I step outside, see the light turning the ice pink and gold, and think: nobody else on Earth is seeing this right now.',
        'Give your mum a hug from me, and keep asking questions. The world needs people who want to know how things work.',
        'Lots of love, Auntie Jo'
      ],
      questions: [
        { id: 'p6q1', skill: 'e.retrieve', level: 1, q: 'What is the temperature on the day Jo writes?', options: ['Minus 28 degrees', 'Minus 14 degrees', 'Plus 28 degrees', 'Minus 6 degrees'], answer: 0, typed: { accept: ['-28', 'minus 28', '-28 degrees', 'minus 28 degrees', '-28°c', 'minus twenty-eight', 'minus twenty eight'], model: 'Minus 28 degrees.' }, explain: '“Today it is minus 28 degrees, which is warm for here”.' },
        { id: 'p6q2', skill: 'e.infer', level: 2, q: 'Why do they tape black card over the windows?', options: ['Because the sun never sets, so they need darkness to sleep', 'To keep the penguins from looking in', 'To stop the wind getting through', 'To protect the windows from ice'], answer: 0, typed: { keywords: [['sleep', 'dark'], ['sun', 'never sets', 'light', 'bright']], need: 2, model: 'Because in the Antarctic summer the sun never sets, so they need to block out the light to get dark enough to sleep.' }, explain: 'The card blocks the constant daylight so that people can sleep.' },
        { id: 'p6q3', skill: 'e.vocab', level: 1, q: 'What does “racket” mean in paragraph 6?', options: ['A loud noise', 'A bat for tennis', 'A nest', 'A type of gate'], answer: 0, typed: { keywords: [['noise', 'loud', 'din', 'sound', 'row']], model: 'A loud, unpleasant noise.' }, explain: 'Here racket means a loud noise. The comparison with “a thousand rusty gates” tells you it is not a tennis racket.' },
        { id: 'p6q4', skill: 'e.language', level: 2, q: '“The whole continent is a mirror.” What does this metaphor show?', options: ['The snow reflects huge amounts of light', 'You can see your face in the ice', 'Antarctica is flat and smooth', 'The station is made of glass'], answer: 0, typed: { keywords: [['reflect', 'bright', 'light', 'shine', 'dazzl', 'glare']], model: 'It shows that the snow reflects so much light that the whole land shines and dazzles like a mirror.' }, explain: 'The sentence before explains that the snow reflects enough light to damage your eyes.' },
        { id: 'p6q5', skill: 'e.infer', level: 2, q: 'Why does Jo write “please forgive the mistakes”?', options: ['She is typing while wearing thick mittens', 'She has never written a letter before', 'She is very tired from launching balloons', 'The penguins keep distracting her'], answer: 0, typed: { keywords: [['mitten', 'glove', 'typing', 'cold', 'fingers']], model: 'Because she is typing the letter in thick mittens, which makes it hard to press the right keys.' }, explain: 'She says she does everything in thick mittens, “including typing this letter”.' },
        { id: 'p6q6', skill: 'e.retrieve', level: 1, q: 'How often does Jo launch a weather balloon?', options: ['Every six hours', 'Every six days', 'Once a day', 'Every thirty minutes'], answer: 0, typed: { accept: ['every six hours', 'every 6 hours', '6 hours', 'six hours', 'four times a day', '4 times a day'], model: 'Every six hours.' }, explain: '“Every six hours I launch a balloon the size of a car.”' },
        { id: 'p6q7', skill: 'e.infer', level: 3, q: 'How does Jo feel about her job overall? Use evidence.', options: ['She finds it hard at times but thinks the experience is worth it', 'She hates it and wants to go home immediately', 'She finds it easy and relaxing', 'She is bored because nothing happens'], answer: 0, typed: { keywords: [['worth', 'love', 'amazing', 'special', 'glad', 'privilege', 'lucky', 'enjoy', 'proud'], ['hard', 'slow', 'pizza', 'bath', 'miss', 'difficult', 'tough', 'careful']], need: 2, model: 'She finds it hard and sometimes misses home comforts like a hot bath and pizza, but overall she feels it is worth it because she sees things nobody else on Earth is seeing.' }, explain: 'She admits the work is “slow, careful” and she misses pizza, but the final thought shows wonder and pride.' },
        { id: 'p6q8', skill: 'e.language', level: 2, q: 'Why did Jo write this letter?', options: ['To answer Sam’s question about life in Antarctica', 'To ask Sam to send her a pizza', 'To complain about the penguins', 'To explain how to launch a balloon'], answer: 0, typed: { keywords: [['answer', 'question', 'asked', 'describe', 'tell', 'explain', 'what it is like']], model: 'To answer Sam’s question about what it is like to live in Antarctica, and to encourage him to keep being curious.' }, explain: 'The first line says, “You asked me what it is like... so here is my honest answer.”' },
        { id: 'p6q9', skill: 'e.retrieve', level: 2, q: 'Which phrase shows that the station is not built on solid land?', options: ['“Our station sits on a floating ice shelf”', '“The wind howls through the stilts”', '“The penguins... nest about two kilometres away”', '“The whole continent is a mirror”'], answer: 0, typed: { keywords: [['floating', 'drifting', 'ice shelf', 'out to sea']], model: '“Our station sits on a floating ice shelf” (and “the ground beneath me is drifting out to sea”).' }, explain: 'A floating ice shelf is ice over the sea, not land. The ground is actually drifting.' }
      ]
    },
    {
      id: 'p-clockmaker',
      title: 'The Clockmaker’s Apprentice',
      kind: 'Fiction',
      level: 3,
      intro: 'A story set in Victorian times, when children often left home to learn a trade.',
      text: [
        'In the winter of 1851, when Eli was twelve, he was sent to learn the trade of clockmaking from a Mr Absalom Finch, whose shop stood at the crooked end of Mercer Street. The sign above the door had faded to a ghost of gold, and the window was so crowded with timepieces that passers-by could not see inside. From the pavement, all one heard was ticking: a dense, whispering forest of it.',
        'Mr Finch himself was a tall, stooping man with spectacles pushed up into a nest of white hair, where he invariably forgot them. He spoke little, and when he did it was mostly to the clocks. “Patience,” he would murmur to a stubborn mechanism, as if it were a nervous horse. “Patience, now.”',
        'Eli’s duties, at first, were humble. He swept the floor, fetched coal, and wound the shop’s three hundred and six clocks each morning, a task that took until eleven. He was not permitted to touch a single screw. “A clock,” said Mr Finch, “is a conversation between a hundred tiny parts. Before you may join in, you must learn to listen.”',
        'So Eli listened. Through the long grey afternoons he learnt to hear the difference between the steady tick of a healthy movement and the faint, irregular stumble of one that was failing. He came to know each clock by its voice, as a shepherd knows his flock, and he began, without meaning to, to love them.',
        'It was in March, nearly four months after his arrival, that the mantel clock belonging to the Mayor’s wife was carried in, wrapped in a shawl like an invalid. It had stopped at twenty past four and would not be persuaded to go on. Mr Finch examined it for an hour, muttering, and at last set down his eyeglass with a sigh.',
        '“My hands,” he said, holding them up so that Eli could see the tremor in them, “are no longer equal to this.” He looked at the boy for a long moment. “Yours, however, are.”',
        'Eli felt his heart begin to race, keeping time, it seemed, with every clock in the shop.'
      ],
      questions: [
        { id: 'p7q1', skill: 'e.retrieve', level: 1, q: 'How many clocks did Eli wind each morning?', options: ['306', '360', '136', '316'], answer: 0, typed: { accept: ['306', 'three hundred and six'], model: 'Three hundred and six.' }, explain: 'Paragraph 3: “the shop’s three hundred and six clocks”.' },
        { id: 'p7q2', skill: 'e.vocab', level: 3, q: 'What does “invariably” mean in paragraph 2?', options: ['Always', 'Sometimes', 'Never', 'Suddenly'], answer: 0, typed: { keywords: [['always', 'every time', 'without fail', 'constantly']], model: 'Always, without fail.' }, explain: 'Invariably means it never varies: he always forgot the spectacles were in his hair.' },
        { id: 'p7q3', skill: 'e.vocab', level: 2, q: 'Eli’s duties were “humble”. What does this mean here?', options: ['Simple and unimportant', 'Dangerous', 'Well paid', 'Interesting'], answer: 0, typed: { keywords: [['simple', 'basic', 'lowly', 'unimportant', 'boring', 'ordinary', 'menial', 'small', 'easy']], model: 'Simple, basic jobs that were not important or skilled, such as sweeping and fetching coal.' }, explain: 'Humble duties are lowly, ordinary jobs. The examples (sweeping, fetching coal) confirm it.' },
        { id: 'p7q4', skill: 'e.language', level: 3, q: 'The ticking is described as “a dense, whispering forest”. What does this metaphor suggest?', options: ['There were so many clocks that their quiet ticking surrounded you like trees in a thick forest', 'The shop was built from wood', 'The clocks were hidden among trees', 'The ticking was very loud and frightening'], answer: 0, typed: { keywords: [['many', 'lots', 'crowded', 'surround', 'thick', 'everywhere', 'hundreds'], ['quiet', 'soft', 'whisper', 'gentle']], need: 2, model: 'It suggests there were so many clocks that their soft ticking surrounded you on all sides, like being among the trees of a thick forest.' }, explain: '“Dense” and “forest” suggest great numbers, and “whispering” suggests the sound was soft but everywhere.' },
        { id: 'p7q5', skill: 'e.infer', level: 2, q: 'Why did Mr Finch refuse to let Eli touch the clocks at first?', options: ['He believed Eli first had to learn to listen and understand how clocks work', 'He thought Eli would steal them', 'He did not like Eli', 'The clocks were too heavy for a boy'], answer: 0, typed: { keywords: [['listen', 'understand', 'learn', 'patien', 'ready', 'first']], model: 'Because he believed a clock had to be understood before it could be touched. Eli needed to learn to listen first.' }, explain: 'Mr Finch explains: “Before you may join in, you must learn to listen.”' },
        { id: 'p7q6', skill: 'e.language', level: 2, q: 'The clock is “wrapped in a shawl like an invalid”. What does this simile suggest about how the clock is treated?', options: ['It is treated like a sick person who is precious and needs care', 'It is treated like a baby who needs feeding', 'It is treated like rubbish', 'It is too cold in the shop'], answer: 0, typed: { keywords: [['sick', 'ill', 'patient', 'invalid', 'poorly', 'unwell'], ['care', 'gentle', 'precious', 'loved', 'valuable', 'treasured', 'important']], need: 2, model: 'It suggests the clock is treated like a sick person: carefully and tenderly, as if it were precious and alive.' }, explain: 'An invalid is someone who is ill. Wrapping the clock like one shows it is valued and gently cared for.' },
        { id: 'p7q7', skill: 'e.infer', level: 3, q: 'What does Mr Finch mean when he says, “Yours, however, are”?', options: ['Eli’s hands are steady enough to repair the clock, so he trusts Eli to do it', 'Eli’s hands are dirty and need washing', 'Eli must hold the clock while Mr Finch works', 'Eli should stop sweeping the floor'], answer: 0, typed: { keywords: [['steady', 'trust', 'ready', 'repair', 'fix', 'mend', 'capable', 'able', 'let eli', 'eli can']], model: 'He means that Eli’s hands are steady, unlike his own shaking ones, so he trusts Eli to repair the clock. He is telling Eli he is ready.' }, explain: 'Mr Finch has just shown the tremor in his hands. “Yours are” means Eli’s hands are equal to the task.' },
        { id: 'p7q8', skill: 'e.language', level: 3, q: 'What is the effect of the final sentence?', options: ['It shows Eli’s excitement and nerves, and links his heartbeat to the clocks he has come to love', 'It shows that Eli is frightened of Mr Finch', 'It tells us the time', 'It shows Eli wants to leave the shop'], answer: 0, typed: { keywords: [['excite', 'nervous', 'thrill', 'fast', 'race', 'proud', 'anxious'], ['clock', 'tick', 'time', 'belong', 'part of']], need: 2, model: 'It shows Eli’s excitement and nerves: his heart races like a clock ticking. Linking his heartbeat to the clocks suggests he now belongs there.' }, explain: 'A racing heart shows strong feeling; “keeping time” with the clocks suggests Eli has become part of the shop.' },
        { id: 'p7q9', skill: 'e.retrieve', level: 2, q: 'In which month did the Mayor’s wife’s clock arrive?', options: ['March', 'January', 'December', 'November'], answer: 0, typed: { accept: ['march'], model: 'March, nearly four months after Eli arrived.' }, explain: '“It was in March, nearly four months after his arrival”.' }
      ]
    },
    {
      id: 'p-park',
      title: 'Avon Wildlife Park: Visitor Guide',
      kind: 'Information (creative comprehension)',
      level: 2,
      intro: 'QEH-style creative comprehension: read the leaflet, the tables and the map notes, then answer.',
      data: true,
      text: [
        'Welcome to Avon Wildlife Park, home to over 300 animals from five continents. The park is open every day except Christmas Day. Last entry is one hour before closing.',
        '<table class="data-table"><caption>Opening times</caption><tr><th>Season</th><th>Dates</th><th>Open</th><th>Close</th></tr><tr><td>Summer</td><td>1 April to 30 September</td><td>9:30</td><td>18:00</td></tr><tr><td>Winter</td><td>1 October to 31 March</td><td>10:00</td><td>16:30</td></tr></table>',
        '<table class="data-table"><caption>Ticket prices (at the gate)</caption><tr><th>Ticket</th><th>Price</th></tr><tr><td>Adult</td><td>£18</td></tr><tr><td>Child (3 to 15)</td><td>£12</td></tr><tr><td>Under 3</td><td>Free</td></tr><tr><td>Family (2 adults + 2 children)</td><td>£54</td></tr></table><p>Book online and save 10% on every ticket.</p>',
        '<table class="data-table"><caption>Daily talks and feeds</caption><tr><th>Animal</th><th>Times</th><th>Where</th></tr><tr><td>Penguins</td><td>11:00 and 15:00</td><td>Penguin Cove (north-east)</td></tr><tr><td>Lemurs</td><td>11:30</td><td>Lemur Walk (north)</td></tr><tr><td>Giraffes</td><td>13:00</td><td>Savannah (west)</td></tr><tr><td>Otters</td><td>14:15</td><td>Riverbank (south, by the entrance)</td></tr></table>',
        'Getting around: the entrance is at the south of the park. Riverbank is a two-minute walk from the entrance. Penguin Cove and Lemur Walk are both about fifteen minutes from the entrance; they are five minutes from each other. The Savannah is twenty minutes from the entrance and twenty-five minutes from Penguin Cove. The Treetop Café, in the centre of the park, is ten minutes from everywhere.',
        'Rules: please do not feed the animals, keep to the paths, and leave balloons and footballs at home.'
      ],
      questions: [
        { id: 'p8q1', skill: 'e.retrieve', level: 1, q: 'What time does the park close on 15 November?', options: ['16:30', '18:00', '10:00', '15:30'], answer: 0, typed: { accept: ['16:30', '4:30', '4.30', '4:30pm', '4.30pm', 'half past four', '16.30'], model: '16:30, because November is in the winter season.' }, explain: 'November falls between 1 October and 31 March, so winter hours apply: closing at 16:30.' },
        { id: 'p8q2', skill: 'e.retrieve', level: 2, q: 'What is the latest time you can enter the park on 20 July?', options: ['17:00', '18:00', '16:30', '15:30'], answer: 0, typed: { accept: ['17:00', '5pm', '5 pm', '5:00', '5.00', '5:00pm', '5 o\'clock', '17.00'], model: '17:00. July is summer, so closing is 18:00 and last entry is one hour earlier.' }, explain: 'Summer closing is 18:00 and last entry is one hour before closing.' },
        { id: 'p8q3', skill: 'e.infer', level: 2, q: 'A family of two adults and three children pays at the gate. What is the cheapest way to pay?', options: ['A family ticket plus one child: £66', 'Two adults and three children: £72', 'Three child tickets and a family ticket: £90', 'Five adult tickets: £90'], answer: 0, typed: { accept: ['66', '£66', '66 pounds', 'family ticket plus one child', 'family ticket and one child, £66'], model: 'A family ticket (£54) plus one extra child (£12) = £66. Buying separately would cost £72.' }, explain: 'Family ticket £54 covers 2 adults and 2 children; add one child at £12 to make £66. Separate tickets cost 2 × £18 + 3 × £12 = £72.' },
        { id: 'p8q4', skill: 'e.infer', level: 2, q: 'How much does an adult ticket cost if booked online?', options: ['£16.20', '£17.00', '£16.00', '£19.80'], answer: 0, typed: { accept: ['16.20', '£16.20', '16.2', '£16.2'], model: '£16.20 (10% of £18 is £1.80, and £18 − £1.80 = £16.20).' }, explain: '10% of £18 is £1.80. £18 minus £1.80 is £16.20.' },
        { id: 'p8q5', skill: 'e.infer', level: 2, q: 'You arrive at the entrance at 10:40 and walk straight to the nearest feed you can reach in time. Which is it?', options: ['Penguins at 11:00', 'Lemurs at 11:30', 'Otters at 14:15', 'Giraffes at 13:00'], answer: 0, typed: { keywords: [['penguin']], model: 'The penguins at 11:00. Penguin Cove is fifteen minutes away, so you arrive at 10:55, in time.' }, explain: 'Penguin Cove is 15 minutes away: 10:40 + 15 minutes = 10:55, just before the 11:00 feed.' },
        { id: 'p8q6', skill: 'e.infer', level: 3, q: 'After the 11:00 penguin feed (which lasts 20 minutes), can you reach the lemur talk on time?', options: ['Yes: it is a five-minute walk and you arrive at 11:25', 'No: Lemur Walk is fifteen minutes away', 'No: the lemur talk is at 11:00', 'Yes, but only if you run'], answer: 0, typed: { keywords: [['yes']], model: 'Yes. The feed ends at 11:20, Lemur Walk is five minutes from Penguin Cove, so you arrive at 11:25 for the 11:30 talk.' }, explain: '11:00 + 20 minutes = 11:20. Add the five-minute walk: 11:25, before 11:30.' },
        { id: 'p8q7', skill: 'e.retrieve', level: 1, q: 'How long is it between the two penguin feeds?', options: ['4 hours', '3 hours', '5 hours', '4 hours 30 minutes'], answer: 0, typed: { accept: ['4 hours', '4', 'four hours', '240 minutes'], model: 'Four hours (11:00 to 15:00).' }, explain: 'From 11:00 to 15:00 is four hours.' },
        { id: 'p8q8', skill: 'e.infer', level: 2, q: 'Which of these statements is true?', options: ['The otters are fed close to the entrance', 'The park is open on Christmas Day', 'Children under 3 pay £12', 'The Savannah is five minutes from Penguin Cove'], answer: 0, typed: { keywords: [['otter']], model: 'The otters are fed at Riverbank, which is by the entrance.' }, explain: 'Riverbank is “south, by the entrance”. The park is closed on Christmas Day, under 3s are free, and the Savannah is 25 minutes from Penguin Cove.' }
      ]
    }
  ];

  /* ------------------------------------------------------------------ */
  /* Spelling, punctuation and grammar bank (multiple choice)            */
  /* ------------------------------------------------------------------ */

  const SPAG = [
    // Punctuation
    { id: 's1', skill: 'e.punct', level: 1, q: 'Which sentence is punctuated correctly?', options: ['“Hurry up,” said Mum, “or we will miss the bus.”', '“Hurry up” said Mum, “or we will miss the bus.”', '“Hurry up,” said Mum “or we will miss the bus”.', 'Hurry up, said Mum, “or we will miss the bus.”'], answer: 0, explain: 'Speech needs a comma before the closing speech mark, a comma after “said Mum”, and the full stop inside the final speech marks.' },
    { id: 's2', skill: 'e.punct', level: 1, q: 'Which sentence uses the apostrophe correctly?', options: ['The dog wagged its tail.', 'The dog wagged it’s tail.', 'The dog’s wagged its tail.', 'The dogs’ wagged its tail.'], answer: 0, explain: '“Its” (belonging to it) has no apostrophe. “It’s” always means “it is” or “it has”.' },
    { id: 's3', skill: 'e.punct', level: 2, q: 'Which sentence uses the apostrophe correctly?', options: ['The children’s coats were soaked.', 'The childrens’ coats were soaked.', 'The childrens coat’s were soaked.', 'The children’s coat’s were soaked.'], answer: 0, explain: '“Children” is already plural, so the apostrophe goes before the s: children’s. Plural coats never needs an apostrophe.' },
    { id: 's4', skill: 'e.punct', level: 2, q: 'Where should the commas go? “My cousin who lives in Leeds is coming to stay.”', options: ['My cousin, who lives in Leeds, is coming to stay.', 'My cousin who lives, in Leeds, is coming to stay.', 'My cousin who lives in Leeds, is coming to stay.', 'My, cousin who lives in Leeds is coming, to stay.'], answer: 0, explain: '“Who lives in Leeds” is extra information, so it sits between a pair of commas.' },
    { id: 's5', skill: 'e.punct', level: 2, q: 'Which sentence uses a colon correctly?', options: ['You will need three things: a torch, a map and a sense of humour.', 'You will need: three things, a torch, a map and a sense of humour.', 'You will need three things, a torch: a map and a sense of humour.', 'You: will need three things, a torch, a map and a sense of humour.'], answer: 0, explain: 'A colon introduces a list after a complete sentence.' },
    { id: 's6', skill: 'e.punct', level: 3, q: 'Which sentence uses a semicolon correctly?', options: ['The rain had stopped; the pitch was still a swamp.', 'The rain had stopped; and the pitch was still a swamp.', 'The rain; had stopped the pitch was still a swamp.', 'Because the rain had stopped; the pitch was still a swamp.'], answer: 0, explain: 'A semicolon joins two complete sentences that are closely related, without a joining word.' },
    { id: 's7', skill: 'e.punct', level: 1, q: 'Which sentence needs a question mark?', options: ['Have you seen my keys', 'I wonder where my keys are', 'She asked where her keys were', 'Find my keys, please'], answer: 0, explain: 'Only a direct question takes a question mark. “I wonder where...” is a statement.' },
    { id: 's8', skill: 'e.punct', level: 2, q: 'Which sentence uses the comma to avoid confusion?', options: ['Let’s eat, Grandma.', 'Let’s eat Grandma.', 'Let’s, eat Grandma.', 'Let’s eat Grandma,'], answer: 0, explain: 'The comma shows you are speaking to Grandma, not planning to eat her.' },
    { id: 's9', skill: 'e.punct', level: 2, q: 'Which sentence is punctuated correctly?', options: ['Although it was late, nobody wanted to go home.', 'Although it was late nobody, wanted to go home.', 'Although, it was late nobody wanted to go home.', 'Although it was late nobody wanted, to go home.'], answer: 0, explain: 'When a subordinate clause (Although it was late) comes first, a comma separates it from the main clause.' },
    { id: 's10', skill: 'e.punct', level: 3, q: 'Which sentence uses brackets (parenthesis) correctly?', options: ['The museum (which opened in 1902) is free on Sundays.', 'The museum which (opened in 1902) is free on Sundays.', 'The museum (which opened in 1902 is free) on Sundays.', '(The museum) which opened in 1902 is free on Sundays.'], answer: 0, explain: 'Brackets hold extra information that could be removed, leaving a complete sentence.' },
    { id: 's11', skill: 'e.punct', level: 2, q: 'Which sentence uses the possessive apostrophe correctly for more than one teacher?', options: ['The teachers’ staffroom was tidy.', 'The teacher’s staffroom was tidy.', 'The teachers staffroom’ was tidy.', 'The teachers’s staffroom was tidy.'], answer: 0, explain: 'For a plural ending in s, the apostrophe goes after the s: teachers’.' },
    { id: 's12', skill: 'e.punct', level: 2, q: 'Which sentence uses a hyphen correctly?', options: ['A well-known actor opened the fete.', 'A well known-actor opened the fete.', 'A well-known-actor opened the fete.', 'A-well known actor opened the fete.'], answer: 0, explain: '“Well-known” is a compound adjective describing the actor, so it is hyphenated.' },

    // Grammar
    { id: 's20', skill: 'e.grammar', level: 1, q: 'Which word is the verb in this sentence? “The enormous dragon snored loudly.”', options: ['snored', 'enormous', 'dragon', 'loudly'], answer: 0, explain: 'The verb is the doing or being word. Snored is what the dragon did.' },
    { id: 's21', skill: 'e.grammar', level: 1, q: 'Which word is an adverb? “She carefully lifted the fragile vase.”', options: ['carefully', 'fragile', 'vase', 'lifted'], answer: 0, explain: 'Adverbs describe how a verb is done. Carefully tells us how she lifted.' },
    { id: 's22', skill: 'e.grammar', level: 2, q: 'Which sentence is written in the past tense?', options: ['The team trained every evening before the final.', 'The team trains every evening before the final.', 'The team will train every evening before the final.', 'The team is training every evening before the final.'], answer: 0, explain: '“Trained” is the past tense form.' },
    { id: 's23', skill: 'e.grammar', level: 2, q: 'Which sentence is grammatically correct?', options: ['Neither of the boys was ready.', 'Neither of the boys were ready.', 'Neither of the boy was ready.', 'Neither the boys was ready.'], answer: 0, explain: '“Neither” is singular, so it takes “was”.' },
    { id: 's24', skill: 'e.grammar', level: 2, q: 'Which word is a pronoun? “After lunch, they walked to the park.”', options: ['they', 'lunch', 'walked', 'park'], answer: 0, explain: 'A pronoun stands in for a noun. “They” replaces the people’s names.' },
    { id: 's25', skill: 'e.grammar', level: 2, q: 'Which sentence contains a subordinate clause?', options: ['When the bell rang, everyone rushed outside.', 'The bell rang and everyone rushed outside.', 'Everyone rushed outside.', 'The bell rang loudly.'], answer: 0, explain: '“When the bell rang” cannot stand alone as a sentence, so it is a subordinate clause.' },
    { id: 's26', skill: 'e.grammar', level: 3, q: 'Which sentence is in the passive voice?', options: ['The window was broken by the ball.', 'The ball broke the window.', 'The ball is breaking the window.', 'Someone broke the window with a ball.'], answer: 0, explain: 'In the passive voice the subject (the window) has the action done to it.' },
    { id: 's27', skill: 'e.grammar', level: 2, q: 'Which is the correct word? “There are ___ apples than yesterday.”', options: ['fewer', 'less', 'least', 'lesser'], answer: 0, explain: 'Use “fewer” for things you can count (apples) and “less” for things you cannot (water).' },
    { id: 's28', skill: 'e.grammar', level: 2, q: 'Which word is a conjunction? “I wanted to play, but it was raining.”', options: ['but', 'wanted', 'raining', 'play'], answer: 0, explain: 'A conjunction joins two parts of a sentence. “But” joins the two clauses.' },
    { id: 's29', skill: 'e.grammar', level: 1, q: 'Which word is an adjective? “A mysterious parcel arrived this morning.”', options: ['mysterious', 'parcel', 'arrived', 'morning'], answer: 0, explain: 'Adjectives describe nouns. Mysterious describes the parcel.' },
    { id: 's30', skill: 'e.grammar', level: 3, q: 'Which sentence uses a modal verb?', options: ['You should finish your homework first.', 'You finish your homework first.', 'You finished your homework first.', 'You are finishing your homework first.'], answer: 0, explain: 'Modal verbs (should, could, might, must, will) show how likely or necessary something is.' },
    { id: 's31', skill: 'e.grammar', level: 2, q: 'Which sentence is correct?', options: ['My sister and I went swimming.', 'Me and my sister went swimming.', 'My sister and me went swimming.', 'Myself and my sister went swimming.'], answer: 0, explain: 'Take away “my sister and”: you would say “I went swimming”, not “me went swimming”.' },
    { id: 's32', skill: 'e.grammar', level: 2, q: 'Which sentence is a command?', options: ['Close the door quietly.', 'Did you close the door?', 'The door is closed.', 'What a heavy door!'], answer: 0, explain: 'A command starts with an imperative verb (Close) and tells someone to do something.' },
    { id: 's33', skill: 'e.grammar', level: 3, q: 'Which sentence contains a relative clause?', options: ['The boy who won the race is my cousin.', 'The boy won the race and he is my cousin.', 'My cousin won the race.', 'The race was won by my cousin.'], answer: 0, explain: '“Who won the race” is a relative clause: it starts with a relative pronoun (who) and adds information about the boy.' },
    { id: 's34', skill: 'e.grammar', level: 2, q: 'Choose the correct word: “The weather ___ been terrible all week.”', options: ['has', 'have', 'having', 'had been'], answer: 0, explain: '“Weather” is singular, so it takes “has”.' },
    { id: 's35', skill: 'e.grammar', level: 3, q: 'Which word is a preposition? “The cat hid beneath the table.”', options: ['beneath', 'cat', 'hid', 'table'], answer: 0, explain: 'Prepositions show position or relationship: beneath, under, beside, between.' },
    { id: 's36', skill: 'e.grammar', level: 1, q: 'Which word is a noun? “The old lighthouse flashed bravely.”', options: ['lighthouse', 'old', 'flashed', 'bravely'], answer: 0, explain: 'A noun names a person, place or thing. Lighthouse is a thing.' },
    { id: 's37', skill: 'e.grammar', level: 2, q: 'Which sentence uses the correct form of the verb?', options: ['She has written three letters.', 'She has wrote three letters.', 'She have written three letters.', 'She has writed three letters.'], answer: 0, explain: 'After “has”, use the past participle: written.' },
    { id: 's38', skill: 'e.grammar', level: 3, q: 'Which sentence is written formally?', options: ['We would be grateful if you could reply promptly.', 'Get back to us quick, yeah?', 'Can you reply ASAP?', 'Hit us up when you can.'], answer: 0, explain: 'Formal writing avoids slang and contractions and uses polite, complete sentences.' },

    // Spelling and word choice
    { id: 's40', skill: 'e.spelling', level: 1, q: 'Which word is spelt correctly?', options: ['separate', 'seperate', 'separete', 'sepperate'], answer: 0, explain: 'Remember: there is “a rat” in sep-a-rat-e.' },
    { id: 's41', skill: 'e.spelling', level: 1, q: 'Which word is spelt correctly?', options: ['definitely', 'definately', 'definitly', 'defiantly'], answer: 0, explain: 'Definitely has “finite” in the middle. Defiantly is a different word.' },
    { id: 's42', skill: 'e.spelling', level: 2, q: 'Which word is spelt correctly?', options: ['necessary', 'neccessary', 'necesary', 'nessesary'], answer: 0, explain: 'One collar, two sleeves: one c, two s.' },
    { id: 's43', skill: 'e.spelling', level: 2, q: 'Which word is spelt correctly?', options: ['embarrass', 'embarass', 'embbarass', 'emmbarass'], answer: 0, explain: 'Embarrass has two r and two s.' },
    { id: 's44', skill: 'e.spelling', level: 1, q: 'Choose the correct word: “The twins left ___ bags on the bus.”', options: ['their', 'there', 'they’re', 'theirs'], answer: 0, explain: '“Their” shows belonging. “There” is a place; “they’re” means they are.' },
    { id: 's45', skill: 'e.spelling', level: 2, q: 'Choose the correct word: “The ___ of the school welcomed the visitors.”', options: ['principal', 'principle', 'prinsiple', 'princeple'], answer: 0, explain: 'The principal (a person) is your pal. A principle is a rule or belief.' },
    { id: 's46', skill: 'e.spelling', level: 2, q: 'Choose the correct word: “The medicine had no ___ at all.”', options: ['effect', 'affect', 'efect', 'affekt'], answer: 0, explain: '“Effect” is usually a noun (a result). “Affect” is usually a verb (to influence).' },
    { id: 's47', skill: 'e.spelling', level: 2, q: 'Which word is spelt correctly?', options: ['accommodation', 'accomodation', 'acommodation', 'acomodation'], answer: 0, explain: 'Accommodation has two c and two m: room for everyone.' },
    { id: 's48', skill: 'e.spelling', level: 3, q: 'Which word is spelt correctly?', options: ['conscience', 'concience', 'consience', 'conscence'], answer: 0, explain: 'Conscience: con + science.' },
    { id: 's49', skill: 'e.spelling', level: 1, q: 'Choose the correct word: “I ___ the whole cake!”', options: ['ate', 'eight', 'eat', 'eaten'], answer: 0, explain: '“Ate” is the past tense of eat. “Eight” is the number.' },
    { id: 's50', skill: 'e.spelling', level: 2, q: 'Which word is spelt correctly?', options: ['rhythm', 'rythm', 'rhythem', 'rhytm'], answer: 0, explain: 'Rhythm Helps Your Two Hips Move.' },
    { id: 's51', skill: 'e.spelling', level: 2, q: 'Choose the correct word: “The weather was ___ than yesterday.”', options: ['worse', 'worst', 'worser', 'more worse'], answer: 0, explain: 'Comparing two things uses “worse”; “worst” is for three or more.' },
    { id: 's52', skill: 'e.spelling', level: 3, q: 'Which word is spelt correctly?', options: ['mischievous', 'mischievious', 'mischeivous', 'mischivous'], answer: 0, explain: 'Mischievous has only three syllables: mis-chie-vous.' },
    { id: 's53', skill: 'e.spelling', level: 2, q: 'Which word is spelt correctly?', options: ['beginning', 'begining', 'beggining', 'beginnig'], answer: 0, explain: 'Double the n when adding -ing to begin.' },
    { id: 's54', skill: 'e.spelling', level: 3, q: 'Choose the correct word: “The ___ library was silent.”', options: ['stationary', 'stationery', 'stationairy', 'stationry'], answer: 0, explain: 'Stationary (not moving) has an “a”; stationery (paper and pens) has an “e” for envelope. A library does not move.' },
    { id: 's55', skill: 'e.spelling', level: 1, q: 'Which word is spelt correctly?', options: ['believe', 'beleive', 'belive', 'bilieve'], answer: 0, explain: 'I before e, except after c: believe.' },
    { id: 's56', skill: 'e.spelling', level: 2, q: 'Which word is spelt correctly?', options: ['receive', 'recieve', 'receeve', 'reseive'], answer: 0, explain: 'After c, it is ei: receive.' },
    { id: 's57', skill: 'e.spelling', level: 3, q: 'Which prefix makes the opposite of “responsible”?', options: ['irresponsible', 'unresponsible', 'disresponsible', 'inresponsible'], answer: 0, explain: 'Words beginning with r usually take the prefix ir-: irresponsible, irregular.' },
    { id: 's58', skill: 'e.spelling', level: 2, q: 'Which word is spelt correctly?', options: ['disappear', 'dissapear', 'disapear', 'dissappear'], answer: 0, explain: 'Dis + appear: one s, two p.' }
  ];

  /* ------------------------------------------------------------------ */
  /* Graded vocabulary (synonyms, antonyms, cloze, anagrams)             */
  /* ------------------------------------------------------------------ */
  // w: word, d: definition, s: synonyms, a: antonym, eg: sentence with ___ gap

  const VOCAB = [
    // Level 1
    { w: 'enormous', l: 1, d: 'very large', s: ['huge', 'gigantic', 'massive'], a: 'tiny', eg: 'An ___ wave crashed over the harbour wall.' },
    { w: 'ancient', l: 1, d: 'very old', s: ['old', 'antique', 'age-old'], a: 'modern', eg: 'The ___ castle had stood for a thousand years.' },
    { w: 'rapid', l: 1, d: 'very fast', s: ['quick', 'swift', 'speedy'], a: 'slow', eg: 'The ___ river swept the boat downstream.' },
    { w: 'fragile', l: 1, d: 'easily broken', s: ['delicate', 'breakable', 'flimsy'], a: 'sturdy', eg: 'Handle the ___ vase with care.' },
    { w: 'furious', l: 1, d: 'extremely angry', s: ['angry', 'enraged', 'livid'], a: 'calm', eg: 'Dad was ___ when he saw the broken window.' },
    { w: 'timid', l: 1, d: 'shy and easily frightened', s: ['shy', 'nervous', 'fearful'], a: 'bold', eg: 'The ___ kitten hid behind the sofa.' },
    { w: 'brave', l: 1, d: 'ready to face danger', s: ['courageous', 'fearless', 'bold'], a: 'cowardly', eg: 'The ___ firefighter ran into the burning house.' },
    { w: 'gloomy', l: 1, d: 'dark or sad', s: ['dismal', 'dreary', 'miserable'], a: 'cheerful', eg: 'A ___ fog hung over the ___ streets.' },
    { w: 'vanish', l: 1, d: 'to disappear suddenly', s: ['disappear', 'fade', 'evaporate'], a: 'appear', eg: 'The magician made the rabbit ___ in a puff of smoke.' },
    { w: 'gigantic', l: 1, d: 'extremely big', s: ['enormous', 'huge', 'colossal'], a: 'minute', eg: 'A ___ footprint was pressed into the mud.' },
    { w: 'cautious', l: 1, d: 'careful to avoid danger', s: ['careful', 'wary', 'watchful'], a: 'reckless', eg: 'Be ___ when you cross the icy road.' },
    { w: 'abandon', l: 1, d: 'to leave behind for good', s: ['desert', 'leave', 'forsake'], a: 'keep', eg: 'The crew had to ___ the sinking ship.' },
    { w: 'weary', l: 1, d: 'very tired', s: ['tired', 'exhausted', 'drained'], a: 'energetic', eg: 'The ___ travellers collapsed into their beds.' },
    { w: 'peculiar', l: 1, d: 'strange or unusual', s: ['odd', 'strange', 'unusual'], a: 'ordinary', eg: 'A ___ smell drifted out of the laboratory.' },
    { w: 'generous', l: 1, d: 'happy to give to others', s: ['kind', 'giving', 'unselfish'], a: 'selfish', eg: 'The ___ baker gave away his leftover bread.' },
    { w: 'miserable', l: 1, d: 'very unhappy', s: ['unhappy', 'wretched', 'sorrowful'], a: 'joyful', eg: 'Stuck indoors with a cold, Sam felt thoroughly ___.' },
    { w: 'grasp', l: 1, d: 'to hold firmly or to understand', s: ['grip', 'clutch', 'seize'], a: 'release', eg: 'She managed to ___ the rope just in time.' },
    { w: 'drenched', l: 1, d: 'completely soaked', s: ['soaked', 'sodden', 'saturated'], a: 'dry', eg: 'We were ___ by the time we reached the bus stop.' },
    { w: 'feeble', l: 1, d: 'weak', s: ['weak', 'frail', 'faint'], a: 'strong', eg: 'The old dog gave a ___ wag of its tail.' },
    { w: 'glance', l: 1, d: 'a quick look', s: ['peek', 'glimpse', 'look'], a: 'stare', eg: 'He gave a quick ___ at the clock.' },
    { w: 'scarce', l: 1, d: 'in short supply', s: ['rare', 'limited', 'sparse'], a: 'plentiful', eg: 'Food was ___ during the long winter.' },
    { w: 'commence', l: 1, d: 'to begin', s: ['begin', 'start', 'launch'], a: 'finish', eg: 'The race will ___ at exactly ten o’clock.' },
    { w: 'tremble', l: 1, d: 'to shake with fear or cold', s: ['shake', 'shiver', 'quiver'], a: 'steady', eg: 'His hands began to ___ as he opened the envelope.' },
    { w: 'reluctant', l: 1, d: 'unwilling', s: ['unwilling', 'hesitant', 'loath'], a: 'eager', eg: 'The ___ puppy refused to go out in the rain.' },
    { w: 'plead', l: 1, d: 'to beg', s: ['beg', 'implore', 'appeal'], a: 'demand', eg: '“Please, just five more minutes,” he began to ___.' },
    { w: 'ascend', l: 1, d: 'to climb or go up', s: ['climb', 'rise', 'mount'], a: 'descend', eg: 'The balloon began to ___ slowly into the clouds.' },
    { w: 'hostile', l: 1, d: 'unfriendly', s: ['unfriendly', 'aggressive', 'antagonistic'], a: 'friendly', eg: 'The ___ crowd booed the referee.' },
    { w: 'dim', l: 1, d: 'not bright', s: ['faint', 'dull', 'murky'], a: 'bright', eg: 'In the ___ light, she could barely read the map.' },
    { w: 'idle', l: 1, d: 'doing nothing', s: ['lazy', 'inactive', 'unoccupied'], a: 'busy', eg: 'The machines stood ___ during the strike.' },
    { w: 'cunning', l: 1, d: 'clever at tricking people', s: ['sly', 'crafty', 'wily'], a: 'honest', eg: 'The ___ fox tricked the crow into dropping the cheese.' },
    { w: 'tranquil', l: 1, d: 'calm and peaceful', s: ['calm', 'peaceful', 'serene'], a: 'chaotic', eg: 'The lake was ___ in the early morning.' },
    { w: 'grief', l: 1, d: 'deep sadness', s: ['sorrow', 'sadness', 'heartache'], a: 'joy', eg: 'Her ___ at losing the old dog lasted for weeks.' },
    { w: 'swift', l: 1, d: 'moving quickly', s: ['fast', 'rapid', 'speedy'], a: 'sluggish', eg: 'With one ___ movement, the goalkeeper caught the ball.' },
    { w: 'obvious', l: 1, d: 'easy to see or understand', s: ['clear', 'plain', 'evident'], a: 'hidden', eg: 'It was ___ from his grin that he had won.' },
    { w: 'astonished', l: 1, d: 'greatly surprised', s: ['amazed', 'astounded', 'stunned'], a: 'unimpressed', eg: 'The crowd was ___ when the elephant stood on one leg.' },
    { w: 'fierce', l: 1, d: 'violent and frightening', s: ['savage', 'ferocious', 'wild'], a: 'gentle', eg: 'A ___ wind tore the roof from the shed.' },
    { w: 'damp', l: 1, d: 'slightly wet', s: ['moist', 'clammy', 'humid'], a: 'arid', eg: 'The cellar walls were cold and ___.' },
    { w: 'mimic', l: 1, d: 'to copy', s: ['copy', 'imitate', 'impersonate'], a: 'invent', eg: 'The parrot could ___ the ring of the telephone.' },
    { w: 'persist', l: 1, d: 'to keep going despite difficulty', s: ['continue', 'persevere', 'endure'], a: 'quit', eg: 'If you ___ with practice, you will improve.' },
    { w: 'summit', l: 1, d: 'the top of a mountain', s: ['peak', 'top', 'crest'], a: 'base', eg: 'They reached the ___ just as the sun rose.' },

    // Level 2
    { w: 'reluctantly', l: 2, d: 'unwillingly', s: ['unwillingly', 'grudgingly', 'hesitantly'], a: 'eagerly', eg: 'Tom ___ handed over the last biscuit.' },
    { w: 'abundant', l: 2, d: 'existing in large amounts', s: ['plentiful', 'ample', 'copious'], a: 'scarce', eg: 'Blackberries were ___ along the lane in September.' },
    { w: 'benevolent', l: 2, d: 'kind and generous', s: ['kind', 'generous', 'charitable'], a: 'cruel', eg: 'The ___ king gave bread to every family in the town.' },
    { w: 'conceal', l: 2, d: 'to hide', s: ['hide', 'cover', 'disguise'], a: 'reveal', eg: 'She tried to ___ the torn page inside her book.' },
    { w: 'diligent', l: 2, d: 'hard-working and careful', s: ['hard-working', 'industrious', 'conscientious'], a: 'lazy', eg: 'The ___ student checked every answer twice.' },
    { w: 'exasperated', l: 2, d: 'extremely annoyed', s: ['annoyed', 'frustrated', 'irritated'], a: 'pleased', eg: 'The ___ teacher sighed for the tenth time that morning.' },
    { w: 'flourish', l: 2, d: 'to grow well or succeed', s: ['thrive', 'prosper', 'bloom'], a: 'wither', eg: 'With plenty of sunshine, the tomatoes began to ___.' },
    { w: 'hesitate', l: 2, d: 'to pause before doing something', s: ['pause', 'waver', 'delay'], a: 'proceed', eg: 'Do not ___ to ask if you need help.' },
    { w: 'immense', l: 2, d: 'extremely large', s: ['vast', 'huge', 'enormous'], a: 'tiny', eg: 'An ___ crowd gathered outside the stadium.' },
    { w: 'jubilant', l: 2, d: 'full of happiness and triumph', s: ['overjoyed', 'elated', 'triumphant'], a: 'despondent', eg: 'The ___ fans sang all the way home.' },
    { w: 'lenient', l: 2, d: 'not strict', s: ['easy-going', 'tolerant', 'merciful'], a: 'strict', eg: 'The ___ referee let the foul go unpunished.' },
    { w: 'meticulous', l: 2, d: 'very careful about detail', s: ['careful', 'precise', 'thorough'], a: 'careless', eg: 'The ___ artist painted every feather on the owl.' },
    { w: 'notorious', l: 2, d: 'famous for something bad', s: ['infamous', 'disreputable', 'ill-famed'], a: 'respected', eg: 'The ___ pirate was feared across the seven seas.' },
    { w: 'obstinate', l: 2, d: 'stubborn', s: ['stubborn', 'headstrong', 'inflexible'], a: 'cooperative', eg: 'The ___ mule refused to take another step.' },
    { w: 'perilous', l: 2, d: 'full of danger', s: ['dangerous', 'hazardous', 'risky'], a: 'safe', eg: 'The climbers faced a ___ journey across the glacier.' },
    { w: 'ravenous', l: 2, d: 'extremely hungry', s: ['starving', 'famished', 'voracious'], a: 'full', eg: 'After the match, the ___ players emptied the buffet.' },
    { w: 'sombre', l: 2, d: 'dark, serious or sad', s: ['gloomy', 'grave', 'solemn'], a: 'cheerful', eg: 'A ___ mood settled over the room after the news.' },
    { w: 'tedious', l: 2, d: 'boring and too long', s: ['boring', 'dull', 'monotonous'], a: 'exciting', eg: 'Copying out the list was a ___ job.' },
    { w: 'vivid', l: 2, d: 'bright and clear', s: ['bright', 'brilliant', 'striking'], a: 'dull', eg: 'The parrot’s ___ feathers glowed in the sunlight.' },
    { w: 'wary', l: 2, d: 'cautious about possible danger', s: ['cautious', 'suspicious', 'careful'], a: 'trusting', eg: 'The deer was ___ of the strange noise in the bushes.' },
    { w: 'adversary', l: 2, d: 'an opponent or enemy', s: ['opponent', 'enemy', 'rival'], a: 'ally', eg: 'The knight bowed to his ___ before the duel.' },
    { w: 'bewildered', l: 2, d: 'very confused', s: ['confused', 'puzzled', 'baffled'], a: 'certain', eg: 'The ___ tourists stared at the map upside down.' },
    { w: 'coax', l: 2, d: 'to persuade gently', s: ['persuade', 'cajole', 'wheedle'], a: 'force', eg: 'She tried to ___ the cat down from the tree with a treat.' },
    { w: 'dwindle', l: 2, d: 'to become gradually smaller', s: ['shrink', 'decrease', 'diminish'], a: 'grow', eg: 'Our supplies began to ___ as the week went on.' },
    { w: 'elated', l: 2, d: 'very happy and excited', s: ['thrilled', 'overjoyed', 'ecstatic'], a: 'miserable', eg: 'Priya was ___ when her name was read out.' },
    { w: 'frantic', l: 2, d: 'wild with fear or worry', s: ['desperate', 'panicky', 'frenzied'], a: 'calm', eg: 'The ___ mother searched every aisle for her toddler.' },
    { w: 'gullible', l: 2, d: 'easily tricked', s: ['naive', 'trusting', 'credulous'], a: 'sceptical', eg: 'The ___ boy believed the moon was made of cheese.' },
    { w: 'hoard', l: 2, d: 'to collect and store away', s: ['stockpile', 'store', 'amass'], a: 'squander', eg: 'Squirrels ___ nuts to eat during the winter.' },
    { w: 'intricate', l: 2, d: 'very detailed and complicated', s: ['complex', 'elaborate', 'detailed'], a: 'simple', eg: 'The spider spun an ___ web across the gate.' },
    { w: 'luminous', l: 2, d: 'giving off light', s: ['glowing', 'radiant', 'shining'], a: 'dark', eg: 'The ___ hands of the clock glowed green in the dark.' },
    { w: 'melancholy', l: 2, d: 'a feeling of deep sadness', s: ['sadness', 'gloom', 'sorrow'], a: 'cheer', eg: 'A ___ tune drifted from the old piano.' },
    { w: 'nimble', l: 2, d: 'quick and light in movement', s: ['agile', 'lithe', 'sprightly'], a: 'clumsy', eg: 'The ___ goat leapt from rock to rock.' },
    { w: 'ominous', l: 2, d: 'suggesting something bad will happen', s: ['threatening', 'menacing', 'sinister'], a: 'promising', eg: '___ black clouds gathered over the hills.' },
    { w: 'prosper', l: 2, d: 'to do well and succeed', s: ['thrive', 'flourish', 'succeed'], a: 'fail', eg: 'The little shop began to ___ once the road was finished.' },
    { w: 'resilient', l: 2, d: 'able to recover quickly', s: ['tough', 'strong', 'hardy'], a: 'fragile', eg: 'The ___ team bounced back from three defeats.' },
    { w: 'subtle', l: 2, d: 'not obvious; delicate', s: ['faint', 'slight', 'understated'], a: 'obvious', eg: 'There was a ___ hint of lemon in the sauce.' },
    { w: 'thrive', l: 2, d: 'to grow strong and healthy', s: ['flourish', 'prosper', 'bloom'], a: 'wilt', eg: 'Cacti ___ in hot, dry places.' },
    { w: 'unanimous', l: 2, d: 'agreed by everyone', s: ['united', 'agreed', 'undivided'], a: 'divided', eg: 'The vote for a longer lunch break was ___.' },
    { w: 'vigilant', l: 2, d: 'keeping careful watch', s: ['alert', 'watchful', 'observant'], a: 'careless', eg: 'The ___ lifeguard spotted the swimmer in trouble.' },
    { w: 'yearn', l: 2, d: 'to long for something', s: ['long', 'crave', 'pine'], a: 'dread', eg: 'During the long winter he began to ___ for the sea.' },

    // Level 3
    { w: 'audacious', l: 3, d: 'bold and daring', s: ['daring', 'bold', 'fearless'], a: 'timid', eg: 'It was an ___ plan: to steal the crown in broad daylight.' },
    { w: 'belligerent', l: 3, d: 'aggressive and ready to fight', s: ['hostile', 'aggressive', 'combative'], a: 'peaceful', eg: 'The ___ goose hissed at anyone who came near.' },
    { w: 'candid', l: 3, d: 'honest and direct', s: ['frank', 'honest', 'open'], a: 'evasive', eg: 'To be ___, the cake was a disaster.' },
    { w: 'despondent', l: 3, d: 'very unhappy and without hope', s: ['dejected', 'downcast', 'hopeless'], a: 'hopeful', eg: 'After the third rejection, the writer felt ___.' },
    { w: 'eloquent', l: 3, d: 'speaking clearly and persuasively', s: ['articulate', 'fluent', 'expressive'], a: 'inarticulate', eg: 'Her ___ speech moved the audience to tears.' },
    { w: 'fastidious', l: 3, d: 'very fussy about details', s: ['fussy', 'particular', 'exacting'], a: 'sloppy', eg: 'The ___ chef rejected any plate with a smudge.' },
    { w: 'garrulous', l: 3, d: 'very talkative', s: ['talkative', 'chatty', 'loquacious'], a: 'taciturn', eg: 'My ___ uncle can talk for an hour about cheese.' },
    { w: 'haughty', l: 3, d: 'arrogantly proud', s: ['arrogant', 'proud', 'superior'], a: 'humble', eg: 'The ___ duchess refused to speak to the servants.' },
    { w: 'impetuous', l: 3, d: 'acting quickly without thinking', s: ['rash', 'hasty', 'impulsive'], a: 'cautious', eg: 'In an ___ moment, he dived into the icy river.' },
    { w: 'jeopardy', l: 3, d: 'danger of harm or failure', s: ['danger', 'peril', 'risk'], a: 'safety', eg: 'One more mistake would put the whole mission in ___.' },
    { w: 'lethargic', l: 3, d: 'sluggish and lacking energy', s: ['sluggish', 'listless', 'inactive'], a: 'energetic', eg: 'The heat made everyone ___ by mid-afternoon.' },
    { w: 'magnanimous', l: 3, d: 'generous, especially to a rival', s: ['generous', 'forgiving', 'big-hearted'], a: 'petty', eg: 'The ___ champion praised the opponent who had nearly beaten her.' },
    { w: 'nonchalant', l: 3, d: 'calm and seemingly unconcerned', s: ['casual', 'relaxed', 'unconcerned'], a: 'anxious', eg: 'He gave a ___ shrug, as if winning meant nothing.' },
    { w: 'ostentatious', l: 3, d: 'showy, designed to impress', s: ['showy', 'flashy', 'pretentious'], a: 'modest', eg: 'The ___ mansion had gold taps in every bathroom.' },
    { w: 'placid', l: 3, d: 'calm and not easily upset', s: ['calm', 'peaceful', 'serene'], a: 'agitated', eg: 'The ___ old horse ignored the barking dogs.' },
    { w: 'quell', l: 3, d: 'to put an end to, to calm', s: ['suppress', 'subdue', 'crush'], a: 'provoke', eg: 'The teacher managed to ___ the noise with one raised eyebrow.' },
    { w: 'reticent', l: 3, d: 'not revealing thoughts easily', s: ['reserved', 'quiet', 'withdrawn'], a: 'talkative', eg: 'He was ___ about where he had been all day.' },
    { w: 'scrupulous', l: 3, d: 'extremely careful and honest', s: ['careful', 'honest', 'conscientious'], a: 'careless', eg: 'The ___ accountant checked every penny.' },
    { w: 'tenacious', l: 3, d: 'holding on firmly; determined', s: ['determined', 'persistent', 'dogged'], a: 'weak', eg: 'The ___ terrier would not let go of the rope.' },
    { w: 'ubiquitous', l: 3, d: 'found everywhere', s: ['everywhere', 'universal', 'omnipresent'], a: 'rare', eg: 'Mobile phones have become ___ in modern life.' },
    { w: 'venerable', l: 3, d: 'respected because of age or wisdom', s: ['respected', 'revered', 'esteemed'], a: 'disreputable', eg: 'The ___ professor had taught for fifty years.' },
    { w: 'wistful', l: 3, d: 'sadly longing for something', s: ['longing', 'nostalgic', 'yearning'], a: 'content', eg: 'She gave a ___ look at the old photographs.' },
    { w: 'zealous', l: 3, d: 'full of energy and enthusiasm for a cause', s: ['enthusiastic', 'passionate', 'fervent'], a: 'apathetic', eg: 'The ___ volunteers planted a thousand trees in a day.' },
    { w: 'apprehensive', l: 3, d: 'worried that something bad may happen', s: ['anxious', 'uneasy', 'nervous'], a: 'confident', eg: 'She felt ___ as the dentist picked up the drill.' },
    { w: 'brevity', l: 3, d: 'shortness, using few words', s: ['shortness', 'conciseness', 'briefness'], a: 'wordiness', eg: 'The ___ of his speech surprised everyone: just ten words.' },
    { w: 'copious', l: 3, d: 'in very large amounts', s: ['plentiful', 'abundant', 'ample'], a: 'meagre', eg: 'She took ___ notes during the lecture.' },
    { w: 'dubious', l: 3, d: 'doubtful or suspicious', s: ['doubtful', 'suspicious', 'uncertain'], a: 'certain', eg: 'The ___ shopkeeper examined the fifty-pound note closely.' },
    { w: 'exuberant', l: 3, d: 'full of energy and excitement', s: ['lively', 'enthusiastic', 'ebullient'], a: 'subdued', eg: 'The ___ puppy bounded across the lawn.' },
    { w: 'futile', l: 3, d: 'pointless, having no effect', s: ['pointless', 'useless', 'vain'], a: 'effective', eg: 'Arguing with the parking machine was ___.' },
    { w: 'indignant', l: 3, d: 'angry at something unfair', s: ['outraged', 'offended', 'resentful'], a: 'pleased', eg: 'The ___ customer demanded to see the manager.' },
    { w: 'morose', l: 3, d: 'gloomy and bad-tempered', s: ['sullen', 'gloomy', 'sulky'], a: 'cheerful', eg: 'The ___ guard grunted and waved us through.' },
    { w: 'pensive', l: 3, d: 'deeply thoughtful', s: ['thoughtful', 'reflective', 'contemplative'], a: 'carefree', eg: 'He sat in ___ silence, staring at the rain.' },
    { w: 'precarious', l: 3, d: 'not securely held; likely to fall', s: ['unstable', 'shaky', 'insecure'], a: 'secure', eg: 'The pile of plates looked ___ on the edge of the table.' },
    { w: 'relinquish', l: 3, d: 'to give up', s: ['surrender', 'abandon', 'yield'], a: 'retain', eg: 'The champion had to ___ her title after the final.' },
    { w: 'serene', l: 3, d: 'calm and peaceful', s: ['calm', 'tranquil', 'peaceful'], a: 'turbulent', eg: 'The ___ monk smiled at the shouting crowd.' },
    { w: 'trepidation', l: 3, d: 'a feeling of fear about what may happen', s: ['fear', 'dread', 'anxiety'], a: 'confidence', eg: 'With great ___, she opened the exam results.' },
    { w: 'voracious', l: 3, d: 'wanting great amounts, especially food', s: ['greedy', 'insatiable', 'ravenous'], a: 'satisfied', eg: 'The ___ reader finished six books in a week.' },
    { w: 'adamant', l: 3, d: 'refusing to change one’s mind', s: ['firm', 'unyielding', 'insistent'], a: 'flexible', eg: 'Gran was ___ that we wear our coats.' },
    { w: 'conspicuous', l: 3, d: 'easily seen, standing out', s: ['noticeable', 'obvious', 'prominent'], a: 'inconspicuous', eg: 'In his orange suit he was rather ___ at the funeral.' },
    { w: 'deteriorate', l: 3, d: 'to become worse', s: ['worsen', 'decline', 'decay'], a: 'improve', eg: 'The weather began to ___ as the afternoon went on.' }
  ];

  /* ------------------------------------------------------------------ */
  /* Verbal reasoning word banks                                         */
  /* ------------------------------------------------------------------ */

  // A four-letter word hidden across the end of one word and the start of the next.
  const HIDDEN_WORDS = [
    { s: 'We must open the gate.', a: 'stop' }, { s: 'The camel ate the hay.', a: 'late' },
    { s: 'It was of average size.', a: 'sofa' }, { s: 'I bet he never sleeps.', a: 'then' },
    { s: 'Sara insisted on cake.', a: 'rain' }, { s: 'His magic art show starts soon.', a: 'cart' },
    { s: 'The horse ate the carrot.', a: 'seat' }, { s: 'We had clam pie and chips.', a: 'lamp' },
    { s: 'Take a cab and come quickly.', a: 'band' }, { s: 'A new line arrived today.', a: 'near' },
    { s: 'The kitten tasted the milk.', a: 'tent' }, { s: 'I ate a taco at lunch.', a: 'coat' },
    { s: 'Stir ingredients slowly.', a: 'ring' }, { s: 'Colour the shape area blue.', a: 'pear' },
    { s: 'The span ends at the tower.', a: 'pane' }, { s: 'Just one stop to go.', a: 'nest' },
    { s: 'Teach all the children.', a: 'hall' }, { s: 'The dragon celebrated loudly.', a: 'once' },
    { s: 'Pull the rope hard.', a: 'hero' }, { s: 'She said rumours spread fast.', a: 'drum' },
    { s: 'The best art wins a prize.', a: 'star' }, { s: 'Jim iced the cake.', a: 'mice' },
    { s: 'A mango at the market.', a: 'goat' }, { s: 'It was perfect.', a: 'wasp' },
    { s: 'A wasp inside the car is scary.', a: 'spin' }, { s: 'I saw Irene yesterday.', a: 'wire' },
    { s: 'Pete amazed us all.', a: 'team' }, { s: 'That makes zero sense.', a: 'rose' },
    { s: 'We put uneven stones in a row.', a: 'tune' }, { s: 'Take this and that.', a: 'sand' },
    { s: 'Please chip in evenly.', a: 'pine' }, { s: 'We decided to venture out.', a: 'oven' },
    { s: 'The map alerted us.', a: 'pale' }, { s: 'An epic apex predator.', a: 'cape' }
  ];

  // Five words; `odd` is the index of the one that does not belong.
  const ODD_ONE_OUT = [
    { w: ['apple', 'banana', 'carrot', 'grape', 'pear'], odd: 2, why: 'A carrot is a vegetable; the others are fruit.', l: 1 },
    { w: ['run', 'sprint', 'jog', 'sit', 'dash'], odd: 3, why: 'The others are ways of moving fast.', l: 1 },
    { w: ['oak', 'ash', 'rose', 'elm', 'beech'], odd: 2, why: 'A rose is a flower; the others are trees.', l: 2 },
    { w: ['circle', 'square', 'triangle', 'cube', 'hexagon'], odd: 3, why: 'A cube is a 3D shape; the others are flat.', l: 1 },
    { w: ['happy', 'cheerful', 'glad', 'joyful', 'furious'], odd: 4, why: 'Furious is angry; the others mean happy.', l: 1 },
    { w: ['violin', 'cello', 'guitar', 'trumpet', 'harp'], odd: 3, why: 'A trumpet is a brass instrument; the others have strings.', l: 2 },
    { w: ['Paris', 'Rome', 'Spain', 'Berlin', 'Madrid'], odd: 2, why: 'Spain is a country; the others are capital cities.', l: 2 },
    { w: ['copper', 'iron', 'gold', 'wood', 'silver'], odd: 3, why: 'Wood is not a metal.', l: 1 },
    { w: ['whisper', 'shout', 'mutter', 'murmur', 'glance'], odd: 4, why: 'A glance is a look; the others are ways of speaking.', l: 2 },
    { w: ['sofa', 'chair', 'table', 'stool', 'bench'], odd: 2, why: 'You sit on the others.', l: 1 },
    { w: ['March', 'Monday', 'June', 'August', 'October'], odd: 1, why: 'Monday is a day; the others are months.', l: 1 },
    { w: ['river', 'lake', 'pond', 'mountain', 'sea'], odd: 3, why: 'The others are bodies of water.', l: 1 },
    { w: ['sparrow', 'robin', 'bat', 'eagle', 'owl'], odd: 2, why: 'A bat is a mammal; the others are birds.', l: 2 },
    { w: ['hammer', 'saw', 'drill', 'nail', 'chisel'], odd: 3, why: 'A nail is not a tool.', l: 2 },
    { w: ['tulip', 'daisy', 'daffodil', 'fern', 'lily'], odd: 3, why: 'A fern has no flowers.', l: 2 },
    { w: ['enormous', 'huge', 'vast', 'minute', 'gigantic'], odd: 3, why: 'Minute means tiny.', l: 2 },
    { w: ['Mercury', 'Venus', 'Mars', 'Moon', 'Jupiter'], odd: 3, why: 'The Moon is not a planet.', l: 1 },
    { w: ['doctor', 'nurse', 'surgeon', 'patient', 'dentist'], odd: 3, why: 'The others are medical jobs.', l: 1 },
    { w: ['bread', 'cheese', 'butter', 'cream', 'yoghurt'], odd: 0, why: 'The others are dairy products.', l: 2 },
    { w: ['hop', 'skip', 'jump', 'leap', 'crawl'], odd: 4, why: 'The others leave the ground.', l: 1 },
    { w: ['cup', 'mug', 'glass', 'plate', 'beaker'], odd: 3, why: 'You drink from the others.', l: 1 },
    { w: ['pound', 'dollar', 'euro', 'cheque', 'yen'], odd: 3, why: 'The others are currencies.', l: 2 },
    { w: ['snake', 'lizard', 'crocodile', 'frog', 'tortoise'], odd: 3, why: 'A frog is an amphibian; the others are reptiles.', l: 2 },
    { w: ['car', 'bus', 'lorry', 'bicycle', 'van'], odd: 3, why: 'A bicycle has no engine.', l: 1 },
    { w: ['novel', 'poem', 'play', 'library', 'story'], odd: 3, why: 'A library is a place, not a piece of writing.', l: 2 },
    { w: ['smile', 'grin', 'frown', 'beam', 'smirk'], odd: 2, why: 'The others are happy expressions.', l: 1 },
    { w: ['shirt', 'jumper', 'blouse', 'trousers', 'cardigan'], odd: 3, why: 'Trousers go on your legs.', l: 1 },
    { w: ['metre', 'kilogram', 'centimetre', 'mile', 'inch'], odd: 1, why: 'A kilogram measures mass, not length.', l: 2 },
    { w: ['add', 'multiply', 'divide', 'total', 'subtract'], odd: 3, why: 'The others are operations.', l: 2 },
    { w: ['kitchen', 'bedroom', 'garden', 'bathroom', 'hallway'], odd: 2, why: 'A garden is outside.', l: 1 },
    { w: ['bee', 'ant', 'spider', 'beetle', 'wasp'], odd: 2, why: 'A spider has eight legs; insects have six.', l: 2 },
    { w: ['lion', 'tiger', 'leopard', 'wolf', 'cheetah'], odd: 3, why: 'A wolf is not a cat.', l: 1 },
    { w: ['scissors', 'knife', 'spoon', 'razor', 'axe'], odd: 2, why: 'A spoon has no blade.', l: 1 },
    { w: ['Atlantic', 'Pacific', 'Indian', 'Arctic', 'Nile'], odd: 4, why: 'The Nile is a river; the others are oceans.', l: 2 },
    { w: ['brother', 'uncle', 'father', 'aunt', 'grandfather'], odd: 3, why: 'The others are male.', l: 1 },
    { w: ['sprint', 'marathon', 'relay', 'hurdles', 'swim'], odd: 4, why: 'The others are running events.', l: 2 },
    { w: ['begin', 'start', 'commence', 'finish', 'launch'], odd: 3, why: 'The others mean to start.', l: 2 },
    { w: ['whale', 'dolphin', 'shark', 'seal', 'otter'], odd: 2, why: 'A shark is a fish; the others are mammals.', l: 3 },
    { w: ['jacket', 'coat', 'anorak', 'blazer', 'helmet'], odd: 4, why: 'A helmet is not clothing for your body.', l: 1 },
    { w: ['triangle', 'pentagon', 'hexagon', 'octagon', 'rectangle'], odd: 4, why: 'A rectangle is the only one whose name does not tell you its number of sides... and the only one with exactly four sides.', l: 3 },
    { w: ['sincere', 'honest', 'frank', 'candid', 'deceitful'], odd: 4, why: 'Deceitful means dishonest.', l: 3 },
    { w: ['famished', 'ravenous', 'starving', 'satisfied', 'hungry'], odd: 3, why: 'Satisfied means full.', l: 3 }
  ];

  // "A is to B as C is to ?"  options[0] is correct; they are shuffled on use.
  const ANALOGIES = [
    { a: 'bird', b: 'nest', c: 'bee', options: ['hive', 'honey', 'flower', 'wing'], l: 1 },
    { a: 'hot', b: 'cold', c: 'light', options: ['dark', 'bright', 'lamp', 'warm'], l: 1 },
    { a: 'kitten', b: 'cat', c: 'puppy', options: ['dog', 'kennel', 'bone', 'bark'], l: 1 },
    { a: 'author', b: 'book', c: 'composer', options: ['symphony', 'piano', 'orchestra', 'singer'], l: 2 },
    { a: 'foot', b: 'shoe', c: 'hand', options: ['glove', 'finger', 'ring', 'arm'], l: 1 },
    { a: 'finger', b: 'hand', c: 'toe', options: ['foot', 'leg', 'shoe', 'nail'], l: 1 },
    { a: 'big', b: 'enormous', c: 'small', options: ['tiny', 'little', 'short', 'thin'], l: 2 },
    { a: 'fish', b: 'water', c: 'bird', options: ['air', 'nest', 'tree', 'feather'], l: 1 },
    { a: 'captain', b: 'ship', c: 'pilot', options: ['aeroplane', 'airport', 'runway', 'uniform'], l: 1 },
    { a: 'eye', b: 'see', c: 'ear', options: ['hear', 'sound', 'listen', 'noise'], l: 1 },
    { a: 'teacher', b: 'school', c: 'doctor', options: ['hospital', 'patient', 'medicine', 'nurse'], l: 1 },
    { a: 'Monday', b: 'Tuesday', c: 'January', options: ['February', 'December', 'month', 'winter'], l: 1 },
    { a: 'sail', b: 'boat', c: 'wing', options: ['aeroplane', 'bird', 'feather', 'sky'], l: 2 },
    { a: 'cow', b: 'calf', c: 'sheep', options: ['lamb', 'wool', 'goat', 'ewe'], l: 1 },
    { a: 'happy', b: 'sad', c: 'brave', options: ['cowardly', 'strong', 'bold', 'frightening'], l: 2 },
    { a: 'up', b: 'down', c: 'north', options: ['south', 'east', 'compass', 'pole'], l: 1 },
    { a: 'rose', b: 'flower', c: 'oak', options: ['tree', 'leaf', 'acorn', 'forest'], l: 1 },
    { a: 'knife', b: 'cut', c: 'pen', options: ['write', 'ink', 'paper', 'draw'], l: 1 },
    { a: 'book', b: 'chapter', c: 'play', options: ['act', 'stage', 'actor', 'theatre'], l: 2 },
    { a: 'hour', b: 'minute', c: 'minute', options: ['second', 'hour', 'clock', 'time'], l: 2 },
    { a: 'speak', b: 'whisper', c: 'walk', options: ['tiptoe', 'run', 'march', 'sprint'], l: 2 },
    { a: 'water', b: 'thirsty', c: 'food', options: ['hungry', 'eat', 'dinner', 'kitchen'], l: 1 },
    { a: 'triangle', b: 'three', c: 'hexagon', options: ['six', 'five', 'eight', 'four'], l: 2 },
    { a: 'baker', b: 'bread', c: 'tailor', options: ['clothes', 'needle', 'shop', 'cloth'], l: 2 },
    { a: 'sculptor', b: 'statue', c: 'painter', options: ['picture', 'brush', 'colour', 'gallery'], l: 2 },
    { a: 'dog', b: 'kennel', c: 'horse', options: ['stable', 'field', 'saddle', 'hay'], l: 1 },
    { a: 'circle', b: 'sphere', c: 'square', options: ['cube', 'rectangle', 'cuboid', 'pyramid'], l: 2 },
    { a: 'yesterday', b: 'today', c: 'today', options: ['tomorrow', 'now', 'yesterday', 'week'], l: 1 },
    { a: 'king', b: 'queen', c: 'prince', options: ['princess', 'palace', 'crown', 'duke'], l: 1 },
    { a: 'late', b: 'early', c: 'sunset', options: ['sunrise', 'night', 'evening', 'sun'], l: 2 },
    { a: 'wrist', b: 'hand', c: 'ankle', options: ['foot', 'leg', 'knee', 'toe'], l: 1 },
    { a: 'library', b: 'books', c: 'gallery', options: ['paintings', 'artists', 'walls', 'museum'], l: 2 },
    { a: 'doctor', b: 'patient', c: 'lawyer', options: ['client', 'court', 'judge', 'law'], l: 3 },
    { a: 'scarce', b: 'abundant', c: 'timid', options: ['bold', 'shy', 'quiet', 'nervous'], l: 3 },
    { a: 'glove', b: 'hand', c: 'hat', options: ['head', 'hair', 'coat', 'scarf'], l: 1 },
    { a: 'thermometer', b: 'temperature', c: 'ruler', options: ['length', 'wood', 'straight', 'pencil'], l: 2 },
    { a: 'ravenous', b: 'hungry', c: 'exhausted', options: ['tired', 'asleep', 'lazy', 'bored'], l: 3 },
    { a: 'chapter', b: 'book', c: 'verse', options: ['poem', 'rhyme', 'song', 'line'], l: 2 }
  ];

  // Word that completes all three compound words.
  const COMPOUNDS = [
    { w: 'foot', ends: ['ball', 'print', 'path'] }, { w: 'sun', ends: ['flower', 'light', 'shine'] },
    { w: 'rain', ends: ['bow', 'coat', 'drop'] }, { w: 'fire', ends: ['work', 'place', 'fly'] },
    { w: 'snow', ends: ['ball', 'flake', 'man'] }, { w: 'book', ends: ['case', 'shop', 'mark'] },
    { w: 'water', ends: ['fall', 'proof', 'melon'] }, { w: 'sea', ends: ['side', 'weed', 'shell'] },
    { w: 'play', ends: ['ground', 'time', 'mate'] }, { w: 'door', ends: ['bell', 'step', 'way'] },
    { w: 'bed', ends: ['room', 'time', 'side'] }, { w: 'hand', ends: ['bag', 'shake', 'writing'] },
    { w: 'light', ends: ['house', 'bulb', 'weight'] }, { w: 'tooth', ends: ['brush', 'paste', 'ache'] },
    { w: 'air', ends: ['port', 'craft', 'line'] }, { w: 'moon', ends: ['light', 'beam', 'walk'] },
    { w: 'home', ends: ['work', 'made', 'sick'] }, { w: 'sand', ends: ['castle', 'paper', 'storm'] },
    { w: 'wind', ends: ['mill', 'screen', 'pipe'] }, { w: 'head', ends: ['line', 'ache', 'phone'] },
    { w: 'black', ends: ['board', 'bird', 'berry'] }, { w: 'butter', ends: ['fly', 'cup', 'milk'] },
    { w: 'post', ends: ['card', 'man', 'code'] }, { w: 'grand', ends: ['mother', 'father', 'stand'] },
    { w: 'news', ends: ['paper', 'letter', 'reader'] }, { w: 'time', ends: ['table', 'keeper', 'line'] },
    { w: 'star', ends: ['fish', 'light', 'dust'] }, { w: 'eye', ends: ['brow', 'lid', 'lash'] },
    { w: 'back', ends: ['pack', 'ground', 'bone'] }, { w: 'out', ends: ['side', 'line', 'door'] },
    { w: 'over', ends: ['coat', 'time', 'flow'] }, { w: 'under', ends: ['ground', 'line', 'stand'] },
    { w: 'ice', ends: ['berg', 'cream', 'cap'] }, { w: 'horse', ends: ['shoe', 'back', 'power'] },
    { w: 'green', ends: ['house', 'grocer', 'finch'] }, { w: 'birth', ends: ['day', 'place', 'mark'] }
  ];

  // Three-letter word that completes the capitalised word.
  const MISSING_WORDS = [
    { s: 'We cleaned the CAR___.', a: 'PET', full: 'CARPET' }, { s: 'She WAN___ to go home.', a: 'TED', full: 'WANTED' },
    { s: 'Add the ___NUT butter.', a: 'PEA', full: 'PEANUT' }, { s: 'The ___TER was long and cold.', a: 'WIN', full: 'WINTER' },
    { s: 'Pass the ___TER, please.', a: 'BUT', full: 'BUTTER' }, { s: 'He ___PED over the puddle.', a: 'HOP', full: 'HOPPED' },
    { s: 'She ___TED the car in the car park.', a: 'DEN', full: 'DENTED' }, { s: 'The ___MER holidays were hot.', a: 'SUM', full: 'SUMMER' },
    { s: 'Hit the nail with the ___MER.', a: 'HAM', full: 'HAMMER' }, { s: 'The ___DER was slippery.', a: 'LAD', full: 'LADDER' },
    { s: 'The ___TLE crawled under the leaf.', a: 'BEE', full: 'BEETLE' }, { s: 'Open the ___DOW.', a: 'WIN', full: 'WINDOW' },
    { s: 'He won a MILL___ pounds.', a: 'ION', full: 'MILLION' }, { s: 'The ___ROT squawked on the pirate’s shoulder.', a: 'PAR', full: 'PARROT' },
    { s: 'I ate a raw ___ROT.', a: 'CAR', full: 'CARROT' }, { s: 'The knight threw his SP___.', a: 'EAR', full: 'SPEAR' },
    { s: 'Do not SP___ the surprise!', a: 'OIL', full: 'SPOIL' }, { s: 'Stick a ST___ on the envelope.', a: 'AMP', full: 'STAMP' },
    { s: 'Please ST___ up straight.', a: 'AND', full: 'STAND' }, { s: 'Drink it through a ST___.', a: 'RAW', full: 'STRAW' },
    { s: 'The CL___ had a red nose.', a: 'OWN', full: 'CLOWN' }, { s: 'A B___N dog wagged its tail.', a: 'ROW', full: 'BROWN' },
    { s: 'The castle T___R was tall.', a: 'OWE', full: 'TOWER' }, { s: 'Sit on the CH___.', a: 'AIR', full: 'CHAIR' },
    { s: 'Draw a bar CH___.', a: 'ART', full: 'CHART' }, { s: 'Do not SH___ in the library.', a: 'OUT', full: 'SHOUT' },
    { s: 'What SH___ is it: a circle or a square?', a: 'APE', full: 'SHAPE' }, { s: 'The SH___ has sharp teeth.', a: 'ARK', full: 'SHARK' },
    { s: 'You SC___D me!', a: 'ARE', full: 'SCARED' }, { s: 'Spin the G___E to find Australia.', a: 'LOB', full: 'GLOBE' },
    { s: 'G___E the cheese for the pizza.', a: 'RAT', full: 'GRATE' }, { s: 'Water the PL___ every day.', a: 'ANT', full: 'PLANT' },
    { s: 'Put it on a clean PL___.', a: 'ATE', full: 'PLATE' }, { s: 'A B___CH snapped off the tree.', a: 'RAN', full: 'BRANCH' },
    { s: 'Give the dog a TR___.', a: 'EAT', full: 'TREAT' }, { s: 'I read on my TAB___.', a: 'LET', full: 'TABLET' },
    { s: 'The PIG___ squealed.', a: 'LET', full: 'PIGLET' }, { s: 'Press the ___TON to start.', a: 'BUT', full: 'BUTTON' },
    { s: 'A ___TON of milk.', a: 'CAR', full: 'CARTON' }, { s: 'A soft ___TON t-shirt.', a: 'COT', full: 'COTTON' },
    { s: 'The storm did a lot of ___AGE.', a: 'DAM', full: 'DAMAGE' }, { s: 'Post the ___TER today.', a: 'LET', full: 'LETTER' },
    { s: 'It does not ___TER.', a: 'MAT', full: 'MATTER' }, { s: 'Light the ___DLE.', a: 'CAN', full: 'CANDLE' },
    { s: '___DLE the canoe across the lake.', a: 'PAD', full: 'PADDLE' }, { s: 'Put the ___DLE on the horse.', a: 'SAD', full: 'SADDLE' },
    { s: 'I ___DER what time it is.', a: 'WON', full: 'WONDER' }, { s: 'The meat was soft and ___DER.', a: 'TEN', full: 'TENDER' },
    { s: 'She lost an ___RING.', a: 'EAR', full: 'EARRING' }, { s: 'The ___TLE grazed in the field.', a: 'CAT', full: 'CATTLE' },
    { s: 'The baby shook the ___TLE.', a: 'RAT', full: 'RATTLE' }, { s: 'They fought a fierce ___TLE.', a: 'BAT', full: 'BATTLE' },
    { s: 'A stinging ___TLE.', a: 'NET', full: 'NETTLE' }, { s: 'Please ___TLE down, class.', a: 'SET', full: 'SETTLE' },
    { s: 'A ___TLE mouse crept out.', a: 'LIT', full: 'LITTLE' }, { s: 'The ___NING team cheered.', a: 'WIN', full: 'WINNING' },
    { s: 'Pass the ___PER and salt.', a: 'PEP', full: 'PEPPER' }, { s: 'A shiny ___PER coin.', a: 'COP', full: 'COPPER' },
    { s: 'Can you ___AGE on your own?', a: 'MAN', full: 'MANAGE' }, { s: 'The ___PET show made us laugh.', a: 'PUP', full: 'PUPPET' }
  ];

  /* ------------------------------------------------------------------ */
  /* Problem-solving bank                                                */
  /* ------------------------------------------------------------------ */

  const PUZZLES = [
    { id: 'z1', skill: 'ps.number', level: 1, q: 'I think of a number, double it and add 5. The answer is 17. What was my number?', answer: 6, explain: 'Work backwards: 17 − 5 = 12, then 12 ÷ 2 = 6.' },
    { id: 'z2', skill: 'ps.number', level: 1, q: 'Ali has twice as many sweets as Ben. Together they have 24. How many does Ali have?', answer: 16, explain: 'Ben has 1 share and Ali has 2 shares: 3 shares = 24, so one share is 8 and Ali has 16.' },
    { id: 'z3', skill: 'ps.logic', level: 2, q: 'A farmer has chickens and sheep. Altogether there are 10 heads and 28 legs. How many sheep are there?', answer: 4, explain: 'If all 10 were chickens there would be 20 legs. Each sheep adds 2 extra legs: (28 − 20) ÷ 2 = 4 sheep.' },
    { id: 'z4', skill: 'ps.number', level: 2, q: 'What is the next number in this sequence? 1, 1, 2, 3, 5, 8, ...', answer: 13, explain: 'Each number is the sum of the two before it: 5 + 8 = 13. This is the Fibonacci sequence.' },
    { id: 'z5', skill: 'ps.spatial', level: 2, q: 'A clock shows exactly 3 o’clock. What is the angle between the two hands, in degrees?', answer: 90, unit: '°', explain: 'The hour hand points at 3 and the minute hand at 12: a quarter of a turn, which is 90°.' },
    { id: 'z6', skill: 'ps.logic', level: 3, q: 'A snail climbs 3 metres up a 10-metre wall each day and slips back 2 metres each night. On which day does it reach the top?', answer: 8, explain: 'It gains 1 metre a day, so after 7 days it is at 7 metres. On day 8 it climbs 3 metres and reaches 10 before it can slip.' },
    { id: 'z7', skill: 'ps.logic', level: 1, q: 'Which weighs more: a kilogram of feathers or a kilogram of bricks?', options: ['They weigh the same', 'The bricks', 'The feathers', 'It depends on the size'], answer: 0, explain: 'A kilogram is a kilogram! The feathers just take up more space.' },
    { id: 'z8', skill: 'ps.logic', level: 2, q: 'Five people are in a room. Each person shakes hands with every other person exactly once. How many handshakes are there?', answer: 10, explain: 'Each of the 5 people shakes 4 hands, which gives 20, but every handshake is counted twice: 20 ÷ 2 = 10.' },
    { id: 'z9', skill: 'ps.number', level: 3, q: 'Jo is 3 years older than her brother. In 4 years’ time their ages will add up to 25. How old is Jo now?', answer: 10, explain: 'In 4 years they total 25, so now they total 25 − 8 = 17. Two ages 3 apart that add to 17 are 7 and 10. Jo is 10.' },
    { id: 'z10', skill: 'ps.spatial', level: 3, q: 'A rectangle has a perimeter of 22 cm. Its length is 3 cm more than its width. What is its area in cm²?', answer: 28, unit: 'cm²', explain: 'Length + width = 11. If width is w, then w + (w + 3) = 11, so w = 4 and length = 7. Area = 4 × 7 = 28.' },
    { id: 'z11', skill: 'ps.logic', level: 3, q: 'Three cats catch three mice in three minutes. How many cats are needed to catch 100 mice in 100 minutes?', answer: 3, explain: 'Each cat catches one mouse every three minutes. In 100 minutes, 3 cats catch 100 mice.' },
    { id: 'z12', skill: 'ps.number', level: 1, q: 'A bus leaves at 8:45 and arrives at 10:20. How many minutes does the journey take?', answer: 95, unit: 'minutes', explain: '8:45 to 10:20 is 1 hour 35 minutes = 95 minutes.' },
    { id: 'z13', skill: 'ps.number', level: 2, q: 'What is the smallest number that can be divided exactly by 2, 3, 4, 5 and 6?', answer: 60, explain: 'The lowest common multiple of 2, 3, 4, 5 and 6 is 60.' },
    { id: 'z14', skill: 'ps.number', level: 2, q: 'I am a two-digit number. My tens digit is double my units digit, and my digits add up to 9. What number am I?', answer: 63, explain: 'Digits d and 2d add to 9, so 3d = 9 and d = 3. Tens digit 6, units digit 3: 63.' },
    { id: 'z15', skill: 'ps.number', level: 1, q: 'Using each of the digits 2, 5 and 7 exactly once, what is the largest EVEN number you can make?', answer: 752, explain: 'An even number must end in 2, so put the biggest digits first: 752.' },
    { id: 'z16', skill: 'ps.number', level: 1, q: 'A book has 120 pages. Mia reads 15 pages every day. On which day does she finish the book?', answer: 8, explain: '120 ÷ 15 = 8, so she finishes on day 8.' },
    { id: 'z17', skill: 'ps.logic', level: 2, q: 'Tom has 3 shirts and 4 pairs of trousers. How many different outfits (one shirt and one pair of trousers) can he make?', answer: 12, explain: 'Each of the 3 shirts goes with any of the 4 pairs: 3 × 4 = 12.' },
    { id: 'z18', skill: 'ps.logic', level: 1, q: 'In a race, Anna finished ahead of Ben but behind Cara. Dan finished last. Who came second?', options: ['Anna', 'Ben', 'Cara', 'Dan'], answer: 0, explain: 'Order: Cara, Anna, Ben, Dan. Anna is second.' },
    { id: 'z19', skill: 'ps.number', level: 2, q: 'In a magic square every row, column and diagonal adds up to 15. The top row is 8, 1, 6 and the middle row is 3, 5, ?. What is the missing number?', answer: 7, explain: '3 + 5 + ? = 15, so ? = 7.' },
    { id: 'z20', skill: 'ps.number', level: 3, q: 'Half of a number plus a quarter of the same number is 18. What is the number?', answer: 24, explain: 'A half plus a quarter is three quarters. If three quarters is 18, one quarter is 6 and the number is 24.' },
    { id: 'z21', skill: 'ps.number', level: 1, q: 'Three pencils cost 45p. How much do seven pencils cost, in pence?', answer: 105, unit: 'p', explain: 'One pencil costs 15p, so seven cost 7 × 15 = 105p (£1.05).' },
    { id: 'z22', skill: 'ps.spatial', level: 2, q: 'A square has the same perimeter as a rectangle measuring 10 cm by 6 cm. What is the area of the square in cm²?', answer: 64, unit: 'cm²', explain: 'The rectangle’s perimeter is 32 cm, so the square’s side is 8 cm and its area is 64 cm².' },
    { id: 'z23', skill: 'ps.number', level: 3, q: 'What is the 100th odd number?', answer: 199, explain: 'The nth odd number is 2n − 1: 2 × 100 − 1 = 199.' },
    { id: 'z24', skill: 'ps.number', level: 1, q: 'How many minutes are there in one whole day?', answer: 1440, explain: '24 hours × 60 minutes = 1440 minutes.' },
    { id: 'z25', skill: 'ps.logic', level: 2, q: 'If today is Wednesday, what day of the week will it be in 100 days’ time?', options: ['Friday', 'Thursday', 'Saturday', 'Wednesday'], answer: 0, explain: '100 = 14 weeks and 2 days. Two days after Wednesday is Friday.' },
    { id: 'z26', skill: 'ps.number', level: 3, q: 'A bottle and a cork cost £1.10 together. The bottle costs £1 more than the cork. How much is the cork, in pence?', answer: 5, unit: 'p', explain: 'If the cork is 5p, the bottle is £1.05, and together they make £1.10. (10p would make the bottle only 90p more.)' },
    { id: 'z27', skill: 'ps.number', level: 2, q: 'Two numbers multiply to give 36 and add to give 13. What is the larger of the two numbers?', answer: 9, explain: 'Pairs that multiply to 36: 1×36, 2×18, 3×12, 4×9, 6×6. Only 4 and 9 add to 13.' },
    { id: 'z28', skill: 'ps.spatial', level: 3, q: 'How many squares of ALL sizes can you find on a 3 by 3 grid of small squares?', answer: 14, explain: '9 small squares + 4 squares of size 2×2 + 1 big square = 14.' },
    { id: 'z29', skill: 'ps.number', level: 3, q: 'A train 100 metres long passes a signal post completely in 5 seconds. What is its speed in metres per second?', answer: 20, unit: 'm/s', explain: 'The whole train (100 m) passes in 5 s: 100 ÷ 5 = 20 m/s.' },
    { id: 'z30', skill: 'ps.logic', level: 2, q: 'Lena has some marbles. She gives half of them to Max, then half of what is left to Nia, and has 6 left. How many did she start with?', answer: 24, explain: 'Work backwards: 6 is half of 12, and 12 is half of 24.' },
    { id: 'z31', skill: 'ps.number', level: 2, q: 'What is the largest three-digit number whose digits add up to 10?', answer: 910, explain: 'Make the first digit as big as possible (9), then the next (1), leaving 0: 910.' },
    { id: 'z32', skill: 'ps.number', level: 1, q: 'At a party there are 12 children. Each child gets 3 balloons and there are 5 balloons left over. How many balloons were there to begin with?', answer: 41, explain: '12 × 3 = 36, plus the 5 left over = 41.' },
    { id: 'z33', skill: 'ps.number', level: 3, q: 'A two-digit number has digits that add up to 9. When its digits are reversed, the new number is 27 bigger. What is the original number?', answer: 36, explain: '36 reversed is 63, and 63 − 36 = 27. (Try pairs that add to 9: 18, 27, 36...)' },
    { id: 'z34', skill: 'ps.number', level: 3, q: 'How many times is the digit 7 written when you write every number from 1 to 100?', answer: 20, explain: 'Ten times as a units digit (7, 17, ... 97) and ten times as a tens digit (70 to 79): 20 in total.' },
    { id: 'z35', skill: 'ps.spatial', level: 1, q: 'How many edges does a cube have?', answer: 12, explain: 'A cube has 6 faces, 8 vertices (corners) and 12 edges.' },
    { id: 'z36', skill: 'ps.spatial', level: 3, q: 'A large cube is made from 27 small cubes (3 by 3 by 3) and painted red on the outside. How many small cubes have exactly TWO red faces?', answer: 12, explain: 'The cubes with two painted faces sit in the middle of each edge. A cube has 12 edges, so 12 small cubes.' },
    { id: 'z37', skill: 'ps.spatial', level: 2, q: 'Fold a square of paper in half, then in half again. Cut off the corner where all the folds meet, then unfold. What shape is the hole?', options: ['A square (diamond) in the middle', 'A triangle in one corner', 'Four holes near the edges', 'There is no hole'], answer: 0, explain: 'The corner where the folds meet is the centre of the paper. Cutting a triangle there opens out into a square hole in the middle.' },
    { id: 'z38', skill: 'ps.spatial', level: 2, q: 'Which 3D shape has 5 faces, 8 edges and 5 vertices?', options: ['Square-based pyramid', 'Triangular prism', 'Cube', 'Tetrahedron'], answer: 0, explain: 'A square base plus four triangular faces: 5 faces, 8 edges, 5 vertices. A triangular prism has 5 faces but 9 edges.' },
    { id: 'z39', skill: 'ps.spatial', level: 2, q: 'In a mirror, a clock appears to show 4 o’clock. What is the real time?', options: ['8 o’clock', '4 o’clock', '2 o’clock', '10 o’clock'], answer: 0, explain: 'A mirror flips the clock left to right. 4 on the right becomes 8 on the left.' },
    { id: 'z40', skill: 'ps.spatial', level: 3, q: 'How many diagonals does a hexagon have?', answer: 9, explain: 'Each of the 6 corners joins to 3 others that are not neighbours: 6 × 3 = 18, but each diagonal is counted twice, so 9.' },
    { id: 'z41', skill: 'ps.logic', level: 2, q: 'A rope ladder hangs over the side of a boat with its bottom rung just touching the water. The rungs are 30 cm apart. The tide rises by 90 cm. How many rungs are now under water?', options: ['None: the boat rises with the tide', 'Three', 'Two', 'One'], answer: 0, explain: 'The boat floats, so it rises with the tide and the ladder rises with it.' },
    { id: 'z42', skill: 'ps.logic', level: 3, q: 'A man looks at a portrait and says: “Brothers and sisters I have none, but that man’s father is my father’s son.” Who is in the portrait?', options: ['His son', 'Himself', 'His father', 'His uncle'], answer: 0, explain: '“My father’s son” is the man himself (he has no brothers). So the portrait is of someone whose father is him: his son.' },
    { id: 'z43', skill: 'ps.logic', level: 1, q: 'Ravi’s mum has three children. The first is called April and the second is called May. What is the third one called?', options: ['Ravi', 'June', 'July', 'Not enough information'], answer: 0, explain: 'The question starts with “Ravi’s mum”, so Ravi is the third child.' },
    { id: 'z44', skill: 'ps.logic', level: 3, q: 'What letter comes next? O, T, T, F, F, S, S, ...', options: ['E', 'N', 'T', 'O'], answer: 0, explain: 'They are the first letters of One, Two, Three, Four, Five, Six, Seven... so Eight comes next.' },
    { id: 'z45', skill: 'ps.spatial', level: 3, q: 'A rectangular lawn measures 12 m by 8 m. A path 1 m wide runs all the way round the OUTSIDE of it. What is the area of the path in m²?', answer: 44, unit: 'm²', explain: 'With the path, the whole shape is 14 m by 10 m = 140 m². Take away the lawn: 140 − 96 = 44 m².' },
    { id: 'z46', skill: 'ps.number', level: 2, q: 'Two buses leave the station together at 9:00. One comes back every 20 minutes, the other every 30 minutes. At what time are they next back together?', options: ['10:00', '9:50', '9:30', '10:30'], answer: 0, explain: 'The lowest common multiple of 20 and 30 is 60 minutes, so 10:00.' },
    { id: 'z47', skill: 'ps.number', level: 1, q: 'A pizza is cut into 7 slices. Sam eats 3 slices and Jo eats half of what is left. How many slices remain?', answer: 2, explain: '7 − 3 = 4 left; Jo eats half (2), so 2 remain.' },
    { id: 'z48', skill: 'ps.logic', level: 2, q: 'Three boxes are labelled APPLES, ORANGES and MIXED, but every label is wrong. You may take one fruit from one box. From which box should you take it to work out all three labels?', options: ['The box labelled MIXED', 'The box labelled APPLES', 'The box labelled ORANGES', 'It is impossible'], answer: 0, explain: 'The MIXED box cannot be mixed, so one fruit tells you what it really holds. The other two then fall into place because their labels are also wrong.' },
    { id: 'z49', skill: 'ps.number', level: 2, q: 'The sum of three consecutive whole numbers is 72. What is the largest of them?', answer: 25, explain: 'The middle number is 72 ÷ 3 = 24, so the numbers are 23, 24 and 25.' },
    { id: 'z50', skill: 'ps.spatial', level: 2, q: 'A square piece of paper is folded in half diagonally. What shape is it now?', options: ['A right-angled triangle', 'A rectangle', 'A smaller square', 'A pentagon'], answer: 0, explain: 'Folding corner to corner makes a triangle with one right angle and two 45° angles.' }
  ];

  /* ------------------------------------------------------------------ */
  /* Creative writing prompts                                            */
  /* ------------------------------------------------------------------ */

  const WRITING_PROMPTS = [
    { id: 'w1', skill: 'w.story', type: 'Story', title: 'The door that was never there', prompt: 'Write a story that begins: “The door had not been there yesterday. I was sure of it.”', plan: ['Who finds the door, and where?', 'What is behind it? (Keep it surprising but believable.)', 'What problem does it cause?', 'How does it end: a twist, a decision or a quiet moment?'] },
    { id: 'w2', skill: 'w.story', type: 'Story', title: 'The last bus home', prompt: 'Write a story called “The Last Bus Home”.', plan: ['Who is on the bus and why are they out so late?', 'Something unexpected happens on the journey.', 'Build tension with short sentences.', 'Decide the ending BEFORE you start writing.'] },
    { id: 'w3', skill: 'w.story', type: 'Story', title: 'Continue the story', prompt: 'Continue this story: “When the lights came back on, the classroom was empty. Every single chair had been turned to face the window.”', plan: ['Keep the same character and setting.', 'Explain the chairs... or leave a mystery that makes sense.', 'Use the five senses to build atmosphere.', 'Finish with a satisfying last line.'] },
    { id: 'w4', skill: 'w.story', type: 'Story', title: 'An unlikely friendship', prompt: 'Write a story about an unlikely friendship.', plan: ['Who are the two characters and why would they never normally be friends?', 'What forces them together?', 'Show the friendship growing through actions, not just “they became friends”.', 'End with a moment that shows the change.'] },
    { id: 'w5', skill: 'w.story', type: 'Story', title: 'The wrong parcel', prompt: 'A parcel arrives at your house. It has your name on it, but you did not order it. Write the story.', plan: ['Describe the parcel before opening it (sound, weight, smell).', 'What is inside and who sent it?', 'Make a decision that leads to a problem.', 'Resolve it, perhaps with a twist.'] },
    { id: 'w6', skill: 'w.story', type: 'Story', title: 'Lost', prompt: 'Write a story with the title “Lost”. It could be about a lost object, a lost person, or being lost yourself.', plan: ['Decide what “lost” means in your story.', 'Start in the middle of the action.', 'Show feelings through body language (trembling hands, racing heart).', 'Found or not found? Decide the ending now.'] },
    { id: 'w7', skill: 'w.describe', type: 'Description', title: 'The storm', prompt: 'Describe a storm arriving over the place where you live. Use all five senses. This is a description, not a story: nothing needs to happen.', plan: ['Before: the strange calm, colours of the sky.', 'During: sounds, smells, how things move.', 'Use a simile, a metaphor and personification.', 'After: what has changed?'] },
    { id: 'w8', skill: 'w.describe', type: 'Description', title: 'The market', prompt: 'Describe a busy market early in the morning.', plan: ['Zoom in on three or four stalls or people.', 'Sounds and smells first: they make a place feel real.', 'Vary your sentence lengths. One very short sentence has impact.', 'End by zooming out, or on a single small detail.'] },
    { id: 'w9', skill: 'w.describe', type: 'Description', title: 'The abandoned house', prompt: 'Describe an old, abandoned house as you walk through it for the first time.', plan: ['Outside first, then the door, then inside.', 'Personification works well: the house “breathes”, stairs “groan”.', 'Leave clues about who lived there.', 'Decide the mood: creepy, sad, or peaceful?'] },
    { id: 'w10', skill: 'w.describe', type: 'Description', title: 'A place you love', prompt: 'Describe a real place that matters to you, so vividly that the reader feels they are standing there.', plan: ['Pick one specific time of day and season.', 'Small details beat big claims: not “it was beautiful” but what you saw.', 'Include one memory connected to the place.', 'Finish with how it makes you feel, in one line.'] },
    { id: 'w11', skill: 'w.nonfiction', type: 'Letter', title: 'Letter to the Head', prompt: 'Write a letter to your headteacher persuading them to introduce a new club, trip or rule at school.', plan: ['Formal opening: Dear Mrs/Mr ..., and a clear first sentence saying what you want.', 'Three reasons, each in its own paragraph with evidence.', 'Deal with one objection they might raise.', 'Polite ending and a clear request.'] },
    { id: 'w12', skill: 'w.nonfiction', type: 'Diary', title: 'Diary of a big day', prompt: 'Write the diary entry of a character on the evening of the most important day of their life.', plan: ['Start with “Dear Diary” and the date.', 'First person, past tense, personal feelings.', 'Mix what happened with how it felt.', 'End with a thought about tomorrow.'] },
    { id: 'w13', skill: 'w.nonfiction', type: 'Article', title: 'Newspaper report', prompt: 'Write a newspaper report about a strange event in your town (for example, a river turning purple or a giant footprint in the park).', plan: ['Catchy headline and a first sentence covering who, what, where, when.', 'Include a quote from a witness and one from an expert.', 'Keep it factual in tone, even if the event is silly.', 'End with what happens next.'] },
    { id: 'w14', skill: 'w.nonfiction', type: 'Speech', title: 'Speech to Year 6', prompt: 'Write a short speech to persuade Year 6 pupils to join a club you love.', plan: ['Hook: a question or surprising fact.', 'Rule of three: three reasons.', 'Talk directly to the audience: “you”.', 'Finish with a memorable line.'] },
    { id: 'w15', skill: 'w.story', type: 'Story', title: 'The photograph', prompt: 'Write a story inspired by this picture: an old black-and-white photograph of a child standing alone on a railway platform, holding a small suitcase.', plan: ['Who is the child and where are they going?', 'What is in the suitcase?', 'Pick a time period and keep it consistent.', 'A quiet, emotional ending often works best here.'] },
    { id: 'w16', skill: 'w.story', type: 'Story', title: 'The competition', prompt: 'Write a story about a competition that does not go as planned.', plan: ['What competition, and what does the main character expect?', 'The twist: what goes wrong (or surprisingly right)?', 'Show the character learning something.', 'Dialogue can show character: let people speak.'] },
    { id: 'w17', skill: 'w.describe', type: 'Description', title: 'Midnight in the city', prompt: 'Describe a city at midnight from the top of a tall building.', plan: ['Lights, shapes and sounds from above.', 'Contrast: the busy parts and the still parts.', 'A metaphor for the city as a whole (a machine? an animal? a sea?).', 'Finish with a single tiny detail far below.'] },
    { id: 'w18', skill: 'w.nonfiction', type: 'Letter', title: 'Letter from the future', prompt: 'Write a letter from your 25-year-old self to you today.', plan: ['What have you done? Be imaginative but believable.', 'Give one piece of advice, with a reason.', 'Mention something specific about being ten.', 'Warm, personal ending.'] },
    { id: 'w19', skill: 'w.story', type: 'Story', title: 'The night the river froze', prompt: 'Write a story called “The Night the River Froze”.', plan: ['Setting first: cold described through the senses.', 'Who goes onto the ice, and why?', 'Danger, decision, consequence.', 'A final image that stays in the reader’s mind.'] },
    { id: 'w20', skill: 'w.describe', type: 'Description', title: 'The kitchen at breakfast', prompt: 'Describe your kitchen on a busy school morning.', plan: ['Noise and movement: who is doing what?', 'Smells and tastes.', 'A bit of humour works well.', 'Vary sentence openers: adverbs, -ing words, prepositions.'] }
  ];

  const WRITING_RUBRIC = [
    { id: 'imagination', label: 'Imagination & creativity', help: 'Original ideas, interesting characters, a twist or surprise.' },
    { id: 'form', label: 'Form & purpose', help: 'It does what the task asked: a story reads like a story, a letter like a letter.' },
    { id: 'organisation', label: 'Organisation & cohesion', help: 'Clear beginning, middle and end, paragraphs, ideas linked smoothly.' },
    { id: 'sentences', label: 'Sentence structure', help: 'Varied lengths and openers, some complex sentences, accurate punctuation.' },
    { id: 'vocab', label: 'Vocabulary & effect', help: 'Precise, ambitious words; similes, metaphors and senses used for effect.' },
    { id: 'spag', label: 'Spelling, punctuation & grammar', help: 'Accurate spelling, speech punctuation, apostrophes, capital letters.' }
  ];

  /* ------------------------------------------------------------------ */
  /* Praise, encouragement, badges                                       */
  /* ------------------------------------------------------------------ */

  const PRAISE = ['Brilliant!', 'Nailed it!', 'You’re on fire!', 'Exactly right.', 'Superb thinking.', 'Top-set answer.', 'Boom! Correct.', 'Spot on.', 'That is how it is done.', 'Genius move.', 'Smashed it.', 'Perfect.'];
  const PRAISE_STREAK = ['Three in a row!', 'Unstoppable!', 'Streak alert!', 'You are flying!', 'Hat-trick!'];
  const ENCOURAGE = ['Not this time, but here is the trick:', 'Close! The key idea is:', 'Good try. This one catches lots of people out:', 'Every mistake teaches you something. Here it is:', 'Nearly. Have a look at this:', 'No problem. Watch how it works:'];
  const STRETCH_INTRO = ['Stretch question! This one is a level up. Give it a go.', 'Bonus challenge: harder than usual, no pressure.', 'You have earned a tougher one. Show off!'];
  const CONFIDENCE_INTRO = ['Let us warm up with this one.', 'Quick confidence builder:', 'Easy points coming up:'];

  const BADGES = [
    { id: 'first-session', name: 'First Steps', emoji: '🚀', desc: 'Completed your first 40-minute session.' },
    { id: 'five-sessions', name: 'Bridge Builder', emoji: '🌉', desc: 'Completed five sessions.' },
    { id: 'ten-sessions', name: 'Gorge Crosser', emoji: '🏔️', desc: 'Completed ten sessions.' },
    { id: 'streak-3', name: 'Hat-trick', emoji: '🎩', desc: 'Three correct answers in a row.' },
    { id: 'streak-8', name: 'On Fire', emoji: '🔥', desc: 'Eight correct answers in a row.' },
    { id: 'maths-50', name: 'Number Ninja', emoji: '🥷', desc: 'Fifty maths questions answered correctly.' },
    { id: 'vr-50', name: 'Word Wizard', emoji: '🧙', desc: 'Fifty verbal reasoning questions correct.' },
    { id: 'nvr-30', name: 'Shape Shifter', emoji: '🔷', desc: 'Thirty non-verbal reasoning questions correct.' },
    { id: 'writer-300', name: 'Wordsmith', emoji: '✍️', desc: 'Wrote a piece of at least 300 words.' },
    { id: 'interview-10', name: 'Smooth Talker', emoji: '🎤', desc: 'Practised ten interview questions.' },
    { id: 'comeback', name: 'Comeback Kid', emoji: '💪', desc: 'Raised a weak skill above 60.' },
    { id: 'stretch', name: 'Stretch Armstrong', emoji: '🦾', desc: 'Got a stretch question right.' },
    { id: 'weekly-4', name: 'Four-Week Streak', emoji: '📅', desc: 'A session every week for four weeks.' },
    { id: 'all-rounder', name: 'All-Rounder', emoji: '🌟', desc: 'Every subject above 60.' },
    { id: 'speedster', name: 'Speedster', emoji: '⚡', desc: 'Ten multiple-choice questions right at exam pace.' }
  ];

  const ADVICE = {
    pacing: 'In the QEH online test you get roughly 45 seconds a question. If one is taking too long, pick your best guess and move on: there is no penalty for a wrong answer.',
    workings: 'In the BGS papers, show your working. A clear method can earn marks even when the final answer slips.',
    reading: 'Read the whole question twice. Underline the key words in your head: ALL sizes, in PENCE, to the NEAREST...',
    writing: 'Plan for five minutes, write for most of the time, and save three minutes to read it back and fix punctuation.',
    interview: 'Look up, smile, and treat it as a chat about things you love. A short real example beats a long list.'
  };

  return {
    SCHOOLS,
    SUBJECTS,
    SKILLS,
    INTERVIEW_FRAMEWORKS,
    INTERVIEW_QUESTIONS,
    INTERVIEW_RAPID,
    PASSAGES,
    SPAG,
    VOCAB,
    HIDDEN_WORDS,
    ODD_ONE_OUT,
    ANALOGIES,
    COMPOUNDS,
    MISSING_WORDS,
    PUZZLES,
    WRITING_PROMPTS,
    WRITING_RUBRIC,
    PRAISE,
    PRAISE_STREAK,
    ENCOURAGE,
    STRETCH_INTRO,
    CONFIDENCE_INTRO,
    BADGES,
    ADVICE
  };
});
