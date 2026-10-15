'use strict';
/* Study Quest data: Computing & PSHE-online (MYP2 — online safety, digital wellbeing, web design). */
(function (root, factory) {
  const mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  else { root.SQ_DATA = root.SQ_DATA || []; root.SQ_DATA.push(mod); }
})(typeof self !== 'undefined' ? self : this, function () {
  const LINKS = {
    bitesize: { label: 'BBC Bitesize — KS3 Computer Science', url: 'https://www.bbc.co.uk/bitesize/subjects/zvc9q6f' },
    childnet: { label: 'Childnet — advice for young people', url: 'https://www.childnet.com/young-people/' },
    interland: { label: 'Google Interland — online safety game', url: 'https://beinternetawesome.withgoogle.com/en_us/interland' },
    oak: { label: 'Oak National Academy — Year 8 Computing', url: 'https://www.thenational.academy/pupils/years/year-8/subjects' }
  };
  return {
    id: 'computing', name: 'Computing', short: 'Computing', emoji: '💻',
    tagline: 'Online safety, digital wellbeing, evaluating information, privacy and website design',
    topics: [
      {
        id: 'comp-safety', name: 'Safe & private online', strand: 'Online safety',
        intro: 'Passwords that can’t be cracked, phishing you can smell a mile off, and keeping your data yours.',
        links: [LINKS.childnet, LINKS.interland, LINKS.bitesize],
        cards: [
          { title: 'Passwords that work', body: 'Strong = <b>long and unique</b>. A passphrase like <b>PurpleTiger!Jumps42</b> beats "password123" by miles — length matters more than weird symbols.<br><br>Rules: a different password for every important account, never share them (best friends included), and turn on <b>two-factor authentication (2FA)</b> — a code on your phone as a second lock, so a stolen password alone isn’t enough.' },
          { title: 'Phishing', body: '<b>Phishing</b> = fake messages pretending to be real companies (or friends) to trick you into handing over passwords or card details.<br><br>Warning signs: urgent threats ("act NOW or lose your account!"), prizes you never entered for, odd sender addresses, links that don’t match the real site, and <b>anyone asking for your password — real companies never do</b>.' },
          { title: 'Your data, your footprint', body: 'Personal data = anything identifying you: full name, home address, school, phone number, live location. Keep it off public profiles.<br><br>Your <b>digital footprint</b> is the trail you leave online — posts, comments, photos, likes. It’s hard to delete and easy for others to screenshot, so post as if a future employer is reading. Check app privacy settings: if a game demands your location for no reason, say no.' },
          { title: 'When something feels wrong', body: 'If a stranger wants to move your chat somewhere private, asks for photos, or anything online makes you uncomfortable: <b>stop, don’t reply, save the evidence, block, report — and tell a trusted adult</b>. You will never be in trouble for asking for help. Every decent platform has report and block buttons; use them without hesitation.' }
        ],
        questions: [
          { id: 'cs1', type: 'mcq', q: 'Which is the strongest password?', options: ['PurpleTiger!Jumps42', 'password123', 'eli2014', 'qwerty'], answer: 0,
            hint: 'Long + unpredictable wins.', explain: 'A long passphrase with mixed words, symbols and numbers takes centuries to crack; the others take seconds.' },
          { id: 'cs2', type: 'mcq', q: 'Two-factor authentication (2FA) means…', options: ['a second check (like a phone code) on top of your password', 'two different passwords', 'logging in twice a day', 'two people share the account'], answer: 0,
            hint: 'Something you know PLUS something you have.', explain: 'Even if someone steals your password, they can’t get in without the second factor.' },
          { id: 'cs3', type: 'mcq', q: 'Phishing is…', options: ['fake messages that trick you into giving away details', 'a fishing video game', 'downloading music', 'a type of virus scan'], answer: 0,
            hint: 'The bait is a convincing-looking message.', explain: 'Phishing messages impersonate real organisations to "fish" for your passwords and card details.' },
          { id: 'cs4', type: 'mcq', q: 'Which is a classic phishing warning sign?', options: ['"URGENT: click this link now or lose your account!"', 'a message with no links at all', 'an email from your teacher about homework', 'a receipt for something you actually bought'], answer: 0,
            hint: 'Scammers want you panicked, not thinking.', explain: 'Urgency plus a link plus a threat is the phishing formula — slow down and check the sender.' },
          { id: 'cs5', type: 'mcq', q: 'Which should you NEVER post on a public profile?', options: ['your home address', 'your favourite game', 'a drawing you made', 'your opinion about a film'], answer: 0,
            hint: 'Which one tells a stranger where to find you?', explain: 'Home address, school, phone number and live location are for real-life trusted people only.' },
          { id: 'cs6', type: 'mcq', q: 'Your digital footprint is…', options: ['the trail of data you leave online', 'the size of your screen', 'your keyboard typing speed', 'a virus'], answer: 0,
            hint: 'Every post and like adds to it.', explain: 'Posts, comments, photos and likes build a lasting record — easy to make, hard to erase.' },
          { id: 'cs7', type: 'mcq', q: 'A stranger in a game asks to move the chat to a private app. You should…', options: ['decline and tell a trusted adult', 'agree — it’s probably fine', 'share your number so it’s easier', 'send them a selfie first'], answer: 0,
            hint: 'Why would they want to leave the moderated chat?', explain: 'Moving to private chats is a classic grooming move — decline, block if needed, and tell a trusted adult.' },
          { id: 'cs8', type: 'mcq', q: 'Should you share your password with your best friend?', options: ['no — passwords stay private, full stop', 'yes, if they promise not to tell', 'yes, best friends are safe', 'only on weekends'], answer: 0,
            hint: 'Friendships change; shared passwords don’t expire.', explain: 'Even people you trust can slip up, fall out with you, or get hacked themselves. Passwords are private.' },
          { id: 'cs9', type: 'mcq', q: 'A free quiz app demands your exact location to run. Best response?', options: ['deny it — a quiz doesn’t need your location', 'allow it — all apps need everything', 'delete your other apps instead', 'give it a fake name but real location'], answer: 0,
            hint: 'Does the permission match the job?', explain: 'Only grant permissions an app genuinely needs. A quiz has no business knowing where you are.' },
          { id: 'cs10', type: 'mcq', q: 'Something online has made you really uncomfortable. The best move is…', options: ['block, report, and tell a trusted adult', 'keep it secret and hope it stops', 'reply angrily', 'delete the evidence immediately'], answer: 0,
            hint: 'Three verbs — and one of them involves a real person.', explain: 'Block and report with the platform’s tools, keep evidence, and loop in an adult you trust. You’re never in trouble for asking.' }
        ]
      },
      {
        id: 'comp-think', name: 'Think before you believe', strand: 'Digital wellbeing',
        intro: 'Clickbait, deepfakes and filter bubbles: how to fact-check the internet — and keep your screen time healthy.',
        links: [LINKS.bitesize, LINKS.childnet, LINKS.oak],
        cards: [
          { title: 'Clickbait and fake news', body: '<b>Clickbait</b> = headlines engineered to make you click ("You won’t BELIEVE what happened next!"). <b>Fake news</b> spreads faster than real news because shocking stories get shared before anyone checks them.<br><br>The share button is a publish button — once you share it, it’s your claim too.' },
          { title: 'How to fact-check', body: 'Professional fact-checkers use <b>lateral reading</b>: instead of staring at the page, open new tabs and check <b>who is behind the site and whether reliable sources report the same story</b>.<br><br>Ask: Who wrote it? When? What’s their evidence? Who benefits if I believe this? A NASA page, a museum or a major news organisation beats an anonymous viral post every time.' },
          { title: 'Bias, bubbles and deepfakes', body: '<b>Bias</b> = presenting one side as the whole story. Algorithms feed you more of what you already like, trapping you in a <b>filter bubble / echo chamber</b> where everyone seems to agree with you.<br><br>A <b>deepfake</b> is AI-generated fake video or audio of a real person. Seeing is no longer believing — check the source before you trust the clip.' },
          { title: 'Digital wellbeing', body: 'Healthy tech habits look like: screens off before sleep (blue light and doom-scrolling wreck it), regular breaks, hobbies and friends offline, and noticing how apps make you <i>feel</i>.<br><br>Apps are designed to hold your attention — streaks, autoplay, infinite scroll. Knowing the tricks is half the defence. And an ad dressed up as a normal post is <b>sponsored content</b> — influencers must label it.' }
        ],
        questions: [
          { id: 'ct1', type: 'mcq', q: 'Clickbait is…', options: ['an exaggerated headline designed to make you click', 'a fishing simulator', 'a virus', 'a kind of cookie'], answer: 0,
            hint: '"You won’t BELIEVE…"', explain: 'Clickbait promises more than it delivers — the click is the product.' },
          { id: 'ct2', type: 'mcq', q: 'Fake news spreads quickly mainly because…', options: ['shocking stories get shared before anyone checks them', 'it’s always better written', 'newspapers print it first', 'it only spreads on Tuesdays'], answer: 0,
            hint: 'What makes YOU hit share?', explain: 'Outrage and amazement trigger shares; checking takes effort. That gap is how falsehoods outrun facts.' },
          { id: 'ct3', type: 'mcq', q: 'The best way to check a surprising story is to…', options: ['see whether reliable sources report it too (lateral reading)', 'count the likes', 'check if the pictures look cool', 'ask in the comments'], answer: 0,
            hint: 'Open new tabs, leave the page.', explain: 'Lateral reading — checking other trustworthy sources — is how professional fact-checkers work.' },
          { id: 'ct4', type: 'mcq', q: 'A biased website is one that…', options: ['presents only one side of the story', 'loads slowly', 'has adverts', 'uses bright colours'], answer: 0,
            hint: 'What’s missing from the story?', explain: 'Bias means a one-sided telling — spot it by asking whose voice is missing.' },
          { id: 'ct5', type: 'mcq', q: 'Which source is most trustworthy for a science fact?', options: ['a NASA or museum website', 'an anonymous viral post', 'a comment under a video', 'a meme'], answer: 0,
            hint: 'Who has experts and a reputation to lose?', explain: 'Organisations with expertise and accountability (NASA, museums, universities) beat anonymous posts.' },
          { id: 'ct6', type: 'mcq', q: 'A deepfake is…', options: ['an AI-generated fake video or audio of a real person', 'a very deep lake', 'a hidden level in a game', 'a strong password'], answer: 0,
            hint: 'The face is real; the footage isn’t.', explain: 'AI can now fabricate convincing video and audio — one more reason to check the source, not just your eyes.' },
          { id: 'ct7', type: 'mcq', q: 'Which is a sign of HEALTHY screen habits?', options: ['taking breaks and keeping up offline hobbies', 'scrolling in bed until 2am', 'skipping meals to keep a streak', 'checking your phone every 30 seconds'], answer: 0,
            hint: 'Balance is the clue.', explain: 'Tech is healthy when it fits around sleep, friends, movement and hobbies — not instead of them.' },
          { id: 'ct8', type: 'mcq', q: 'An "echo chamber" or "filter bubble" means…', options: ['only ever seeing opinions like your own', 'a sound effect in music apps', 'a soundproof gaming room', 'a type of microphone'], answer: 0,
            hint: 'The algorithm feeds you what you already agree with.', explain: 'Recommendation algorithms can wall you in with similar views — seek out other perspectives on purpose.' },
          { id: 'ct9', type: 'mcq', q: 'Before sharing a dramatic post you should…', options: ['check it’s actually true', 'add more exclamation marks', 'share fast before others do', 'tag everyone you know'], answer: 0,
            hint: 'Sharing = publishing.', explain: 'A 30-second check saves you from spreading falsehoods with your name on them.' },
          { id: 'ct10', type: 'mcq', q: 'An advert disguised as a normal post by an influencer is called…', options: ['sponsored content', 'a news bulletin', 'open source', 'a system update'], answer: 0,
            hint: 'Look for #ad — it’s required.', explain: 'Paid promotions must be labelled (e.g. #ad). If someone’s paid to say it, judge it like an advert.' }
        ]
      },
      {
        id: 'comp-web', name: 'Build the web', strand: 'Website design',
        intro: 'HTML bones, CSS style and the design rules that make websites a joy (or a nightmare) to use.',
        links: [LINKS.bitesize, LINKS.oak, LINKS.interland],
        cards: [
          { title: 'HTML: the skeleton', body: '<b>HTML</b> (HyperText Markup Language) holds a page’s <b>structure and content</b> using tags: <b>&lt;h1&gt;</b> is the main heading, &lt;p&gt; a paragraph, &lt;img&gt; an image, and <b>&lt;a&gt;</b> a hyperlink that jumps to another page.<br><br>This very app is built from HTML — view the source and see!' },
          { title: 'CSS: the style', body: '<b>CSS</b> (Cascading Style Sheets) controls how it all <b>looks</b>: colours, fonts, spacing, layout. HTML says "this is a heading"; CSS says "headings are big, bold and blue".<br><br>Separating content (HTML) from style (CSS) means one style change can restyle a whole site.' },
          { title: 'Design for everyone', body: 'Good sites are <b>accessible</b>:<br>• <b>Alt text</b> on images describes them for people using screen readers.<br>• Strong <b>colour contrast</b> keeps text readable for everyone, including colour-blind users.<br>• Clear fonts, short paragraphs and headings help every reader.<br><br>Designing for accessibility makes the site better for all users.' },
          { title: 'Design that works', body: 'The classics of good web design: a <b>consistent navigation menu</b> (same place on every page), obvious links, fast loading, and layouts that work on a phone.<br><br>A <b>URL</b> is a page’s address — <i>https://www.bbc.co.uk/bitesize</i> — and your <b>browser</b> is the program that fetches pages and displays them. Check the URL before trusting a page: scammers fake the look, but faking the address is harder.' }
        ],
        questions: [
          { id: 'cw1', type: 'mcq', q: 'HTML is used for a web page’s…', options: ['structure and content', 'colours and fonts', 'internet connection', 'passwords'], answer: 0,
            hint: 'It’s the skeleton, not the clothes.', explain: 'HTML marks up the content — headings, paragraphs, images, links. CSS handles the look.' },
          { id: 'cw2', type: 'mcq', q: 'CSS controls a page’s…', options: ['appearance — colours, fonts and layout', 'content and words', 'wifi speed', 'search ranking'], answer: 0,
            hint: 'The S is for Style.', explain: 'Cascading Style Sheets style the HTML: same content, any look.' },
          { id: 'cw3', type: 'mcq', q: 'The &lt;h1&gt; tag marks…', options: ['the main heading', 'a hyperlink', 'an image', 'a hidden message'], answer: 0,
            hint: 'h for heading, 1 for the biggest.', explain: '<h1> is the top-level heading; h2–h6 are smaller sub-headings.' },
          { id: 'cw4', type: 'mcq', q: 'A hyperlink (the &lt;a&gt; tag)…', options: ['takes you to another page when clicked', 'plays a sound', 'deletes the page', 'makes text bold'], answer: 0,
            hint: 'It’s the "HyperText" in HTML.', explain: 'Links are what make the web a web — pages connected to pages.' },
          { id: 'cw5', type: 'mcq', q: 'Alt text on an image is important because it…', options: ['describes the image for screen-reader users', 'makes the image load faster', 'stops people copying it', 'adds a watermark'], answer: 0,
            hint: 'Think of someone who can’t see the image.', explain: 'Screen readers speak the alt text aloud — without it, blind users get nothing. It also shows if the image fails to load.' },
          { id: 'cw6', type: 'mcq', q: 'Good colour contrast between text and background matters because…', options: ['it keeps text readable for everyone', 'it uses less electricity', 'it makes pages load faster', 'search engines demand rainbows'], answer: 0,
            hint: 'Pale grey on white — how does it feel to read?', explain: 'Low contrast makes text hard or impossible to read, especially for visually impaired users.' },
          { id: 'cw7', type: 'mcq', q: 'A URL is…', options: ['the address of a web page', 'a type of virus', 'a programming language', 'a username'], answer: 0,
            hint: 'You type it in the bar at the top.', explain: 'Uniform Resource Locator — the unique address that finds one page among billions.' },
          { id: 'cw8', type: 'mcq', q: 'Keeping the navigation menu the same on every page helps because…', options: ['users always know where they are and how to move around', 'it looks mysterious', 'it saves ink', 'menus are decorative'], answer: 0,
            hint: 'Imagine a supermarket that rearranged itself every visit.', explain: 'Consistency builds a mental map — users navigate without thinking. That’s good design.' },
          { id: 'cw9', type: 'mcq', q: 'Which combination is most readable?', options: ['a clear font, short paragraphs and headings', 'ALL CAPS in neon green on yellow', 'tiny text with no spacing', 'one 2,000-word paragraph'], answer: 0,
            hint: 'Think of the pages you find easiest to read.', explain: 'Clear type, white space and structure let readers scan and understand — walls of neon text repel them.' },
          { id: 'cw10', type: 'mcq', q: 'A web browser’s job is to…', options: ['fetch web pages and display them', 'create electricity', 'print newspapers', 'block all images'], answer: 0,
            hint: 'Chrome, Safari and Firefox all do it.', explain: 'The browser requests pages from servers, then turns the HTML and CSS into what you see.' }
        ]
      }
    ]
  };
});
