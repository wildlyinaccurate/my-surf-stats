export type SurfNote = {
    date: Date;
    time: string;
    location: string;
    friends: string[];
    boards: string[];
    waves: string;
    mood: string[];
    keywords: string[];
};

export type ParseError = {
    line: number;
    message: number;
};

export function parseNotes(input: string): (SurfNote | ParseError)[] {
    const lines = input.split("\n");

    return lines.filter(Boolean).map((line) => {
        const columns = line.split("\t");

        return {
            date: new Date(columns[0]),
            time: columns[1],
            location: columns[2],
            friends: columns[3].split(","),
            boards: columns[4].split(","),
            waves: columns[5],
            mood: columns[6].split(","),
            keywords: columns[7].split(","),
        };
    });
}
