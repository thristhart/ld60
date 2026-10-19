const vhsSubtitles = `
4.00	7.75	This videotape is the last will and testament of Ralph Palmer,
7.75	11.8	born on April 18th, 1954 at 4:53pm,
11.80	14.0	as represented by me, Duncan Baker.
15.0	19.0	Your grandfather requires you to solve a series of puzzles in order to obtain your inheritance.
20.0	23.2	It will be held in escrow indefinitely until you earn it.
23.2	28.6	Throughout the room are various "gadgets and gizmos" your grandfather was fond of,
26.8	30.48	that you will use to unlock your inheritance.
31.0	35.0	Your grandfather will explain in more detail using his own words.
35.5	38.3	Oh, my dear little cheddar biscuit.
38.3	42.6	Of all my grandchildren, you were truly my favorite.
42.6	47.1	When everyone else was busy rotting away on their laptops and their iPhones,
47.1	50.68	you were still entranced by the rotary phone.
50.68	56.62	Of all your siblings you're the only one who knows how to read an analog clock, or tune a radio.
56.62	61.14	Everyone else thinks they're getting a small but even share of my meager fortune,
61.14	65.29	but in truth I'm leaving most of my wealth and possessions to you.
65.29	69.0	What pleasant memories we have of our times together!
69.0	72.0	I hope this little exercise jogs up some of them.
72.0	76.0	The next step involves the clock, and my birthday.
76.0	79.0	Bye-bye, from your pappy.
`;

const cassetteSubtitles = `
12.0	14.5	Have you made plans for your family's future?
14.5	16.0	Don't leave it to the last minute!
16.0	19.0	If you've got a complex will or a convoluted trust,
19.0	22.2	you can trust the offices of Duncan Baker to make it happen.
22.2	26.81	Give us a call at 555-243-1460.
26.81	31.0	That's 555-243-1460.
31.0	33.5	Don't wait until it's too late!
`;

const phoneCallSubtitles = `
0.00	1.64	This is Duncan Baker.
1.64	3.00	Congratulations!
3.00	5.88	You've completed the little game your grandfather left for you.
5.88	9.00	In doing so, you'll be receiving the other thing he left for you:
9.00	11.75	5.6 million dollars.
11.75	15.00	But the real treasure is all this old tech you got to use, right?
16.20	17.4	Right?
`;

const vhsSubtitleData = vhsSubtitles
    .trim()
    .split("\n")
    .map((line) => {
        const [start, stop, subtitle] = line.trim().split("\t");
        return {
            start: parseFloat(start),
            stop: parseFloat(stop),
            subtitle,
        };
    });
const cassetteSubtitleData = cassetteSubtitles
    .trim()
    .split("\n")
    .map((line) => {
        const [start, stop, subtitle] = line.trim().split("\t");
        return {
            start: parseFloat(start),
            stop: parseFloat(stop),
            subtitle,
        };
    });
const phoneCallSubtitleData = phoneCallSubtitles
    .trim()
    .split("\n")
    .map((line) => {
        const [start, stop, subtitle] = line.trim().split("\t");
        return {
            start: parseFloat(start),
            stop: parseFloat(stop),
            subtitle,
        };
    });

export function GetVHSSubtitleAtTime(time: number | undefined) {
    if (!time) {
        return undefined;
    }
    for (const title of vhsSubtitleData) {
        if (title.start <= time && title.stop >= time) {
            return title;
        }
    }
    return undefined;
}

export function GetCassetteSubtitleAtTime(time: number | undefined) {
    if (!time) {
        return undefined;
    }
    for (const title of cassetteSubtitleData) {
        if (title.start <= time && title.stop >= time) {
            return title;
        }
    }
    return undefined;
}

export function GetPhoneCallSubtitleAtTime(time: number | undefined) {
    if (!time) {
        return undefined;
    }
    for (const title of phoneCallSubtitleData) {
        if (title.start <= time && title.stop >= time) {
            return title;
        }
    }
    return undefined;
}
