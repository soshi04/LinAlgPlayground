import { Fragment } from "react";
import { cn } from "@/lib/utils";

interface MatrixDisplayProps {
  matrix: string[][];
  augmented: boolean;
  numVars: number;
  pivotColumns?: number[];
  className?: string;
}

export function MatrixDisplay({
  matrix,
  augmented,
  numVars,
  pivotColumns,
  className,
}: MatrixDisplayProps) {
  if (matrix.length === 0) return null;

  return (
    <div className={cn("max-w-full overflow-x-auto", className)}>
      <div className="inline-flex items-stretch">
        {/* left bracket */}
        <div className="w-1.5 shrink-0 border-l-2 border-t-2 border-b-2 border-foreground/40 rounded-l-sm" />

        <table className="border-collapse">
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <Fragment key={j}>
                    {augmented && j === numVars && (
                      <td className="px-1 text-muted-foreground/60 select-none text-center">
                        │
                      </td>
                    )}
                    <td
                      className={cn(
                        "px-2 py-0.5 text-center font-mono text-sm min-w-[2.5rem] whitespace-nowrap",
                        pivotColumns?.includes(j) && "font-bold text-primary"
                      )}
                    >
                      {cell}
                    </td>
                  </Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* right bracket */}
        <div className="w-1.5 shrink-0 border-r-2 border-t-2 border-b-2 border-foreground/40 rounded-r-sm" />
      </div>
    </div>
  );
}
