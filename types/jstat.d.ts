// types/jstat.d.ts

declare module 'jstat' {
  export const jStat: {
      centralF: {
          /**
           * Returns the inverse of the F distribution.
           * (Calculates the F-Critical value from the tables)
           */
          inv(p: number, df1: number, df2: number): number;
          
          /**
           * Returns the cumulative distribution function of the F distribution.
           * (Used to calculate the exact P-Value)
           */
          cdf(x: number, df1: number, df2: number): number;
      };
    };
}