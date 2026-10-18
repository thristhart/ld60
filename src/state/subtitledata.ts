const vhsSubtitles = `
4.00	7.75	This videotape is the last will and testament of Ralph Palmer,
7.75	11.8	born on April 18th, 1954 at 4:53pm,
11.80	14.0	as represented by me, Duncan Baker.
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
