import { ParseError, SurfNote } from "../lib/notes-parser";

type ParseResultDetailsProps = {
    results: Array<SurfNote | ParseError>;
};

export default function ParseResultDetails(props: ParseResultDetailsProps) {
    const { results } = props;

    return (
        <div>
            Your text was parsed into {results.length} notes.
            <div>
                {results.map((result) => (
                    <pre>{JSON.stringify(result, null, 4)}</pre>
                ))}
            </div>
        </div>
    );
}
