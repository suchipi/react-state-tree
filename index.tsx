import React, { useState, useContext, useRef } from "react";
import { get, set } from "lodash";
import produce from "immer";

const MISSING = {};

type StateTreePath = Array<string | number>;

type StateTreeAPI<StateTreeType> = {
  stateTree: StateTreeType;
  replaceStateTree: (nextStateTree: StateTreeType) => void;
  markGeneratedPath: (path: StateTreePath) => void;
  checkIfGeneratedPathInUse: (path: StateTreePath) => boolean;
};

const defaultStateTreeAPI = {
  stateTree: null,
  replaceStateTree: () => {},
  markGeneratedPath: () => {},
  checkIfGeneratedPathInUse: () => false,
};

const StateTree = React.createContext<StateTreeAPI<any>>(defaultStateTreeAPI);
const StateTreePath = React.createContext<StateTreePath>([]);

export function StateTreeProvider<StateTreeType extends Object>({
  children,
  // @ts-ignore
  initialValue = {},
  onUpdate = () => {},
}: {
  children?: React.ReactNode;
  initialValue?: StateTreeType;
  onUpdate?: (stateTree: StateTreeType) => void;
}) {
  const [stateTree, rawReplaceStateTree] = useState(initialValue);
  const generatedPaths = useRef({});

  return (
    <StateTree.Provider
      value={{
        stateTree,
        replaceStateTree(nextStateTree) {
          rawReplaceStateTree(nextStateTree);
          onUpdate(nextStateTree);
        },
        markGeneratedPath(path) {
          set(generatedPaths.current, path, true);
        },
        checkIfGeneratedPathInUse(path) {
          return get(generatedPaths.current, path, false);
        },
      }}
    >
      {children}
    </StateTree.Provider>
  );
}

export function StateKey({
  value,
  children,
}: {
  value: string | number;
  children: React.ReactNode;
}) {
  const parentPath = useContext(StateTreePath);

  return (
    <StateTreePath.Provider value={parentPath.concat(value)}>
      {children}
    </StateTreePath.Provider>
  );
}

export function StateListKey({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return (
    <StateKey value={value}>
      {React.Children.map(children, (child, index) => {
        return (
          <StateKey key={index} value={index}>
            {child}
          </StateKey>
        );
      })}
    </StateKey>
  );
}

export function useEntireStateTree() {
  const { stateTree, replaceStateTree } = useContext(StateTree);
  return { stateTree, replaceStateTree };
}

let defaultStateTreeKey: string | number | null = null;

export function nextStateTreeKey(nextKey: string | number) {
  defaultStateTreeKey = nextKey;
}

export function useStateTree<T>(
  initialValue: T,
  key = defaultStateTreeKey
): [T, (nextValue: T) => void] {
  defaultStateTreeKey = null;

  const keyRef = useRef(key);

  const stateTreeApi = useContext(StateTree);
  if (stateTreeApi === defaultStateTreeAPI) {
    // If they aren't using a StateTreeProvider, fall back to useState
    return useState(initialValue);
  }

  const {
    stateTree,
    replaceStateTree,
    markGeneratedPath,
    checkIfGeneratedPathInUse,
  } = stateTreeApi;
  const stateTreePath = useContext(StateTreePath);

  if (keyRef.current == null) {
    let generatedKey;
    let index: number = 0;

    const valueAtStateTreePath = get(stateTree, stateTreePath, MISSING);
    if (valueAtStateTreePath !== MISSING) {
      index = Object.keys(valueAtStateTreePath).length;
    }

    do {
      generatedKey = "$" + index;
      index++;
    } while (checkIfGeneratedPathInUse(stateTreePath.concat(generatedKey)));

    markGeneratedPath(stateTreePath.concat(generatedKey));
    keyRef.current = generatedKey;
  }

  const targetPath = stateTreePath.concat(keyRef.current);

  const updateState = (nextValue: T) => {
    replaceStateTree(
      produce(stateTree, (draft) => {
        set(draft, targetPath, nextValue);
      })
    );
  };

  let value = get(stateTree, targetPath, MISSING);
  if (value === MISSING) {
    updateState(initialValue);
    value = initialValue;
  }

  return [value, updateState];
}
