# tiny-react-query-clone

Lightweight custom implementation of a React Query-like data fetching and caching library.  
Supports caching, deduplication, retries, optimistic updates, and manual refetching.

## Features

- ✅ Cache management with expiration (cacheTime)
- 🔁 Deduplication of simultaneous requests (dedupingInterval)
- ♻️ Automatic retries on fetch errors
- 🧬 Optimistic updates with mutate
- 🔥 Manual refetching
- 🎯 Fine-grained control with fetch options

## Demo

The project includes a usage example (`usage-example.tsx`) fetching data from SWAPI (https://www.swapi.tech/).

![image](https://github.com/user-attachments/assets/aed9482c-0c2b-4ec0-804d-18ce22dd615d)


## Installation

```bash
git clone https://github.com/your-username/tiny-react-query-clone.git
cd tiny-react-query-clone
npm install
npm run dev
```

## Usage

Wrap your app with `ReactQueryProvider` and pass in a `QueryClient`:

```
import { ReactQueryProvider, QueryClient } from "./context/react-query-provider";

const client = new QueryClient();

export default function App() {
  return (
    <ReactQueryProvider client={client}>
      <YourComponents />
    </ReactQueryProvider>
  );
}
```
<br>
Fetch data inside components using `useDataFetching`:

```
const { data, error, isLoading, refetch, mutate } = useDataFetching(
  "https://api.example.com/item/1",
  "item-1"
);
```
