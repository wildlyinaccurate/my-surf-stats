import { FormEvent, TextareaHTMLAttributes } from "react";
import { useSignal, useSignalEffect } from "@preact/signals-react";
import { ParseError, parseNotes, SurfNote } from "../lib/notes-parser";

type NotesParserProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    onParse?: (notes: (SurfNote | ParseError)[]) => void;
};

export default function NotesParser(props: NotesParserProps) {
    const { value = "", onParse, ...textareaProps } = props;
    const input = useSignal(String(value));

    useSignalEffect(() => {
        if (onParse) {
            onParse(parseNotes(input.value));
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
