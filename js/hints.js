window.HM = window.HM || {};
HM.TAG_PHRASES = {
animal: ['It has a pulse', 'Something from the animal kingdom', 'Could be at a zoo', 'Nature documentary material', 'Might need feeding', 'Ask a vet'],
bird: ['Feathers may be involved', 'Look up', 'Something with wings', 'Tweet-adjacent', 'Birdwatchers care'],
sea: ['Salty territory', 'Think of the ocean', 'Deep blue thoughts', 'Sailors know it', 'Below the waves, maybe'],
insect: ['Six legs, probably', 'Small and crawly', 'Bug-adjacent', 'Buzz around this one', 'Tiny creature energy'],
plant: ['It photosynthesises', 'Rooted somewhere', 'Gardeners would know', 'Green thumbs up', 'Grows from the ground'],
food: ['Edible territory', 'Your stomach cares', 'Think about the menu', 'Something on a plate', 'Snack-adjacent'],
drink: ['Sip on this', 'Goes in a glass', 'Think about thirst', 'Pour one out', 'Liquid refreshment'],
body: ['Look at yourself', 'Anatomy class', 'Part of you, maybe', 'Doctors point at it', 'Flesh-and-bone stuff'],
health: ['The doctor will see you', 'Medicine cabinet energy', 'Wellness-adjacent', 'Hospital vocabulary', 'Feeling under the weather?'],
clothing: ['You could wear it', 'Check the closet', 'Fashion-adjacent', 'Something to put on', 'Wardrobe territory'],
home: ['Found around the house', 'Domestic life', 'Home sweet home', 'Room by room', 'Where you live, roughly'],
kitchen: ['Kitchen territory', 'The chef has one', 'Near the stove', 'Cooking class', 'Check the cupboards'],
tool: ['Handy to have', 'Check the toolbox', 'It helps get a job done', 'Used with your hands', 'Workshop material'],
vehicle: ['It gets you places', 'Wheels? Wings? Hulls?', 'Transport department', 'Going somewhere', 'Moves people or things'],
travel: ['Pack your bags', 'Away from home', 'Passport energy', 'On the move', 'Tourist vocabulary'],
place: ['It is somewhere', 'Put a pin in the map', 'A location of sorts', 'You could go there', 'Geography class'],
building: ['It has walls', 'Built by hands', 'Architecture class', 'You could walk into it', 'Brick-and-mortar'],
nature: ['Go outside', 'Mother Nature approves', 'The great outdoors', 'Natural world', 'Far from the city'],
weather: ['Check the forecast', 'Look at the sky', 'Meteorologists talk about it', 'Bring an umbrella?', 'Climate chatter'],
space: ['Look way, way up', 'Astronomy class', 'Beyond the clouds', 'Cosmic vocabulary', 'Telescope territory'],
science: ['Lab coat required', 'Science class', 'Ask a researcher', 'Hypothesis-adjacent', 'Textbook material'],
tech: ['Plug it in', 'Engineers know it', 'Tech vocabulary', 'Circuits and code', 'Modern machinery'],
music: ['Turn it up', 'Music class', 'Has a rhythm to it', 'Ask a musician', 'Ear candy'],
art: ['Gallery material', 'Creative territory', 'Art class', 'Ask an artist', 'Beauty is in the eye...'],
sport: ['Game day', 'Athletic territory', 'Sweat might be involved', 'Coach would know', 'Stadium vocabulary'],
game: ['Let us play', 'Fun and games', 'Roll the dice', 'Win or lose', 'Game night'],
job: ['Someone gets paid for this', 'Career day', 'Work-adjacent', 'Clock in', 'A line of work'],
people: ['Humans involved', 'About a person', 'Somebody, somewhere', 'Social territory', 'Ask around'],
family: ['Family tree', 'Relatives might be involved', 'Holiday dinner talk', 'Kin-adjacent', 'Blood is thicker...'],
feeling: ['Feel it in your chest', 'Emotional territory', 'Mood ring material', 'Something you feel', 'Heart over head'],
action: ['Something you do', 'An action', 'Get moving', 'Verbs are doing words', 'Do it, do it now'],
motion: ['Things in motion', 'Movement involved', 'Not sitting still', 'Kinetic energy', 'Going somewhere fast'],
sound: ['Listen closely', 'Ears perk up', 'Makes some noise', 'Acoustic territory', 'Hear that?'],
quality: ['Describes something', 'An adjective lives here', 'A trait or quality', 'How would you describe it?', 'Adjective energy'],
mind: ['Think about it', 'Brain territory', 'Mental matters', 'Ask a philosopher', 'Between the ears'],
time: ['Tick tock', 'Check the clock', 'Time-adjacent', 'Calendar vocabulary', 'Past, present, future'],
number: ['Count it', 'Math class', 'Numbers involved', 'Quantity matters', 'Do the arithmetic'],
color: ['Paint the picture', 'A splash of colour', 'Look at the palette', 'Hue knew?', 'Art supply energy'],
shape: ['Geometry class', 'Trace its outline', 'Form and figure', 'Shape-shifting', 'Draw it'],
material: ['What is it made of?', 'Raw material', 'Building blocks', 'Touch the texture', 'Stuff stuff is made of'],
money: ['Follow the money', 'Cha-ching', 'Wallet territory', 'Economics class', 'Costs something'],
language: ['Words about words', 'English class', 'Linguists care', 'Speak up', 'Grammar-adjacent'],
law: ['Order in the court', 'Legal territory', 'Rules and regulations', 'Ask a lawyer', 'By the book'],
myth: ['Legendary stuff', 'Once upon a time', 'Mythology class', 'Gods and monsters', 'Folklore material'],
history: ['History class', 'From the past', 'Dusty old books', 'Museum material', 'Ancient times, maybe'],
war: ['Battle-adjacent', 'Military vocabulary', 'Armour up', 'Generals would know', 'Conflict territory'],
school: ['Back to school', 'Teacher would approve', 'Classroom vocabulary', 'Study hard', 'Homework energy'],
light: ['Let there be light', 'Bright idea', 'Shines somehow', 'Glow-adjacent', 'Illuminating'],
fire: ['Things are heating up', 'Hot hot hot', 'Smoke may be involved', 'Feel the burn', 'Flame-adjacent'],
water: ['Wet territory', 'Make a splash', 'H-two-oh', 'Things that flow', 'Dive in'],
magic: ['A little magical', 'Spellbook material', 'Abracadabra', 'Wizards would know', 'Mystical territory'],
danger: ['Proceed with caution', 'Risky business', 'Watch out', 'Danger-adjacent', 'Not entirely safe'],
fun: ['Fun times', 'Party energy', 'Good vibes', 'Grin-inducing', 'Lighten up'],
};
HM.POS_PHRASES = {
noun: ['It is a thing', 'A noun, probably', 'Person, place or thing', 'You could point at it'],
verb: ['It is a doing word', 'An action word', 'You can do this', 'A verb, probably'],
adj: ['It describes something', 'A describing word', 'An adjective, probably', 'Use it to describe'],
adv: ['It describes how', 'An adverb, probably', 'Tells you the manner', 'Modifies an action'],
other:['Not your usual word', 'Defies categories', 'Odd one out'],
};
HM.FLAVOR = [
'The skull is judging your spelling', 'Somewhere, a crow is laughing at you', 'The forest has eyes. Several.',
'Your keyboard fears you', 'Vowels are cheap. Time is not.', 'The noose is patient', 'Dictionaries cannot save you here',
'Nobody spells it right the first time. Probably.', 'Type like the trees are watching. They are.',
'Bones do not lie. Bones also cannot spell.', 'Rumor has it the word is a word', 'A ghost just sighed at your last guess',
'Moonlight makes every letter look guilty', 'Do not panic. The skull panics for you.', 'Hint: the word has letters in it',
'The wind whispers... nothing useful', 'Your ancestors are rooting for you. Some of them.', 'That skull won a spelling bee once',
'Every wrong guess feeds the forest', 'Hesitation is how they get you', 'The owls do not know either',
'Somewhere a librarian just fainted', 'Trust your gut. Your gut has no eyes.', 'Rare letters lurk in the undergrowth',
'The fog knows. The fog will not say.', 'Fun fact: the gallows were built by an English teacher',
'The crows have placed bets. Against you.', 'Spell it like you mean it', 'A bat flew by. It was not helpful.',
'Deep breaths. The forest can smell fear.', 'Legend says someone once guessed Z first. Legend.', 'Even the moon is squinting',
'Your typing speed has been noted by the dead', 'Unlimited guesses. Limited dignity.', 'The mushrooms are whispering. Ignore them.',
'You are being watched by a very literate raven', 'Somebody in these woods knows the word. Not telling.',
'It is not the letters. It is the order.', 'A wisp floats by, smug as ever', 'The trees creak in disappointment',
'Ask the skull nicely. It will still say nothing.', 'Q without U? Bold. Possible, though.', 'Lightning would help. It will not come.',
'The ground here is mostly old guesses', 'Your vocabulary is on trial. The jury is spiders.', 'Clock check: still ticking. Sorry.',
'The clue box is right there, you know', 'A goblin claims he knew it instantly. Goblins lie.', 'Each tile is a tiny coffin',
'The fog thickens. Rude.', 'You hear distant typing. It is yours.', 'Guess loud. Guess proud.', 'The bones rattle approvingly. Maybe.',
];
HM.HINT_FRAMES = [t => `The crows mutter: ${t}`, t => `A wisp whispers: ${t}`, t => `The trees creak: ${t}`, t => `Overheard in the fog: ${t}`, t => `The skull hums: ${t}`, t => `Scrawled on a gravestone: ${t}`];
HM.QUIPS = {
miss: ['Ooh. Bold choice.', 'The skull winced', 'That letter was not invited', 'Wrong, but with confidence', 'The crows are taking notes', 'Bad letter. Bad.', 'Even the fog groaned', 'The forest just laughed. Out loud.', 'Somewhere, a bell tolls for that guess'],
hit: ['Lucky... or skilled?', 'The bones approve', 'A tile flips. The forest gasps.', 'Okay, okay, show-off', 'The crows are recalculating', 'That one stung them'],
low: ['TICK. TOCK.', 'The noose tightens', 'Ten seconds of fame left', 'Type faster, bone-brain', 'The skull is sweating. Skulls cannot sweat.', 'The trees lean in closer'],
perk: ['Cheater. Lovely.', 'The forest allows it. This time.', 'Ooh, magic', 'The rules just blinked', 'A rune flickers. Someone is meddling.'],
tier: ['Deeper into the woods...', 'The trees grow taller here', 'Harder words. Hungrier crows.', 'The moon turns a shade darker', 'You hear the gallows creak ahead'],
wordmiss: ['Nice word. Wrong word.', 'Close? Who can say. Not us.', 'The skull mouths: no.', 'A valiant attempt at literacy'],
};
HM.VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
HM.LETTER_FREQ = 'etaoinshrdlcumwfgypbvkjxqz';
HM.Hints = {
pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
quip(kind) { return HM.Hints.pick(HM.QUIPS[kind] || HM.FLAVOR); },
buildLoop(entry) {
const P = HM.Hints.pick, items = [];
const flav = HM.FLAVOR.slice().sort(() => Math.random() - 0.5).slice(0, 7);
flav.forEach(text => items.push({ text, kind: 'flavor' }));
if (entry) {
const tag = P(entry.t || []);
if (tag && HM.TAG_PHRASES[tag]) items.push({ text: P(HM.HINT_FRAMES)(P(HM.TAG_PHRASES[tag])), kind: 'hint' });
if (Math.random() < 0.5) items.push({ text: P(HM.HINT_FRAMES)(P(HM.POS_PHRASES[entry.pos] || HM.POS_PHRASES.other)), kind: 'hint' });
if (Math.random() < 0.2) items.push({ text: 'The bones rattle: ' + P(HM.Hints.structural(entry.w).slice(1)).toLowerCase(), kind: 'hint' });
}
for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
return items;
},
structural(word) {
const out = [];
const n = word.length;
const letters = word.split('');
const vowels = letters.filter(c => HM.VOWELS.has(c)).length;
const distinct = new Set(letters).size;
out.push(`${n} letters long`);
out.push(vowels === 0 ? 'Not a single A E I O U' : `${vowels} vowel${vowels > 1 ? 's' : ''} (not counting Y)`);
out.push(`${distinct} distinct letter${distinct > 1 ? 's' : ''}`);
if (/(.)\1/.test(word)) out.push('Contains a double letter');
else out.push('No double letters');
if (/[jqxz]/.test(word)) out.push('Hides a rare letter (J, Q, X or Z)');
if (word.includes('y')) out.push('Y makes an appearance');
out.push(HM.VOWELS.has(word[0]) ? 'Starts with a vowel' : 'Starts with a consonant');
out.push(HM.VOWELS.has(word[n - 1]) ? 'Ends with a vowel' : 'Ends with a consonant');
const syl = HM.Hints.syllables(word);
out.push(`About ${syl} syllable${syl > 1 ? 's' : ''}`);
return out;
},
syllables(word) {
let w = word.toLowerCase();
if (w.length <= 3) return 1;
w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
const m = w.match(/[aeiouy]{1,2}/g);
return Math.max(1, m ? m.length : 1);
}
};
