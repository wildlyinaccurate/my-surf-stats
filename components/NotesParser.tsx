import { FormEvent, TextareaHTMLAttributes } from "react";
import { useComputed, useSignal, useSignalEffect } from "@preact/signals-react";
import { ParseError, parseNotes, SurfNote } from "../lib/notes-parser";
import { Lexicon } from "compromise/types/misc";

type NotesParserProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    onParse?: (notes: (SurfNote | ParseError)[]) => void;
    lexicon?: Lexicon;
};

export default function NotesParser(props: NotesParserProps) {
    const { value = "", onParse, lexicon, ...textareaProps } = props;
    const input = useSignal(String(value));
    const parsedNotes = useComputed(() => {
        try {
            return parseNotes(input.value, lexicon);
        } catch (e) {
            console.error(e);
            return [];
        }
    });

    useSignalEffect(() => {
        if (onParse) {
            onParse(parsedNotes.value);
        }
    });

    const onInput = (event: FormEvent<HTMLTextAreaElement>) => {
        input.value = event.currentTarget.value;

        if (props.onInput) {
            props.onInput(event);
        }
    };

    return <textarea {...textareaProps} value={value} onInput={onInput} />;
}
