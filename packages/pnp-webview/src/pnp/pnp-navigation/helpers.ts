export type SearchResult = {
  match: boolean;
  ranges: [number, number][];
};

// implementation from hds-components
export const fuzzySearch = (subject: string, pattern: string): SearchResult => {
  const result: SearchResult = {
    match: false,
    ranges: [],
  };
  let fromIndex = 0;
  let foundIndex = 0;
  const indexMax = pattern.length - 1;
  const lcSubject = subject.toLowerCase();
  const lcPattern = pattern.toLowerCase();

  for (let index = 0; index <= indexMax; index++) {
    foundIndex = lcSubject.indexOf(lcPattern[index], fromIndex);

    if (foundIndex === -1) {
      return {
        match: false,
        ranges: [],
      };
    }

    result.match = true;
    result.ranges.push([foundIndex, foundIndex + 1]);

    fromIndex = foundIndex + 1;
  }

  return result;
};

export const containsSearch = (
  subject: string,
  pattern: string
): SearchResult => {
  const result: SearchResult = {
    match: false,
    ranges: [],
  };
  const foundIndex = subject.toLowerCase().indexOf(pattern.toLowerCase());

  if (foundIndex !== -1) {
    result.match = true;
    result.ranges = [[foundIndex, foundIndex + pattern.length]];
  }

  return result;
};
