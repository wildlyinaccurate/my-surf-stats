import { useComputed, useSignal } from "@preact/signals-react";
import { Block, Card, ColGrid, Icon, Flex, Metric, Text, BarChart, Title, DonutChart } from "@tremor/react";
import { countBy, identity } from "ramda";
import Head from "next/head";
import NotesParser from "../components/NotesParser";
import date from "../lib/date";
import useLocalStorageState from "../lib/hooks/useLocalStorageState";
import { ParseError, SurfNote } from "../lib/notes-parser";
import SurfIcon from "../components/icons/SurfIcon";
import FriendIcon from "../components/icons/FriendIcon";
import LocationIcon from "../components/icons/LocationIcon";
import ParseResultDetails from "../components/ParseResultDetails";

const CHART_HEIGHT = "h-80";

export default function Index() {
    const [inputValue, setInputValue] = useLocalStorageState("v1.inputValue", "");
    const [lexicon, setLexicon] = useLocalStorageState("v1.lexicon", {});
    const parsedResult = useSignal<(SurfNote | ParseError)[]>([]);
    const parseErrors = useComputed(() => parsedResult.value.filter((val): val is ParseError => "error" in val));
    const notes = useComputed(() => parsedResult.value.filter((val): val is SurfNote => "date" in val));
    const resultsExpanded = useSignal(false);

    const daysData = useComputed(() => countBy((note: SurfNote) => date(note.date).format("YYYY-MM-DD"))(notes.value));

    const weeksData = useComputed(() => {
        const weeks = Object.fromEntries(new Array(52).fill(0).map((v, i) => [i + 1, v]));
        const surfsByWeek = countBy((note: SurfNote) => date(note.date).week())(notes.value);

        return Object.entries({ ...weeks, ...surfsByWeek }).map(([week, surfs]) => ({
            Week: date().week(Number(week)).format("D MMM"),
            Surfs: surfs,
        }));
    });

    const friendsData = useComputed(() => {
        const friends = countBy(
            identity,
            notes.value.flatMap((note) => note.friends)
        );

        return Object.entries(friends).map(([friend, surfs]) => ({
            Friend: friend,
            Surfs: surfs,
        }));
    });

    const boardsData = useComputed(() => {
        const boards = countBy(
            identity,
            notes.value.flatMap((note) => note.boards)
        );

        return Object.entries(boards).map(([board, surfs]) => ({
            Board: board,
            Surfs: surfs,
        }));
    });

    const timesData = useComputed(() => {
        const surfsByTime = countBy((note: SurfNote) => {
            const hour = date(note.date).hour();

            if (hour < 12) {
                return "Morning";
            } else if (hour >= 12 && hour < 17) {
                return "Afternoon";
            }

            return "Evening";
        })(notes.value);

        type Time = "Morning" | "Afternoon" | "Evening";

        // Predefine the categories so that we can match each category to a colour
        const categories: Record<Time, { Time: Time; Surfs: number }> = {
            Morning: { Time: "Morning", Surfs: 0 },
            Afternoon: { Time: "Afternoon", Surfs: 0 },
            Evening: { Time: "Evening", Surfs: 0 },
        };

        Object.entries(surfsByTime).forEach(([time, surfs]) => (categories[time as Time].Surfs = surfs));

        return Object.values(categories);
    });

    return (
        <div className="container">
            <Head>
                <title>Surf Stats!</title>
                <meta name="description" content="Generate stats about your surfs" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="px-4 py-5 mt-5 text-center">
                <h1>Surf Stats 🏄‍♀️</h1>
            </div>

            <div className="row justify-content-center text-center">
                <div className="col-10">
                    {parseErrors.value && (
                        <div className="alert alert-warning">
                            We could not fully parse the notes you pasted. Click the &quot;View Results&quot; link below
                            for more details.
                        </div>
                    )}

                    <div className="form-floating">
                        <NotesParser
                            className="form-control"
                            id="notes-parser"
                            lexicon={lexicon.value}
                            onInput={(event) => setInputValue(event.currentTarget.value)}
                            onParse={(parsed) => (parsedResult.value = parsed)}
                            placeholder="Paste your surf notes here"
                            style={{ height: "120px" }}
                            value={inputValue.value}
                        />
                        <label htmlFor="notes-parser">Paste your surf notes here</label>
                    </div>

                    <a href="#results" onClick={() => (resultsExpanded.value = true)} className="info-link mt-3">
                        View Results
                    </a>

                    {resultsExpanded.value && <ParseResultDetails results={parsedResult.value} />}
                </div>
            </div>

            <hr />

            <div className="row mt-4">
                <ColGrid numColsSm={1} numColsLg={3} gapX="gap-x-6" gapY="gap-y-6">
                    <Card decoration="top" decorationColor={"indigo"}>
                        <Flex justifyContent="justify-start" spaceX="space-x-4">
                            <Icon icon={SurfIcon} variant="light" size="xl" color="indigo" />
                            <Block>
                                <Metric color="indigo">{notes.value.length}</Metric>
                                <Text>
                                    surfs over <b>{Object.keys(daysData.value).length} days</b>
                                </Text>
                            </Block>
                        </Flex>
                    </Card>

                    <Card decoration="top" decorationColor={"fuchsia"}>
                        <Flex justifyContent="justify-start" spaceX="space-x-4">
                            <Icon icon={FriendIcon} variant="light" size="xl" color="fuchsia" />
                            <Block>
                                <Metric color="fuchsia">{Object.keys(friendsData.value).length}</Metric>
                                <Text>surf buddies</Text>
                            </Block>
                        </Flex>
                    </Card>

                    <Card decoration="top" decorationColor={"amber"}>
                        <Flex justifyContent="justify-start" spaceX="space-x-4">
                            <Icon icon={LocationIcon} variant="light" size="xl" color="amber" />
                            <Block>
                                <Metric color="amber">9</Metric>
                                <Text>different surf locations</Text>
                            </Block>
                        </Flex>
                    </Card>
                </ColGrid>
            </div>

            <div className="row mt-4">
                <ColGrid numColsSm={1} numColsLg={2} gapX="gap-x-6" gapY="gap-y-6">
                    <Card>
                        <Title>Surfs by week</Title>
                        <BarChart
                            categories={["Surfs"]}
                            colors={["indigo"]}
                            data={weeksData.value}
                            dataKey="Week"
                            height={CHART_HEIGHT}
                            marginTop="mt-5"
                            showLegend={false}
                            yAxisWidth="w-4"
                        />
                    </Card>

                    <Card>
                        <Title>Surfs by time of day</Title>
                        <DonutChart
                            category="Surfs"
                            colors={["yellow", "green", "orange"]}
                            data={timesData.value}
                            dataKey="Time"
                            height={CHART_HEIGHT}
                            marginTop="mt-5"
                            variant="pie"
                        />
                    </Card>

                    <Card>
                        <Title>Your favourite boards</Title>
                        <BarChart
                            categories={["Surfs"]}
                            colors={["blue", "green", "red"]}
                            data={boardsData.value}
                            dataKey="Board"
                            height={CHART_HEIGHT}
                            marginTop="mt-5"
                            showLegend={false}
                            yAxisWidth="w-4"
                        />
                    </Card>

                    <Card>
                        <Title>Your friends</Title>
                        <BarChart
                            categories={["Surfs"]}
                            colors={["blue", "green", "red"]}
                            data={friendsData.value}
                            dataKey="Friend"
                            height={CHART_HEIGHT}
                            marginTop="mt-5"
                            showLegend={false}
                            yAxisWidth="w-4"
                        />
                    </Card>
                </ColGrid>
            </div>
        </div>
    );
}
