# `react-state-tree`

`react-state-tree` is a drop-in replacement for `useState` that persists your state into a redux-like state tree stored in a top-level provider component.

If you use `useStateTree` in an app with no `StateTreeProvider`, it will fall back to `useState`. So it is safe to use in custom hooks and components.

## Tutorial

To start using `react-state-tree`, wrap your app with a `StateTreeProvider`:

<!-- prettier-ignore -->
```jsx
import { StateTreeProvider } from "react-state-tree";

function App() {
  return (
    <StateTreeProvider> {/* added StateTreeProvider */}
      <Counter />
    </StateTreeProvider>
  );
}
```

Now, use `useStateTree` instead of `useState` every time you want to persist state to the tree:

<!-- prettier-ignore -->
```jsx
import { useStateTree } from "react-state-tree";

function Counter({ id }) {
  const [count, setCount] = useStateTree(0); // replaced useState with useStateTree

  const handleClick = () => setCount(count + 1);
  return <button onClick={handleClick}>{count}</button>;
}
```

Your app state is now stored within the `StateTreeProvider`; try adding an `onUpdate` callback to your `StateTreeProvider`:

<!-- prettier-ignore -->
```jsx
function App() {
  return (
    <StateTreeProvider onUpdate={(state) => console.log(state)}> {/* added onUpdate prop */}
      <Counter />
    </StateTreeProvider>
  );
}
```

You can now look in the console to see your state:

<!-- prettier-ignore -->
```js
// Sample log output
{ $0: 1 }
{ $0: 2 }
{ $0: 3 }
```

It's kind of ugly, though. Let's customize that key by adding a second argument to the `useStateTree` call:

<!-- prettier-ignore -->
```jsx
function Counter({ id }) {
  const [count, setCount] = useStateTree(0, "count"); // added "count" as the second argument

  const handleClick = () => setCount(count + 1);
  return <button onClick={handleClick}>{count}</button>;
}
```

Now if we look at the log output:

<!-- prettier-ignore -->
```js
{ count: 1 }
{ count: 2 }
{ count: 3 }
```

A lot nicer. But what if we want multiple counters in our app?

<!-- prettier-ignore -->
```jsx
function App() {
  return (
    <StateTreeProvider onUpdate={(state) => console.log(state)}>
      <Counter />
      <Counter /> {/* added another Counter */}
    </StateTreeProvider>
  );
}
```

With our custom key, they'll both try to write to `count`, which won't work...

If we remove the custom key, it'll work, but it'll be ugly again:

<!-- prettier-ignore -->
```js
{ $0: 1, $1: 0 }
{ $0: 1, $1: 1 }
{ $0: 1, $1: 2 }
```

How can we keep our nice custom `count` key but use a different part of the state tree for each counter?

One way is to wrap each counter with the `StateKey` component:

<!-- prettier-ignore -->
```jsx
import { StateTreeProvider, StateKey } from "react-state-tree";

function App() {
  return (
    <StateTreeProvider onUpdate={(state) => console.log(state)}>
      <StateKey value="first"> {/* added StateKey around Counter */}
        <Counter />
      </StateKey>
      <StateKey value="second"> {/* added StateKey around Counter */}
        <Counter />
      </StateKey>
    </StateTreeProvider>
  );
}
```

And now we can put our custom key back:

<!-- prettier-ignore -->
```jsx
function Counter({ id }) {
  const [count, setCount] = useStateTree(0, "count"); // put count back

  const handleClick = () => setCount(count + 1);
  return <button onClick={handleClick}>{count}</button>;
}
```

And now our state looks like this:

<!-- prettier-ignore -->
```js
{ first: { count: 1 }, second: {count: 0 } }
{ first: { count: 1 }, second: {count: 1 } }
{ first: { count: 1 }, second: {count: 2 } }
```

Neat! But what if we want them in an array instead of under the `first` and `second` keys?

To do that, we use `StateKeyList` instead of `StateKey`:

<!-- prettier-ignore -->
```jsx
import { StateTreeProvider, StateKey } from "react-state-tree";

function App() {
  return (
    <StateTreeProvider onUpdate={(state) => console.log(state)}>
      <StateKeyList value="counters"> {/* removed StateKeys and added StateKeyList instead */}
        <Counter />
        <Counter />
      </StateKeyList>
    </StateTreeProvider>
  );
}
```

Now our state looks like this:

