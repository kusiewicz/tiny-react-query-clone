"use client";

import { useState } from "react";
import { useDataFetching } from "../../react-query";

const BASE_URL = "https://www.swapi.tech/api/people";

type PersonData = {
  message: string;
  result: {
    properties: {
      name: string;
      height: string;
      birth_year: string;
      gender: string;
    };
  };
};

export const UsageExampleComponent = () => {
  const [randomId, setRandomId] = useState(() =>
    Math.floor(Math.random() * 80 + 1)
  );

  const twinQuery1 = useDataFetching<PersonData>(
    `${BASE_URL}/1`,
    "swapi-people-1",
    {
      dedupingInterval: 5000,
      retryCount: 2,
      retryDelay: 1000,
    }
  );

  const twinQuery2 = useDataFetching<PersonData>(
    `${BASE_URL}/1`,
    "swapi-people-1"
  );

  const randomQuery = useDataFetching<PersonData>(
    `${BASE_URL}/${randomId}`,
    `swapi-people-${randomId}`
  );

  return (
    <div className="font-mono">
      <h2>🔁 Deduplication + Multiple Queries Demo</h2>

      <div className="mt-5">
        <h3>Query 1: Person 1</h3>
        <Hero {...twinQuery1} />

        <h3>Query 2 (Same as Query 1)</h3>
        <Hero {...twinQuery2} />
      </div>

      <div className="mt-8">
        <h3>Query 3: Random person</h3>
        <button
          className="cursor-pointer"
          onClick={() => setRandomId(Math.floor(Math.random() * 80 + 1))}
        >
          🔀 Load random
        </button>
        <Hero {...randomQuery} />
      </div>
    </div>
  );
};

type QueryResult = ReturnType<typeof useDataFetching<PersonData>>;

const Hero = ({
  data,
  isLoading,
  isValidating,
  error,
  refetch,
  mutate,
}: QueryResult) => {
  if (isLoading || !data) return <p>⏳ Loading...</p>;
  if (error) return <p className="text-red-500">❌ {error.message}</p>;

  const person = data.result.properties;

  return (
    <div className="border border-gray-300 p-3 rounded-lg">
      <p>
        🧍 <strong>Name:</strong> {person.name}
      </p>
      <p>
        📏 <strong>Height:</strong> {person.height}cm
      </p>
      <p>
        🍼 <strong>Birth year:</strong> {person.birth_year}
      </p>
      <p>
        ⚧️ <strong>Gender:</strong> {person.gender}
      </p>

      <div className="mt-3">
        <button className="mr-2 cursor-pointer" onClick={refetch}>
          🔁 Refetch
        </button>
        <button
          onClick={() => {
            mutate({
              ...data,
              result: {
                ...data.result,
                properties: { ...person, name: "Robert Lewandowski" },
              },
            });
          }}
          className="cursor-pointer"
        >
          🧬 Mutate
        </button>
      </div>

      {isValidating && <p>♻️ Validating...</p>}
    </div>
  );
};
