import nlp from "compromise";
import datePlugin from "compromise-dates";
import { Lexicon } from "compromise/types/misc";

nlp.plugin(datePlugin);
nlp.plugin({
    tags: {
        Surfboard: {
            isA: "Noun",
        },
    },
    words: {
        "Taylor's": "Place",
        "Taylor's Mistake": "Place",

        "7'4": "Surfboard",
        "5'6": "Surfboard",
        Clifford: "Surfboard",
    },
});

export type SurfNote = {
    date: Date;
    time?: string;
    location?: string;
    friends: string[];
    boards: string[];
    waves?: string;
    mood: string[];
    keywords: string[];
    raw: string[];
};

export type ParseError = {
    line: string;
    message: number;
};

export function parseNotes(input: string, lexicon?: Lexicon): (SurfNote | ParseError)[] {
    const lines = input.split("\n");
    const notes: SurfNote[] = [];
    let currentNote: SurfNote;

    lines.forEach((line) => {
        const doc = nlp(line, lexicon);

        const dates = doc
            .dates()
            .get()
            .filter((d) => d.start);

        if (dates.length > 0) {
            // Start a new note and save the previous one
            if (currentNote) {
                notes.push(currentNote as SurfNote);
            }

            currentNote = {
                date: dates[0].start,
                friends: [],
                boards: [],
                mood: [],
                keywords: [],
                raw: [],
            };
        }

        currentNote.raw.push(line);

        const boards = doc
            .match("#Surfboard+")
            .toTitleCase()
            .out("array")
            .map((s: string) => s.replace(/\.$/, ""));

        if (boards.length) {
            currentNote.boards = currentNote.boards.concat(boards);
        }

        const people = doc
            .people()
            .toTitleCase()
            .out("array")
            .map((s: string) => s.replace(/\.$/, ""));

        if (people.length) {
            currentNote.friends = currentNote.friends.concat(people);
        }
    });

    return notes;
}