<!-- prettier-ignore -->
```js
{
  counters: [
    { count: 1 },
    { count: 0 }
  ]
}
{
  counters: [
    { count: 1 },
    { count: 1 }
  ]
}
{
  counters: [
    { count: 1 },
    { count: 2 }
  ]
}
```

As you can see, the shape of your state follows the shape of your React tree in your app.

Now that we have all your app's state in one tree, let's try persisting it to `localStorage`:

<!-- prettier-ignore -->
```jsx
import { StateTreeProvider, StateKey } from "react-state-tree";

function App() {
  return (
    <StateTreeProvider
      // Added initialState prop and changed onUpdate prop
      initialState={localStorage.state ? JSON.parse(localStorage.state) : {}}
      onUpdate={(state) => localStorage.state = JSON.stringify(state)}
    >
      {/* ... omitted for brevity ... */}
    </StateTreeProvider>
  );
}
```

Now click your counters a few times, then refresh the page. The state persists across page refreshes!

## API Documentation

The `react-state-tree` module has several named exports; each is documented here.

### `StateTreeProvider`

`StateTreeProvider` is a React component that should be wrapped around your app- or at least, the part of your app where you want a state tree.

<!-- prettier-ignore -->
```jsx
import { StateTreeProvider } from "react-state-tree";

function App() {
  return (
    <StateTreeProvider>
      {/* rest of your app goes here... */}
    </StateTreeProvider>
  );
}
```

`StateTreeProvider` accepts two optional props (in addition to `children`):

- `initialValue` - The initial value for the state tree. Defaults to `{}`.
- `onUpdate` - A function to call whenever the state tree changes. It will be called with a single argument: the state tree.

### `useStateTree`

`useStateTree` is a React hook that behaves the same as `useState`, but the state is stored on the state tree instead of in component state.

Its signature is the same as `useState`:

```jsx
import { useStateTree } from "react-state-tree";

const [count, setCount] = useStateTree(0);
```

But it also accepts an optional second argument, the key to persist the state under:

```jsx
import { useStateTree } from "react-state-tree";

const [count, setCount] = useStateTree(0, "count");
```

If you don't pass the second argument, it will us an autogenerated key by default (unless you use `nextStateTreeKey`; see the docs for that function below for more details).

### `StateKey`

This component wraps a portion of your app and changes where all `useStateTree` calls in child components link to on the state tree.

When you don't have a `StateKey` in your app, all `useStateTree` calls will link to the top object in the state tree:

<!-- prettier-ignore -->
```jsx
import {useStateKey, StateTreeProvider} from "react-state-tree";

// Given this component:
function Counter() {
  const [count, setCount] = useStateTree(0, "count");

  return (
    <button
      onClick={() => setCount(count + 1)}
    >
      {count}
    </button>
  );
}

// And this app:
function App() {
  return (
    <StateTreeProvider>
      <Counter />
    </StateTreeProvider>
  )
}

// The state tree will look like this:
// { count: 0 }
```

But if you wrap a portion of your app with a `StateKey`, then all of the state for child components of that `StateKey` are linked to a sub-tree of your state tree:

```jsx
import { useStateKey, StateTreeProvider, StateKey } from "react-state-tree";

// If you wrap the same Counter from above with a StateKey:
function App() {
  return (
    <StateTreeProvider>
      <StateKey value="counter">
        <Counter />
      </StateKey>
    </StateTreeProvider>
  );
}

// Then all of that Counter's state is moved underneath the "counter" key in your state tree:
// { counter: { count: 0 } }
```

The `value` prop passed to the `StateKey` determines where child component state gets linked. In the above example, the `value` prop was `"counter"`, so the state was moved to `{ counter: ... }` in the state tree.

`StateKey`s compose with parent `StateKeys`, allowing you to create large, deep state trees.

### `StateListKey`

`StateListKey` works the same as `StateKey`, but it creates an Array instead of an object.

Suppose we had an app with two counters in it:

<!-- prettier-ignore -->
```jsx
import {useStateKey, StateTreeProvider} from "react-state-tree";

// Given this component:
function Counter({ stateKey }) {
  const [count, setCount] = useStateTree(0, stateKey);

  return (
    <button
      onClick={() => setCount(count + 1)}
    >
      {count}
    </button>
  );
}

// And this app:
function App() {
  return (
    <StateTreeProvider>
      <Counter stateKey="first" />
      <Counter stateKey="second" />
    </StateTreeProvider>
  )
}

// The state tree will look like this:
// { first: 0, second: 0 }
```

