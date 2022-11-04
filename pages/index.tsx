import { useComputed, useSignal } from "@preact/signals-react";
import { Block, Card, ColGrid, Icon, Flex, Metric, Text, BarChart, Title } from "@tremor/react";
import { countBy, identity } from "ramda";
import Head from "next/head";
import NotesParser from "../components/NotesParser";
import date from "../lib/date";
import useLocalStorageState from "../lib/hooks/useLocalStorageState";
import { ParseError, SurfNote } from "../lib/notes-parser";
import SurfIcon from "../components/icons/SurfIcon";
import FriendIcon from "../components/icons/FriendIcon";
import LocationIcon from "../components/icons/LocationIcon";

export default function Index() {
    const [inputValue, setInputValue] = useLocalStorageState("v1.inputValue", "");
    const parsedResult = useSignal<(SurfNote | ParseError)[]>([]);
    const notes = useComputed(() => parsedResult.value.filter((val): val is SurfNote => "date" in val));

    const weeksData = useComputed(() => {
        const weeks = Object.fromEntries(new Array(52).fill(0).map((v, i) => [i + 1, v]));
        const surfsByWeek = countBy((note: SurfNote) => date(note.date).week())(notes.value);

        return Object.entries({ ...weeks, ...surfsByWeek }).map(([week, surfs]) => ({
            Week: date().week(Number(week)).format("D MMM"),
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
            color: "ref",
            Surfs: surfs,
        }));
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
                <div className="col-8">
                    <div className="form-floating">
                        <NotesParser
                            value={inputValue.value}
                            onInput={(event) => setInputValue(event.currentTarget.value)}
                            onParse={(parsed) => (parsedResult.value = parsed)}
                            className="form-control"
                            placeholder="Paste your surf notes here"
                            id="notes-parser"
                            style={{ height: "120px" }}
                        />
                        <label htmlFor="notes-parser">Paste your surf notes here</label>
                    </div>
                </div>
            </div>

            <hr />

            <div className="row mt-4">
                <ColGrid numColsSm={1} numColsLg={3} gapX="gap-x-6" gapY="gap-y-6">
                    <Card decoration="top" decorationColor={"indigo"}>
                        <Flex justifyContent="justify-start" spaceX="space-x-4">
                            <Icon icon={SurfIcon} variant="light" size="xl" color="indigo" />
                            <Block>
                                <Metric color="indigo">97</Metric>
                                <Text>
                                    surfs over <b>92 days</b>
                                </Text>
                            </Block>
                        </Flex>
                    </Card>

                    <Card decoration="top" decorationColor={"fuchsia"}>
                        <Flex justifyContent="justify-start" spaceX="space-x-4">
                            <Icon icon={FriendIcon} variant="light" size="xl" color="fuchsia" />
                            <Block>
                                <Metric color="fuchsia">14</Metric>
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
                            data={weeksData.value}
                            dataKey="Week"
                            categories={["Surfs"]}
                            colors={["indigo"]}
                            showLegend={false}
                            marginTop="mt-5"
                            yAxisWidth="w-4"
                        />
                    </Card>

                    <Card>
                        <Title>Your favourite boards</Title>
                        <BarChart
                            data={boardsData.value}
                            dataKey="Board"
                            categories={["Surfs"]}
                            colors={["blue", "green", "red"]}
                            showLegend={false}
                            marginTop="mt-5"
                            yAxisWidth="w-4"
                        />
                    </Card>
                </ColGrid>
            </div>
        </div>
    );
}
