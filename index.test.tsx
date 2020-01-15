import React from "react";
import { render, fireEvent, cleanup } from "react-testing-library";
import {
  StateTreeProvider,
  useStateTree,
  nextStateTreeKey,
  StateKey,
  StateListKey,
  useEntireStateTree,
} from ".";

afterEach(cleanup);

test("basic usage", () => {
  function Counter({ id }: { id: string }) {
    const [count, setCount] = useStateTree(0);

    return (
      <button data-testid={id} onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    );
  }

  let state = {};

  const app = render(
    <StateTreeProvider
      initialValue={state}
      onUpdate={(newState) => (state = newState)}
    >
      <Counter id="first" />
      <Counter id="second" />
    </StateTreeProvider>
  );

  expect(app.container.innerHTML).toMatchInlineSnapshot(
    `"<button data-testid=\\"first\\">Count: 0</button><button data-testid=\\"second\\">Count: 0</button>"`
  );

  const firstButton = app.getByTestId("first");
  const secondButton = app.getByTestId("second");

  fireEvent.click(firstButton);
  fireEvent.click(firstButton);

  fireEvent.click(secondButton);

  expect(app.container.innerHTML).toMatchInlineSnapshot(
    `"<button data-testid=\\"first\\">Count: 2</button><button data-testid=\\"second\\">Count: 1</button>"`
  );
  expect(state).toMatchInlineSnapshot(`
Object {
  "$0": 2,
  "$1": 1,
}
`);
});

test("user-specified keys in useStateTree call", () => {
  function Counter({ id }: { id: string }) {
    const [count, setCount] = useStateTree(0, id);

    return (
      <button data-testid={id} onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    );
  }

  let state = {};

  const app = render(
    <StateTreeProvider
      initialValue={state}
      onUpdate={(newState) => {
        state = newState;
      }}
    >
      <Counter id="first" />
      <Counter id="second" />
    </StateTreeProvider>
  );

  expect(app.container.innerHTML).toMatchInlineSnapshot(
    `"<button data-testid=\\"first\\">Count: 0</button><button data-testid=\\"second\\">Count: 0</button>"`
  );

  const firstButton = app.getByTestId("first");
  const secondButton = app.getByTestId("second");

  fireEvent.click(firstButton);
  fireEvent.click(firstButton);

  fireEvent.click(secondButton);

  expect(app.container.innerHTML).toMatchInlineSnapshot(
    `"<button data-testid=\\"first\\">Count: 2</button><button data-testid=\\"second\\">Count: 1</button>"`
  );
  expect(state).toMatchInlineSnapshot(`
Object {
  "first": 2,
  "second": 1,
}
`);
});

test("user-specified keys via nextStateTreeKey", () => {
  function Counter({ id }: { id: string }) {
    nextStateTreeKey(id);
    const [count, setCount] = useStateTree(0);

    return (
      <button data-testid={id} onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    );
  }

  let state = {};

  const app = render(
    <StateTreeProvider
      initialValue={state}
      onUpdate={(newState) => {
        state = newState;
      }}
    >
      <Counter id="first" />
      <Counter id="second" />
    </StateTreeProvider>
  );

  expect(app.container.innerHTML).toMatchInlineSnapshot(
    `"<button data-testid=\\"first\\">Count: 0</button><button data-testid=\\"second\\">Count: 0</button>"`
  );

  const firstButton = app.getByTestId("first");
  const secondButton = app.getByTestId("second");

  fireEvent.click(firstButton);
  fireEvent.click(firstButton);

  fireEvent.click(secondButton);

  expect(app.container.innerHTML).toMatchInlineSnapshot(
    `"<button data-testid=\\"first\\">Count: 2</button><button data-testid=\\"second\\">Count: 1</button>"`
  );
  expect(state).toMatchInlineSnapshot(`
Object {
  "first": 2,
  "second": 1,
}
`);
});

test("StateKey", () => {
  function Counter({ id }: { id: string }) {
    const [count, setCount] = useStateTree(0, id);

    return (
      <button data-testid={id} onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    );
  }

  let state = {};

  const app = render(
    <StateTreeProvider
      initialValue={state}
      onUpdate={(newState) => {
        state = newState;
      }}
    >
      <StateKey value="counters">
        <Counter id="first" />
        <Counter id="second" />
      </StateKey>
    </StateTreeProvider>
  );

  expect(app.container.innerHTML).toMatchInlineSnapshot(
    `"<button data-testid=\\"first\\">Count: 0</button><button data-testid=\\"second\\">Count: 0</button>"`
  );

  const firstButton = app.getByTestId("first");
  const secondButton = app.getByTestId("second");

  fireEvent.click(firstButton);
  fireEvent.click(firstButton);

  fireEvent.click(secondButton);

  expect(app.container.innerHTML).toMatchInlineSnapshot(
    `"<button data-testid=\\"first\\">Count: 2</button><button data-testid=\\"second\\">Count: 1</button>"`
  );
  expect(state).toMatchInlineSnapshot(`
Object {
  "counters": Object {
    "first": 2,
    "second": 1,
  },
}
`);
});