If we wrap the counters in a `StateListKey`, then they will be linked to an array in the state tree instead:

<!-- prettier-ignore -->
```jsx
import {useStateKey, StateTreeProvider, StateListKey} from "react-state-tree";

function App() {
  return (
    <StateTreeProvider>
      <StateListKey value="counters">
        <Counter stateKey="first" />
        <Counter stateKey="second" />
      </StateListKey>
    </StateTreeProvider>
  )
}

// Each Counter's state is moved into an object that lives in an array at the "counters" key in your state tree:
// {
//   counters: [
//     { first: 0 },
//     { second: 0 }
//   ]
// }

// Since they're in separate objects now, it probably makes sense to remove the `stateKey` prop from `Counter` and always put the state at `count` instead:
function Counter() {
  const [count, setCount] = useStateTree(0, "count");

  return (
    <button
      onClick={() => setCount(count + 1)}
    >
      {count}
    </button>
  );
}

// With that change in place, here's how the state tree will look:
// {
//   counters: [
//     { count: 0 },
//     { count: 0 }
//   ]
// }
```

The `value` prop passed to the `StateListKey` determines where the array for child component states will get linked. In the above example, the `value` prop was `"counters"`, so the state was linked to `{ counters: [...] }` in the state tree.

### `nextStateTreeKey`

`nextStateTreeKey` is an escape-hatch that lets you specify the state key for the next `useStateTree` call.

Suppose you had a custom hook that created some state:

```jsx
function usePosition(leftKey, rightKey) {
  const [position, setPosition] = useStateTree({ x: 0, y: 0 });

  // ... and a bunch of custom logic that
  // calls `setPosition` based on user input,
  // using `leftKey` and `rightKey`.

  return position;
}
```

And you were using that hook multiple times in a component:

```jsx
function MyComponent() {
  const player1Pos = usePosition("ArrowLeft", "ArrowRight");
  const player2Pos = usePosition("a", "d");

  // ... rest of the component omitted
}
```

If you want to specify a state key for each `position`, you can't do so unless you modify `usePosition` to accept a state key:

```jsx
function usePosition(leftKey, rightKey, stateKey) {
  const [position, setPosition] = useStateTree({ x: 0, y: 0 }, stateKey);

  // ...
}

function MyComponent() {
  const player1Pos = usePosition("ArrowLeft", "ArrowRight", "player1Position");
  const player2Pos = usePosition("a", "d", "player2Position");

  // ...
}
```

This works fine, but if you have a lot of nested hooks, it can be tedious to thread the custom key all the way down to where the `useStateTree` call is.

As a workaround, you can use the `nextStateTreeKey` function to specify the key for the next `useStateTree` call:

```jsx
function usePosition(leftKey, rightKey) {
  const [position, setPosition] = useStateTree({ x: 0, y: 0 });

  // ...
}

function MyComponent() {
  nextStateTreeKey("player1Position");
  const player1Pos = usePosition("ArrowLeft", "ArrowRight");

  nextStateTreeKey("player2Position");
  const player2Pos = usePosition("a", "d");

  // ...
}
```

However, use this sparingly; it creates an implicit contract that the next custom hook will use `useStateTree` at some point, which can be dangerous. If `usePosition` was changed later to not use `useStateTree`, then `nextStateTreeKey` could affect some other unrelated `useStateTree` call elsewhere in the app (whichever `useStateTree` call happens next, as long as it doesn't have a key specified).

Note that `nextStateTreeKey` has no effect on `useStateTree` calls that have a state key specified as their second argument; `nextStateTreeKey` _only_ affects `useStateTree` calls without a second argument. If you call `nextStateTreeKey` before a `useStateTree` call, but that `useStateTree` call had a second argument specified, then the key passed into `nextStateTreeKey` will be unused, because the second argument to `useStateTree` will be used instead.

### `useEntireStateTree`

`useEntireStateTree` is an escape hatch that gives you the entire state tree, and the ability to change it. It's useful if you want to create a component that shows the state tree (for debugging), or you want to implement a redux-style `dispatch` pattern on top of `react-state-tree`.

When `useEntireStateTree` is called, it returns an object with two keys: `stateTree` and `replaceStateTree`.

- `stateTree` is the entire state tree.
- `replaceStateTree` is a function that can be called with a new state tree object to replace the state tree. Think of it as `setState` for the whole state tree.

## License

MIT
