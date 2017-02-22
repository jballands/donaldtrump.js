//
//  utils/sentenceTokenizer.js
//
//  donaldtrump.js
//  (C) 2017 Jonathan Ballands
//

const tokenizerBlacklist = ['mr.', 'mrs.', 'ms.', 'sen.', 'vs.', 'assoc.', 'avg.',
    'incl.', 'pres.', 'u.s.'];

export default function(text) {
    // To tokenize into sentences, it's sometimes easier to look at each word
    const words = text.split(' ');

    const terminationRegex = new RegExp(/[\.|!|\?|\|]+$/g);

    const sentences = [];
    let acc = [];

    for (const word of words) {
        acc.push(word);
        const lowercased = word.toLowerCase();

        // Intelligently skip over the blacklist
        if (tokenizerBlacklist.indexOf(lowercased) > -1) {
            continue;
        }

        // Add acc to sentences if this word has a termination sequence in it
        if (terminationRegex.test(word)) {
            sentences.push(acc.join(' '));
            acc = [];
        }
    }

    return sentences;
}