test("StateListKey", () => {
  function Counter({ id }: { id: string }) {
    const [count, setCount] = useStateTree(0, "count");

    return (
      <button data-testid={id} onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    );
  }

  let state = {};

  const app = render(
    <StateTreeProvider
      initialValue={state}
      onUpdate={(newState) => {
        state = newState;
      }}
    >
      <StateListKey value="counters">
        <Counter id="first" />
        <Counter id="second" />
      </StateListKey>
    </StateTreeProvider>
  );

  expect(app.container.innerHTML).toMatchInlineSnapshot(
    `"<button data-testid=\\"first\\">Count: 0</button><button data-testid=\\"second\\">Count: 0</button>"`
  );

  const firstButton = app.getByTestId("first");
  const secondButton = app.getByTestId("second");

  fireEvent.click(firstButton);
  fireEvent.click(firstButton);

  fireEvent.click(secondButton);

  expect(app.container.innerHTML).toMatchInlineSnapshot(
    `"<button data-testid=\\"first\\">Count: 2</button><button data-testid=\\"second\\">Count: 1</button>"`
  );
  expect(state).toMatchInlineSnapshot(`
Object {
  "counters": Array [
    Object {
      "count": 2,
    },
    Object {
      "count": 1,
    },
  ],
}
`);
});

test("composing StateKey with StateListKey", () => {
  function Counter({ id }: { id: string }) {
    const [count, setCount] = useStateTree(0, "count");

    return (
      <button data-testid={id} onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    );
  }

  let state = {};

  const app = render(
    <StateTreeProvider
      initialValue={state}
      onUpdate={(newState) => {
        state = newState;
      }}
    >
      <StateListKey value="counters">
        <StateKey value="button">
          <Counter id="first" />
        </StateKey>
        <StateKey value="button">
          <Counter id="second" />
        </StateKey>
      </StateListKey>
    </StateTreeProvider>
  );

  expect(app.container.innerHTML).toMatchInlineSnapshot(
    `"<button data-testid=\\"first\\">Count: 0</button><button data-testid=\\"second\\">Count: 0</button>"`
  );

  const firstButton = app.getByTestId("first");
  const secondButton = app.getByTestId("second");

  fireEvent.click(firstButton);
  fireEvent.click(firstButton);

  fireEvent.click(secondButton);

  expect(app.container.innerHTML).toMatchInlineSnapshot(
    `"<button data-testid=\\"first\\">Count: 2</button><button data-testid=\\"second\\">Count: 1</button>"`
  );
  expect(state).toMatchInlineSnapshot(`
Object {
  "counters": Array [
    Object {
      "button": Object {
        "count": 2,
      },
    },
    Object {
      "button": Object {
        "count": 1,
      },
    },
  ],
}
`);
});

test("hydrating state from initial value (simple)", () => {
  function Counter({ id }: { id: string }) {
    const [count, setCount] = useStateTree(0, id);

    return (
      <button data-testid={id} onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    );
  }

  let state = {
    first: 4,
    second: 56,
  };

  const app = render(
    <StateTreeProvider initialValue={state}>
      <Counter id="first" />
      <Counter id="second" />
    </StateTreeProvider>
  );

  expect(app.container.innerHTML).toMatchInlineSnapshot(
    `"<button data-testid=\\"first\\">Count: 4</button><button data-testid=\\"second\\">Count: 56</button>"`
  );
});

test("hydrating state from initial value (complex)", () => {
  function Counter({ id }: { id: string }) {
    const [count, setCount] = useStateTree(0, "count");

    return (
      <button data-testid={id} onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    );
  }

  let state = {
    counters: [
      {
        button: {
          count: 50,
        },
      },
      // second counter omitted
    ],
  };

  const app = render(
    <StateTreeProvider initialValue={state}>
      <StateListKey value="counters">
        <StateKey value="button">
          <Counter id="first" />
        </StateKey>
        <StateKey value="button">
          <Counter id="second" />
        </StateKey>
      </StateListKey>
    </StateTreeProvider>
  );

  expect(app.container.innerHTML).toMatchInlineSnapshot(
    `"<button data-testid=\\"first\\">Count: 50</button><button data-testid=\\"second\\">Count: 0</button>"`
  );
});

test("useEntireStateTree", () => {
  const initialState = {};

  function Counter({ id }: { id: string }) {
    const [count, setCount] = useStateTree(0, id);

    return (
      <button data-testid={id} onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    );
  }

  function StateView() {
    const { stateTree, replaceStateTree } = useEntireStateTree();
    return (
      <pre>
        {JSON.stringify(stateTree)}
        <button
          onClick={() => {
            replaceStateTree(initialState);
          }}
        >
          Reset
        </button>
      </pre>
    );
  }

  const app = render(
    <StateTreeProvider initialValue={initialState}>
      <Counter id="first" />
      <Counter id="second" />
      <StateView />
    </StateTreeProvider>
  );

  expect(app.container.innerHTML).toMatchInlineSnapshot(
    `"<button data-testid=\\"first\\">Count: 0</button><button data-testid=\\"second\\">Count: 0</button><pre>{\\"second\\":0,\\"first\\":0}<button>Reset</button></pre>"`
  );

  const firstButton = app.getByTestId("first");
  const secondButton = app.getByTestId("second");

  fireEvent.click(firstButton);
  fireEvent.click(firstButton);

  fireEvent.click(secondButton);

  expect(app.container.innerHTML).toMatchInlineSnapshot(
    `"<button data-testid=\\"first\\">Count: 2</button><button data-testid=\\"second\\">Count: 1</button><pre>{\\"second\\":1,\\"first\\":2}<button>Reset</button></pre>"`
  );

  fireEvent.click(app.getByText("Reset"));

  expect(app.container.innerHTML).toMatchInlineSnapshot(
    `"<button data-testid=\\"first\\">Count: 0</button><button data-testid=\\"second\\">Count: 0</button><pre>{\\"second\\":0,\\"first\\":0}<button>Reset</button></pre>"`
  );
});
